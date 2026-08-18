import express from 'express';
import { query, get, run } from '../db/database.js';

const router = express.Router();

// Synonym map for search engine matching
const SYNONYM_MAP = {
  'hair tel': 'hair oil',
  'baal oil': 'hair oil',
  'baal tel': 'hair oil',
  'बाल तेल': 'hair oil',
  'kesh oil': 'hair oil',
  'vitality': 'ashwagandha',
  'stamina': 'shilajit',
  'glow': 'kumkumadi',
  'face oil': 'kumkumadi',
  'digestive': 'triphala',
  'stomach': 'triphala',
  'shampoo': 'cleanser',
  'immunity': 'turmeric',
  'haldi': 'turmeric',
  'chyawanprash': 'rasayana'
};

// GET all categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await query('SELECT * FROM categories WHERE active = 1 ORDER BY display_order ASC');
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

// GET products (PLP with filtering & sorting)
router.get('/', async (req, res, next) => {
  try {
    const { category, min_price, max_price, rating, is_featured, is_bestseller, sort, search } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as main_image,
             (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND status = 'APPROVED') as avg_rating,
             (SELECT COUNT(id) FROM reviews WHERE product_id = p.id AND status = 'APPROVED') as review_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'PUBLISHED'
    `;

    const params = [];

    if (category) {
      sql += ` AND c.slug = ?`;
      params.push(category);
    }

    if (min_price) {
      sql += ` AND p.selling_price >= ?`;
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      sql += ` AND p.selling_price <= ?`;
      params.push(parseFloat(max_price));
    }

    if (is_featured === '1') {
      sql += ` AND p.is_featured = 1`;
    }

    if (is_bestseller === '1') {
      sql += ` AND p.is_bestseller = 1`;
    }

    if (search) {
      let searchTerm = search.trim().toLowerCase();
      if (SYNONYM_MAP[searchTerm]) {
        searchTerm = SYNONYM_MAP[searchTerm];
      }
      sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.ingredients) LIKE ? OR LOWER(p.key_ingredients) LIKE ?)`;
      const queryPattern = `%${searchTerm}%`;
      params.push(queryPattern, queryPattern, queryPattern, queryPattern);
    }

    // Sort order
    if (sort === 'price_low') {
      sql += ` ORDER BY p.selling_price ASC`;
    } else if (sort === 'price_high') {
      sql += ` ORDER BY p.selling_price DESC`;
    } else if (sort === 'newest') {
      sql += ` ORDER BY p.created_at DESC`;
    } else if (sort === 'bestseller') {
      sql += ` ORDER BY p.is_bestseller DESC, p.id DESC`;
    } else {
      sql += ` ORDER BY p.is_featured DESC, p.id DESC`;
    }

    const products = await query(sql, params);

    // Filter by rating if provided
    let filteredProducts = products;
    if (rating) {
      const targetRating = parseFloat(rating);
      filteredProducts = products.filter(p => (p.avg_rating || 0) >= targetRating);
    }

    res.json({ success: true, count: filteredProducts.length, products: filteredProducts });
  } catch (err) {
    next(err);
  }
});

// GET Search suggestions and search analytics record
router.get('/search/suggest', async (req, res, next) => {
  try {
    const { q, session_id } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, suggestions: [], popular: ['Hair Oil', 'Ashwagandha', 'Shilajit', 'Kumkumadi', 'Triphala'] });
    }

    let searchKey = q.trim().toLowerCase();
    if (SYNONYM_MAP[searchKey]) {
      searchKey = SYNONYM_MAP[searchKey];
    }

    const results = await query(
      `SELECT p.id, p.name, p.slug, p.selling_price, c.name as category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as main_image
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'PUBLISHED' AND (LOWER(p.name) LIKE ? OR LOWER(p.key_ingredients) LIKE ?)
       LIMIT 6`,
      [`%${searchKey}%`, `%${searchKey}%`]
    );

    // Track search event in analytics
    if (session_id) {
      await run(
        `INSERT INTO analytics_events (event_name, session_id, page, metadata_json)
         VALUES ('SEARCH', ?, '/search', ?)`,
        [session_id, JSON.stringify({ query: q, results_count: results.length })]
      );
    }

    res.json({ success: true, query: q, suggestions: results });
  } catch (err) {
    next(err);
  }
});

// GET single product PDP by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await get(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.status = 'PUBLISHED'`,
      [req.params.slug]
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const images = await query('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC', [product.id]);
    const variants = await query(
      `SELECT v.*, i.available_stock, i.reserved_stock
       FROM product_variants v
       LEFT JOIN inventory i ON v.id = i.variant_id
       WHERE v.product_id = ?`,
      [product.id]
    );

    const reviews = await query(
      `SELECT * FROM reviews WHERE product_id = ? AND status = 'APPROVED' ORDER BY created_at DESC`,
      [product.id]
    );

    const ratingSummary = await get(
      `SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews
       FROM reviews WHERE product_id = ? AND status = 'APPROVED'`,
      [product.id]
    );

    const relatedProducts = await query(
      `SELECT p.id, p.name, p.slug, p.mrp, p.selling_price,
              (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as main_image
       FROM products p
       WHERE p.category_id = ? AND p.id != ? AND p.status = 'PUBLISHED'
       LIMIT 4`,
      [product.category_id, product.id]
    );

    res.json({
      success: true,
      product: {
        ...product,
        images,
        variants,
        reviews,
        avg_rating: ratingSummary.avg_rating || 5.0,
        total_reviews: ratingSummary.total_reviews || 0,
        related_products: relatedProducts,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
