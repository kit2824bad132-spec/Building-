const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

async function runSeed() {
  console.log('🌱 Starting comprehensive database seed for Saravanan Builders...');

  try {
    // 1. Seed Admin
    const adminEmail = 'admin@saravananbuilders.com';
    const adminPass = 'Saravanan@2026';
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash(adminPass, adminSalt);

    const existingAdmin = await db.query('SELECT id FROM admins WHERE email = $1', [adminEmail]);
    if (existingAdmin.rows.length === 0) {
      await db.query(
        `INSERT INTO admins (full_name, email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, 'admin', NOW(), NOW())`,
        ['Er. Saravanan B.E. (Founder & MD)', adminEmail, adminHash]
      );
      console.log('✅ Admin account seeded: admin@saravananbuilders.com / Saravanan@2026');
    }

    // 2. Seed Cost Estimator Settings
    const tiers = [
      {
        quality_tier: 'Basic',
        tier_title: 'Essential Residential',
        price_per_sqft: 1850,
        description: 'Sturdy, practical construction with quality brickwork, standard vitrified tiles, and essential branded fittings.',
        specifications: [
          'Standard Red Brick Masonry',
          'ISI Grade TMT Fe-550 Steel & OPC Cement',
          'Standard Vitrified Flooring (2x2 ft)',
          'Anchor / GM Electrical Switches',
          'Parryware / Cera Standard Sanitaryware',
          'Flush Doors with Teak wood frame for Main door',
          'Asian Paints Tractor Emulsion'
        ]
      },
      {
        quality_tier: 'Standard',
        tier_title: 'Premium Contemporary',
        price_per_sqft: 2200,
        description: 'Our most popular choice: Enhanced architectural elevation, premium vitrified tiles, teak wood fittings, and branded plumbing.',
        specifications: [
          'Engineered Clay Bricks / Solid Blocks',
          'Tata Tiscon / JSW TMT Rebars',
          'Premium Glazed Vitrified Tiles (4x2 ft)',
          'Legrand / Schneider Modular Switches & Finolex wiring',
          'Jaquar / Kohler CP & Sanitaryware',
          'First Quality Burma Teak Wood Main Door & Frame',
          'Asian Paints Apex Weatherproof Exterior + Royal Interior',
          'Stainless Steel Staircase Railings with Toughened Glass'
        ]
      },
      {
        quality_tier: 'Premium',
        tier_title: 'Luxury Signature Villa',
        price_per_sqft: 2750,
        description: 'Architect-designed luxury residence with Italian marble/granite finishes, complete smart switches, and designer elevation.',
        specifications: [
          'Custom Structural Column Design with Soil Stabilization',
          'Italian Marble or Large Slab Designer Granite Flooring',
          'Grohe / Hansgrohe Luxury Concealed Plumbing',
          'Smart Home Automation ready cabling & Havells Crabtree fixtures',
          'Full Teak Wood Doors & Soundproof UPVC French Windows',
          'Designer Exterior Elevation Stone Cladding & Pergolas',
          'Comprehensive Anti-termite & Multi-layer Waterproofing Guarantee'
        ]
      }
    ];

    for (const t of tiers) {
      const existing = await db.query('SELECT id FROM construction_cost_settings WHERE quality_tier = $1', [t.quality_tier]);
      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO construction_cost_settings (quality_tier, tier_title, price_per_sqft, description, specifications)
           VALUES ($1, $2, $3, $4, $5)`,
          [t.quality_tier, t.tier_title, t.price_per_sqft, t.description, JSON.stringify(t.specifications)]
        );
      }
    }
    console.log('✅ Construction cost estimator pricing tiers seeded.');

    // 3. Seed Projects
    const projectsData = [
      {
        title: 'The Grand Sovereign Villa',
        slug: 'the-grand-sovereign-villa',
        description: 'An architectural masterpiece featuring double-height living spaces, imported natural stone cladding, serene water features, and expansive landscaped terraces. Built with seismic-resistant RCC frame construction and luxury Burma teak woodwork.',
        location: 'Anna Nagar West, Chennai',
        house_type: 'Luxury Villa',
        built_up_area_sqft: 3450,
        number_of_floors: 2,
        construction_cost: 8500000,
        start_date: '2024-03-01',
        completion_date: '2025-02-15',
        status: 'Completed',
        is_featured: true,
        is_published: true,
        main_image_url: '/uploads/hero_modern_villa.jpg',
        gallery: [
          { image_url: '/uploads/hero_modern_villa.jpg', caption: 'Front Elevation & Landscaped Driveway' },
          { image_url: '/uploads/duplex_house.jpg', caption: 'Evening Lighting & Double Height Glazing' }
        ]
      },
      {
        title: 'Contemporary Horizon Duplex',
        slug: 'contemporary-horizon-duplex',
        description: 'A contemporary 4-BHK duplex home designed for modern multi-generational living. Integrates natural louvers for passive thermal cooling, automated perimeter lighting, and custom granite flooring.',
        location: 'Saravanampatti, Coimbatore',
        house_type: 'Duplex House',
        built_up_area_sqft: 2800,
        number_of_floors: 2,
        construction_cost: 6850000,
        start_date: '2024-06-10',
        completion_date: '2025-04-20',
        status: 'Completed',
        is_featured: true,
        is_published: true,
        main_image_url: '/uploads/duplex_house.jpg',
        gallery: [
          { image_url: '/uploads/duplex_house.jpg', caption: 'Full Twilight Elevation with Warm LEDs' }
        ]
      },
      {
        title: 'Emerald Heights Signature Residence',
        slug: 'emerald-heights-signature-residence',
        description: 'Individual independent residential home featuring state-of-the-art earthquake-resistant column foundation, premium wire-cut red brick walls, and custom modular spaces. Currently under active structural execution.',
        location: 'Mogappair West, Chennai',
        house_type: 'Independent 3BHK',
        built_up_area_sqft: 2250,
        number_of_floors: 2,
        construction_cost: 5600000,
        start_date: '2025-09-01',
        completion_date: '2026-06-30',
        status: 'Ongoing',
        is_featured: true,
        is_published: true,
        main_image_url: '/uploads/construction_site.jpg',
        gallery: [
          { image_url: '/uploads/construction_site.jpg', caption: 'Active Site Structural Columns & Masonry Work' }
        ]
      }
    ];

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

    let seededProjectIds = [];

    for (const p of projectsData) {
      let pId;
      const existing = await db.query('SELECT id FROM projects WHERE slug = $1', [p.slug]);
      if (existing.rows.length === 0) {
        const res = await db.query(
          `INSERT INTO projects (
            title, slug, description, location, house_type,
            built_up_area_sqft, number_of_floors, construction_cost,
            start_date, completion_date, status, is_featured, is_published,
            main_image_url, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
          RETURNING id`,
          [
            p.title, p.slug, p.description, p.location, p.house_type,
            p.built_up_area_sqft, p.number_of_floors, p.construction_cost,
            p.start_date, p.completion_date, p.status, p.is_featured, p.is_published,
            p.main_image_url
          ]
        );
        pId = res.rows[0].id;

        // Insert gallery images
        if (p.gallery) {
          for (let i = 0; i < p.gallery.length; i++) {
            await db.query(
              `INSERT INTO project_images (project_id, image_url, caption, display_order)
               VALUES ($1, $2, $3, $4)`,
              [pId, p.gallery[i].image_url, p.gallery[i].caption, i]
            );
          }
        }

        // Add 8 milestones
        for (let i = 0; i < standardStages.length; i++) {
          let stageStatus = 'Pending';
          let completedAt = null;

          if (p.status === 'Completed') {
            stageStatus = 'Completed';
            completedAt = p.completion_date;
          } else {
            // For Ongoing Emerald Heights:
            if (i < 2) {
              stageStatus = 'Completed';
              completedAt = '2025-11-15';
            } else if (i === 2) {
              stageStatus = 'In Progress';
            }
          }

          await db.query(
            `INSERT INTO construction_milestones (project_id, stage_name, stage_order, status, completed_at, remarks, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [
              pId,
              standardStages[i],
              i + 1,
              stageStatus,
              completedAt,
              stageStatus === 'Completed' ? 'Inspected and certified by Er. Saravanan' : null
            ]
          );
        }
      } else {
        pId = existing.rows[0].id;
      }
      seededProjectIds.push(pId);
    }
    console.log(`✅ Seeded ${projectsData.length} residential projects with realistic photography and milestones.`);

    // 4. Seed Demo Customer Account
    const custEmail = 'karthik@example.com';
    const custPass = 'Customer123!';
    const custSalt = await bcrypt.genSalt(10);
    const custHash = await bcrypt.hash(custPass, custSalt);

    let customerId;
    const existingCust = await db.query('SELECT id FROM customers WHERE email = $1', [custEmail]);
    if (existingCust.rows.length === 0) {
      const res = await db.query(
        `INSERT INTO customers (full_name, email, phone, password_hash, address, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id`,
        [
          'Karthik Ramanathan',
          custEmail,
          '+91 97890 54321',
          custHash,
          'Plot 42, Green Avenue, Mogappair, Chennai'
        ]
      );
      customerId = res.rows[0].id;
      console.log('✅ Demo Customer created: karthik@example.com / Customer123!');
    } else {
      customerId = existingCust.rows[0].id;
    }

    // 5. Assign Project (Emerald Heights) to Demo Customer
    const ongoingProjectId = seededProjectIds[2] || 3;
    const existingAssignment = await db.query(
      'SELECT id FROM customer_projects WHERE customer_id = $1 AND project_id = $2',
      [customerId, ongoingProjectId]
    );

    if (existingAssignment.rows.length === 0) {
      await db.query(
        `INSERT INTO customer_projects (customer_id, project_id, notes, assigned_at)
         VALUES ($1, $2, $3, NOW())`,
        [
          customerId,
          ongoingProjectId,
          'Custom 3BHK residential home tailored with North-East entrance and solar conduit lines.'
        ]
      );
      console.log('✅ Assigned ongoing project to customer Karthik Ramanathan.');

      // Add Progress Updates with photos for this customer's project
      await db.query(
        `INSERT INTO progress_updates (
          project_id, title, description, progress_percentage, stage_name, photos, update_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          ongoingProjectId,
          'First Floor Slab Curing & First Floor Brickwork In Progress',
          'RCC roof slab casting for ground floor successfully completed with 28-day water ponding curing test passed. Currently our team has started the red brick masonry work for exterior walls and room partitions.',
          45,
          'RCC Structural Frame Work',
          JSON.stringify([
            { url: '/uploads/construction_site.jpg', caption: 'Columns cast and brickwork in active progress' }
          ]),
          new Date().toISOString().split('T')[0]
        ]
      );
      console.log('✅ Added initial progress update with site photograph for customer dashboard.');
    }

    // 6. Seed Sample Enquiries
    const existingEnq = await db.query('SELECT id FROM enquiries LIMIT 1');
    if (existingEnq.rows.length === 0) {
      await db.query(
        `INSERT INTO enquiries (
          customer_name, phone, email, construction_location, built_up_area_sqft,
          budget_range, message, status, admin_notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          'Suresh Kumar',
          '+91 98412 87654',
          'suresh.k@gmail.com',
          'Maduravoyal, Chennai',
          2400,
          '₹50L - ₹65L',
          'Planning to construct a G+1 independent house on a 30x40 site. Need consultation on structural design and approval assistance.',
          'New',
          'Called client on 14th Oct - scheduled preliminary site visit for this weekend.'
        ]
      );
      console.log('✅ Seeded sample enquiry for admin enquiry dashboard.');
    }

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

runSeed();
