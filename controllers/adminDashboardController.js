import db from '../database/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalCompanies = await db.companies.count();
    const totalPlans = await db.plans.count();
    const totalBenefits = await db.policyBenefits.count();

    const allPlans = await db.plans.getAll();
    const allCompanies = await db.companies.getAll();

    // Sort by updated_at descending
    const recentPlans = [...allPlans]
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
      .slice(0, 5)
      .map(p => {
        const comp = allCompanies.find(c => c.id === p.company_id) || null;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          companyName: comp ? comp.name : (p.company_name || 'General'),
          status: p.status || 'active',
          updatedAt: p.updated_at || p.created_at
        };
      });

    const recentCompanies = [...allCompanies]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logo: c.logo,
        status: c.status || 'active',
        createdAt: c.created_at
      }));

    return res.json({
      success: true,
      data: {
        totalCompanies,
        totalPlans,
        totalBenefits,
        recentPlans,
        recentCompanies
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics'
    });
  }
};

