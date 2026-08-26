import express from 'express';
import { query, get, run } from '../db/database.js';
import { requireAuth, authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// =================== Customer-facing endpoints ===================

// POST /api/support/tickets
router.post('/tickets', authenticateToken, async (req, res, next) => {
  try {
    const { subject, category, message, order_id, name, email } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ success: false, error: 'Subject, category, and message are required' });
    }

    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : (name || 'Guest');
    const userEmail = req.user ? req.user.email : email;

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'Email is required for guest tickets' });
    }

    const ticketCode = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await run(
      `INSERT INTO support_tickets (ticket_code, user_id, user_name, user_email, order_id, category, subject)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [ticketCode, userId, userName, userEmail, order_id || null, category, subject]
    );

    await run(
      `INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
       VALUES ($1, 'CUSTOMER', $2, $3)`,
      [result.lastID, userName, message]
    );

    res.json({
      success: true,
      ticket_id: result.lastID,
      ticket_code: ticketCode,
      message: 'Support ticket created successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/support/tickets
router.get('/tickets', requireAuth, async (req, res, next) => {
  try {
    const tickets = await query(
      `SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY updated_at DESC`,
      [req.user.id]
    );

    for (const ticket of tickets) {
      const msgCount = await get(
        'SELECT COUNT(id) as count FROM ticket_messages WHERE ticket_id = $1',
        [ticket.id]
      );
      ticket.message_count = msgCount.count || 0;
    }

    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
});

// GET /api/support/tickets/:id
router.get('/tickets/:id', requireAuth, async (req, res, next) => {
  try {
    const ticket = await get(
      'SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const messages = await query(
      'SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC',
      [ticket.id]
    );

    res.json({ success: true, ticket, messages });
  } catch (err) {
    next(err);
  }
});

// POST /api/support/tickets/:id/message
router.post('/tickets/:id/message', requireAuth, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const ticket = await get(
      'SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    await run(
      `INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
       VALUES ($1, 'CUSTOMER', $2, $3)`,
      [ticket.id, req.user.name, message]
    );

    await run(
      "UPDATE support_tickets SET status = 'OPEN', updated_at = NOW() WHERE id = $1",
      [ticket.id]
    );

    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    next(err);
  }
});

// =================== Admin endpoints ===================

// GET /api/support/admin/tickets
router.get('/admin/tickets', requireAuth, requireRole(['SUPPORT_MANAGER', 'ORDER_MANAGER']), async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;
    let sql = 'SELECT * FROM support_tickets WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status) {
      sql += ` AND status = $${paramIdx++}`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND priority = $${paramIdx++}`;
      params.push(priority);
    }
    if (category) {
      sql += ` AND category = $${paramIdx++}`;
      params.push(category);
    }

    sql += ` ORDER BY CASE priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, updated_at DESC`;

    const tickets = await query(sql, params);

    for (const ticket of tickets) {
      const msgCount = await get(
        'SELECT COUNT(id) as count FROM ticket_messages WHERE ticket_id = $1',
        [ticket.id]
      );
      ticket.message_count = msgCount.count || 0;
    }

    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
});

// GET /api/support/admin/tickets/:id
router.get('/admin/tickets/:id', requireAuth, requireRole(['SUPPORT_MANAGER', 'ORDER_MANAGER']), async (req, res, next) => {
  try {
    const ticket = await get('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const messages = await query(
      'SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC',
      [ticket.id]
    );

    res.json({ success: true, ticket, messages });
  } catch (err) {
    next(err);
  }
});

// PUT /api/support/admin/tickets/:id
router.put('/admin/tickets/:id', requireAuth, requireRole(['SUPPORT_MANAGER']), async (req, res, next) => {
  try {
    const { status, priority } = req.body;
    const ticket = await get('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const newStatus = status || ticket.status;
    const newPriority = priority || ticket.priority;

    await run(
      'UPDATE support_tickets SET status = $1, priority = $2, updated_at = NOW() WHERE id = $3',
      [newStatus, newPriority, ticket.id]
    );

    res.json({ success: true, message: `Ticket updated: status=${newStatus}, priority=${newPriority}` });
  } catch (err) {
    next(err);
  }
});

// POST /api/support/admin/tickets/:id/reply
router.post('/admin/tickets/:id/reply', requireAuth, requireRole(['SUPPORT_MANAGER', 'ORDER_MANAGER']), async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Reply message is required' });
    }

    const ticket = await get('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    await run(
      `INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
       VALUES ($1, 'SUPPORT', $2, $3)`,
      [ticket.id, req.user.name || 'Support Team', message]
    );

    await run(
      "UPDATE support_tickets SET status = 'IN_PROGRESS', updated_at = NOW() WHERE id = $1",
      [ticket.id]
    );

    res.json({ success: true, message: 'Reply sent' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/support/admin/tickets/:id/assign
router.put('/admin/tickets/:id/assign', requireAuth, requireRole(['SUPPORT_MANAGER']), async (req, res, next) => {
  try {
    const { assigned_to } = req.body;
    const ticket = await get('SELECT * FROM support_tickets WHERE id = $1', [req.params.id]);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    await run(
      'UPDATE support_tickets SET updated_at = NOW() WHERE id = $1',
      [ticket.id]
    );

    await run(
      `INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
       VALUES ($1, 'SUPPORT', 'System', $2)`,
      [ticket.id, `Ticket assigned to ${assigned_to || req.user.name}`]
    );

    res.json({ success: true, message: `Ticket assigned to ${assigned_to || req.user.name}`, assigned_to: assigned_to || req.user.name });
  } catch (err) {
    next(err);
  }
});

export default router;
