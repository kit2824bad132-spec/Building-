const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const { upload, isCloudinaryConfigured, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Helper to generate unique URL-friendly slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ==========================================
// PUBLIC PROJECT ROUTES
// ==========================================

// Get all published projects with filtering & search
router.get('/', async (req, res, next) => {
  try {
    const { location, house_type, status, max_budget, search } = req.query;

    let sql = `
      SELECT p.*,
        ROUND((p.construction_cost / NULLIF(p.built_up_area_sqft, 0)), 2) as cost_per_sqft,
        COALESCE(
          json_agg(
            json_build_object('id', pi.id, 'image_url', pi.image_url, 'caption', pi.caption, 'display_order', pi.display_order)
          ) FILTER (WHERE pi.id IS NOT NULL), '[]'
        ) as images
      FROM projects p
      LEFT JOIN project_images pi ON p.id = pi.project_id
      WHERE p.is_published = true
    `;

    const params = [];
    let paramIndex = 1;

    if (location) {
      sql += ` AND LOWER(p.location) LIKE $${paramIndex++}`;
      params.push(`%${location.toLowerCase()}%`);
    }

    if (house_type) {
      sql += ` AND LOWER(p.house_type) = $${paramIndex++}`;
      params.push(house_type.toLowerCase());
    }

    if (status) {
      sql += ` AND p.status = $${paramIndex++}`;
      params.push(status);
    }

    if (max_budget && !isNaN(Number(max_budget))) {
      sql += ` AND p.construction_cost <= $${paramIndex++}`;
      params.push(Number(max_budget));
    }

    if (search) {
      sql += ` AND (LOWER(p.title) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex} OR LOWER(p.location) LIKE $${paramIndex})`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    sql += ` GROUP BY p.id ORDER BY p.is_featured DESC, p.created_at DESC`;

    const result = await db.query(sql, params);
    res.json({ success: true, count: result.rows.length, projects: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get featured projects for homepage
router.get('/featured', async (req, res, next) => {
  try {
    const sql = `
      SELECT p.*,
        ROUND((p.construction_cost / NULLIF(p.built_up_area_sqft, 0)), 2) as cost_per_sqft
      FROM projects p
      WHERE p.is_published = true AND p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT 6
    `;
    const result = await db.query(sql);
    res.json({ success: true, projects: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get single project by slug or ID
router.get('/:slugOrId', async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const isId = !isNaN(Number(slugOrId));

    const projectQuery = isId
      ? 'SELECT * FROM projects WHERE id = $1'
      : 'SELECT * FROM projects WHERE slug = $1';

    const projectResult = await db.query(projectQuery, [slugOrId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = projectResult.rows[0];

    // Compute cost per sqft
    const cost = Number(project.construction_cost);
    const area = Number(project.built_up_area_sqft);
    project.cost_per_sqft = area > 0 ? Math.round(cost / area) : null;

    // Fetch associated gallery images
    const imagesResult = await db.query(
      'SELECT id, image_url, public_id, caption, display_order FROM project_images WHERE project_id = $1 ORDER BY display_order ASC, id ASC',
      [project.id]
    );
    project.images = imagesResult.rows;

    // Fetch construction milestones if available
    const milestonesResult = await db.query(
      'SELECT * FROM construction_milestones WHERE project_id = $1 ORDER BY stage_order ASC',
      [project.id]
    );
    project.milestones = milestonesResult.rows;

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ADMIN PROJECT MANAGEMENT ROUTES
// ==========================================

// Get all projects for Admin (both published and draft)
router.get('/admin/all', requireAdmin, async (req, res, next) => {
  try {
    const sql = `
      SELECT p.*,
        ROUND((p.construction_cost / NULLIF(p.built_up_area_sqft, 0)), 2) as cost_per_sqft,
        COUNT(pi.id) as total_gallery_images
      FROM projects p
      LEFT JOIN project_images pi ON p.id = pi.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    const result = await db.query(sql);
    res.json({ success: true, count: result.rows.length, projects: result.rows });
  } catch (error) {
    next(error);
  }
});

// Admin Image Upload Endpoint (Multer + Cloudinary / Local storage)
router.post('/admin/upload', requireAdmin, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided for upload.' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      if (isCloudinaryConfigured) {
        // Upload buffer directly to Cloudinary
        const result = await uploadToCloudinary(file.buffer, 'saravanan_builders/projects');
        uploadedImages.push({
          url: result.url,
          public_id: result.public_id,
          originalname: file.originalname
        });
      } else {
        // Return local URL
        const localUrl = `/uploads/${file.filename}`;
        uploadedImages.push({
          url: localUrl,
          public_id: null,
          originalname: file.originalname
        });
      }
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) processed successfully.`,
      images: uploadedImages
    });
  } catch (error) {
    next(error);
  }
});

// Create new project
router.post('/admin/create', requireAdmin, async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      location,
      house_type,
      built_up_area_sqft,
      number_of_floors,
      construction_cost,
      start_date,
      completion_date,
      status,
      is_featured,
      is_published,
      main_image_url,
      main_image_public_id,
      gallery_images // Array of { image_url, public_id, caption }
    } = req.body;

    if (!title || !description || !location || !house_type || !built_up_area_sqft || !construction_cost || !main_image_url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, location, house type, built-up area, construction cost, and a main image.'
      });
    }

    const finalSlug = slug ? slugify(slug) : slugify(title) + '-' + Math.floor(Math.random() * 1000);

    const projectInsert = await db.query(
      `INSERT INTO projects (
        title, slug, description, location, house_type,
        built_up_area_sqft, number_of_floors, construction_cost,
        start_date, completion_date, status, is_featured, is_published,
        main_image_url, main_image_public_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        title.trim(),
        finalSlug,
        description.trim(),
        location.trim(),
        house_type.trim(),
        Number(built_up_area_sqft),
        Number(number_of_floors) || 1,
        Number(construction_cost),
        start_date || null,
        completion_date || null,
        status || 'Ongoing',
        Boolean(is_featured),
        is_published !== undefined ? Boolean(is_published) : true,
        main_image_url,
        main_image_public_id || null
      ]
    );

    const createdProject = projectInsert.rows[0];

    // Insert gallery images if provided
    if (Array.isArray(gallery_images) && gallery_images.length > 0) {
      for (let i = 0; i < gallery_images.length; i++) {
        const img = gallery_images[i];
        if (img.image_url) {
          await db.query(
            `INSERT INTO project_images (project_id, image_url, public_id, caption, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [createdProject.id, img.image_url, img.public_id || null, img.caption || '', i]
          );
        }
      }
    }

    // Initialize the 8 standard residential construction milestones automatically
    const standardStages = [
      'Planning and Architectural Design',
      'Foundation & Earthwork',
      'RCC Structural Frame Work',
      'Brickwork & Masonry',
      'Electrical, Plumbing & Conduit Work',
      'Plastering & Weathering Course',
      'Flooring, Tiling & Wall Painting',
      'Final Inspection & Key Handover'
    ];

    for (let i = 0; i < standardStages.length; i++) {
      await db.query(
        `INSERT INTO construction_milestones (project_id, stage_name, stage_order, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [createdProject.id, standardStages[i], i + 1, i === 0 ? 'In Progress' : 'Pending']
      );
    }

    res.status(201).json({
      success: true,
      message: 'Residential project created successfully with default construction milestones!',
      project: createdProject
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      location,
      house_type,
      built_up_area_sqft,
      number_of_floors,
      construction_cost,
      start_date,
      completion_date,
      status,
      is_featured,
      is_published,
      main_image_url,
      main_image_public_id,
      gallery_images
    } = req.body;

    const existingResult = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const current = existingResult.rows[0];

    const updated = await db.query(
      `UPDATE projects SET
        title = $1,
        slug = $2,
        description = $3,
        location = $4,
        house_type = $5,
        built_up_area_sqft = $6,
        number_of_floors = $7,
        construction_cost = $8,
        start_date = $9,
        completion_date = $10,
        status = $11,
        is_featured = $12,
        is_published = $13,
        main_image_url = $14,
        main_image_public_id = $15,
        updated_at = NOW()
      WHERE id = $16
      RETURNING *`,
      [
        title !== undefined ? title.trim() : current.title,
        slug !== undefined ? slugify(slug) : current.slug,
        description !== undefined ? description.trim() : current.description,
        location !== undefined ? location.trim() : current.location,
        house_type !== undefined ? house_type.trim() : current.house_type,
        built_up_area_sqft !== undefined ? Number(built_up_area_sqft) : current.built_up_area_sqft,
        number_of_floors !== undefined ? Number(number_of_floors) : current.number_of_floors,
        construction_cost !== undefined ? Number(construction_cost) : current.construction_cost,
        start_date !== undefined ? start_date : current.start_date,
        completion_date !== undefined ? completion_date : current.completion_date,
        status !== undefined ? status : current.status,
        is_featured !== undefined ? Boolean(is_featured) : current.is_featured,
        is_published !== undefined ? Boolean(is_published) : current.is_published,
        main_image_url !== undefined ? main_image_url : current.main_image_url,
        main_image_public_id !== undefined ? main_image_public_id : current.main_image_public_id,
        id
      ]
    );

    // If new gallery images provided, refresh or append
    if (Array.isArray(gallery_images)) {
      // Clear previous and replace with updated set
      await db.query('DELETE FROM project_images WHERE project_id = $1', [id]);
      for (let i = 0; i < gallery_images.length; i++) {
        const img = gallery_images[i];
        if (img.image_url) {
          await db.query(
            `INSERT INTO project_images (project_id, image_url, public_id, caption, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, img.image_url, img.public_id || null, img.caption || '', i]
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Project updated successfully.',
      project: updated.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch images to delete from Cloudinary if needed
    const projectRes = await db.query('SELECT main_image_public_id FROM projects WHERE id = $1', [id]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const mainPublicId = projectRes.rows[0].main_image_public_id;
    if (mainPublicId) {
      await deleteFromCloudinary(mainPublicId);
    }

    const imagesRes = await db.query('SELECT public_id FROM project_images WHERE project_id = $1', [id]);
    for (const row of imagesRes.rows) {
      if (row.public_id) {
        await deleteFromCloudinary(row.public_id);
      }
    }

    await db.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({ success: true, message: 'Project and associated resources deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
