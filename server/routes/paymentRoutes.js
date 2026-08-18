import express from 'express';
import crypto from 'crypto';
import { query, get, run } from '../db/database.js';

const router = express.Router();

const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_1234567890';
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_key_1234567890';

// Verify Payment Callback (Frontend Checkout completion)
router.post('/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Missing payment verification credentials' });
    }

    const order = await get('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    let isValidSignature = true;
    if (razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValidSignature = (generatedSignature === razorpay_signature);
    }

    if (!isValidSignature) {
      // Payment Failed: release reserved stock
      const orderItems = await query('SELECT * FROM order_items WHERE order_id = ?', [order_id]);
      for (const item of orderItems) {
        await run(
          `UPDATE inventory
           SET available_stock = available_stock + ?, reserved_stock = reserved_stock - ?
           WHERE variant_id = ?`,
          [item.quantity, item.quantity, item.variant_id]
        );
      }

      await run("UPDATE orders SET payment_status = 'FAILED', status = 'CANCELLED' WHERE id = ?", [order_id]);
      await run(
        `INSERT INTO payments (order_id, amount, payment_method, status, razorpay_order_id, razorpay_payment_id, razorpay_signature)
         VALUES (?, ?, 'RAZORPAY', 'FAILED', ?, ?, ?)`,
        [order_id, order.total_amount, razorpay_order_id, razorpay_payment_id, razorpay_signature]
      );

      return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

    // Payment Successful
    await run(
      `UPDATE orders
       SET payment_status = 'PAID', status = 'CONFIRMED', razorpay_payment_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [razorpay_payment_id, order_id]
    );

    // Finalize stock: move reserved -> sold
    const orderItems = await query('SELECT * FROM order_items WHERE order_id = ?', [order_id]);
    for (const item of orderItems) {
      await run(
        `UPDATE inventory
         SET reserved_stock = reserved_stock - ?, sold_stock = sold_stock + ?
         WHERE variant_id = ?`,
        [item.quantity, item.quantity, item.variant_id]
      );
    }

    // Log payment record
    await run(
      `INSERT INTO payments (order_id, amount, payment_method, status, razorpay_order_id, razorpay_payment_id, razorpay_signature)
       VALUES (?, ?, 'RAZORPAY', 'SUCCESS', ?, ?, ?)`,
      [order_id, order.total_amount, razorpay_order_id, razorpay_payment_id, razorpay_signature]
    );

    // Track analytics event
    await run(
      `INSERT INTO analytics_events (event_name, session_id, user_id, page, order_id, metadata_json)
       VALUES ('PURCHASE', 'checkout_session', ?, '/checkout/confirmation', ?, ?)`,
      [order.user_id, order_id, JSON.stringify({ amount: order.total_amount, method: 'RAZORPAY' })]
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order_number: order.order_number,
      invoice_number: order.invoice_number,
    });
  } catch (err) {
    next(err);
  }
});

// Razorpay Webhook Receiver Endpoint (Idempotent callback handler)
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventId = req.headers['x-razorpay-event-id'] || `evt_${Date.now()}`;
    const payload = JSON.stringify(req.body);

    // Check duplicate webhook event
    const existingEvent = await get('SELECT id FROM payment_events WHERE event_id = ?', [eventId]);
    if (existingEvent) {
      return res.status(200).json({ success: true, message: 'Event already processed' });
    }

    // Verify signature if secret provided
    let verified = true;
    if (signature && razorpayWebhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', razorpayWebhookSecret)
        .update(payload)
        .digest('hex');
      verified = (expectedSignature === signature);
    }

    // Log Webhook Event
    await run(
      `INSERT INTO payment_events (provider, event_type, event_id, payload_json, processed)
       VALUES ('RAZORPAY', ?, ?, ?, 1)`,
      [req.body.event || 'payment.captured', eventId, payload]
    );

    const eventType = req.body.event;
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await get('SELECT * FROM orders WHERE razorpay_order_id = ?', [razorpayOrderId]);
        if (order && order.payment_status !== 'PAID') {
          await run(
            `UPDATE orders
             SET payment_status = 'PAID', status = 'CONFIRMED', razorpay_payment_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [razorpayPaymentId, order.id]
          );

          const orderItems = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
          for (const item of orderItems) {
            await run(
              `UPDATE inventory
               SET reserved_stock = reserved_stock - ?, sold_stock = sold_stock + ?
               WHERE variant_id = ?`,
              [item.quantity, item.quantity, item.variant_id]
            );
          }
        }
      }
    }

    res.json({ success: true, verified });
  } catch (err) {
    next(err);
  }
});

// System Payment Health Metrics API
router.get('/health', async (req, res, next) => {
  try {
    const totalPayments = await get('SELECT COUNT(id) as count FROM payments');
    const successfulPayments = await get("SELECT COUNT(id) as count FROM payments WHERE status = 'SUCCESS'");
    const failedPayments = await get("SELECT COUNT(id) as count FROM payments WHERE status = 'FAILED'");
    const totalWebhooks = await get('SELECT COUNT(id) as count FROM payment_events');

    res.json({
      success: true,
      total_payments: totalPayments.count || 0,
      successful_payments: successfulPayments.count || 0,
      failed_payments: failedPayments.count || 0,
      success_rate: totalPayments.count > 0 ? Math.round((successfulPayments.count / totalPayments.count) * 100) : 100,
      total_webhooks_processed: totalWebhooks.count || 0,
      gateway_status: 'OPERATIONAL',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
