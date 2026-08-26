import express from 'express';
import Razorpay from 'razorpay';
import { query, get, run } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { getShippingProvider } from '../services/shippingService.js';

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
router.get('/pincode/:pincode', async (req, res) => {
  try {
    const provider = getShippingProvider();
    const result = await provider.checkServiceability(req.params.pincode);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Serviceability check failed' });
  }
});

// Helper: Validate coupon with per-user limit enforcement
const validateCoupon = async (couponCode, subtotal, userId) => {
  if (!couponCode) return { discount_amount: 0, applied_coupon: null };

  const coupon = await get(
    `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND active = TRUE AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
    [couponCode]
  );

  if (!coupon) return { discount_amount: 0, applied_coupon: null, error: 'Invalid or expired coupon code' };

  if (coupon.start_date && new Date(coupon.start_date) > new Date()) {
    return { discount_amount: 0, applied_coupon: null, error: 'Coupon is not yet active' };
  }

  if (subtotal < coupon.min_cart_value) {
    return { discount_amount: 0, applied_coupon: null, error: `Minimum order value of ₹${coupon.min_cart_value} required` };
  }

  const globalUsage = await get('SELECT COUNT(id) as count FROM coupon_usages WHERE coupon_id = $1', [coupon.id]);
  if (globalUsage.count >= coupon.usage_limit) {
    return { discount_amount: 0, applied_coupon: null, error: 'Coupon usage limit reached' };
  }

  if (userId) {
    const userUsage = await get(
      'SELECT COUNT(id) as count FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2',
      [coupon.id, userId]
    );
    if (userUsage.count >= coupon.per_user_limit) {
      return { discount_amount: 0, applied_coupon: null, error: `You have already used this coupon ${coupon.per_user_limit} time(s)` };
    }
  }

  let discount_amount = 0;
  if (coupon.discount_type === 'PERCENT') {
    discount_amount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount > 0) {
      discount_amount = Math.min(discount_amount, coupon.max_discount);
    }
  } else if (coupon.discount_type === 'FLAT') {
    discount_amount = Math.min(coupon.discount_value, subtotal);
  }

  return {
    discount_amount,
    applied_coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      saved_amount: Math.round(discount_amount * 100) / 100,
    },
  };
};

// Helper: FEFO batch allocation
const allocateFEFO = async (variantId, quantityNeeded) => {
  const batches = await query(
    `SELECT * FROM batches
     WHERE variant_id = $1 AND expiry_date > CURRENT_DATE AND quantity > 0
     ORDER BY expiry_date ASC`,
    [variantId]
  );

  let remaining = quantityNeeded;
  const allocations = [];

  for (const batch of batches) {
    if (remaining <= 0) break;

    const take = Math.min(remaining, batch.quantity);
    allocations.push({ batch_id: batch.id, batch_number: batch.batch_number, quantity: take });

    await run('UPDATE batches SET quantity = quantity - $1 WHERE id = $2', [take, batch.id]);
    remaining -= take;
  }

  return { allocated: quantityNeeded - remaining, remaining, allocations };
};

// Process Checkout & Initiate Order
router.post('/initiate', authenticateToken, async (req, res, next) => {
  try {
    const {
      items,
      shipping_address,
      payment_method,
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

    const provider = getShippingProvider();
    const serviceCheck = await provider.checkServiceability(shipping_address.pincode);
    if (!serviceCheck.serviceable) {
      return res.status(400).json({ success: false, error: `Delivery not available to pincode ${shipping_address.pincode}` });
    }

    // 1. Validate items & inventory
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const variant = await get(
        `SELECT v.*, p.name as product_name, p.id as product_id, i.available_stock
         FROM product_variants v
         JOIN products p ON v.product_id = p.id
         LEFT JOIN inventory i ON v.id = i.variant_id
         WHERE v.id = $1 AND p.status = 'PUBLISHED'`,
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
    const userId = req.user ? req.user.id : null;
    const couponResult = await validateCoupon(coupon_code, subtotal, userId);
    if (couponResult.error) {
      return res.status(400).json({ success: false, error: couponResult.error });
    }
    const discount_amount = couponResult.discount_amount;

    const discountedSubtotal = Math.max(0, subtotal - discount_amount);
    const tax_amount = Math.round(discountedSubtotal * 0.12 * 100) / 100;

    const totalWeight = validatedItems.reduce((acc, i) => acc + i.quantity * 250, 0);
    const rateResult = await provider.getRate(shipping_address.pincode, totalWeight, payment_method === 'COD');
    const shipping_fee = discountedSubtotal >= 499 ? 0 : (rateResult.success ? rateResult.shipping_fee : 50);

    const total_amount = Math.round((discountedSubtotal + tax_amount + shipping_fee) * 100) / 100;

    // 3. Order & Invoice Number Generation
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    const customerEmail = req.user ? req.user.email : guest_email;
    const customerName = req.user ? req.user.name : guest_name;
    const customerPhone = req.user ? req.user.phone : guest_phone;

    // 4. Reserve stock + FEFO batch allocation
    for (const item of validatedItems) {
      await run(
        `UPDATE inventory
         SET available_stock = available_stock - $1, reserved_stock = reserved_stock + $2
         WHERE variant_id = $3`,
        [item.quantity, item.quantity, item.variant_id]
      );

      try {
        await allocateFEFO(item.variant_id, item.quantity);
      } catch (fefoErr) {
        console.warn('FEFO batch allocation warning (non-critical):', fefoErr.message);
      }
    }

    // 5. Create Order Record
    const orderRes = await run(
      `INSERT INTO orders (
        order_number, user_id, guest_email, guest_name, guest_phone, status,
        subtotal, tax_amount, shipping_fee, discount_amount, total_amount,
        payment_method, payment_status, shipping_address_json, invoice_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
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
        'PENDING',
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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

    // 6. Record coupon usage
    if (couponResult.applied_coupon) {
      await run(
        'INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1, $2, $3)',
        [couponResult.applied_coupon.id, userId, orderId]
      );
    }

    // Record Analytics event
    await run(
      `INSERT INTO analytics_events (event_name, session_id, user_id, page, order_id, metadata_json)
       VALUES ('CHECKOUT_START', 'checkout_session', $1, '/checkout', $2, $3)`,
      [userId, orderId, JSON.stringify({ amount: total_amount, method: payment_method })]
    );

    // 7. Payment initiation
    if (payment_method === 'RAZORPAY') {
      let rzpOrder = null;
      try {
        if (razorpay) {
          rzpOrder = await razorpay.orders.create({
            amount: Math.round(total_amount * 100),
            currency: 'INR',
            receipt: orderNumber,
            notes: { order_id: orderId, order_number: orderNumber },
          });
        }
      } catch (err) {
        console.warn('Razorpay live API call failed, generating simulated sandbox order object:', err.message);
      }

      const rzpOrderId = rzpOrder ? rzpOrder.id : `rzp_order_${orderId}_${Date.now()}`;
      await run('UPDATE orders SET razorpay_order_id = $1 WHERE id = $2', [rzpOrderId, orderId]);

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
      await run("UPDATE orders SET status = 'CONFIRMED' WHERE id = $1", [orderId]);
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

// POST /api/checkout/release-expired-reservations
router.post('/release-expired-reservations', async (req, res, next) => {
  try {
    const expiredOrders = await query(
      `SELECT o.id, o.order_number, oi.variant_id, oi.quantity
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.status = 'PENDING'
       AND o.payment_method = 'RAZORPAY'
       AND o.created_at <= NOW() - INTERVAL '15 minutes'`
    );

    const releasedOrders = new Set();

    for (const item of expiredOrders) {
      await run(
        `UPDATE inventory
         SET available_stock = available_stock + $1, reserved_stock = GREATEST(0, reserved_stock - $2)
         WHERE variant_id = $3`,
        [item.quantity, item.quantity, item.variant_id]
      );
      releasedOrders.add(item.id);
    }

    for (const orderId of releasedOrders) {
      await run(
        "UPDATE orders SET status = 'CANCELLED', payment_status = 'EXPIRED' WHERE id = $1",
        [orderId]
      );
    }

    res.json({
      success: true,
      released_orders_count: releasedOrders.size,
      message: `Released inventory reservations for ${releasedOrders.size} expired pending orders.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
