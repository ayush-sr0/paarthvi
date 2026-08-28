import express from 'express';
import { getShippingProvider } from '../services/shippingService.js';
import { get, run, query } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * Check Serviceability & Rate
 * POST /api/shipping/serviceability
 */
router.post('/serviceability', async (req, res, next) => {
  try {
    const { pincode, weight_grams, cod_required } = req.body;
    if (!pincode) {
      return res.status(400).json({ success: false, error: 'Pincode is required' });
    }

    const provider = getShippingProvider();
    const serviceability = await provider.checkServiceability(pincode);
    const rateInfo = await provider.getRate(pincode, weight_grams || 500, !!cod_required);

    res.json({
      success: true,
      serviceability,
      rate: rateInfo,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Create Waybill & Shipping Label (Selloship 2.0 API)
 * POST /api/shipping/create-waybill/:orderId
 * Role required: ORDER_MANAGER or SUPER_ADMIN
 */
router.post('/create-waybill/:orderId', requireAuth, requireRole(['ORDER_MANAGER', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await get('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.waybill) {
      return res.json({
        success: true,
        message: 'Waybill already generated for this order',
        waybill: order.waybill,
        courier_name: order.courier_name,
        shipping_label_url: order.shipping_label_url,
      });
    }

    const orderItems = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
    const shippingAddress = typeof order.shipping_address_json === 'string'
      ? JSON.parse(order.shipping_address_json || '{}')
      : (order.shipping_address_json || {});

    const provider = getShippingProvider();
    const result = await provider.createShipment({
      order_number: order.order_number,
      invoice_number: order.invoice_number,
      weight_grams: 500,
      length_mm: 150,
      height_mm: 100,
      breadth_mm: 100,
      items: orderItems,
      shipping_address: shippingAddress,
      customer_name: order.guest_name,
      customer_email: order.guest_email,
      customer_phone: order.guest_phone,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
      courierName: req.body.courierName || 'Delhivery',
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error || 'Failed to generate waybill' });
    }

    // Persist waybill & shipping details to order
    await run(
      `UPDATE orders 
       SET waybill = $1, courier_name = $2, shipping_label_url = $3, shipping_status = 'PACKED', status = 'PACKED', updated_at = NOW() 
       WHERE id = $4`,
      [result.waybill, result.courierName, result.shippingLabel, orderId]
    );

    res.json({
      success: true,
      waybill: result.waybill,
      courier_name: result.courierName,
      shipping_label_url: result.shippingLabel,
      routing_code: result.routingCode,
      status: 'PACKED',
      provider: result.provider,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Track Shipment (Get Status)
 * GET /api/shipping/track/:waybill
 */
router.get('/track/:waybill', async (req, res, next) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, error: 'Waybill number is required' });
    }

    const provider = getShippingProvider();
    const trackingInfo = await provider.trackShipment(waybill);
    // Read-only: status synchronisation to the orders table is intentionally
    // omitted here. This is a public unauthenticated endpoint; any DB write
    // must go through an authenticated, role-protected route or a background job.

    res.json({
      success: true,
      tracking: trackingInfo,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Cancel Waybill
 * POST /api/shipping/cancel-waybill/:orderId
 * Role required: ORDER_MANAGER or SUPER_ADMIN
 */
router.post('/cancel-waybill/:orderId', requireAuth, requireRole(['ORDER_MANAGER', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await get('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!order.waybill) {
      return res.status(400).json({ success: false, error: 'Order does not have an active waybill' });
    }

    // Prevent cancellation of orders that are already in a final state
    const FINAL_STATES = ['DELIVERED', 'CANCELLED'];
    if (FINAL_STATES.includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel waybill: order is already ${order.status}`,
      });
    }

    const provider = getShippingProvider();
    const cancelRes = await provider.cancelShipment(order.waybill);

    if (cancelRes.success) {
      await run(
        `UPDATE orders 
         SET shipping_status = 'CANCELLED', status = 'CANCELLED', updated_at = NOW() 
         WHERE id = $1`,
        [orderId]
      );
    }

    res.json({
      success: cancelRes.success,
      message: cancelRes.message || 'Waybill cancelled successfully',
      waybill: order.waybill,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Generate Shipping Manifest PDF
 * POST /api/shipping/manifest
 * Role required: ORDER_MANAGER or SUPER_ADMIN
 */
router.post('/manifest', requireAuth, requireRole(['ORDER_MANAGER', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const { awbNumbers } = req.body;
    if (!Array.isArray(awbNumbers) || awbNumbers.length === 0) {
      return res.status(400).json({ success: false, error: 'awbNumbers array is required' });
    }

    const provider = getShippingProvider();
    const manifestRes = await provider.generateManifest(awbNumbers);

    if (manifestRes.success && manifestRes.manifestDownloadUrl) {
      // Update orders table with manifest_url
      for (const awb of awbNumbers) {
        await run('UPDATE orders SET manifest_url = $1 WHERE waybill = $2', [manifestRes.manifestDownloadUrl, awb]);
      }
    }

    res.json(manifestRes);
  } catch (err) {
    next(err);
  }
});

export default router;
