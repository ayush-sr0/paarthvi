import express from 'express';
import { query, get, run } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Use authenticateToken to optionally identify user for coupon checks
router.use(authenticateToken);

// Get active cart for user or guest session
router.post('/sync', async (req, res, next) => {
  try {
    const { items, coupon_code } = req.body; // [{ variant_id, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({
        success: true,
        items: [],
        subtotal: 0,
        tax_amount: 0,
        shipping_fee: 0,
        discount_amount: 0,
        total_amount: 0,
      });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const variant = await get(
        `SELECT v.id, v.product_id, v.sku, v.attribute_name, v.attribute_value,
                COALESCE(v.mrp, p.mrp) as mrp,
                COALESCE(v.selling_price, p.selling_price) as selling_price,
                p.name as product_name, p.slug as product_slug,
                (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as main_image,
                i.available_stock
         FROM product_variants v
         JOIN products p ON v.product_id = p.id
         LEFT JOIN inventory i ON v.id = i.variant_id
         WHERE v.id = $1 AND (p.status = 'PUBLISHED' OR p.status IS NULL)`,
        [item.variant_id]
      );


      if (variant) {
        const qty = Math.min(Math.max(1, item.quantity), variant.available_stock || 10);
        const itemTotal = variant.selling_price * qty;
        subtotal += itemTotal;

        validatedItems.push({
          variant_id: variant.id,
          product_id: variant.product_id,
          product_name: variant.product_name,
          product_slug: variant.product_slug,
          attribute_name: variant.attribute_name,
          attribute_value: variant.attribute_value,
          sku: variant.sku,
          mrp: variant.mrp,
          unit_price: variant.selling_price,
          quantity: qty,
          total_price: itemTotal,
          main_image: variant.main_image,
          available_stock: variant.available_stock,
        });
      }
    }

    // Coupon validation with per-user limit check
    let discount_amount = 0;
    let applied_coupon = null;
    let coupon_error = null;

    if (coupon_code) {
      const coupon = await get(
        `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND active = TRUE AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
        [coupon_code]
      );

      if (!coupon) {
        coupon_error = 'Invalid or expired coupon code';
      } else if (subtotal < coupon.min_cart_value) {
        coupon_error = `Minimum order value of ₹${coupon.min_cart_value} required`;
      } else {
        // Check global usage limit
        const globalUsage = await get('SELECT COUNT(id) as count FROM coupon_usages WHERE coupon_id = $1', [coupon.id]);
        if (globalUsage.count >= coupon.usage_limit) {
          coupon_error = 'Coupon usage limit reached';
        }

        // Check per-user limit
        if (!coupon_error && req.user) {
          const userUsage = await get(
            'SELECT COUNT(id) as count FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2',
            [coupon.id, req.user.id]
          );
          if (userUsage.count >= coupon.per_user_limit) {
            coupon_error = `You have already used this coupon ${coupon.per_user_limit} time(s)`;
          }
        }

        if (!coupon_error) {
          if (coupon.discount_type === 'PERCENT') {
            discount_amount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount > 0) {
              discount_amount = Math.min(discount_amount, coupon.max_discount);
            }
          } else if (coupon.discount_type === 'FLAT') {
            discount_amount = Math.min(coupon.discount_value, subtotal);
          }
          applied_coupon = {
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            saved_amount: Math.round(discount_amount * 100) / 100,
          };
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount_amount);
    // GST (Average 12% tax rate)
    const tax_amount = Math.round(discountedSubtotal * 0.12 * 100) / 100;
    // Shipping: Free shipping over ₹499 else ₹50
    const shipping_fee = discountedSubtotal >= 499 || subtotal === 0 ? 0 : 50;
    const total_amount = Math.round((discountedSubtotal + tax_amount + shipping_fee) * 100) / 100;

    res.json({
      success: true,
      items: validatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_amount,
      shipping_fee,
      discount_amount: Math.round(discount_amount * 100) / 100,
      total_amount,
      applied_coupon,
      coupon_error,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
