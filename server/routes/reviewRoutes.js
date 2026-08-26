import express from 'express';
import { query, get, run } from '../db/database.js';
import { requireAuth, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/reviews
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { product_id, rating, review_text } = req.body;

    if (!product_id || !rating || !review_text) {
      return res.status(400).json({ success: false, error: 'Product ID, rating, and review text are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const existingReview = await get(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [product_id, req.user.id]
    );
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }

    const purchaseCheck = await get(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'DELIVERED'
       LIMIT 1`,
      [req.user.id, product_id]
    );
    const isVerifiedPurchase = !!purchaseCheck;

    const result = await run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, review_text, verified_purchase, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING') RETURNING id`,
      [product_id, req.user.id, req.user.name, rating, review_text, isVerifiedPurchase]
    );

    res.json({
      success: true,
      review_id: result.lastID,
      verified_purchase: isVerifiedPurchase,
      message: 'Review submitted successfully. It will be visible after moderation approval.',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/:productId
router.get('/:productId', async (req, res, next) => {
  try {
    const reviews = await query(
      `SELECT id, user_name, rating, review_text, verified_purchase, created_at
       FROM reviews
       WHERE product_id = $1 AND status = 'APPROVED'
       ORDER BY created_at DESC`,
      [req.params.productId]
    );

    const summary = await get(
      `SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews
       FROM reviews WHERE product_id = $1 AND status = 'APPROVED'`,
      [req.params.productId]
    );

    res.json({
      success: true,
      reviews,
      avg_rating: summary.avg_rating || 0,
      total_reviews: summary.total_reviews || 0,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
