import express from 'express';
import bcrypt from 'bcryptjs';
import { run, get, query } from '../db/database.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Register new customer
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const existing = await get('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, passwordHash, phone || null, 'CUSTOMER']
    );

    const user = { id: result.lastID, name, email, role: 'CUSTOMER' };
    const token = generateToken(user);

    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await get('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    next(err);
  }
});

// Google Login via Supabase
router.post('/supabase-google', async (req, res, next) => {
  try {
    const { email, name, avatar_url } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required for Google authentication' });
    }

    let user = await get('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      const passwordHash = await bcrypt.hash(`google-auth-${Date.now()}`, 10);
      const result = await run(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name || email.split('@')[0], email, passwordHash, 'CUSTOMER']
      );
      user = { id: result.lastID, name: name || email.split('@')[0], email, role: 'CUSTOMER', phone: null };
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' },
    });
  } catch (err) {
    next(err);
  }
});


// Get current profile
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await get('SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1', [req.user.id]);
    const addresses = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id DESC', [req.user.id]);
    res.json({ success: true, user, addresses });
  } catch (err) {
    next(err);
  }
});

// Add delivery address
router.post('/address', requireAuth, async (req, res, next) => {
  try {
    const { name, phone, street_address, city, state, pincode, is_default } = req.body;
    if (!name || !phone || !street_address || !city || !state || !pincode) {
      return res.status(400).json({ success: false, error: 'All address fields are required' });
    }

    if (is_default) {
      await run('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }

    const result = await run(
      `INSERT INTO addresses (user_id, name, phone, street_address, city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [req.user.id, name, phone, street_address, city, state, pincode, is_default ? true : false]
    );

    res.json({ success: true, address_id: result.lastID });
  } catch (err) {
    next(err);
  }
});

// Edit delivery address
router.put('/address/:id', requireAuth, async (req, res, next) => {
  try {
    const addressId = req.params.id;
    const existing = await get('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [addressId, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    const { name, phone, street_address, city, state, pincode, is_default } = req.body;

    if (is_default) {
      await run('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }

    await run(
      `UPDATE addresses
       SET name = $1, phone = $2, street_address = $3, city = $4, state = $5, pincode = $6, is_default = $7
       WHERE id = $8 AND user_id = $9`,
      [
        name || existing.name,
        phone || existing.phone,
        street_address || existing.street_address,
        city || existing.city,
        state || existing.state,
        pincode || existing.pincode,
        is_default !== undefined ? Boolean(is_default) : existing.is_default,
        addressId,
        req.user.id,
      ]
    );

    res.json({ success: true, message: 'Address updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete delivery address
router.delete('/address/:id', requireAuth, async (req, res, next) => {
  try {
    const addressId = req.params.id;
    const existing = await get('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [addressId, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    await run('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [addressId, req.user.id]);
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Set default delivery address
router.put('/address/:id/default', requireAuth, async (req, res, next) => {
  try {
    const addressId = req.params.id;
    await run('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    await run('UPDATE addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2', [addressId, req.user.id]);
    res.json({ success: true, message: 'Default address updated' });
  } catch (err) {
    next(err);
  }
});

export default router;
