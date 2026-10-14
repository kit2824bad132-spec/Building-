const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Admin Login
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const result = await db.query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin', full_name: admin.full_name },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: 'admin'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Customer Registration
router.post('/customer/register', async (req, res, next) => {
  try {
    const { full_name, email, phone, password, address } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and password are required fields.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if customer email already exists
    const existing = await db.query('SELECT id FROM customers WHERE email = $1 LIMIT 1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insertResult = await db.query(
      `INSERT INTO customers (full_name, email, phone, password_hash, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, full_name, email, phone, address, created_at`,
      [full_name.trim(), cleanEmail, phone.trim(), password_hash, address ? address.trim() : '']
    );

    const customer = insertResult.rows[0];
    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer', full_name: customer.full_name },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Customer registration successful!',
      token,
      user: {
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name,
        phone: customer.phone,
        address: customer.address,
        role: 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Customer Login
router.post('/customer/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = await db.query('SELECT * FROM customers WHERE email = $1 LIMIT 1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid customer email or password.' });
    }

    const customer = result.rows[0];
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid customer email or password.' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer', full_name: customer.full_name },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name,
        phone: customer.phone,
        address: customer.address,
        role: 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Current User Profile
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const result = await db.query('SELECT id, full_name, email, role, created_at FROM admins WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Admin not found.' });
      }
      return res.json({ success: true, user: { ...result.rows[0], role: 'admin' } });
    } else {
      const result = await db.query('SELECT id, full_name, email, phone, address, created_at FROM customers WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      return res.json({ success: true, user: { ...result.rows[0], role: 'customer' } });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
