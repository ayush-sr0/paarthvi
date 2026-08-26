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
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      order.items = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.shipping_address = typeof order.shipping_address_json === 'string'
        ? JSON.parse(order.shipping_address_json || '{}')
        : (order.shipping_address_json || {});
    }

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// Track Order by Order Number (Guest / Public tracking)
router.get('/track/:orderNumber', async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await get('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    const shipment = await get('SELECT * FROM shipments WHERE order_id = $1', [order.id]);

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
        shipping_address: typeof order.shipping_address_json === 'string'
          ? JSON.parse(order.shipping_address_json || '{}')
          : (order.shipping_address_json || {}),
        timeline,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Download GST Tax Invoice
router.get('/:id/invoice', authenticateToken, async (req, res, next) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    const shippingAddress = typeof order.shipping_address_json === 'string'
      ? JSON.parse(order.shipping_address_json || '{}')
      : (order.shipping_address_json || {});

    const storeInfo = {
      name: 'Parthvi Ayurveda (Parthvi Herbal Formulations Pvt Ltd)',
      address: 'Plot 14, Industrial Estate, Haridwar, Uttarakhand - 249401',
      gstin: '05AAACP1234F1Z9',
      fssai_lic: '12621005000432',
      email: 'support@parthvi.com',
      phone: '+91 9876543210',
    };

    const invoiceData = {
      store_info: storeInfo,
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
        hsn_sac: '30049011',
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

    const itemRows = invoiceData.items.map((item, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e2dc;">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e2dc;">${item.description}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e2dc;text-align:center;">${item.hsn_sac}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e2dc;text-align:center;">${item.sku}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e2dc;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e2dc;text-align:right;">₹${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e2dc;text-align:right;">₹${Number(item.total_price).toFixed(2)}</td>
      </tr>
    `).join('');

    const invoice_html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice ${invoiceData.invoice_number}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c1c18; margin: 0; padding: 30px; }
    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1A2E1D; padding-bottom: 15px; margin-bottom: 20px; }
    .store-name { font-size: 20px; font-weight: bold; color: #1A2E1D; }
    .store-detail { font-size: 11px; color: #424841; margin-top: 4px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { margin: 0; font-size: 22px; color: #1A2E1D; letter-spacing: 2px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .meta-box { padding: 12px; background: #f6f3ed; border-radius: 6px; font-size: 12px; }
    .meta-box h4 { margin: 0 0 6px; color: #C5A059; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 20px 0; }
    th { background: #1A2E1D; color: #fff; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .totals { margin-left: auto; width: 280px; font-size: 12px; }
    .totals tr td { padding: 5px 8px; }
    .totals .grand { font-size: 16px; font-weight: bold; color: #1A2E1D; border-top: 2px solid #1A2E1D; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e2dc; font-size: 10px; color: #727971; text-align: center; }
    @media print { body { padding: 15px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="store-name">🌿 ${storeInfo.name}</div>
      <div class="store-detail">${storeInfo.address}</div>
      <div class="store-detail">GSTIN: ${storeInfo.gstin} | FSSAI: ${storeInfo.fssai_lic}</div>
      <div class="store-detail">Email: ${storeInfo.email} | Phone: ${storeInfo.phone}</div>
    </div>
    <div class="invoice-title">
      <h2>TAX INVOICE</h2>
      <div class="store-detail" style="text-align:right;">${invoiceData.invoice_number}</div>
      <div class="store-detail" style="text-align:right;">Date: ${new Date(invoiceData.invoice_date).toLocaleDateString('en-IN')}</div>
    </div>
  </div>
  <div class="meta-grid">
    <div class="meta-box">
      <h4>Bill To</h4>
      <strong>${invoiceData.customer_info.name}</strong><br/>
      ${invoiceData.customer_info.address}<br/>
      Phone: ${invoiceData.customer_info.phone || 'N/A'}<br/>
      Email: ${invoiceData.customer_info.email || 'N/A'}
    </div>
    <div class="meta-box">
      <h4>Order Details</h4>
      Order: <strong>${invoiceData.order_number}</strong><br/>
      Payment: ${invoiceData.payment_method} (${invoiceData.payment_status})<br/>
      Date: ${new Date(invoiceData.invoice_date).toLocaleDateString('en-IN')}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Product</th><th>HSN/SAC</th><th>SKU</th><th>Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right;">₹${Number(invoiceData.pricing.subtotal).toFixed(2)}</td></tr>
    ${invoiceData.pricing.discount_amount > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:#C5A059;">-₹${Number(invoiceData.pricing.discount_amount).toFixed(2)}</td></tr>` : ''}
    <tr><td>CGST (6%)</td><td style="text-align:right;">₹${invoiceData.pricing.cgst.toFixed(2)}</td></tr>
    <tr><td>SGST (6%)</td><td style="text-align:right;">₹${invoiceData.pricing.sgst.toFixed(2)}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right;">${invoiceData.pricing.shipping_fee > 0 ? '₹' + Number(invoiceData.pricing.shipping_fee).toFixed(2) : 'FREE'}</td></tr>
    <tr class="grand"><td>Grand Total</td><td style="text-align:right;">₹${Number(invoiceData.pricing.total_amount).toFixed(2)}</td></tr>
  </table>
  <div class="footer">
    This is a computer-generated invoice and does not require a physical signature.<br/>
    Thank you for choosing Parthvi Ayurveda — Ancient Wisdom, Modern Wellness.
  </div>
  <div class="no-print" style="text-align:center;margin-top:20px;">
    <button onclick="window.print()" style="background:#1A2E1D;color:#fff;border:none;padding:12px 30px;border-radius:20px;font-size:13px;cursor:pointer;">Print / Save as PDF</button>
  </div>
</body>
</html>`;

    res.json({ success: true, invoice: invoiceData, invoice_html });
  } catch (err) {
    next(err);
  }
});

// Cancel Order
router.post('/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Order cannot be cancelled in its current state' });
    }

    const orderItems = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    for (const item of orderItems) {
      if (order.payment_status === 'PAID') {
        await run(
          'UPDATE inventory SET available_stock = available_stock + $1, sold_stock = sold_stock - $2 WHERE variant_id = $3',
          [item.quantity, item.quantity, item.variant_id]
        );
      } else {
        await run(
          'UPDATE inventory SET available_stock = available_stock + $1, reserved_stock = reserved_stock - $2 WHERE variant_id = $3',
          [item.quantity, item.quantity, item.variant_id]
        );
      }
    }

    await run("UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1", [order.id]);

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

    const order = await get('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, error: 'Return request can only be submitted for delivered orders' });
    }

    const orderItem = await get('SELECT * FROM order_items WHERE id = $1 AND order_id = $2', [order_item_id, order.id]);
    if (!orderItem) {
      return res.status(404).json({ success: false, error: 'Order item not found' });
    }

    const result = await run(
      `INSERT INTO returns (order_id, order_item_id, user_id, reason, image_url, refund_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'REQUESTED') RETURNING id`,
      [order.id, orderItem.id, req.user.id, reason, image_url || null, orderItem.total_price]
    );

    await run("UPDATE orders SET status = 'RETURN_REQUESTED' WHERE id = $1", [order.id]);

    res.json({ success: true, return_id: result.lastID, message: 'Return request submitted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
