import express from 'express';
import { query, get, run } from '../db/database.js';
import { requireAuth, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET user orders
router.get('/my-orders', requireAuth, async (req, res, next) => {
  try {
    const orders = await query(
      `SELECT o.*,
              (SELECT COUNT(id) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      order.items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.shipping_address = JSON.parse(order.shipping_address_json || '{}');
    }

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// Track Order by Order Number & Email/Phone (Guest / Public tracking)
router.get('/track/:orderNumber', async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const shipment = await get('SELECT * FROM shipments WHERE order_id = ?', [order.id]);

    const timeline = [
      { status: 'PENDING', title: 'Order Placed', timestamp: order.created_at, done: true },
      { status: 'CONFIRMED', title: 'Order Confirmed', timestamp: order.created_at, done: order.status !== 'PENDING' && order.status !== 'CANCELLED' },
      { status: 'PROCESSING', title: 'Processing in Herbal Warehouse', timestamp: null, done: ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
      { status: 'PACKED', title: 'Packed & Quality Verified', timestamp: null, done: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
      { status: 'SHIPPED', title: 'Handed to Courier Partner', timestamp: shipment?.shipped_at || null, done: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
      { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', timestamp: null, done: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
      { status: 'DELIVERED', title: 'Delivered', timestamp: shipment?.delivered_at || null, done: order.status === 'DELIVERED' },
    ];

    res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        created_at: order.created_at,
        total_amount: order.total_amount,
        items,
        shipment,
        shipping_address: JSON.parse(order.shipping_address_json || '{}'),
        timeline,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Download GST Tax Invoice Data
router.get('/:id/invoice', authenticateToken, async (req, res, next) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const shippingAddress = JSON.parse(order.shipping_address_json || '{}');

    const invoiceData = {
      store_info: {
        name: 'Parthvi Ayurveda (Parthvi Herbal Formulations Pvt Ltd)',
        address: 'Plot 14, Industrial Estate, Haridwar, Uttarakhand - 249401',
        gstin: '05AAACP1234F1Z9',
        fssai_lic: '12621005000432',
        email: 'support@parthvi.com',
        phone: '+91 9876543210',
      },
      invoice_number: order.invoice_number || `INV-${order.id}`,
      invoice_date: order.created_at,
      order_number: order.order_number,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      customer_info: {
        name: shippingAddress.name || order.guest_name || 'Customer',
        phone: shippingAddress.phone || order.guest_phone,
        email: order.guest_email || req.user?.email,
        address: `${shippingAddress.street || ''}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pincode || ''}`,
      },
      items: items.map(item => ({
        description: `${item.product_name} (${item.variant_name})`,
        hsn_sac: '30049011', // Ayurvedic Medicaments HSN Code
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        mrp: item.mrp,
        total_price: item.total_price,
        gst_rate: '12%',
      })),
      pricing: {
        subtotal: order.subtotal,
        discount_amount: order.discount_amount,
        tax_amount: order.tax_amount,
        cgst: Math.round((order.tax_amount / 2) * 100) / 100,
        sgst: Math.round((order.tax_amount / 2) * 100) / 100,
        shipping_fee: order.shipping_fee,
        total_amount: order.total_amount,
      },
    };

    res.json({ success: true, invoice: invoiceData });
  } catch (err) {
    next(err);
  }
});

// Cancel Order (User or Admin)
router.post('/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Order cannot be cancelled in its current state' });
    }

    // Release stock
    const orderItems = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    for (const item of orderItems) {
      if (order.payment_status === 'PAID') {
        // Stock was sold, return to available
        await run(
          'UPDATE inventory SET available_stock = available_stock + ?, sold_stock = sold_stock - ? WHERE variant_id = ?',
          [item.quantity, item.quantity, item.variant_id]
        );
      } else {
        // Stock was reserved, release
        await run(
          'UPDATE inventory SET available_stock = available_stock + ?, reserved_stock = reserved_stock - ? WHERE variant_id = ?',
          [item.quantity, item.quantity, item.variant_id]
        );
      }
    }

    await run("UPDATE orders SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

// Request Return
router.post('/:id/return', requireAuth, async (req, res, next) => {
  try {
    const { order_item_id, reason, image_url } = req.body;
    if (!order_item_id || !reason) {
      return res.status(400).json({ success: false, error: 'Order item and return reason are required' });
    }

    const order = await get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, error: 'Return request can only be submitted for delivered orders' });
    }

    const orderItem = await get('SELECT * FROM order_items WHERE id = ? AND order_id = ?', [order_item_id, order.id]);
    if (!orderItem) {
      return res.status(404).json({ success: false, error: 'Order item not found' });
    }

    const result = await run(
      `INSERT INTO returns (order_id, order_item_id, user_id, reason, image_url, refund_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED')`,
      [order.id, orderItem.id, req.user.id, reason, image_url || null, orderItem.total_price]
    );

    await run("UPDATE orders SET status = 'RETURN_REQUESTED' WHERE id = ?", [order.id]);

    res.json({ success: true, return_id: result.lastID, message: 'Return request submitted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
