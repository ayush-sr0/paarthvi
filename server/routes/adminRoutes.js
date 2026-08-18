import express from 'express';
import { query, get, run } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to log admin actions in audit_logs
const logAuditAction = async (req, action, entity, entity_id, prev_val = null, new_val = null) => {
  try {
    await run(
      `INSERT INTO audit_logs (admin_id, admin_email, action, entity, entity_id, prev_value_json, new_value_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
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

// Protect all admin routes
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
    const expiringBatches = await get(`SELECT COUNT(id) as count FROM batches WHERE expiry_date <= DATE('now', '+90 days')`);
    const totalCustomers = await get(`SELECT COUNT(id) as count FROM users WHERE role = 'CUSTOMER'`);

    const recentOrders = await query(`SELECT id, order_number, guest_name, total_amount, status, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`);
    const topProducts = await query(
      `SELECT p.name, SUM(oi.quantity) as total_qty, SUM(oi.total_price) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id ORDER BY total_qty DESC LIMIT 5`
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
        conversion_rate: 3.42, // Simulated analytics conversion rate
      },
      recent_orders: recentOrders,
      top_products: topProducts,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Orders Manager (List & Filter Orders)
router.get('/orders', requireRole(['ORDER_MANAGER', 'SUPPORT_MANAGER']), async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = `SELECT * FROM orders WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (order_number LIKE ? OR guest_name LIKE ? OR guest_phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY created_at DESC`;
    const orders = await query(sql, params);

    for (const o of orders) {
      o.items = await query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
    }

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// Update Order Status (Order State Machine Transition)
router.put('/orders/:id/status', requireRole(['ORDER_MANAGER']), async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const order = await get('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    await run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, orderId]);
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
    const { name, slug, category_id, brand, short_desc, description, mrp, selling_price, is_featured, is_bestseller, ingredients, key_ingredients, benefits, usage_directions, warnings, storage_info, net_qty, manufacturer_info, image_url } = req.body;

    const resProd = await run(
      `INSERT INTO products (
        name, slug, category_id, brand, short_desc, description, mrp, selling_price,
        is_featured, is_bestseller, ingredients, key_ingredients, benefits, usage_directions, warnings, storage_info, net_qty, manufacturer_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, category_id, brand || 'Parthvi Ayurveda', short_desc, description, mrp, selling_price, is_featured ? 1 : 0, is_bestseller ? 1 : 0, ingredients, key_ingredients, benefits, usage_directions, warnings, storage_info, net_qty, manufacturer_info]
    );

    const productId = resProd.lastID;
    if (image_url) {
      await run('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 1)', [productId, image_url]);
    }

    // Default variant & inventory
    const resVar = await run(
      'INSERT INTO product_variants (product_id, sku, attribute_name, attribute_value, mrp, selling_price) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, `SKU-${slug.toUpperCase()}-STD`, 'Pack', 'Standard Pack', mrp, selling_price]
    );

    await run('INSERT INTO inventory (variant_id, available_stock, low_stock_threshold) VALUES (?, 100, 10)', [resVar.lastID]);

    await logAuditAction(req, 'CREATE_PRODUCT', 'PRODUCT', productId, null, { name, slug });
    res.json({ success: true, product_id: productId });
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
    const prevInv = await get('SELECT available_stock FROM inventory WHERE variant_id = ?', [variantId]);

    await run('UPDATE inventory SET available_stock = ? WHERE variant_id = ?', [available_stock, variantId]);
    await run(
      'INSERT INTO inventory_transactions (variant_id, change_qty, reason, admin_id) VALUES (?, ?, ?, ?)',
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
    const { status, refund_amount } = req.body;
    const returnId = req.params.id;

    await run(
      `UPDATE returns SET status = ?, refund_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, refund_amount, returnId]
    );

    if (status === 'REFUNDED') {
      const retObj = await get('SELECT order_id FROM returns WHERE id = ?', [returnId]);
      if (retObj) {
        await run("UPDATE orders SET payment_status = 'REFUNDED', status = 'REFUNDED' WHERE id = ?", [retObj.order_id]);
      }
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
    await run('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Review status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// 7. System Error Logs & Audit Logs
router.get('/system/error-logs', requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const logs = await query('SELECT * FROM error_logs ORDER BY timestamp DESC LIMIT 100');
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

router.get('/system/audit-logs', requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const logs = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

export default router;
