import db from '../database/db.js';

/**
 * Format database plan data into the rich shape consumed by public plan components
 */
async function formatPlanForPublic(planData) {
  if (!planData) return null;

  const company = planData.company || (planData.company_id ? await db.companies.findById(planData.company_id) : null) || {};
  // Company branding is the authoritative source for theme & colors
  const primaryColor = company.primary_color || planData.theme_primary || planData.primary_color || '#0038A8';
  const secondaryColor = company.secondary_color || planData.theme_secondary || planData.secondary_color || '#F0F4FF';

  // 1. Group Policy Benefits into standard categories
  const benefits = planData.policyBenefits || [];
  const categorizedSections = [
    {
      id: 'most-important-features',
      title: 'MOST IMPORTANT',
      items: []
    },
    {
      id: 'value-added-features',
      title: 'VALUE ADDED',
      items: []
    },
    {
      id: 'additional-features',
      title: 'ADDITIONAL',
      items: []
    },
    {
      id: 'optional-features',
      title: 'OPTIONAL',
      items: []
    }
  ];

  for (const b of benefits) {
    const cat = String(b.category || b.section || '').toUpperCase();
    const item = {
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      badge: b.badge || '',
      iconType: b.icon_type || 'shield',
      iconUrl: b.icon_url || '',
      imageUrl: b.image_url || '',
      summary: b.summary || b.detailed_description || '',
      detailedDescription: b.detailed_description || b.summary || '',
      intro: b.intro || '',
      points: Array.isArray(b.points) ? b.points : (b.points ? [b.points] : []),
      steps: Array.isArray(b.steps) ? b.steps : (b.steps ? [b.steps] : []),
      videoTitle: b.video_title || b.title,
      videoUrl: b.video_url || '',
      pdfTitle: b.pdf_title || '',
      pdfUrl: b.pdf_url || '',
      externalUrl: b.external_url || '',
      tierData: b.tier_data || null,
      displayOrder: Number(b.display_order) || 0
    };

    if (cat.includes('VALUE')) {
      categorizedSections[1].items.push(item);
    } else if (cat.includes('ADDITIONAL')) {
      categorizedSections[2].items.push(item);
    } else if (cat.includes('OPTION')) {
      categorizedSections[3].items.push(item);
    } else {
      categorizedSections[0].items.push(item);
    }
  }

  // Filter out completely empty sections if none added
  const featuresSections = benefits.length === 0
    ? []
    : categorizedSections.filter((s, idx) => idx === 0 || s.items.length > 0);

  // 2. Report Card metrics
  const reportCards = planData.reportCard || [];
  const csrItem = reportCards.find(r => r.metric_key === 'csr') || reportCards[0];
  const icrItem = reportCards.find(r => r.metric_key === 'icr') || reportCards[1];
  const compItem = reportCards.find(r => r.metric_key === 'complaint_volume' || r.metric_key === 'complaints') || reportCards[2];

  const reportCard = {
    heading: 'REPORT CARD',
    subheading: `${company.name || planData.company_name || 'Insurer'} Performance`,
    description: 'Official claim settlement and financial strength metrics.',
    csr: csrItem ? {
      title: csrItem.title || 'Claim Settlement Ratio',
      summaryValue: csrItem.summary_value,
      subtitle: csrItem.subtitle || 'Claim Settlement Ratio',
      explanation: csrItem.explanation || '',
      singleYear: csrItem.single_year || csrItem.summary_value,
      singleYearLabel: csrItem.single_year_label || 'Recent Single Year',
      threeYearAvg: csrItem.three_year_avg || csrItem.summary_value,
      threeYearAvgLabel: csrItem.three_year_avg_label || '3 Years Avg Ratio'
    } : {
      title: 'Claim Settlement Ratio',
      summaryValue: 'N/A',
      subtitle: 'Claim Settlement Ratio',
      explanation: 'Information not available for this plan.',
      singleYear: 'N/A',
      singleYearLabel: 'Recent Single Year',
      threeYearAvg: 'N/A',
      threeYearAvgLabel: '3 Years Avg Ratio'
    },
    icr: icrItem ? {
      title: icrItem.title || 'Incurred Claim Ratio',
      summaryValue: icrItem.summary_value,
      subtitle: icrItem.subtitle || 'Incurred Claim Ratio',
      explanation: icrItem.explanation || '',
      range: icrItem.summary_value,
      rangeLabel: icrItem.single_year_label || 'Incurred Claim Ratio'
    } : {
      title: 'Incurred Claim Ratio',
      summaryValue: 'N/A',
      subtitle: 'Incurred Claim Ratio',
      explanation: 'Information not available for this plan.',
      range: 'N/A',
      rangeLabel: 'Incurred Claim Ratio'
    },
    complaintVolume: compItem ? {
      title: compItem.title || 'Complaints/10K',
      summaryValue: compItem.summary_value,
      subtitle: compItem.subtitle || 'Complaints/10K',
      explanation: compItem.explanation || '',
      value: compItem.summary_value,
      label: compItem.single_year_label || `Complaints/10K — ${compItem.summary_value}`
    } : {
      title: 'Complaints/10K',
      summaryValue: 'N/A',
      subtitle: 'Complaints/10K',
      explanation: 'Information not available for this plan.',
      value: 'N/A',
      label: 'Complaints/10K — N/A'
    },
    allMetrics: reportCards
  };

  // 3. Company Strength
  const strengthItems = planData.companyStrength || [];
  const ownershipItem = strengthItems.find(s => s.metric_key === 'ownership');
  const creditRatingItem = strengthItems.find(s => s.metric_key === 'creditRating' || s.metric_key === 'credit_rating');
  const capitalStrengthItem = strengthItems.find(s => s.metric_key === 'capitalStrength' || s.metric_key === 'solvency');
  const financialBaseItem = strengthItems.find(s => s.metric_key === 'financialBase' || s.metric_key === 'aum');
  const reinsuranceStrengthItem = strengthItems.find(s => s.metric_key === 'reinsuranceStrength' || s.metric_key === 'reinsurance');
  const marketPositionItem = strengthItems.find(s => s.metric_key === 'marketPosition' || s.metric_key === 'market_position');

  const defaultStrengthItem = (title) => ({
    title,
    summaryValue: 'N/A',
    explanation: 'Information not available for this plan.',
    value: 'N/A',
    label: '',
    items: []
  });

  const companyStrength = {
    heading: 'COMPANY STRENGTH',
    subheading: 'How reliable/strong is the insurer?',
    description: 'How reliable/strong is the insurer?',
    ownership: ownershipItem ? { ...ownershipItem, summaryValue: ownershipItem.summary_value, explanation: ownershipItem.explanation, items: ownershipItem.items || [] } : defaultStrengthItem('OWNERSHIP'),
    creditRating: creditRatingItem ? { ...creditRatingItem, summaryValue: creditRatingItem.summary_value, explanation: creditRatingItem.explanation, items: creditRatingItem.items || [] } : defaultStrengthItem('CREDIT RATING'),
    capitalStrength: capitalStrengthItem ? { ...capitalStrengthItem, summaryValue: capitalStrengthItem.summary_value, explanation: capitalStrengthItem.explanation, value: capitalStrengthItem.summary_value, items: capitalStrengthItem.items || [] } : defaultStrengthItem('CAPITAL STRENGTH'),
    financialBase: financialBaseItem ? { ...financialBaseItem, summaryValue: financialBaseItem.summary_value, explanation: financialBaseItem.explanation, value: financialBaseItem.summary_value, items: financialBaseItem.items || [] } : defaultStrengthItem('FINANCIAL BASE'),
    reinsuranceStrength: reinsuranceStrengthItem ? { ...reinsuranceStrengthItem, summaryValue: reinsuranceStrengthItem.summary_value, explanation: reinsuranceStrengthItem.explanation, value: reinsuranceStrengthItem.summary_value, items: reinsuranceStrengthItem.items || [] } : defaultStrengthItem('REINSURANCE STRENGTH'),
    marketPosition: marketPositionItem ? { ...marketPositionItem, summaryValue: marketPositionItem.summary_value, explanation: marketPositionItem.explanation, value: marketPositionItem.summary_value, items: marketPositionItem.items || [] } : defaultStrengthItem('MARKET POSITION'),
    items: strengthItems
  };

  // 4. Limitations & Waiting Periods
  const limitations = {
    heading: 'LIMITATIONS & WAITING PERIODS',
    subheading: 'Terms & Waiting Periods',
    description: 'Interactive policy timelines, specific disease waiting, and permanent exclusions.',
    items: (planData.limitations || []).map(l => ({
      id: l.id,
      title: l.title,
      summary: l.summary || '',
      highlight: l.highlight || '',
      durationTag: l.duration_tag || '',
      policyRef: l.policy_ref || '',
      diseaseList: Array.isArray(l.disease_list) ? l.disease_list : [],
      exclusionsList: Array.isArray(l.exclusions_list) ? l.exclusions_list : [],
      iconUrl: l.icon_url || '',
      imageUrl: l.image_url || '',
      videoUrl: l.video_url || '',
      pdfUrl: l.pdf_url || ''
    }))
  };

  // 5. Must Know
  const mustKnow = {
    heading: 'MUST-KNOW DETAILS',
    subheading: 'Key product highlights that policyholders should keep in mind',
    buttonLabel: 'MUST KNOW DETAILS',
    layout: 'details-modal',
    items: (planData.mustKnow || []).map(m => ({
      id: m.id,
      title: m.title,
      summary: m.summary || '',
      points: Array.isArray(m.points) ? m.points : [],
      icon: m.icon || '🛡️',
      iconUrl: m.icon_url || '',
      imageUrl: m.image_url || '',
      videoUrl: m.video_url || '',
      pdfUrl: m.pdf_url || '',
      externalUrl: m.external_url || ''
    }))
  };

  // 6. Best Suited For
  const bestSuitedFor = {
    heading: 'BEST SUITED FOR',
    subheading: `Who should choose ${planData.name}?`,
    description: 'Ideal customer profiles and comprehensive healthcare scenarios.',
    tagline: planData.subtitle || planData.tagline || 'Recommended health protection for families and individuals.',
    profiles: (planData.bestSuited || []).map(b => ({
      id: b.id,
      title: b.title,
      summary: b.summary || '',
      badge: b.badge || '',
      icon: b.icon || '🎯',
      iconUrl: b.icon_url || '',
      imageUrl: b.image_url || '',
      highlights: Array.isArray(b.highlights) ? b.highlights : []
    }))
  };

  // 7. Variants
  const variants = (planData.variants || []).map(v => ({
    id: v.id,
    variantKey: v.variant_key || v.id,
    name: v.name,
    roomCategory: v.room_category,
    network: v.network_type,
    sumInsured: v.sum_insured,
    coverage: v.coverage || v.sum_insured,
    tagline: v.tagline || '',
    badge: v.badge || '',
    popular: Boolean(v.is_popular),
    highlights: Array.isArray(v.highlights) ? v.highlights : []
  }));

  return {
    id: planData.id,
    planId: planData.id,
    slug: planData.slug,
    name: planData.name,
    planName: planData.name,
    fullName: `${company.name || ''} ${planData.name}`.trim(),
    company: company,
    companyId: company.id || planData.company_id,
    companyName: company.name || planData.company_name,
    companySlug: company.slug || planData.company_id,
    companyLogo: company.logo || planData.logo,
    policyBenefits: planData.policyBenefits || [],
    reportCardList: planData.reportCard || [],
    limitationsList: planData.limitations || [],
    mustKnowList: planData.mustKnow || [],
    bestSuitedList: planData.bestSuited || [],
    subtitle: planData.subtitle || planData.tagline || '',
    policySubtitle: planData.subtitle || `${company.name || ''} Health Insurance Policy`,
    tagline: planData.tagline || planData.subtitle || '',
    description: planData.description || '',
    coverage: planData.coverage || '₹5 Lakh – ₹1 Crore',
    hasVariants: variants.length > 0,
    variants,
    featuresSections,
    reportCard,
    companyStrength,
    limitationsWaitingPeriods: limitations,
    mustKnow,
    bestSuitedFor,
    uiConfig: {
      primaryColor,
      accentColor: primaryColor,
      lightBg: secondaryColor,
      demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    // Standard layout compatibility fields
    benefits: (benefits.slice(0, 4).map(b => b.title)),
    details: {
      roomRent: variants[0]?.roomCategory || 'Single Private Room',
      hospitalization: 'Covered up to base Sum Insured',
      prePostHospital: '60 Days Pre & 90 to 180 Days Post Hospitalization',
      dayCare: 'All Day Care procedures covered (<24 hours admission)',
      noClaimBonus: 'Cumulative Bonus on claim-free years',
      waitingPeriod: '30 Days initial, 24 Months Specified Diseases, 36 Months PED',
      exclusions: 'Cosmetic surgery, intentional self-harm, substance abuse, rest cure'
    }
  };
}

const KNOWN_PARENT_PLANS = {
  'medicare-select-standard': 'medicare-select',
  'medicare-select-smart': 'medicare-select',
  'medicare-select-elite': 'medicare-select',
  'star-super-star-classic': 'star-super-star',
  'star-super-star-secure': 'star-super-star',
  'star-super-star-preferred': 'star-super-star',
  'star-super-star-essential': 'star-super-star',
  'star-super-star-value-plus': 'star-super-star'
};

export const getPublicCompanies = async (req, res) => {
  try {
    const companies = await db.companies.getAll(c => c.status === 'active' || c.status === undefined);
    companies.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    const plans = await db.plans.getAll(p => p.status === 'active' || p.status === undefined);

    const data = companies.map(c => {
      const companyPlans = plans
        .filter(p => String(p.company_id).toLowerCase() === String(c.id).toLowerCase())
        .map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          coverage: p.coverage,
          description: p.description || p.tagline,
          parentPlanId: p.parent_plan_id || KNOWN_PARENT_PLANS[p.id] || KNOWN_PARENT_PLANS[p.slug] || null
        }));

      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        fullName: c.full_name,
        logo: c.logo,
        description: c.description,
        theme: {
          primary: c.primary_color || '#0038A8',
          secondary: c.secondary_color || '#F0F4FF',
          accent: c.primary_color || '#0038A8',
          background: c.secondary_color || '#F0F4FF',
          text: '#0F172A'
        },
        plans: companyPlans
      };
    });

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getPublicCompanies:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve companies' });
  }
};

export const getPublicPlanDetail = async (req, res) => {
  try {
    const { companySlug, planSlug } = req.params;
    const planIdentifier = planSlug || companySlug; // Supports /plans/:planSlug or /plans/:companySlug/:planSlug

    let rawPlan = await db.getPlanWithAllSections(planIdentifier, false);

    if (!rawPlan && companySlug) {
      const companyPrefix = String(companySlug).split('-')[0].toLowerCase();
      if (!planIdentifier.toLowerCase().startsWith(companyPrefix)) {
        rawPlan = await db.getPlanWithAllSections(`${companyPrefix}-${planIdentifier}`, false);
      }
    }

    if (!rawPlan) {
      return res.status(404).json({
        success: false,
        error: `Plan '${planIdentifier}' not found`
      });
    }

    // Validate company ownership if companySlug was provided
    if (companySlug && planSlug) {
      const targetCompany = String(companySlug).toLowerCase().trim();
      const planCompany = String(rawPlan.company_id || '').toLowerCase().trim();
      const isMatch = (planCompany === targetCompany) || (targetCompany === 'hdfc-life' && planCompany === 'hdfc-ergo');
      if (!isMatch) {
        return res.status(404).json({
          success: false,
          error: `Plan '${planSlug}' does not belong to company '${companySlug}'`
        });
      }
    }

    const formatted = await formatPlanForPublic(rawPlan);

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Error in getPublicPlanDetail:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve plan details' });
  }
};
