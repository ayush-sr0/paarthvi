import express from 'express';
import { query, get, run } from '../db/database.js';
import { requireAuth, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Use authenticateToken to optionally identify user
router.use(authenticateToken);

// GET /api/wishlist — Fetch user's wishlist with product details
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let wishlistObj = await get('SELECT * FROM wishlists WHERE user_id = ?', [req.user.id]);
    if (!wishlistObj) {
      const result = await run('INSERT INTO wishlists (user_id) VALUES (?)', [req.user.id]);
      wishlistObj = { id: result.lastID };
    }

    const items = await query(
      `SELECT wi.id as wishlist_item_id, wi.product_id, wi.created_at as added_at,
              p.name, p.slug, p.mrp, p.selling_price, p.status,
              c.name as category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as main_image,
              (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND status = 'APPROVED') as avg_rating,
              (SELECT COUNT(id) FROM reviews WHERE product_id = p.id AND status = 'APPROVED') as review_count,
              (SELECT v.id FROM product_variants v WHERE v.product_id = p.id LIMIT 1) as default_variant_id,
              (SELECT COALESCE(SUM(i.available_stock), 0) FROM inventory i JOIN product_variants v ON i.variant_id = v.id WHERE v.product_id = p.id) as total_stock
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE wi.wishlist_id = ?
       ORDER BY wi.created_at DESC`,
      [wishlistObj.id]
    );

    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/toggle — Add or remove a product from wishlist
router.post('/toggle', requireAuth, async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    let wishlistObj = await get('SELECT * FROM wishlists WHERE user_id = ?', [req.user.id]);
    if (!wishlistObj) {
      const result = await run('INSERT INTO wishlists (user_id) VALUES (?)', [req.user.id]);
      wishlistObj = { id: result.lastID };
    }

    const existing = await get(
      'SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistObj.id, product_id]
    );

    if (existing) {
      await run('DELETE FROM wishlist_items WHERE id = ?', [existing.id]);
      res.json({ success: true, action: 'removed', message: 'Product removed from wishlist' });
    } else {
      await run(
        'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
        [wishlistObj.id, product_id]
      );
      res.json({ success: true, action: 'added', message: 'Product added to wishlist' });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/move-to-cart — Move wishlist item to cart (returns variant info for frontend cart)
router.post('/move-to-cart', requireAuth, async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    // Get default variant for the product
    const variant = await get(
      `SELECT v.id as variant_id, v.sku, v.attribute_value, v.selling_price, i.available_stock
       FROM product_variants v
       LEFT JOIN inventory i ON v.id = i.variant_id
       WHERE v.product_id = ?
       LIMIT 1`,
      [product_id]
    );

    if (!variant || variant.available_stock <= 0) {
      return res.status(400).json({ success: false, error: 'Product is out of stock' });
    }

    // Remove from wishlist
    const wishlistObj = await get('SELECT id FROM wishlists WHERE user_id = ?', [req.user.id]);
    if (wishlistObj) {
      await run('DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?', [wishlistObj.id, product_id]);
    }

    res.json({
      success: true,
      variant_id: variant.variant_id,
      message: 'Item moved to cart',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/wishlist/ids — Get just the product IDs in wishlist (for quick frontend checks)
router.get('/ids', requireAuth, async (req, res, next) => {
  try {
    const wishlistObj = await get('SELECT id FROM wishlists WHERE user_id = ?', [req.user.id]);
    if (!wishlistObj) {
      return res.json({ success: true, product_ids: [] });
    }

    const items = await query(
      'SELECT product_id FROM wishlist_items WHERE wishlist_id = ?',
      [wishlistObj.id]
    );

    res.json({ success: true, product_ids: items.map(i => i.product_id) });
  } catch (err) {
    next(err);
  }
});

export default router;
