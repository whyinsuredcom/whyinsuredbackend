import db from '../database/db.js';

// ===========================================================================
// PLAN BASE CRUD
// ===========================================================================

export const getAllPlans = async (req, res) => {
  try {
    const { company_id, status, search } = req.query;
    let plans = await db.plans.getAll();

    if (company_id && company_id !== 'all') {
      plans = plans.filter(p => String(p.company_id || '').toLowerCase() === String(company_id).toLowerCase());
    }

    if (status && status !== 'all') {
      plans = plans.filter(p => String(p.status || '').toLowerCase() === String(status).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      plans = plans.filter(p =>
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.slug || '').toLowerCase().includes(q) ||
        String(p.subtitle || '').toLowerCase().includes(q) ||
        String(p.tagline || '').toLowerCase().includes(q)
      );
    }

    const companies = await db.companies.getAll();
    const variants = await db.planVariants.getAll();
    const benefits = await db.policyBenefits.getAll();

    const result = plans.map(p => {
      const company = companies.find(c => String(c.id).toLowerCase() === String(p.company_id).toLowerCase()) || null;
      const planVars = variants.filter(v => String(v.plan_id).toLowerCase() === String(p.id).toLowerCase());
      const planBens = benefits.filter(b => String(b.plan_id).toLowerCase() === String(p.id).toLowerCase());

      return {
        ...p,
        companyName: company ? company.name : (p.company_name || 'General'),
        companyLogo: company ? company.logo : '',
        companySlug: company ? company.slug : '',
        variantsCount: planVars.length,
        benefitsCount: planBens.length
      };
    });

    result.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getAllPlans:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve plans'
    });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await db.getPlanWithAllSections(id, true);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: `Plan with ID or Slug '${id}' not found`
      });
    }

    return res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error in getPlanById:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve plan details'
    });
  }
};

export const createPlan = async (req, res) => {
  try {
    const {
      name,
      slug,
      company_id,
      subtitle,
      tagline,
      description,
      logo,
      coverage,
      primary_color,
      secondary_color,
      status,
      is_published
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Plan Name is required'
      });
    }

    if (!company_id || !String(company_id).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Company selection is required'
      });
    }

    const company = await db.companies.findById(company_id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: `Selected company '${company_id}' does not exist`
      });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingSlug = await db.plans.findByField('slug', cleanSlug);
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: `A plan with slug '${cleanSlug}' already exists. Please choose a different slug.`
      });
    }

    const newPlan = await db.plans.create({
      id: cleanSlug,
      slug: cleanSlug,
      name: name.trim(),
      company_id: company.id,
      subtitle: subtitle ? subtitle.trim() : (tagline ? tagline.trim() : ''),
      tagline: tagline ? tagline.trim() : (subtitle ? subtitle.trim() : ''),
      description: description ? description.trim() : '',
      logo: logo || company.logo || '',
      coverage: coverage || '₹5 Lakh - ₹1 Crore',
      theme_primary: primary_color || company.primary_color || '#0038A8',
      theme_secondary: secondary_color || company.secondary_color || '#F0F4FF',
      status: (status || (is_published ? 'active' : 'draft'))
    });

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: newPlan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create plan'
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.plans.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Plan '${id}' not found`
      });
    }

    const {
      name,
      slug,
      company_id,
      subtitle,
      tagline,
      description,
      logo,
      coverage,
      primary_color,
      secondary_color,
      status,
      is_published
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (tagline !== undefined) updates.tagline = tagline;
    if (description !== undefined) updates.description = description;
    if (logo !== undefined) updates.logo = logo;
    if (coverage !== undefined) updates.coverage = coverage;
    if (primary_color !== undefined) updates.theme_primary = primary_color;
    if (secondary_color !== undefined) updates.theme_secondary = secondary_color;
    if (status !== undefined) updates.status = status;
    if (is_published !== undefined) updates.status = is_published ? 'active' : 'draft';

    if (company_id !== undefined) {
      const company = await db.companies.findById(company_id);
      if (!company) {
        return res.status(400).json({ success: false, error: 'Invalid company_id' });
      }
      updates.company_id = company.id;
    }

    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slugExists = await db.plans.findByField('slug', cleanSlug);
      if (slugExists && slugExists.id !== existing.id) {
        return res.status(400).json({
          success: false,
          error: `Slug '${cleanSlug}' is already in use by another plan.`
        });
      }
      updates.slug = cleanSlug;
    }

    const updated = await db.plans.update(existing.id, updates);

    return res.json({
      success: true,
      message: 'Plan updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update plan'
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.plans.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Plan '${id}' not found`
      });
    }

    // Cascade delete section data for this plan
    await db.planVariants.deleteByPlanId(existing.id);
    await db.reportCard.deleteByPlanId(existing.id);
    await db.companyStrength.deleteByPlanId(existing.id);
    await db.policyBenefits.deleteByPlanId(existing.id);
    await db.limitations.deleteByPlanId(existing.id);
    await db.mustKnow.deleteByPlanId(existing.id);
    await db.bestSuited.deleteByPlanId(existing.id);

    await db.plans.delete(existing.id);

    return res.json({
      success: true,
      message: `Plan '${existing.name}' and all associated content were deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete plan'
    });
  }
};

export const togglePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const toggled = await db.plans.toggleStatus(id);
    if (!toggled) {
      return res.status(404).json({
        success: false,
        error: `Plan '${id}' not found`
      });
    }
    return res.json({
      success: true,
      message: `Plan status changed to ${toggled.status}`,
      data: toggled
    });
  } catch (error) {
    console.error('Error toggling plan status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle plan status'
    });
  }
};

export const reorderPlans = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array required'
      });
    }
    await db.plans.reorder(items);
    return res.json({
      success: true,
      message: 'Plans reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering plans:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reorder plans'
    });
  }
};

// ===========================================================================
// SUBSECTION: VARIANTS
// ===========================================================================

export const getVariants = async (req, res) => {
  try {
    const { planId } = req.params;
    const variants = await db.planVariants.findByPlanId(planId, { includeInactive: true });
    return res.json({ success: true, data: variants });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createVariant = async (req, res) => {
  try {
    const planId = req.params.planId || req.body.plan_id;
    const { name, variant_key, room_category, network_type, sum_insured, coverage, tagline, badge, is_popular, highlights, status } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: 'Variant name is required' });
    }

    const newVar = await db.planVariants.create({
      plan_id: planId,
      name: name.trim(),
      variant_key: variant_key ? variant_key.trim().toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      room_category: room_category || 'Single Private Room',
      network_type: network_type || 'All Network Hospitals',
      sum_insured: sum_insured || '5 Lakhs – 1 Crore',
      coverage: coverage || sum_insured || '5 Lakhs – 1 Crore',
      tagline: tagline || '',
      badge: badge || '',
      is_popular: Boolean(is_popular),
      highlights: Array.isArray(highlights) ? highlights : [],
      status: status || 'active'
    });

    return res.status(201).json({ success: true, message: 'Variant created successfully', data: newVar });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.planVariants.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Variant not found' });
    return res.json({ success: true, message: 'Variant updated successfully', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    await db.planVariants.delete(id);
    return res.json({ success: true, message: 'Variant deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reorderVariants = async (req, res) => {
  try {
    const { items } = req.body;
    await db.planVariants.reorder(items);
    return res.json({ success: true, message: 'Variants reordered successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ===========================================================================
// SUBSECTION: REPORT CARD
// ===========================================================================

export const getReportCard = async (req, res) => {
  try {
    const { planId } = req.params;
    const items = await db.reportCard.findByPlanId(planId, { includeInactive: true });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createReportCardItem = async (req, res) => {
  try {
    const planId = req.params.planId || req.body.plan_id;
    const { metric_key, title, subtitle, summary_value, explanation, single_year, single_year_label, three_year_avg, three_year_avg_label, status } = req.body;

    if (!title || !summary_value) {
      return res.status(400).json({ success: false, error: 'Title and Value are required' });
    }

    const item = await db.reportCard.create({
      plan_id: planId,
      metric_key: metric_key || title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      title: title.trim(),
      subtitle: subtitle || title.trim(),
      summary_value: summary_value.trim(),
      explanation: explanation || '',
      single_year: single_year || summary_value.trim(),
      single_year_label: single_year_label || 'Current Year',
      three_year_avg: three_year_avg || summary_value.trim(),
      three_year_avg_label: three_year_avg_label || '3-Year Avg',
      status: status || 'active'
    });

    return res.status(201).json({ success: true, message: 'Report Card item created', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateReportCardItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.reportCard.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Report card item not found' });
    return res.json({ success: true, message: 'Report Card item updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteReportCardItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.reportCard.delete(id);
    return res.json({ success: true, message: 'Report Card item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reorderReportCard = async (req, res) => {
  try {
    const { items } = req.body;
    await db.reportCard.reorder(items);
    return res.json({ success: true, message: 'Report Card items reordered' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ===========================================================================
// SUBSECTION: COMPANY STRENGTH
// ===========================================================================

export const getCompanyStrength = async (req, res) => {
  try {
    const { planId } = req.params;
    const items = await db.companyStrength.findByPlanId(planId, { includeInactive: true });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createCompanyStrengthItem = async (req, res) => {
  try {
    const planId = req.params.planId || req.body.plan_id;
    const { metric_key, title, summary_value, explanation, items, status } = req.body;

    if (!title || !summary_value) {
      return res.status(400).json({ success: false, error: 'Title and Value are required' });
    }

    const item = await db.companyStrength.create({
      plan_id: planId,
      metric_key: metric_key || title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      title: title.trim(),
      summary_value: summary_value.trim(),
      explanation: explanation || '',
      items: Array.isArray(items) ? items : (items ? [items] : []),
      status: status || 'active'
    });

    return res.status(201).json({ success: true, message: 'Company strength item created', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateCompanyStrengthItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.companyStrength.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Company strength item not found' });
    return res.json({ success: true, message: 'Company strength item updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCompanyStrengthItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.companyStrength.delete(id);
    return res.json({ success: true, message: 'Company strength item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reorderCompanyStrength = async (req, res) => {
  try {
    const { items } = req.body;
    await db.companyStrength.reorder(items);
    return res.json({ success: true, message: 'Company strength items reordered' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ===========================================================================
// SUBSECTION: POLICY BENEFITS (MOST IMPORTANT, VALUE ADDED, ADDITIONAL, OPTIONAL)
// ===========================================================================

export const getBenefits = async (req, res) => {
  try {
    const { planId } = req.params;
    const { category, section } = req.query;
    const items = await db.policyBenefits.findByPlanId(planId, {
      includeInactive: true,
      category,
      section
    });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createBenefit = async (req, res) => {
  try {
    const planId = req.params.planId || req.body.plan_id;
    const {
      section,
      category,
      title,
      subtitle,
      badge,
      summary,
      detailed_description,
      intro,
      points,
      steps,
      icon_type,
      icon_url,
      image_url,
      video_title,
      video_url,
      pdf_title,
      pdf_url,
      external_url,
      tier_data,
      status
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, error: 'Benefit title is required' });
    }

    const standardCategory = category || (
      section === 'value_added' ? 'VALUE ADDED' :
      section === 'additional' ? 'ADDITIONAL' :
      section === 'optional' ? 'OPTIONAL' : 'MOST IMPORTANT'
    );

    const standardSection = section || (
      standardCategory === 'VALUE ADDED' ? 'value_added' :
      standardCategory === 'ADDITIONAL' ? 'additional' :
      standardCategory === 'OPTIONAL' ? 'optional' : 'most_important'
    );

    const newBenefit = await db.policyBenefits.create({
      plan_id: planId,
      section: standardSection,
      category: standardCategory,
      title: title.trim(),
      subtitle: subtitle || '',
      badge: badge || '',
      summary: summary || detailed_description || '',
      detailed_description: detailed_description || summary || '',
      intro: intro || '',
      points: Array.isArray(points) ? points : [],
      steps: Array.isArray(steps) ? steps : [],
      icon_type: icon_type || 'shield',
      icon_url: icon_url || '',
      video_url: video_url || '',
      tier_data: tier_data || null,
      status: status || 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Policy benefit added successfully',
      data: newBenefit
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.policyBenefits.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Policy benefit not found' });
    return res.json({ success: true, message: 'Policy benefit updated successfully', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    await db.policyBenefits.delete(id);
    return res.json({ success: true, message: 'Policy benefit deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleBenefitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const toggled = await db.policyBenefits.toggleStatus(id);
    if (!toggled) return res.status(404).json({ success: false, error: 'Benefit not found' });
    return res.json({ success: true, message: `Benefit status changed to ${toggled.status}`, data: toggled });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reorderBenefits = async (req, res) => {
  try {
    const { items } = req.body;
    await db.policyBenefits.reorder(items);
    return res.json({ success: true, message: 'Policy benefits reordered successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ===========================================================================
// SUBSECTION: LIMITATIONS & WAITING PERIODS
// ===========================================================================

export const getLimitations = async (req, res) => {
  try {
    const { planId } = req.params;
    const items = await db.limitations.findByPlanId(planId, { includeInactive: true });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createLimitation = async (req, res) => {
  try {
    const planId = req.params.planId || req.body.plan_id;
    const {
      title,
      summary,
      highlight,
      duration_tag,
      policy_ref,
      disease_list,
      exclusions_list,
      icon_url,
      image_url,
      video_url,
      pdf_url,
      status
    } = req.body;

    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });

    const item = await db.limitations.create({
      plan_id: planId,
      title: title.trim(),
      summary: summary || '',
      waiting_period: req.body.waiting_period || duration_tag || '',
      disease_list: Array.isArray(disease_list) ? disease_list : [],
      exclusions_list: Array.isArray(exclusions_list) ? exclusions_list : [],
      icon_url: icon_url || '',
      video_url: video_url || '',
      status: status || 'active'
    });

    return res.status(201).json({ success: true, message: 'Limitation created successfully', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateLimitation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.limitations.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Limitation not found' });
    return res.json({ success: true, message: 'Limitation updated successfully', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteLimitation = async (req, res) => {
  try {
    const { id } = req.params;
    await db.limitations.delete(id);
    return res.json({ success: true, message: 'Limitation deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reorderLimitations = async (req, res) => {
  try {
    const { items } = req.body;
    await db.limitations.reorder(items);
    return res.json({ success: true, message: 'Limitations reordered successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ===========================================================================
// SUBSECTION: MUST KNOW
// ===========================================================================

export const getMustKnow = async (req, res) => {
  try {
    const { planId } = req.params;
    const items = await db.mustKnow.findByPlanId(planId, { includeInactive: true });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createMustKnowItem = async (req, res) => {
  try {
    const planId = req.params.planId || req.body.plan_id;
    const { title, summary, points, icon, icon_url, image_url, video_url, pdf_url, external_url, status } = req.body;

    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });

    const item = await db.mustKnow.create({
      plan_id: planId,
      title: title.trim(),
      summary: summary || '',
      points: Array.isArray(points) ? points : [],
      icon: icon || '💡',
      icon_url: icon_url || '',
      video_url: video_url || '',
      status: status || 'active'
    });

    return res.status(201).json({ success: true, message: 'Must Know item created', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateMustKnowItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.mustKnow.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Must Know item not found' });
    return res.json({ success: true, message: 'Must Know item updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteMustKnowItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.mustKnow.delete(id);
    return res.json({ success: true, message: 'Must Know item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reorderMustKnow = async (req, res) => {
  try {
    const { items } = req.body;
    await db.mustKnow.reorder(items);
    return res.json({ success: true, message: 'Must Know items reordered' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ===========================================================================
// SUBSECTION: BEST SUITED / PERFECT FOR
// ===========================================================================

export const getBestSuited = async (req, res) => {
  try {
    const { planId } = req.params;
    const items = await db.bestSuited.findByPlanId(planId, { includeInactive: true });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createBestSuitedItem = async (req, res) => {
  try {
    const planId = req.params.planId || req.body.plan_id;
    const { title, heading, summary, description, badge, highlights, bullet_points, icon, icon_url, image_url, video_url, pdf_url, status } = req.body;

    const itemTitle = (heading || title || '').trim();
    if (!itemTitle) return res.status(400).json({ success: false, error: 'Title or Heading is required' });

    const item = await db.bestSuited.create({
      plan_id: planId,
      title: itemTitle,
      heading: itemTitle,
      summary: summary || description || '',
      description: summary || description || '',
      badge: badge || '',
      highlights: Array.isArray(highlights) ? highlights : (Array.isArray(bullet_points) ? bullet_points : []),
      bullet_points: Array.isArray(bullet_points) ? bullet_points : (Array.isArray(highlights) ? highlights : []),
      icon: icon || '🎯',
      icon_url: icon_url || '',
      video_url: video_url || '',
      status: status || 'active'
    });

    return res.status(201).json({ success: true, message: 'Best Suited item created', data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateBestSuitedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.bestSuited.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Best Suited item not found' });
    return res.json({ success: true, message: 'Best Suited item updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteBestSuitedItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.bestSuited.delete(id);
    return res.json({ success: true, message: 'Best Suited item deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reorderBestSuited = async (req, res) => {
  try {
    const { items } = req.body;
    await db.bestSuited.reorder(items);
    return res.json({ success: true, message: 'Best Suited items reordered' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
