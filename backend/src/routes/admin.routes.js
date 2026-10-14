const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// Apply admin verification to all endpoints in this file
router.use(requireAdmin);

// 1. Dashboard Statistics
router.get('/stats', async (req, res, next) => {
  try {
    const totalProjectsRes = await db.query('SELECT COUNT(*) as count FROM projects');
    const publishedProjectsRes = await db.query('SELECT COUNT(*) as count FROM projects WHERE is_published = true');
    const ongoingProjectsRes = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Ongoing'");
    const completedProjectsRes = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Completed'");
    const totalEnquiriesRes = await db.query('SELECT COUNT(*) as count FROM enquiries');
    const newEnquiriesRes = await db.query("SELECT COUNT(*) as count FROM enquiries WHERE status = 'New'");
    const totalCustomersRes = await db.query('SELECT COUNT(*) as count FROM customers');

    // Recent 5 enquiries
    const recentEnquiriesRes = await db.query(`
      SELECT e.id, e.customer_name, e.phone, e.construction_location, e.status, e.created_at
      FROM enquiries e
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        total_projects: parseInt(totalProjectsRes.rows[0]?.count || 0),
        published_projects: parseInt(publishedProjectsRes.rows[0]?.count || 0),
        ongoing_projects: parseInt(ongoingProjectsRes.rows[0]?.count || 0),
        completed_projects: parseInt(completedProjectsRes.rows[0]?.count || 0),
        total_enquiries: parseInt(totalEnquiriesRes.rows[0]?.count || 0),
        new_enquiries: parseInt(newEnquiriesRes.rows[0]?.count || 0),
        total_customers: parseInt(totalCustomersRes.rows[0]?.count || 0)
      },
      recent_enquiries: recentEnquiriesRes.rows
    });
  } catch (error) {
    next(error);
  }
});

// 2. Customer List & Management
router.get('/customers', async (req, res, next) => {
  try {
    const sql = `
      SELECT
        c.id, c.full_name, c.email, c.phone, c.address, c.created_at,
        COUNT(cp.id) as assigned_projects_count,
        COALESCE(
          json_agg(
            json_build_object('id', p.id, 'title', p.title, 'status', p.status)
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) as assigned_projects
      FROM customers c
      LEFT JOIN customer_projects cp ON c.id = cp.customer_id
      LEFT JOIN projects p ON cp.project_id = p.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(sql);
    res.json({ success: true, count: result.rows.length, customers: result.rows });
  } catch (error) {
    next(error);
  }
});

// 3. Assign Project to Customer
router.post('/customer-projects/assign', async (req, res, next) => {
  try {
    const { customer_id, project_id, notes } = req.body;

    if (!customer_id || !project_id) {
      return res.status(400).json({ success: false, message: 'Both customer_id and project_id are required.' });
    }

    // Check if already assigned
    const check = await db.query(
      'SELECT id FROM customer_projects WHERE customer_id = $1 AND project_id = $2',
      [customer_id, project_id]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'This project is already assigned to this customer.' });
    }

    const result = await db.query(
      `INSERT INTO customer_projects (customer_id, project_id, notes, assigned_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [customer_id, project_id, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Project assigned to customer successfully!',
      assignment: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 4. Remove Project Assignment
router.delete('/customer-projects/unassign/:customerId/:projectId', async (req, res, next) => {
  try {
    const { customerId, projectId } = req.params;
    await db.query(
      'DELETE FROM customer_projects WHERE customer_id = $1 AND project_id = $2',
      [customerId, projectId]
    );
    res.json({ success: true, message: 'Project assignment removed successfully.' });
  } catch (error) {
    next(error);
  }
});

// 5. Milestones for a Project
router.get('/projects/:projectId/milestones', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await db.query(
      'SELECT * FROM construction_milestones WHERE project_id = $1 ORDER BY stage_order ASC',
      [projectId]
    );
    res.json({ success: true, milestones: result.rows });
  } catch (error) {
    next(error);
  }
});

// 6. Update Milestone Status & Remarks
router.put('/milestones/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks, completed_at } = req.body;

    const result = await db.query(
      `UPDATE construction_milestones
       SET status = COALESCE($1, status),
           remarks = COALESCE($2, remarks),
           completed_at = COALESCE($3, completed_at),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, remarks, completed_at || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    res.json({ success: true, message: 'Milestone updated.', milestone: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 7. Add Progress Update to Project
router.post('/projects/:projectId/progress-updates', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, progress_percentage, stage_name, photos, update_date } = req.body;

    if (!title || progress_percentage === undefined || !stage_name) {
      return res.status(400).json({
        success: false,
        message: 'Title, stage_name, and progress_percentage (0-100) are required.'
      });
    }

    const pct = parseInt(progress_percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress percentage must be an integer between 0 and 100.'
      });
    }

    const result = await db.query(
      `INSERT INTO progress_updates (
        project_id, title, description, progress_percentage,
        stage_name, photos, update_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        projectId,
        title.trim(),
        description || '',
        pct,
        stage_name.trim(),
        photos ? JSON.stringify(photos) : JSON.stringify([]),
        update_date || new Date().toISOString().split('T')[0]
      ]
    );

    // If progress is 100%, optionally update project status to Completed
    if (pct === 100) {
      await db.query("UPDATE projects SET status = 'Completed', updated_at = NOW() WHERE id = $1", [projectId]);
    }

    res.status(201).json({
      success: true,
      message: 'Progress update recorded and published to customer dashboard!',
      update: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 8. Delete Progress Update
router.delete('/progress-updates/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM progress_updates WHERE id = $1', [id]);
    res.json({ success: true, message: 'Progress update removed.' });
  } catch (error) {
    next(error);
  }
});

// 9. Company Settings
router.get('/company-settings', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM company_settings LIMIT 1');
    if (result.rows.length === 0) {
      const defaultInsert = await db.query(
        `INSERT INTO company_settings (company_name, phone, whatsapp_number, email, address, working_hours)
         VALUES ('Saravanan Builders', '+91 98400 12345', '919840012345', 'contact@saravananbuilders.com', '124, Gandhi Road, Anna Nagar, Chennai, Tamil Nadu - 600040', 'Mon - Sat: 9:00 AM - 7:00 PM')
         RETURNING *`
      );
      return res.json({ success: true, settings: defaultInsert.rows[0] });
    }
    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/company-settings', async (req, res, next) => {
  try {
    const { company_name, phone, whatsapp_number, email, address, working_hours } = req.body;
    const result = await db.query(
      `UPDATE company_settings
       SET company_name = COALESCE($1, company_name),
           phone = COALESCE($2, phone),
           whatsapp_number = COALESCE($3, whatsapp_number),
           email = COALESCE($4, email),
           address = COALESCE($5, address),
           working_hours = COALESCE($6, working_hours),
           updated_at = NOW()
       RETURNING *`,
      [company_name, phone, whatsapp_number, email, address, working_hours]
    );

    res.json({ success: true, message: 'Company settings updated successfully.', settings: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
