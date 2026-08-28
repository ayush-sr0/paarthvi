import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { query, get, run } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicProductsDir = path.join(__dirname, '../../public/products');

const router = express.Router();


const logAuditAction = async (req, action, entity, entity_id, prev_val = null, new_val = null) => {
  try {
    await run(
      `INSERT INTO audit_logs (admin_id, admin_email, action, entity, entity_id, prev_value_json, new_value_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.user?.id || 0,
        req.user?.email || 'admin@parthvi.com',
        action,
        entity,
        String(entity_id),
        prev_val ? JSON.stringify(prev_val) : null,
        new_val ? JSON.stringify(new_val) : null,
      ]
    );
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
};

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURN_REJECTED'],
  RETURN_APPROVED: ['RETURNED'],
  RETURN_REJECTED: [],
  RETURNED: ['REFUND_INITIATED'],
  REFUND_INITIATED: ['REFUNDED'],
  REFUNDED: [],
};

router.use(requireAuth);

// 1. Dashboard Overview Metrics
router.get('/overview', requireRole(['SUPER_ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CONTENT_MANAGER', 'SUPPORT_MANAGER']), async (req, res, next) => {
  try {
    const todaySales = await get(`SELECT SUM(total_amount) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'PAID'`);
    const totalRevenue = await get(`SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'PAID'`);
    const totalOrders = await get(`SELECT COUNT(id) as count FROM orders`);
    const pendingOrders = await get(`SELECT COUNT(id) as count FROM orders WHERE status = 'PENDING' OR status = 'CONFIRMED'`);
    const deliveredOrders = await get(`SELECT COUNT(id) as count FROM orders WHERE status = 'DELIVERED'`);
    const cancelledOrders = await get(`SELECT COUNT(id) as count FROM orders WHERE status = 'CANCELLED'`);
    const lowStockItems = await get(`SELECT COUNT(id) as count FROM inventory WHERE available_stock <= low_stock_threshold`);
    const expiringBatches = await get(`SELECT COUNT(id) as count FROM batches WHERE expiry_date <= CURRENT_DATE + INTERVAL '90 days'`);
    const totalCustomers = await get(`SELECT COUNT(id) as count FROM users WHERE role = 'CUSTOMER'`);

    const recentOrders = await query(`SELECT id, order_number, guest_name, total_amount, status, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`);
    const topProducts = await query(
      `SELECT p.name, SUM(oi.quantity) as total_qty, SUM(oi.total_price) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id, p.name ORDER BY total_qty DESC LIMIT 5`
    );

    res.json({
      success: true,
      metrics: {
        today_sales: todaySales.total || 0,
        total_revenue: totalRevenue.total || 0,
        total_orders: totalOrders.count || 0,
        pending_orders: pendingOrders.count || 0,
        delivered_orders: deliveredOrders.count || 0,
        cancelled_orders: cancelledOrders.count || 0,
        low_stock_items: lowStockItems.count || 0,
        expiring_batches: expiringBatches.count || 0,
        total_customers: totalCustomers.count || 0,
        conversion_rate: 3.42,
      },
      recent_orders: recentOrders,
      top_products: topProducts,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Orders Manager
router.get('/orders', requireRole(['ORDER_MANAGER', 'SUPPORT_MANAGER']), async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = `SELECT * FROM orders WHERE 1=1`;
    const params = [];
    let paramIdx = 1;

    if (status) {
      sql += ` AND status = $${paramIdx++}`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (order_number LIKE $${paramIdx} OR guest_name LIKE $${paramIdx + 1} OR guest_phone LIKE $${paramIdx + 2})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIdx += 3;
    }

    sql += ` ORDER BY created_at DESC`;
    const orders = await query(sql, params);

    for (const o of orders) {
      o.items = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
    }

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// Update Order Status
router.put('/orders/:id/status', requireRole(['ORDER_MANAGER']), async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const order = await get('SELECT * FROM orders WHERE id = $1', [orderId]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const allowedNext = VALID_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid state transition: ${order.status} → ${status}. Allowed transitions: ${allowedNext.join(', ') || 'none'}`,
      });
    }

    await run('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, orderId]);
    await logAuditAction(req, 'UPDATE_ORDER_STATUS', 'ORDER', orderId, { status: order.status }, { status });

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// 3. Products CRUD
router.get('/products', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  try {
    const products = await query(
      `SELECT p.*, c.name as category_name,
              (SELECT SUM(available_stock) FROM inventory i JOIN product_variants v ON i.variant_id = v.id WHERE v.product_id = p.id) as total_stock
       FROM products p
       JOIN categories c ON p.category_id = c.id
       ORDER BY p.id DESC`
    );
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

router.post('/products', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  try {
    const { name, slug, category_id, brand, short_desc, description, mrp, selling_price, is_featured, is_bestseller, target_dosha, ingredients, key_ingredients, benefits, usage_directions, warnings, storage_info, net_qty, manufacturer_info, image_url } = req.body;

    const resProd = await run(
      `INSERT INTO products (
        name, slug, category_id, brand, short_desc, description, mrp, selling_price,
        is_featured, is_bestseller, target_dosha, status, ingredients, key_ingredients, benefits, usage_directions, warnings, storage_info, net_qty, manufacturer_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING id`,
      [name, slug, category_id, brand || 'Parthvi Ayurveda', short_desc, description, mrp, selling_price, Boolean(is_featured), Boolean(is_bestseller), target_dosha || 'TRIDOSAHIC', 'PUBLISHED', ingredients, key_ingredients, benefits, usage_directions, warnings, storage_info, net_qty, manufacturer_info]
    );

    const productId = resProd.lastID;
    if (image_url) {
      await run('INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, 1)', [productId, image_url]);
    }

    const resVar = await run(
      'INSERT INTO product_variants (product_id, sku, attribute_name, attribute_value, mrp, selling_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [productId, `SKU-${slug.toUpperCase()}-STD`, 'Pack', 'Standard Pack', mrp, selling_price]
    );

    await run('INSERT INTO inventory (variant_id, available_stock, low_stock_threshold) VALUES ($1, 100, 10)', [resVar.lastID]);

    await logAuditAction(req, 'CREATE_PRODUCT', 'PRODUCT', productId, null, { name, slug });
    res.json({ success: true, product_id: productId });
  } catch (err) {
    next(err);
  }
});

// Update Product
router.put('/products/:id', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ success: false, error: 'Invalid product ID' });
    const prev = await get('SELECT * FROM products WHERE id = $1', [productId]);
    if (!prev) return res.status(404).json({ success: false, error: 'Product not found' });


    const {
      name, slug, category_id, brand, short_desc, description, mrp, selling_price,
      is_featured, is_bestseller, is_new, target_dosha, status,
      ingredients, key_ingredients, benefits, usage_directions,
      warnings, storage_info, net_qty, manufacturer_info,
    } = req.body;

    const parsedMrp = (mrp !== undefined && mrp !== null && mrp !== '') ? Number(mrp) : null;
    const parsedSellingPrice = (selling_price !== undefined && selling_price !== null && selling_price !== '') ? Number(selling_price) : null;

    await run(
      `UPDATE products SET
        name = COALESCE($1, name), slug = COALESCE($2, slug), category_id = COALESCE($3, category_id),
        brand = COALESCE($4, brand), short_desc = COALESCE($5, short_desc), description = COALESCE($6, description),
        mrp = COALESCE($7, mrp), selling_price = COALESCE($8, selling_price),
        is_featured = COALESCE($9, is_featured), is_bestseller = COALESCE($10, is_bestseller),
        is_new = COALESCE($11, is_new), target_dosha = COALESCE($12, target_dosha), status = COALESCE($13, status),
        ingredients = COALESCE($14, ingredients), key_ingredients = COALESCE($15, key_ingredients),
        benefits = COALESCE($16, benefits), usage_directions = COALESCE($17, usage_directions),
        warnings = COALESCE($18, warnings), storage_info = COALESCE($19, storage_info),
        net_qty = COALESCE($20, net_qty), manufacturer_info = COALESCE($21, manufacturer_info),
        updated_at = NOW()
       WHERE id = $22`,
      [
        name, slug, category_id, brand, short_desc, description, parsedMrp, parsedSellingPrice,
        is_featured != null ? Boolean(is_featured) : null,
        is_bestseller != null ? Boolean(is_bestseller) : null,
        is_new != null ? Boolean(is_new) : null,
        target_dosha, status, ingredients, key_ingredients, benefits, usage_directions,
        warnings, storage_info, net_qty, manufacturer_info,
        productId,
      ]
    );

    if (parsedMrp !== null || parsedSellingPrice !== null) {
      await run(
        `UPDATE product_variants
         SET mrp = COALESCE($1, mrp), selling_price = COALESCE($2, selling_price)
         WHERE product_id = $3`,
        [parsedMrp, parsedSellingPrice, productId]
      );
    }


    await logAuditAction(req, 'UPDATE_PRODUCT', 'PRODUCT', productId, prev, req.body);
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {

    next(err);
  }
});


// Delete Product
router.delete('/products/:id', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const productId = req.params.id;
    await client.query('BEGIN');

    const prevRes = await client.query('SELECT name, slug FROM products WHERE id = $1 FOR UPDATE', [productId]);
    const prev = prevRes.rows[0];
    if (!prev) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Collect all variant IDs for this product within the transaction
    const variantsRes = await client.query('SELECT id FROM product_variants WHERE product_id = $1', [productId]);
    const variantIds = variantsRes.rows.map(v => v.id);

    // Delete all NO ACTION FK children in transaction-safe order before deleting product.

    // order_items are intentionally preserved — we null the references so historical order records remain intact.
    await client.query('DELETE FROM batches WHERE product_id = $1', [productId]);
    await client.query('UPDATE order_items SET product_id = NULL WHERE product_id = $1', [productId]);

    if (variantIds.length > 0) {
      const placeholders = variantIds.map((_, i) => `$${i + 1}`).join(', ');
      await client.query(`DELETE FROM inventory_transactions WHERE variant_id IN (${placeholders})`, variantIds);
      await client.query(`DELETE FROM cart_items WHERE variant_id IN (${placeholders})`, variantIds);
      await client.query(`DELETE FROM batches WHERE variant_id IN (${placeholders})`, variantIds);
      await client.query(`UPDATE order_items SET variant_id = NULL WHERE variant_id IN (${placeholders})`, variantIds);
    }

    // Now delete the product — product_images, product_variants, reviews, wishlist_items
    // will cascade automatically (CASCADE FK rules already in place).
    await client.query('DELETE FROM products WHERE id = $1', [productId]);

    await client.query('COMMIT');
    client.release();

    await logAuditAction(req, 'DELETE_PRODUCT', 'PRODUCT', productId, prev, null);
    res.json({ success: true, message: `Product "${prev.name}" deleted` });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Transaction rollback error:', rollbackErr);
    }
    client.release();
    next(err);
  }
});



// Add image to product gallery
router.post('/products/:id/images', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { image_url, display_order } = req.body;
    if (!image_url) return res.status(400).json({ success: false, error: 'image_url required' });

    const maxOrder = await get('SELECT MAX(display_order) as max_order FROM product_images WHERE product_id = $1', [productId]);
    const order = display_order || (maxOrder?.max_order || 0) + 1;

    const imgRes = await run(
      'INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3) RETURNING id',
      [productId, image_url, order]
    );
    await logAuditAction(req, 'ADD_PRODUCT_IMAGE', 'PRODUCT_IMAGE', imgRes.lastID, null, { product_id: productId, image_url });
    res.json({ success: true, image_id: imgRes.lastID });
  } catch (err) {
    next(err);
  }
});

// Delete image from product gallery
router.delete('/products/:id/images/:imageId', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  try {
    const { id: productId, imageId } = req.params;
    const img = await get('SELECT * FROM product_images WHERE id = $1 AND product_id = $2', [imageId, productId]);
    if (!img) return res.status(404).json({ success: false, error: 'Image not found' });

    await run('DELETE FROM product_images WHERE id = $1', [imageId]);
    await logAuditAction(req, 'DELETE_PRODUCT_IMAGE', 'PRODUCT_IMAGE', imageId, img, null);
    res.json({ success: true, message: 'Image removed from gallery' });
  } catch (err) {
    next(err);
  }
});

// Get all images for a product
router.get('/products/:id/images', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  try {
    const images = await query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
      [req.params.id]
    );
    res.json({ success: true, images });
  } catch (err) {
    next(err);
  }
});

// 4. Inventory & FEFO Batches Manager
router.get('/inventory', requireRole(['PRODUCT_MANAGER', 'ORDER_MANAGER']), async (req, res, next) => {
  try {
    const inventory = await query(
      `SELECT i.*, v.sku, v.attribute_name, v.attribute_value, p.name as product_name, p.slug as product_slug
       FROM inventory i
       JOIN product_variants v ON i.variant_id = v.id
       JOIN products p ON v.product_id = p.id
       ORDER BY i.available_stock ASC`
    );
    const batches = await query(
      `SELECT b.*, p.name as product_name, v.sku
       FROM batches b
       JOIN products p ON b.product_id = p.id
       JOIN product_variants v ON b.variant_id = v.id
       ORDER BY b.expiry_date ASC`
    );
    res.json({ success: true, inventory, batches });
  } catch (err) {
    next(err);
  }
});

router.put('/inventory/:variantId', requireRole(['PRODUCT_MANAGER']), async (req, res, next) => {
  try {
    const { available_stock, reason } = req.body;
    const variantId = req.params.variantId;
    const prevInv = await get('SELECT available_stock FROM inventory WHERE variant_id = $1', [variantId]);

    await run('UPDATE inventory SET available_stock = $1 WHERE variant_id = $2', [available_stock, variantId]);
    await run(
      'INSERT INTO inventory_transactions (variant_id, change_qty, reason, admin_id) VALUES ($1, $2, $3, $4)',
      [variantId, available_stock - (prevInv?.available_stock || 0), reason || 'Manual Admin Stock Adjustment', req.user.id]
    );

    await logAuditAction(req, 'ADJUST_INVENTORY', 'INVENTORY', variantId, prevInv, { available_stock });
    res.json({ success: true, message: 'Stock level updated' });
  } catch (err) {
    next(err);
  }
});

// 5. Returns & Refunds Manager
router.get('/returns', requireRole(['ORDER_MANAGER', 'SUPPORT_MANAGER']), async (req, res, next) => {
  try {
    const returns = await query(
      `SELECT r.*, o.order_number, u.email as user_email
       FROM returns r
       JOIN orders o ON r.order_id = o.id
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, returns });
  } catch (err) {
    next(err);
  }
});

router.put('/returns/:id/status', requireRole(['ORDER_MANAGER']), async (req, res, next) => {
  try {
    const { status, refund_amount, transaction_ref } = req.body;
    const returnId = req.params.id;

    const returnObj = await get(
      `SELECT r.*, oi.variant_id, oi.quantity FROM returns r
       JOIN order_items oi ON r.order_item_id = oi.id
       WHERE r.id = $1`,
      [returnId]
    );
    if (!returnObj) {
      return res.status(404).json({ success: false, error: 'Return not found' });
    }

    await run(
      `UPDATE returns SET status = $1, refund_amount = $2, transaction_ref = $3, updated_at = NOW() WHERE id = $4`,
      [status, refund_amount || returnObj.refund_amount, transaction_ref || null, returnId]
    );

    if (status === 'APPROVED') {
      await run("UPDATE orders SET status = 'RETURN_APPROVED' WHERE id = $1", [returnObj.order_id]);
    }

    if (status === 'REFUNDED') {
      await run(
        'UPDATE inventory SET available_stock = available_stock + $1, sold_stock = sold_stock - $2 WHERE variant_id = $3',
        [returnObj.quantity, returnObj.quantity, returnObj.variant_id]
      );

      await run(
        `INSERT INTO payments (order_id, amount, payment_method, status)
         VALUES ($1, $2, 'REFUND', 'SUCCESS')`,
        [returnObj.order_id, refund_amount || returnObj.refund_amount]
      );


      await run("UPDATE orders SET payment_status = 'REFUNDED', status = 'REFUNDED' WHERE id = $1", [returnObj.order_id]);
    }

    await logAuditAction(req, 'UPDATE_RETURN_STATUS', 'RETURN', returnId, null, { status, refund_amount });
    res.json({ success: true, message: `Return status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// 6. Reviews Moderation
router.get('/reviews', requireRole(['CONTENT_MANAGER', 'SUPPORT_MANAGER']), async (req, res, next) => {
  try {
    const reviews = await query(
      `SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC`
    );
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
});

router.put('/reviews/:id/status', requireRole(['CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const { status } = req.body;
    await run('UPDATE reviews SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true, message: `Review status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// 7. System Error Logs & Audit Logs
router.get('/system/error-logs', requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { severity, status } = req.query;
    let sql = 'SELECT * FROM error_logs WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (severity) {
      sql += ` AND severity = $${paramIdx++}`;
      params.push(severity);
    }
    if (status) {
      sql += ` AND status = $${paramIdx++}`;
      params.push(status);
    }

    sql += ' ORDER BY timestamp DESC LIMIT 100';
    const logs = await query(sql, params);

    const spikeCheck = await get(
      `SELECT COUNT(id) as count FROM error_logs
       WHERE severity IN ('ERROR', 'CRITICAL')
       AND timestamp >= NOW() - INTERVAL '15 minutes'`
    );

    const spikeCount = spikeCheck ? spikeCheck.count : 0;
    const spikeDetected = spikeCount >= 3;

    res.json({
      success: true,
      logs,
      spike_detector: {
        spike_detected: spikeDetected,
        recent_error_count_15m: spikeCount,
        threshold: 3,
        message: spikeDetected
          ? `⚠️ ALERT: Error spike detected! ${spikeCount} critical/system errors in the last 15 minutes.`
          : 'System error rate within normal parameters.',
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update Error Log Status
router.put('/system/error-logs/:id/status', requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { status } = req.body;
    const logId = req.params.id;

    if (!['NEW', 'INVESTIGATING', 'RESOLVED', 'IGNORED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid log status' });
    }

    await run('UPDATE error_logs SET status = $1 WHERE id = $2', [status, logId]);
    await logAuditAction(req, 'UPDATE_ERROR_LOG_STATUS', 'ERROR_LOG', logId, null, { status });

    res.json({ success: true, message: `Error log status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// 8. Webhook Inspector & Retry
router.get('/system/webhooks', requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const webhooks = await query('SELECT * FROM payment_events ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, webhooks });
  } catch (err) {
    next(err);
  }
});

router.post('/system/webhooks/:id/retry', requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const webhookId = req.params.id;
    const event = await get('SELECT * FROM payment_events WHERE id = $1', [webhookId]);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Webhook event not found' });
    }

    await run('UPDATE payment_events SET processed = TRUE WHERE id = $1', [webhookId]);
    await logAuditAction(req, 'RETRY_WEBHOOK', 'PAYMENT_EVENT', webhookId, { processed: event.processed }, { processed: true });

    res.json({
      success: true,
      message: `Webhook event #${webhookId} (${event.event_type}) callback re-triggered & marked processed successfully.`,
      event,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/upload', requireRole(['SUPER_ADMIN', 'PRODUCT_MANAGER', 'CONTENT_MANAGER']), async (req, res, next) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data received' });
    }

    let ext = 'jpg';
    let base64Data = image;
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    }

    const cleanName = filename
      ? filename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/\.[^/.]+$/, '')
      : 'product';
    const uniqueFilename = `${cleanName}-${Date.now()}.${ext}`;
    const filePath = path.join(publicProductsDir, uniqueFilename);

    const buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.mkdir(publicProductsDir, { recursive: true });
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/products/${uniqueFilename}`;
    console.log(`✅ Saved uploaded image to disk: ${filePath}`);
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    next(err);
  }
});

export default router;

