const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireCustomer } = require('../middleware/auth');

// Get all projects assigned to the authenticated customer
router.get('/my-projects', requireCustomer, async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const sql = `
      SELECT
        p.id, p.title, p.slug, p.description, p.location, p.house_type,
        p.built_up_area_sqft, p.number_of_floors, p.construction_cost,
        p.start_date, p.completion_date, p.status, p.main_image_url,
        cp.notes as customer_notes, cp.assigned_at,
        (
          SELECT COALESCE(MAX(pu.progress_percentage), 0)
          FROM progress_updates pu
          WHERE pu.project_id = p.id
        ) as overall_progress_percentage,
        (
          SELECT pu.stage_name
          FROM progress_updates pu
          WHERE pu.project_id = p.id
          ORDER BY pu.update_date DESC, pu.id DESC
          LIMIT 1
        ) as current_stage
      FROM customer_projects cp
      JOIN projects p ON cp.project_id = p.id
      WHERE cp.customer_id = $1
      ORDER BY cp.assigned_at DESC
    `;

    const result = await db.query(sql, [customerId]);
    res.json({ success: true, count: result.rows.length, projects: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get comprehensive project progress & milestone timeline for assigned project
router.get('/my-projects/:projectId', requireCustomer, async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { projectId } = req.params;

    // Verify ownership: customer must be assigned to this project
    const assignmentCheck = await db.query(
      'SELECT id, notes, assigned_at FROM customer_projects WHERE customer_id = $1 AND project_id = $2',
      [customerId, projectId]
    );

    // If user is admin viewing, or customer assigned:
    if (assignmentCheck.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this project.'
      });
    }

    // Fetch Project Details
    const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    const project = projectResult.rows[0];

    // Fetch Construction Milestones
    const milestonesResult = await db.query(
      'SELECT * FROM construction_milestones WHERE project_id = $1 ORDER BY stage_order ASC',
      [projectId]
    );

    // Fetch Chronological Progress Updates with Photos
    const progressResult = await db.query(
      'SELECT * FROM progress_updates WHERE project_id = $1 ORDER BY update_date DESC, id DESC',
      [projectId]
    );

    // Compute Overall Progress
    const latestUpdate = progressResult.rows[0];
    const overallProgress = latestUpdate ? latestUpdate.progress_percentage : 0;
    const currentStage = latestUpdate ? latestUpdate.stage_name : (milestonesResult.rows[0]?.stage_name || 'Planning and Design');

    res.json({
      success: true,
      data: {
        project,
        assignment: assignmentCheck.rows[0] || null,
        overall_progress_percentage: overallProgress,
        current_stage: currentStage,
        milestones: milestonesResult.rows,
        progress_updates: progressResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
