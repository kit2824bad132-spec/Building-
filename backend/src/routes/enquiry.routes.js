const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireAdmin, requireCustomer } = require('../middleware/auth');
const { sendEnquiryNotificationEmail } = require('../services/email.service');

// Submit an enquiry (Public or Authenticated Customer)
router.post('/', async (req, res, next) => {
  try {
    const {
      customer_name,
      phone,
      email,
      construction_location,
      built_up_area_sqft,
      budget_range,
      message,
      project_id,
      hp_field // Honeypot spam protection field
    } = req.body;

    // 1. Basic Spam Protection (Honeypot check)
    if (hp_field && hp_field.trim() !== '') {
      console.warn('[Spam Protection] Bot submission blocked via honeypot field.');
      return res.status(400).json({
        success: false,
        message: 'Spam submission detected.'
      });
    }

    // 2. Server-Side Validation
    if (!customer_name || !customer_name.trim() || customer_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid full name (at least 2 characters).'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '').trim();
    if (cleanPhone.replace(/[^\d]/g, '').length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number (at least 10 digits).'
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address or leave it empty.'
        });
      }
    }

    if (!construction_location || !construction_location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Construction location is required.'
      });
    }

    if (!message || !message.trim() || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide plot details or a message (at least 5 characters).'
      });
    }

    // 3. Prevent Accidental Duplicate Submissions (within 45 seconds)
    try {
      const duplicateCheck = await db.query(
        `SELECT id FROM enquiries
         WHERE phone = $1 AND message = $2
         AND created_at > NOW() - INTERVAL '45 seconds'
         LIMIT 1`,
        [cleanPhone, message.trim()]
      );

      if (duplicateCheck && duplicateCheck.rows && duplicateCheck.rows.length > 0) {
        return res.status(429).json({
          success: false,
          message: 'A duplicate enquiry was recently received. Please wait a moment before resubmitting.'
        });
      }
    } catch (dupErr) {
      // Continue if duplicate interval query isn't supported by storage engine
    }

    // 4. Associate Customer ID if token provided
    let customerId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded && decoded.role === 'customer') {
          customerId = decoded.id;
        }
      } catch (e) {
        // Continue as guest
      }
    }

    // 5. Save Enquiry in Neon PostgreSQL Database
    const insertResult = await db.query(
      `INSERT INTO enquiries (
        customer_name, phone, email, construction_location,
        built_up_area_sqft, budget_range, message, project_id,
        customer_id, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'New', NOW(), NOW())
      RETURNING *`,
      [
        customer_name.trim(),
        cleanPhone,
        email && email.trim() ? email.trim().toLowerCase() : null,
        construction_location.trim(),
        built_up_area_sqft && !isNaN(Number(built_up_area_sqft)) ? Number(built_up_area_sqft) : null,
        budget_range || null,
        message.trim(),
        project_id && !isNaN(Number(project_id)) ? Number(project_id) : null,
        customerId
      ]
    );

    const savedEnquiry = insertResult.rows[0];

    // 6. Send Email Notification to Management (sabarispm7708@gmail.com)
    try {
      await sendEnquiryNotificationEmail({
        customer_name: customer_name.trim(),
        phone: cleanPhone,
        email: email && email.trim() ? email.trim().toLowerCase() : null,
        construction_location: construction_location.trim(),
        built_up_area_sqft: built_up_area_sqft && !isNaN(Number(built_up_area_sqft)) ? Number(built_up_area_sqft) : null,
        budget_range: budget_range || null,
        message: message.trim(),
        submission_date: savedEnquiry ? savedEnquiry.created_at : new Date()
      });
    } catch (emailError) {
      console.error('[Email Notification Failure]:', emailError.message);
      // Return actionable error if email delivery fails, allowing the client to retry
      return res.status(502).json({
        success: false,
        message: 'Enquiry was recorded, but email notification delivery failed. Please retry or contact us directly on WhatsApp.',
        error: emailError.message
      });
    }

    // 7. Build prefilled WhatsApp message link
    const whatsappNum = process.env.COMPANY_WHATSAPP || '917540061497';
    const waText = encodeURIComponent(
      `Hello Saravanan Builders,\nMy name is ${customer_name}.\nI would like to enquire about building a residential home in ${construction_location}.\n` +
      (built_up_area_sqft ? `Approx. Area: ${built_up_area_sqft} sq.ft.\n` : '') +
      (budget_range ? `Budget: ${budget_range}\n` : '') +
      `Note: ${message}`
    );
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=${waText}`;

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received and emailed directly to our chief engineering team. We will contact you shortly.',
      enquiry: savedEnquiry,
      whatsappUrl,
      emailDelivered: true
    });
  } catch (error) {
    next(error);
  }
});

// Customer: View my own enquiries
router.get('/my-enquiries', requireCustomer, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT e.*, p.title as project_title, p.slug as project_slug
       FROM enquiries e
       LEFT JOIN projects p ON e.project_id = p.id
       WHERE e.customer_id = $1 OR e.email = $2
       ORDER BY e.created_at DESC`,
      [req.user.id, req.user.email]
    );

    res.json({ success: true, count: result.rows.length, enquiries: result.rows });
  } catch (error) {
    next(error);
  }
});

// Admin: View all enquiries with filtering & status
router.get('/admin/all', requireAdmin, async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT e.*, p.title as project_title, p.slug as project_slug
      FROM enquiries e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND e.status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (LOWER(e.customer_name) LIKE $${paramIndex} OR LOWER(e.phone) LIKE $${paramIndex} OR LOWER(e.construction_location) LIKE $${paramIndex})`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    sql += ' ORDER BY e.created_at DESC';

    const result = await db.query(sql, params);
    res.json({ success: true, count: result.rows.length, enquiries: result.rows });
  } catch (error) {
    next(error);
  }
});

// Admin: Update enquiry status & notes
router.put('/admin/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['New', 'Contacted', 'Quotation Sent', 'Converted', 'Closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await db.query(
      `UPDATE enquiries
       SET status = COALESCE($1, status),
           admin_notes = COALESCE($2, admin_notes),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, admin_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({
      success: true,
      message: 'Enquiry updated successfully.',
      enquiry: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Delete an enquiry
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM enquiries WHERE id = $1', [id]);
    res.json({ success: true, message: 'Enquiry removed successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
