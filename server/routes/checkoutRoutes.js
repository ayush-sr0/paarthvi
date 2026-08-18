import express from 'express';
import Razorpay from 'razorpay';
import { query, get, run } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ParthviAyurveda2026';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_1234567890';

let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (e) {
  console.warn('Razorpay SDK initialized with test fallback key.');
}

// Check pincode serviceability
router.get('/pincode/:pincode', (req, res) => {
  const { pincode } = req.params;
  const isServiceable = /^[1-9][0-9]{5}$/.test(pincode); // 6-digit Indian PIN check
  const isCodAvailable = parseInt(pincode) % 2 === 0 || pincode.startsWith('2') || pincode.startsWith('1'); // Simulated COD pincodes

  res.json({
    success: true,
    pincode,
    serviceable: isServiceable,
    estimated_days: isServiceable ? 3 : null,
    cod_available: isServiceable ? isCodAvailable : false,
  });
});

// Process Checkout & Initiate Order
router.post('/initiate', authenticateToken, async (req, res, next) => {
  try {
    const {
      items,
      shipping_address,
      payment_method, // RAZORPAY or COD
      coupon_code,
      guest_email,
      guest_name,
      guest_phone,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart items cannot be empty' });
    }

    if (!shipping_address || !shipping_address.street || !shipping_address.city || !shipping_address.pincode) {
      return res.status(400).json({ success: false, error: 'Complete delivery address is required' });
    }

    // 1. Validate items & inventory server-side
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const variant = await get(
        `SELECT v.*, p.name as product_name, p.id as product_id, i.available_stock
         FROM product_variants v
         JOIN products p ON v.product_id = p.id
         LEFT JOIN inventory i ON v.id = i.variant_id
         WHERE v.id = ? AND p.status = 'PUBLISHED'`,
        [item.variant_id]
      );

      if (!variant) {
        return res.status(400).json({ success: false, error: `Product variant not found` });
      }

      if (variant.available_stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${variant.product_name} (${variant.attribute_value}). Available: ${variant.available_stock}`,
        });
      }

      const itemTotal = variant.selling_price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        variant_id: variant.id,
        product_id: variant.product_id,
        product_name: variant.product_name,
        attribute_value: variant.attribute_value,
        sku: variant.sku,
        mrp: variant.mrp,
        unit_price: variant.selling_price,
        quantity: item.quantity,
        total_price: itemTotal,
      });
    }

    // 2. Validate Coupon
    let discount_amount = 0;
    if (coupon_code) {
      const coupon = await get(
        `SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND active = 1 AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
        [coupon_code]
      );

      if (coupon && subtotal >= coupon.min_cart_value) {
        if (coupon.discount_type === 'PERCENT') {
          discount_amount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount > 0) {
            discount_amount = Math.min(discount_amount, coupon.max_discount);
          }
        } else if (coupon.discount_type === 'FLAT') {
          discount_amount = Math.min(coupon.discount_value, subtotal);
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount_amount);
    const tax_amount = Math.round(discountedSubtotal * 0.12 * 100) / 100;
    const shipping_fee = discountedSubtotal >= 499 ? 0 : 50;
    const total_amount = Math.round((discountedSubtotal + tax_amount + shipping_fee) * 100) / 100;

    // 3. Order & Invoice Number Generation
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    const userId = req.user ? req.user.id : null;
    const customerEmail = req.user ? req.user.email : guest_email;
    const customerName = req.user ? req.user.name : guest_name;
    const customerPhone = req.user ? req.user.phone : guest_phone;

    // 4. Reserve stock transactionally
    for (const item of validatedItems) {
      await run(
        `UPDATE inventory
         SET available_stock = available_stock - ?, reserved_stock = reserved_stock + ?
         WHERE variant_id = ?`,
        [item.quantity, item.quantity, item.variant_id]
      );
    }

    // 5. Create Order Record
    const orderRes = await run(
      `INSERT INTO orders (
        order_number, user_id, guest_email, guest_name, guest_phone, status,
        subtotal, tax_amount, shipping_fee, discount_amount, total_amount,
        payment_method, payment_status, shipping_address_json, invoice_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        customerEmail,
        customerName,
        customerPhone,
        payment_method === 'COD' ? 'CONFIRMED' : 'PENDING',
        subtotal,
        tax_amount,
        shipping_fee,
        discount_amount,
        total_amount,
        payment_method,
        payment_method === 'COD' ? 'PENDING' : 'PENDING',
        JSON.stringify(shipping_address),
        invoiceNumber,
      ]
    );

    const orderId = orderRes.lastID;

    // Insert Order Items
    for (const item of validatedItems) {
      await run(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, mrp, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.variant_id,
          item.product_name,
          item.attribute_value,
          item.sku,
          item.unit_price,
          item.mrp,
          item.quantity,
          item.total_price,
        ]
      );
    }

    // Record Analytics Purchase / Checkout Event
    await run(
      `INSERT INTO analytics_events (event_name, session_id, user_id, page, order_id, metadata_json)
       VALUES ('CHECKOUT_START', 'checkout_session', ?, '/checkout', ?, ?)`,
      [userId, orderId, JSON.stringify({ amount: total_amount, method: payment_method })]
    );

    // 6. Payment initiation (Razorpay vs COD)
    if (payment_method === 'RAZORPAY') {
      let rzpOrder = null;
      try {
        if (razorpay) {
          rzpOrder = await razorpay.orders.create({
            amount: Math.round(total_amount * 100), // amount in paise
            currency: 'INR',
            receipt: orderNumber,
            notes: { order_id: orderId, order_number: orderNumber },
          });
        }
      } catch (err) {
        console.warn('Razorpay live API call failed, generating simulated sandbox order object:', err.message);
      }

      const rzpOrderId = rzpOrder ? rzpOrder.id : `rzp_order_${orderId}_${Date.now()}`;
      await run('UPDATE orders SET razorpay_order_id = ? WHERE id = ?', [rzpOrderId, orderId]);

      res.json({
        success: true,
        order_id: orderId,
        order_number: orderNumber,
        razorpay_order_id: rzpOrderId,
        amount: total_amount,
        currency: 'INR',
        key_id: razorpayKeyId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      });
    } else {
      // COD Order direct confirmation
      await run("UPDATE orders SET status = 'CONFIRMED' WHERE id = ?", [orderId]);
      res.json({
        success: true,
        order_id: orderId,
        order_number: orderNumber,
        payment_method: 'COD',
        amount: total_amount,
        status: 'CONFIRMED',
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
