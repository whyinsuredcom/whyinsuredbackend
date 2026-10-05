import db from '../database/db.js';

export const getAllCompanies = async (req, res) => {
  try {
    const { search, status } = req.query;
    let companies = await db.companies.getAll();

    if (search) {
      const q = String(search).toLowerCase().trim();
      companies = companies.filter(c =>
        String(c.name || '').toLowerCase().includes(q) ||
        String(c.full_name || '').toLowerCase().includes(q) ||
        String(c.slug || '').toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      companies = companies.filter(c => String(c.status || '').toLowerCase() === String(status).toLowerCase());
    }

    // Attach plan count to each company
    const plans = await db.plans.getAll();
    const result = companies.map(c => {
      const companyPlans = plans.filter(p => String(p.company_id || '').toLowerCase() === String(c.id).toLowerCase());
      return {
        ...c,
        plansCount: companyPlans.length
      };
    });

    result.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve companies'
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await db.getCompanyWithPlans(id, true);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: `Company with ID or Slug '${id}' was not found`
      });
    }

    return res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve company details'
    });
  }
};

export const createCompany = async (req, res) => {
  try {
    const {
      name,
      slug,
      full_name,
      description,
      logo,
      primary_color,
      secondary_color,
      website_url,
      ownership,
      credit_rating,
      solvency_ratio,
      aum,
      gdpi,
      status
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Company Name is required'
      });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existing = await db.companies.findByField('slug', cleanSlug);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `A company with slug '${cleanSlug}' already exists. Please choose a different slug.`
      });
    }

    const newCompany = await db.companies.create({
      id: cleanSlug,
      slug: cleanSlug,
      name: name.trim(),
      full_name: full_name ? full_name.trim() : `${name.trim()} Insurance Company`,
      description: description ? description.trim() : '',
      logo: logo || '',
      primary_color: primary_color || '#0038A8',
      secondary_color: secondary_color || '#F0F4FF',
      website_url: website_url || '',
      ownership: ownership || '',
      credit_rating: credit_rating || '',
      solvency_ratio: solvency_ratio || '',
      aum: aum || '',
      gdpi: gdpi || '',
      status: status || 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: newCompany
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create company'
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.companies.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Company '${id}' not found`
      });
    }

    const {
      name,
      slug,
      full_name,
      description,
      logo,
      primary_color,
      secondary_color,
      website_url,
      ownership,
      credit_rating,
      solvency_ratio,
      aum,
      gdpi,
      status
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slugExists = await db.companies.findByField('slug', cleanSlug);
      if (slugExists && slugExists.id !== existing.id) {
        return res.status(400).json({
          success: false,
          error: `Slug '${cleanSlug}' is already in use by another company.`
        });
      }
      updates.slug = cleanSlug;
    }
    if (description !== undefined) updates.description = description;
    if (logo !== undefined) updates.logo = logo;
    if (primary_color !== undefined) updates.primary_color = primary_color;
    if (secondary_color !== undefined) updates.secondary_color = secondary_color;
    if (website_url !== undefined) updates.website_url = website_url;
    if (ownership !== undefined) updates.ownership = ownership;
    if (credit_rating !== undefined) updates.credit_rating = credit_rating;
    if (solvency_ratio !== undefined) updates.solvency_ratio = solvency_ratio;
    if (aum !== undefined) updates.aum = aum;
    if (gdpi !== undefined) updates.gdpi = gdpi;
    if (status !== undefined) updates.status = status;

    const updated = await db.companies.update(existing.id, updates);

    return res.json({
      success: true,
      message: 'Company updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update company'
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const existing = await db.companies.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Company '${id}' not found`
      });
    }

    // Safety check: Does company have plans?
    const associatedPlans = await db.plans.findByCompanyId(existing.id, { includeInactive: true });
    if (associatedPlans.length > 0 && force !== 'true') {
      return res.status(409).json({
        success: false,
        error: `Cannot delete company '${existing.name}' because it contains ${associatedPlans.length} plans. Please delete or reassign its plans first, or provide force=true if you really intend to remove them.`
      });
    }

    // If force delete is explicitly confirmed, cascade delete all child plans & section data
    if (associatedPlans.length > 0 && force === 'true') {
      for (const p of associatedPlans) {
        await db.planVariants.deleteByPlanId(p.id);
        await db.reportCard.deleteByPlanId(p.id);
        await db.companyStrength.deleteByPlanId(p.id);
        await db.policyBenefits.deleteByPlanId(p.id);
        await db.limitations.deleteByPlanId(p.id);
        await db.mustKnow.deleteByPlanId(p.id);
        await db.bestSuited.deleteByPlanId(p.id);
        await db.plans.delete(p.id);
      }
    }

    await db.companies.delete(existing.id);

    return res.json({
      success: true,
      message: `Company '${existing.name}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete company'
    });
  }
};

export const toggleCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const toggled = await db.companies.toggleStatus(id);
    if (!toggled) {
      return res.status(404).json({
        success: false,
        error: `Company '${id}' not found`
      });
    }
    return res.json({
      success: true,
      message: `Company status changed to ${toggled.status}`,
      data: toggled
    });
  } catch (error) {
    console.error('Error toggling company status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle company status'
    });
  }
};

export const reorderCompanies = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array with id and display_order required'
      });
    }
    await db.companies.reorder(items);
    return res.json({
      success: true,
      message: 'Companies reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering companies:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reorder companies'
    });
  }
};
