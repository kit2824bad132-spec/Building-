const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// Default tiers in case database is freshly created
const DEFAULT_TIERS = [
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

// Get current cost settings (Public)
router.get('/settings', async (req, res, next) => {
  try {
    let result = await db.query('SELECT * FROM construction_cost_settings ORDER BY id ASC');

    // If empty, auto-seed defaults
    if (result.rows.length === 0) {
      for (const tier of DEFAULT_TIERS) {
        await db.query(
          `INSERT INTO construction_cost_settings (quality_tier, tier_title, price_per_sqft, description, specifications)
           VALUES ($1, $2, $3, $4, $5)`,
          [tier.quality_tier, tier.tier_title, tier.price_per_sqft, tier.description, JSON.stringify(tier.specifications)]
        );
      }
      result = await db.query('SELECT * FROM construction_cost_settings ORDER BY id ASC');
    }

    res.json({ success: true, settings: result.rows });
  } catch (error) {
    next(error);
  }
});

// Calculate construction cost estimate (Public)
router.post('/calculate', async (req, res, next) => {
  try {
    const { built_up_area_sqft, quality_tier = 'Standard', number_of_floors = 1, add_ons = [] } = req.body;

    const area = Number(built_up_area_sqft);
    if (!area || area <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid built-up area in square feet.' });
    }

    const floors = Math.max(1, Number(number_of_floors) || 1);

    // Fetch rate for selected tier
    let tierResult = await db.query('SELECT * FROM construction_cost_settings WHERE LOWER(quality_tier) = LOWER($1)', [quality_tier]);
    let tierData = tierResult.rows[0];

    if (!tierData) {
      // fallback
      tierData = DEFAULT_TIERS.find(t => t.quality_tier.toLowerCase() === quality_tier.toLowerCase()) || DEFAULT_TIERS[1];
    }

    const baseRatePerSqft = Number(tierData.price_per_sqft);
    const baseConstructionCost = Math.round(area * baseRatePerSqft);

    // Calculate optional add-ons costs
    // Example add-ons: 'modular_kitchen', 'false_ceiling', 'solar_rooftop', 'landscaping'
    const addOnRates = {
      modular_kitchen: { name: 'Modular Kitchen (Acrylic & Marine Ply)', cost: 180000 },
      false_ceiling: { name: 'Designer Gypsum False Ceiling with LED Coves', cost: Math.round(area * 110) },
      solar_rooftop: { name: '3 kW On-Grid Solar Power System', cost: 195000 },
      landscaping: { name: 'Architectural Lawn & Paving Landscaping', cost: 75000 },
      wardrobes: { name: 'Custom Bedroom Wardrobes (Up to 3 Rooms)', cost: 220000 }
    };

    let addOnsBreakdown = [];
    let addOnsTotal = 0;

    if (Array.isArray(add_ons)) {
      add_ons.forEach(addonKey => {
        if (addOnRates[addonKey]) {
          const item = addOnRates[addonKey];
          addOnsTotal += item.cost;
          addOnsBreakdown.push({
            key: addonKey,
            name: item.name,
            cost: item.cost
          });
        }
      });
    }

    const totalEstimatedCost = baseConstructionCost + addOnsTotal;

    // Generate WhatsApp direct consultation URL
    const whatsappNum = process.env.COMPANY_WHATSAPP || '917540061497';
    const waText = encodeURIComponent(
      `Hello Saravanan Builders,\nI calculated a preliminary estimate on your website:\n` +
      `- Built-up Area: ${area.toLocaleString('en-IN')} sq.ft.\n` +
      `- Quality: ${tierData.tier_title} (₹${baseRatePerSqft}/sq.ft)\n` +
      `- Floors: ${floors}\n` +
      `- Base Cost: ₹${baseConstructionCost.toLocaleString('en-IN')}\n` +
      (addOnsTotal > 0 ? `- Add-ons: ₹${addOnsTotal.toLocaleString('en-IN')}\n` : '') +
      `- Total Indicative Estimate: ₹${totalEstimatedCost.toLocaleString('en-IN')}\n\n` +
      `Could we arrange a site visit and formal quotation?`
    );
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=${waText}`;

    res.json({
      success: true,
      data: {
        built_up_area_sqft: area,
        quality_tier: tierData.quality_tier,
        tier_title: tierData.tier_title,
        base_rate_per_sqft: baseRatePerSqft,
        number_of_floors: floors,
        base_construction_cost: baseConstructionCost,
        add_ons: addOnsBreakdown,
        add_ons_total: addOnsTotal,
        total_estimated_cost: totalEstimatedCost,
        disclaimer: 'This calculation is a preliminary planning estimate based on standard floor plans and soil conditions. It is not an official quotation. Final quotation is issued after structural assessment and architectural drawing sign-off.',
        whatsapp_quotation_url: whatsappUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Update pricing tier settings
router.put('/admin/settings/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price_per_sqft, tier_title, description, specifications } = req.body;

    const result = await db.query(
      `UPDATE construction_cost_settings
       SET price_per_sqft = COALESCE($1, price_per_sqft),
           tier_title = COALESCE($2, tier_title),
           description = COALESCE($3, description),
           specifications = COALESCE($4, specifications),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        price_per_sqft ? Number(price_per_sqft) : null,
        tier_title,
        description,
        specifications ? JSON.stringify(specifications) : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tier setting not found.' });
    }

    res.json({
      success: true,
      message: 'Cost settings updated successfully.',
      setting: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
