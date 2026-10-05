import db, { hashPassword } from './db.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function seedDatabase() {
  console.log('🌱 Starting WHYINSURED Supabase seed...');

  try {
    // =========================================================================
    // 1. ADMIN USER SEEDING
    // =========================================================================
    const existingAdmin = await db.admins.findByField('email', 'admin@whyinsured.com');
    if (!existingAdmin) {
      await db.admins.create({
        id: 'admin-super-01',
        email: 'admin@whyinsured.com',
        username: 'admin',
        password_hash: hashPassword('Admin@WhyInsured2026!'),
        name: 'Super Administrator',
        role: 'superadmin',
        status: 'active'
      });
      console.log('✅ [Seed] Default Admin created: admin@whyinsured.com (Password: Admin@WhyInsured2026!)');
    } else {
      console.log('✅ [Seed] Default Admin verified: admin@whyinsured.com');
    }

    // Safety guard: If database is already synchronized with canonical public content, do not overwrite
    const existingBenefitsCount = await db.policyBenefits.count();
    if (existingBenefitsCount >= 50) {
      console.log(`✅ [Seed] Database is fully synchronized with canonical website content (${existingBenefitsCount} policy benefits). Preserving canonical data.`);
      return;
    }
    const realCompanies = [
      {
        id: 'hdfc-ergo',
        slug: 'hdfc-ergo',
        name: 'HDFC ERGO',
        full_name: 'HDFC ERGO General Insurance Company Limited',
        description: "One of India's leading health insurance providers, delivering comprehensive coverage, instant cashless claims, and digital-first support.",
        logo: '/assets/hdfc-ergo-logo.png',
        primary_color: '#DC2626',
        secondary_color: '#FFF5F5',
        website_url: 'https://www.hdfcergo.com',
        ownership: 'HDFC Bank (50.5%) / ERGO International AG (49.5%)',
        credit_rating: 'AAA / Stable (CRISIL, ICRA)',
        solvency_ratio: '2.00×',
        aum: '₹27,373 Cr',
        gdpi: '₹18,500+ Cr',
        status: 'active',
        display_order: 1
      },
      {
        id: 'tata-aig',
        slug: 'tata-aig',
        name: 'Tata AIG',
        full_name: 'Tata AIG General Insurance Company Limited',
        description: 'Bringing the trust of Tata to health insurance, featuring global covers and robust maternity add-ons.',
        logo: '/assets/tata-aig.png',
        primary_color: '#0038A8',
        secondary_color: '#F0F4FF',
        website_url: 'https://www.tataaig.com',
        ownership: 'Tata Group (74%) / American International Group (AIG 26%)',
        credit_rating: 'AAA / Stable (CRISIL, ICRA)',
        solvency_ratio: '1.95×',
        aum: '₹22,000+ Cr',
        gdpi: '₹14,500+ Cr',
        status: 'active',
        display_order: 2
      },
      {
        id: 'star-health',
        slug: 'star-health',
        name: 'Star Health',
        full_name: 'Star Health and Allied Insurance Co. Ltd.',
        description: "India's first standalone health insurance firm, famous for its massive network of cashless hospitals and specialized medical covers.",
        logo: '/assets/star-health.png',
        primary_color: '#003087',
        secondary_color: '#F0F4FF',
        website_url: 'https://www.starhealth.in',
        ownership: 'Publicly Listed (Safecrop Investments / Rakesh Jhunjhunwala Estate)',
        credit_rating: 'AAA / Stable',
        solvency_ratio: '1.87×',
        aum: '₹15,000+ Cr',
        gdpi: '₹13,000+ Cr',
        status: 'active',
        display_order: 3
      },
      {
        id: 'niva-bupa',
        slug: 'niva-bupa',
        name: 'Niva Bupa',
        full_name: 'Niva Bupa Health Insurance Company Limited',
        description: 'Specialist health insurer offering innovative claim-lock features and universal coverage.',
        logo: '/assets/niva-bupa.png',
        primary_color: '#0284C7',
        secondary_color: '#F0F9FF',
        website_url: 'https://www.nivabupa.com',
        ownership: 'True North (Bupa 63% / Fettle Tone 37%)',
        credit_rating: 'AA+ / Stable',
        solvency_ratio: '1.72×',
        aum: '₹7,500+ Cr',
        gdpi: '₹5,500+ Cr',
        status: 'active',
        display_order: 4
      },
      {
        id: 'icici-lombard',
        slug: 'icici-lombard',
        name: 'ICICI Lombard',
        full_name: 'ICICI Lombard General Insurance Co. Ltd.',
        description: 'Pioneering private general insurer with seamless digital claims and comprehensive wellness.',
        logo: '/assets/icici-lombard.png',
        primary_color: '#EA580C',
        secondary_color: '#FFF7ED',
        website_url: 'https://www.icicilombard.com',
        ownership: 'ICICI Bank Limited (51.27%) / Public',
        credit_rating: 'AAA / Stable',
        solvency_ratio: '2.55×',
        aum: '₹45,000+ Cr',
        gdpi: '₹25,000+ Cr',
        status: 'active',
        display_order: 5
      },
      {
        id: 'care-health',
        slug: 'care-health',
        name: 'Care Health',
        full_name: 'Care Health Insurance Limited',
        description: 'Specialized health insurer with global hospitalization and OPD benefits.',
        logo: '/assets/care-health.png',
        primary_color: '#15803D',
        secondary_color: '#F0FDF4',
        website_url: 'https://www.careinsurance.com',
        ownership: 'Religare Enterprises Limited',
        credit_rating: 'AA / Positive',
        solvency_ratio: '1.82×',
        aum: '₹8,000+ Cr',
        gdpi: '₹6,800+ Cr',
        status: 'active',
        display_order: 6
      },
      {
        id: 'sbi-general',
        slug: 'sbi-general',
        name: 'SBI General',
        full_name: 'SBI General Insurance Company Limited',
        description: 'State Bank of India trusted legacy with expansive rural and urban healthcare access.',
        logo: '/assets/SBI.png',
        primary_color: '#1E3A8A',
        secondary_color: '#EFF6FF',
        website_url: 'https://www.sbigeneral.in',
        ownership: 'State Bank of India (70%) / Napean Opportunities (16%)',
        credit_rating: 'AAA / Stable',
        solvency_ratio: '2.15×',
        aum: '₹14,000+ Cr',
        gdpi: '₹11,000+ Cr',
        status: 'active',
        display_order: 7
      },
      {
        id: 'acko',
        slug: 'acko',
        name: 'ACKO',
        full_name: 'ACKO General Insurance Limited',
        description: 'Digital-first health insurance with zero paperwork and instant 100% cashless claims.',
        logo: '/assets/acko.png',
        primary_color: '#7C3AED',
        secondary_color: '#F5F3FF',
        website_url: 'https://www.acko.com',
        ownership: 'ACKO Technology & Services P. Ltd.',
        credit_rating: 'A+ / Stable',
        solvency_ratio: '1.92×',
        aum: '₹3,200+ Cr',
        gdpi: '₹2,100+ Cr',
        status: 'active',
        display_order: 8
      },
      {
        id: 'manipal-cigna',
        slug: 'manipal-cigna',
        name: 'ManipalCigna',
        full_name: 'ManipalCigna Health Insurance Company Limited',
        description: 'Joint venture between Manipal Group and Cigna Corporation providing healthcare wellness and global coverage.',
        logo: '/assets/manipal cigna .png',
        primary_color: '#007788',
        secondary_color: '#F0FDFE',
        website_url: 'https://www.manipalcigna.com',
        ownership: 'Manipal Group (51%) / Cigna (49%)',
        credit_rating: 'AA+ / Stable',
        solvency_ratio: '1.90×',
        aum: '₹4,500+ Cr',
        gdpi: '₹2,800+ Cr',
        status: 'active',
        display_order: 9
      },
      {
        id: 'aditya-birla',
        slug: 'aditya-birla',
        name: 'Aditya Birla',
        full_name: 'Aditya Birla Health Insurance Co. Limited',
        description: 'Pioneering health insurance with active health tracking, chronic management, and 100% health returns.',
        logo: '/assets/aditya brila.png',
        primary_color: '#C41230',
        secondary_color: '#FFF1F2',
        website_url: 'https://www.adityabirlacapital.com',
        ownership: 'Aditya Birla Capital (51%) / MMI Holdings (49%)',
        credit_rating: 'AAA / Stable',
        solvency_ratio: '1.85×',
        aum: '₹6,000+ Cr',
        gdpi: '₹3,500+ Cr',
        status: 'active',
        display_order: 10
      },
      {
        id: 'bajaj-general',
        slug: 'bajaj-general',
        name: 'Bajaj General',
        full_name: 'Bajaj Allianz General Insurance Company',
        description: 'Reliable general insurance coverage backed by Bajaj Finserv and Allianz SE.',
        logo: '/assets/Bajaj.png',
        primary_color: '#005B94',
        secondary_color: '#F0F7FC',
        website_url: 'https://www.bajajallianz.com',
        ownership: 'Bajaj Finserv (74%) / Allianz SE (26%)',
        credit_rating: 'AAA / Stable',
        solvency_ratio: '3.10×',
        aum: '₹30,000+ Cr',
        gdpi: '₹19,000+ Cr',
        status: 'active',
        display_order: 11
      },
      {
        id: 'magma-hdi',
        slug: 'magma-hdi',
        name: 'Magma HDI',
        full_name: 'Magma HDI General Insurance Company Limited',
        description: 'Comprehensive family and personal healthcare solutions with flexible sum insured options.',
        logo: '/assets/Magma HDI General Insurance.png',
        primary_color: '#1E3A8A',
        secondary_color: '#EFF6FF',
        website_url: 'https://www.magma-hdi.co.in',
        ownership: 'Poonawalla Fincorp / HDI Global SE',
        credit_rating: 'AA+ / Stable',
        solvency_ratio: '1.88×',
        aum: '₹5,000+ Cr',
        gdpi: '₹2,500+ Cr',
        status: 'active',
        display_order: 12
      },
      {
        id: 'reliance-general',
        slug: 'reliance-general',
        name: 'Reliance General',
        full_name: 'Reliance General Insurance Company Limited',
        description: 'Wide network of cashless healthcare providers and customizable health policies.',
        logo: '/assets/indusind-general.png',
        primary_color: '#0047BA',
        secondary_color: '#EDF3FC',
        website_url: 'https://www.reliancegeneral.co.in',
        ownership: 'Reliance Capital / Public',
        credit_rating: 'AA / Stable',
        solvency_ratio: '1.75×',
        aum: '₹12,000+ Cr',
        gdpi: '₹9,500+ Cr',
        status: 'active',
        display_order: 13
      }
    ];

    for (const comp of realCompanies) {
      const existing = await db.companies.findById(comp.id);
      if (!existing) {
        await db.companies.create(comp);
      } else {
        await db.companies.update(comp.id, comp);
      }
    }
    console.log(`✅ [Seed] Companies verified: ${realCompanies.length} companies`);

    // =========================================================================
    // 3. REAL WHYINSURED PLANS SEEDING
    // =========================================================================
    const realPlans = [
      {
            "id": "hdfc-optima-secure-plus",
            "company_id": "hdfc-ergo",
            "name": "Optima Secure+",
            "slug": "hdfc-optima-secure-plus",
            "subtitle": "Unlimited Protection. Added Every Year.",
            "tagline": "Unlimited Protection. Added Every Year.",
            "description": "Unlimited Protection. Added Every Year.",
            "logo": "/assets/hdfc-ergo-logo.png",
            "coverage": "₹10 Lakh - ₹2 Crore",
            "theme_primary": "#E30613",
            "theme_secondary": "#0A1128",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "hdfc-optima-secure",
            "company_id": "hdfc-ergo",
            "name": "Optima Secure",
            "slug": "hdfc-optima-secure",
            "subtitle": "2X Coverage from Day 1 with Zero Non-Medical Deductions",
            "tagline": "2X Coverage from Day 1 with Zero Non-Medical Deductions",
            "description": "2X Coverage from Day 1 with Zero Non-Medical Deductions",
            "logo": "/assets/hdfc-ergo-logo.png",
            "coverage": "₹5 Lakh - ₹2 Crore",
            "theme_primary": "#E30613",
            "theme_secondary": "#0A1128",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "hdfc-energy",
            "company_id": "hdfc-ergo",
            "name": "HDFC ERGO Energy Plan",
            "slug": "hdfc-energy",
            "subtitle": "Specialized Health Cover with Day 1 Protection for Hypertension & Diabetes",
            "tagline": "Specialized Health Cover with Day 1 Protection for Hypertension & Diabetes",
            "description": "Specialized Health Cover with Day 1 Protection for Hypertension & Diabetes",
            "logo": "/assets/hdfc-ergo-logo.png",
            "coverage": "₹10 Lakh - ₹50 Lakh",
            "theme_primary": "#E30613",
            "theme_secondary": "#0A1128",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "hdfc-medisure-super-topup",
            "company_id": "hdfc-ergo",
            "name": "MediSure Super Top-Up",
            "slug": "hdfc-medisure-super-topup",
            "subtitle": "High-Deductible Health Cover with Expansive Sum Insured & Zero Room Rent Capping",
            "tagline": "High-Deductible Health Cover with Expansive Sum Insured & Zero Room Rent Capping",
            "description": "High-Deductible Health Cover with Expansive Sum Insured & Zero Room Rent Capping",
            "logo": "/assets/hdfc-ergo-logo.png",
            "coverage": "₹5 Lakh - ₹20 Lakh",
            "theme_primary": "#E30613",
            "theme_secondary": "#0A1128",
            "status": "active",
            "display_order": 4
      },
      {
            "id": "medicare-premier",
            "company_id": "tata-aig",
            "name": "MediCare Premier",
            "slug": "medicare-premier",
            "subtitle": "Comprehensive Health Insurance with Enhanced Medical & Wellness Benefits",
            "tagline": "Comprehensive Health Insurance with Enhanced Medical & Wellness Benefits",
            "description": "Comprehensive Health Insurance with Enhanced Medical & Wellness Benefits.",
            "logo": "/assets/tata-aig.png",
            "coverage": "₹50 Lakh - ₹3 Crore",
            "theme_primary": "#0038A8",
            "theme_secondary": "#F0F4FF",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "medicare-select",
            "company_id": "tata-aig",
            "name": "MediCare Select",
            "slug": "medicare-select",
            "subtitle": "Standard essential coverage with Single Private Room and Restore Infinity Plus.",
            "tagline": "Standard essential coverage with Single Private Room and Restore Infinity Plus.",
            "description": "Standard essential coverage covering hospitalization and recovery benefits across 3 tailored variants: MediCare Select, MediCare Select Smart, and MediCare Select Elite.",
            "logo": "/assets/tata-aig.png",
            "coverage": "5 Lakhs – 3 Crore",
            "theme_primary": "#0038A8",
            "theme_secondary": "#F0F4FF",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "medicare-select-standard",
            "company_id": "tata-aig",
            "name": "MediCare Select",
            "slug": "medicare-select-standard",
            "subtitle": "Standard essential coverage with Single Private Room and Restore Infinity Plus.",
            "tagline": "Standard essential coverage with Single Private Room and Restore Infinity Plus.",
            "description": "Comprehensive coverage across all network hospitals with Single Private Room and Restore Infinity Plus.",
            "logo": "/assets/tata-aig.png",
            "coverage": "5 Lakhs – 3 Crore",
            "theme_primary": "#0038A8",
            "theme_secondary": "#F0F4FF",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "medicare-select-smart",
            "company_id": "tata-aig",
            "name": "MediCare Select Smart",
            "slug": "medicare-select-smart",
            "subtitle": "Value-optimized health insurance with Twin Sharing room category across dedicated VPN hospitals.",
            "tagline": "Value-optimized health insurance with Twin Sharing room category across dedicated VPN hospitals.",
            "description": "Value-optimized healthcare with Twin Sharing room category across dedicated VPN network hospitals.",
            "logo": "/assets/tata-aig.png",
            "coverage": "5 Lakhs – 25 Lakhs",
            "theme_primary": "#0038A8",
            "theme_secondary": "#F0F4FF",
            "status": "active",
            "display_order": 4
      },
      {
            "id": "medicare-select-elite",
            "company_id": "tata-aig",
            "name": "MediCare Select Elite",
            "slug": "medicare-select-elite",
            "subtitle": "Elite health insurance with Any Room category, Inbuilt Consumables and Inbuilt 5X Super Charge Bonus.",
            "tagline": "Elite health insurance with Any Room category, Inbuilt Consumables and Inbuilt 5X Super Charge Bonus.",
            "description": "Elite healthcare coverage with Any Room category, Inbuilt Consumables and Inbuilt 5X Super Charge Bonus.",
            "logo": "/assets/tata-aig.png",
            "coverage": "25 Lakhs – 3 Crore",
            "theme_primary": "#0038A8",
            "theme_secondary": "#F0F4FF",
            "status": "active",
            "display_order": 5
      },
      {
            "id": "medicare-reserve",
            "company_id": "tata-aig",
            "name": "MediCare Reserve",
            "slug": "medicare-reserve",
            "subtitle": "Super Top-Up Health Insurance with flexible aggregate deductible and restoration benefits",
            "tagline": "Super Top-Up Health Insurance with flexible aggregate deductible and restoration benefits",
            "description": "Super Top-Up Health Insurance with flexible deductible options and restoration benefit.",
            "logo": "/assets/tata-aig.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#0038A8",
            "theme_secondary": "#F0F4FF",
            "status": "active",
            "display_order": 6
      },
      {
            "id": "star-women-care",
            "company_id": "star-health",
            "name": "Women Care",
            "slug": "star-women-care",
            "subtitle": "Comprehensive Women-Centric Health Cover with Inbuilt Consumables & Mother ICU Cover",
            "tagline": "Comprehensive Women-Centric Health Cover with Inbuilt Consumables & Mother ICU Cover",
            "description": "Specialized health insurance designed for women with mother ICU cover, inbuilt consumables, and maternity benefits.",
            "logo": "/assets/star-health.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "star-young-star",
            "company_id": "star-health",
            "name": "Young Star Insurance Policy",
            "slug": "star-young-star",
            "subtitle": "Tailored health protection for individuals aged 18–40 with 100% restoration, additional RTA cover, and 12-month waiting periods",
            "tagline": "Tailored health protection for individuals aged 18–40 with 100% restoration, additional RTA cover, and 12-month waiting periods",
            "description": "Tailored health protection for individuals aged 18–40 with 100% automatic restoration, additional RTA cover, single private AC room, and 12-month waiting periods.",
            "logo": "/assets/star-health.png",
            "coverage": "₹3 Lakh - ₹1 Crore",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "star-health-assure",
            "company_id": "star-health",
            "name": "HealthAssure",
            "slug": "star-health-assure",
            "subtitle": "Comprehensive assurance with unlimited automatic restoration, any room category, and listed consumables coverage",
            "tagline": "Comprehensive assurance with unlimited automatic restoration, any room category, and listed consumables coverage",
            "description": "Comprehensive assurance with unlimited automatic restoration, any room category, and listed consumables coverage.",
            "logo": "/assets/star-health.png",
            "coverage": "₹5 Lakh - ₹2 Crore",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "star-super-star",
            "company_id": "star-health",
            "name": "Super Star",
            "slug": "star-super-star",
            "subtitle": "Choose from 5 Tailored Variants: Classic, Secure, Preferred, Essential, and Value Plus",
            "tagline": "Choose from 5 Tailored Variants: Classic, Secure, Preferred, Essential, and Value Plus",
            "description": "Star Health's flagship comprehensive cover offering 5 tailored variants: Classic, Secure, Preferred, Essential, and Value Plus.",
            "logo": "/assets/star-health.png",
            "coverage": "₹5 Lakh - Unlimited",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 4
      },
      {
            "id": "star-super-star-classic",
            "company_id": "star-health",
            "name": "Super Star Classic",
            "slug": "star-super-star-classic",
            "subtitle": "Comprehensive Classic Coverage with 90/180 Days Pre & Post Hospitalization, Limitless Care & Freeze Your Age",
            "tagline": "Comprehensive Classic Coverage with 90/180 Days Pre & Post Hospitalization, Limitless Care & Freeze Your Age",
            "description": "Comprehensive classic protection with 90/180 days pre/post hospitalization, Limitless Care, and Freeze Your Age up to 50 years.",
            "logo": "/assets/star-health.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 5
      },
      {
            "id": "star-super-star-secure",
            "company_id": "star-health",
            "name": "Super Star Secure",
            "slug": "star-super-star-secure",
            "subtitle": "Premium High-Security Cover with Any Room, Unlimited Sum Insured Option, Limitless Loyalty Bonus & DME",
            "tagline": "Premium High-Security Cover with Any Room, Unlimited Sum Insured Option, Limitless Loyalty Bonus & DME",
            "description": "High-tier security cover with Any Room, Unlimited Sum Insured option, Limitless Loyalty Bonus, and Durable Medical Equipment.",
            "logo": "/assets/star-health.png",
            "coverage": "₹7.5 Lakh - Unlimited",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 6
      },
      {
            "id": "star-super-star-preferred",
            "company_id": "star-health",
            "name": "Super Star Preferred",
            "slug": "star-super-star-preferred",
            "subtitle": "Elite Coverage with Any Room, Limitless Loyalty Bonus, 1st Year Premium Return & Health Booster",
            "tagline": "Elite Coverage with Any Room, Limitless Loyalty Bonus, 1st Year Premium Return & Health Booster",
            "description": "Elite coverage combining Limitless Loyalty Bonus, Premium Return (first-year refund on 5 claim-free years), and Health Booster.",
            "logo": "/assets/star-health.png",
            "coverage": "₹7.5 Lakh - Unlimited",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 7
      },
      {
            "id": "star-super-star-essential",
            "company_id": "star-health",
            "name": "Super Star Essential",
            "slug": "star-super-star-essential",
            "subtitle": "Cost-Effective Coverage for Zones B & C with Single Private AC Room, Premium Return & DME",
            "tagline": "Cost-Effective Coverage for Zones B & C with Single Private AC Room, Premium Return & DME",
            "description": "Cost-optimized coverage for Zones B & C with Single Private AC room, Premium Return, and loyalty enhancements from ₹7.5 Lakh.",
            "logo": "/assets/star-health.png",
            "coverage": "₹5 Lakh - ₹10 Lakh",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 8
      },
      {
            "id": "star-super-star-value-plus",
            "company_id": "star-health",
            "name": "Super Star Value Plus",
            "slug": "star-super-star-value-plus",
            "subtitle": "High-Value Smart Healthcare with Up to ₹5,000/day Boarding, Premium Return, Consumables & Long-Term Discounts",
            "tagline": "High-Value Smart Healthcare with Up to ₹5,000/day Boarding, Premium Return, Consumables & Long-Term Discounts",
            "description": "Balanced healthcare with up to ₹5,000/day boarding, Premium Return, Inbuilt Consumables, and long-term discounts up to 12.5%.",
            "logo": "/assets/star-health.png",
            "coverage": "₹7.5 Lakh - ₹25 Lakh",
            "theme_primary": "#003087",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 9
      },
      {
            "id": "aspire",
            "company_id": "niva-bupa",
            "name": "Aspire",
            "slug": "aspire",
            "subtitle": "Next-Gen Protection with Booster+ Cumulative Coverage, Lock the Clock & Unlimited Restoration",
            "tagline": "Next-Gen Protection with Booster+ Cumulative Coverage, Lock the Clock & Unlimited Restoration",
            "description": "Next-gen protection with Booster+ cumulative coverage, Lock the Clock premium freezing, and unlimited restoration.",
            "logo": "/assets/niva-bupa.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#0EA5E9",
            "theme_secondary": "#F0F9FF",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "reassure-2-0",
            "company_id": "niva-bupa",
            "name": "ReAssure 2.0",
            "slug": "reassure-2-0",
            "subtitle": "Smart health cover with Unlimited Restoration, Booster bonus up to 10X, Day 1 Health Check-up, and Safeguard+ rider.",
            "tagline": "Smart health cover with Unlimited Restoration, Booster bonus up to 10X, Day 1 Health Check-up, and Safeguard+ rider.",
            "description": "Smart health cover with Unlimited Restoration, Booster bonus up to 10X, Day 1 Health Check-up, and Safeguard+ rider.",
            "logo": "/assets/niva-bupa.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#0EA5E9",
            "theme_secondary": "#FFFFFF",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "health-recharge",
            "company_id": "niva-bupa",
            "name": "Health Recharge",
            "slug": "health-recharge",
            "subtitle": "Flexible Sum Insured, Deductible and Customer-Level Add-on Options",
            "tagline": "Flexible Sum Insured, Deductible and Customer-Level Add-on Options",
            "description": "Flexible Sum Insured, deductible and customer-level optional add-ons.",
            "logo": "/assets/niva-bupa.png",
            "coverage": "₹2 Lakh - ₹95 Lakh",
            "theme_primary": "#0EA5E9",
            "theme_secondary": "#F0F9FF",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "reassure-3-0",
            "company_id": "niva-bupa",
            "name": "ReAssure 3.0",
            "slug": "reassure-3-0",
            "subtitle": "Flexible Variants with Booster+, ReAssure Forever and Worldwide Treatment Options",
            "tagline": "Flexible Variants with Booster+, ReAssure Forever and Worldwide Treatment Options",
            "description": "Four Niva Bupa variants with Booster+, ReAssure Forever, and flexible worldwide treatment options.",
            "logo": "/assets/niva-bupa.png",
            "coverage": "₹5 Lakh / ₹10 Lakh / Unlimited",
            "theme_primary": "#0EA5E9",
            "theme_secondary": "#F0F9FF",
            "status": "active",
            "display_order": 4
      },
      {
            "id": "elevate",
            "company_id": "icici-lombard",
            "name": "Elevate",
            "slug": "elevate",
            "subtitle": "Infinite Care, Power Booster, Unlimited Restoration & Customizable Healthcare Protection",
            "tagline": "Infinite Care, Power Booster, Unlimited Restoration & Customizable Healthcare Protection",
            "description": "Infinite Care, Power Booster, Unlimited Restoration & Customizable Healthcare Protection.",
            "logo": "/assets/icici-lombard.png",
            "coverage": "₹5 Lakh - ₹3 Crore",
            "theme_primary": "#F58220",
            "theme_secondary": "#D94A0B",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "activate-booster",
            "company_id": "icici-lombard",
            "name": "Activate Booster",
            "slug": "activate-booster",
            "subtitle": "High Sum Insured Super Top-Up Protection up to ₹3 Crore with Flexible Deductibles & Guaranteed Deductible Reduction",
            "tagline": "High Sum Insured Super Top-Up Protection up to ₹3 Crore with Flexible Deductibles & Guaranteed Deductible Reduction",
            "description": "Super Top-Up Health Protection with High Sum Insured (up to ₹3 Cr), flexible deductibles, Guaranteed Deductible Reduction, and Plan A & Plan B variants.",
            "logo": "/assets/icici-lombard.png",
            "coverage": "₹10 Lakh - ₹3 Crore",
            "theme_primary": "#F58220",
            "theme_secondary": "#FFF4E8",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "care-supreme",
            "company_id": "care-health",
            "name": "Care Supreme",
            "slug": "care-supreme",
            "subtitle": "Comprehensive Health Insurance with 500% NCB Super & Unlimited Automatic Recharge",
            "tagline": "Comprehensive Health Insurance with 500% NCB Super & Unlimited Automatic Recharge",
            "description": "Comprehensive health insurance with unlimited automatic recharge, cumulative bonus super, and premium healthcare privileges.",
            "logo": "/assets/care-health.png",
            "coverage": "₹7 Lakh - ₹1 Crore",
            "theme_primary": "#003366",
            "theme_secondary": "#FEFCE8",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "ultimate-care",
            "company_id": "care-health",
            "name": "Ultimate Care",
            "slug": "ultimate-care",
            "subtitle": "Complete Protection. More Benefits. More Care.",
            "tagline": "Complete Protection. More Benefits. More Care.",
            "description": "Next-generation health insurance providing high-value coverage with global treatments, wellness rewards, and inflation shield.",
            "logo": "/assets/care-health.png",
            "coverage": "₹10 Lakh - ₹2 Crore",
            "theme_primary": "#003366",
            "theme_secondary": "#FEFCE8",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "ultimate-joy",
            "company_id": "care-health",
            "name": "Ultimate Joy",
            "slug": "ultimate-joy",
            "subtitle": "Family & Maternity Health Protection with Unlimited Automatic Recharge, 500% Cumulative Bonus & Global Newborn Care",
            "tagline": "Family & Maternity Health Protection with Unlimited Automatic Recharge, 500% Cumulative Bonus & Global Newborn Care",
            "description": "Comprehensive family & maternity-focused health coverage with unlimited automatic recharge, 500% cumulative bonus, all room categories covered, and extensive mother & newborn benefits.",
            "logo": "/assets/care-health.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#003366",
            "theme_secondary": "#FEFCE8",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "care-advantage",
            "company_id": "care-health",
            "name": "Care Advantage",
            "slug": "care-advantage",
            "subtitle": "High-Value Health Cover with ₹1 Crore Protection & Zero Sub-Limits",
            "tagline": "High-Value Health Cover with ₹1 Crore Protection & Zero Sub-Limits",
            "description": "High-value health insurance policy providing ₹25 Lakh to ₹1 Crore coverage with zero sub-limits on room rent and ICU charges.",
            "logo": "/assets/care-health.png",
            "coverage": "₹25 Lakh - ₹1 Crore",
            "theme_primary": "#003366",
            "theme_secondary": "#FEFCE8",
            "status": "active",
            "display_order": 4
      },
      {
            "id": "care-freedom",
            "company_id": "care-health",
            "name": "Care Freedom",
            "slug": "care-freedom",
            "subtitle": "Healthcare Freedom with Zero Pre-Policy Medical Check-up",
            "tagline": "Healthcare Freedom with Zero Pre-Policy Medical Check-up",
            "description": "Specialized health protection with zero pre-policy medical check-up, in-patient care, 540+ day care procedures, and annual health check-ups.",
            "logo": "/assets/care-health.png",
            "coverage": "₹3 Lakh - ₹10 Lakh",
            "theme_primary": "#003366",
            "theme_secondary": "#FEFCE8",
            "status": "active",
            "display_order": 5
      },
      {
            "id": "reliance-health-infinity",
            "company_id": "reliance-general",
            "name": "Health Infinity",
            "slug": "reliance-health-infinity",
            "subtitle": "Limitless Health Protection with Unlimited Restoration, 30% More Cover, and Zero Room Sub-Limits",
            "tagline": "Limitless Health Protection with Unlimited Restoration, 30% More Cover, and Zero Room Sub-Limits",
            "description": "Limitless Health Protection with Unlimited Restoration, 30% More Cover, and Zero Room Sub-Limits",
            "logo": "/assets/indusind-general.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#205398",
            "theme_secondary": "#F0F5FA",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "magma-one-health-secure",
            "company_id": "magma-hdi",
            "name": "One Health Secure",
            "slug": "magma-one-health-secure",
            "subtitle": "Comprehensive Health Insurance with Flexible Coverage, Unlimited Restoration, and Extensive Cashless Support",
            "tagline": "Comprehensive Health Insurance with Flexible Coverage, Unlimited Restoration, and Extensive Cashless Support",
            "description": "Comprehensive Health Insurance with Flexible Coverage, Unlimited Restoration, and Extensive Cashless Support",
            "logo": "/assets/Magma%20HDI%20General%20Insurance.png",
            "coverage": "₹5 Lakh - ₹1 Crore",
            "theme_primary": "#ED1B24",
            "theme_secondary": "#FFF5F5",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "lifetime-health",
            "company_id": "manipal-cigna",
            "name": "Lifetime Health",
            "slug": "lifetime-health",
            "subtitle": "Comprehensive Lifetime Health Protection with High Sum Insured & Unlimited Restorations",
            "tagline": "Comprehensive Lifetime Health Protection with High Sum Insured & Unlimited Restorations",
            "description": "Comprehensive Lifetime Health Protection with High Sum Insured & Unlimited Restorations",
            "logo": "/assets/manipal%20cigna%20.png",
            "coverage": "₹50 Lakh - ₹3 Crore",
            "theme_primary": "#F8971F",
            "theme_secondary": "#0982C6",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "sarvah-uttam",
            "company_id": "manipal-cigna",
            "name": "Sarvah Uttam",
            "slug": "sarvah-uttam",
            "subtitle": "Comprehensive Health Insurance with Anant Benefit, Sarathi 2.0 & Unlimited Restoration",
            "tagline": "Comprehensive Health Insurance with Anant Benefit, Sarathi 2.0 & Unlimited Restoration",
            "description": "Comprehensive Health Insurance with Anant Benefit, Sarathi 2.0 & Unlimited Restoration",
            "logo": "/assets/manipal%20cigna%20.png",
            "coverage": "Base SI ₹10L and above",
            "theme_primary": "#F8971F",
            "theme_secondary": "#0982C6",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "sarvah-param",
            "company_id": "manipal-cigna",
            "name": "Sarvah Param",
            "slug": "sarvah-param",
            "subtitle": "India's Most Comprehensive Health Insurance — Zero Waiting Period, Unlimited Coverage & Lifelong Protection",
            "tagline": "India's Most Comprehensive Health Insurance — Zero Waiting Period, Unlimited Coverage & Lifelong Protection",
            "description": "India's Most Comprehensive Health Insurance — Zero Waiting Period, Unlimited Coverage & Lifelong Protection",
            "logo": "/assets/manipal%20cigna%20.png",
            "coverage": "Base SI ₹5L to ₹300L",
            "theme_primary": "#F8971F",
            "theme_secondary": "#0982C6",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "one-max",
            "company_id": "aditya-birla",
            "name": "One Max",
            "slug": "one-max",
            "subtitle": "Comprehensive Health Protection with 100% Super Credit & Unlimited Super Reload",
            "tagline": "Comprehensive Health Protection with 100% Super Credit & Unlimited Super Reload",
            "description": "Comprehensive Health Protection with 100% Super Credit & Unlimited Super Reload",
            "logo": "/assets/aditya%20brila.png",
            "coverage": "₹10 Lakh - ₹3 Crore",
            "theme_primary": "#D51D25",
            "theme_secondary": "#F68529",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "activ-one-vytl",
            "company_id": "aditya-birla",
            "name": "Activ One VYTL",
            "slug": "activ-one-vytl",
            "subtitle": "Comprehensive Health Shield with Day 1 Chronic Care & HealthReturns™",
            "tagline": "Comprehensive Health Shield with Day 1 Chronic Care & HealthReturns™",
            "description": "Comprehensive Health Shield with Day 1 Chronic Care & HealthReturns™",
            "logo": "/assets/aditya%20brila.png",
            "coverage": "₹5 Lakh - ₹2 Crore",
            "theme_primary": "#D51D25",
            "theme_secondary": "#F68529",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "activ-yuva",
            "company_id": "aditya-birla",
            "name": "Activ Yuva",
            "slug": "activ-yuva",
            "subtitle": "Youth-Centric Health Shield with 2X Day 1 Yuva Reload, 10X Yuva Credit & FitForward Multipliers",
            "tagline": "Youth-Centric Health Shield with 2X Day 1 Yuva Reload, 10X Yuva Credit & FitForward Multipliers",
            "description": "Youth-Centric Health Shield with 2X Day 1 Yuva Reload, 10X Yuva Credit & FitForward Multipliers",
            "logo": "/assets/aditya%20brila.png",
            "coverage": "₹5 Lakh - ₹1 Crore / Unlimited",
            "theme_primary": "#D51D25",
            "theme_secondary": "#F68529",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "activ-one-max-plus",
            "company_id": "aditya-birla",
            "name": "Activ One MAX+",
            "slug": "activ-one-max-plus",
            "subtitle": "Premium Health Coverage with Comprehensive Hospitalization, Chronic Care & Health Management",
            "tagline": "Premium Health Coverage with Comprehensive Hospitalization, Chronic Care & Health Management",
            "description": "Premium Health Coverage with Comprehensive Hospitalization, Chronic Care & Health Management",
            "logo": "/assets/aditya%20brila.png",
            "coverage": "Comprehensive Cover",
            "theme_primary": "#D51D25",
            "theme_secondary": "#F68529",
            "status": "active",
            "display_order": 4
      },
      {
            "id": "health-guard",
            "company_id": "bajaj-general",
            "name": "Health Guard",
            "slug": "health-guard",
            "subtitle": "Comprehensive individual and family floater health cover across Silver, Gold, and Platinum variants with Sum Insured reinstatement.",
            "tagline": "Comprehensive individual and family floater health cover across Silver, Gold, and Platinum variants with Sum Insured reinstatement.",
            "description": "Comprehensive individual and family floater health cover across Silver, Gold, and Platinum variants with Sum Insured reinstatement.",
            "logo": "/assets/Bajaj.png",
            "coverage": "₹1.5 Lakh - ₹1 Crore",
            "theme_primary": "#004DA8",
            "theme_secondary": "#003781",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "super-health-insurance",
            "company_id": "sbi-general",
            "name": "Super Health Insurance",
            "slug": "super-health-insurance",
            "subtitle": "Comprehensive healthcare coverage with Health Multiplier up to 3X, unlimited Reinsure Benefit, and Claims Shield consumables protection.",
            "tagline": "Comprehensive healthcare coverage with Health Multiplier up to 3X, unlimited Reinsure Benefit, and Claims Shield consumables protection.",
            "description": "Comprehensive healthcare coverage with Health Multiplier up to 3X, unlimited Reinsure Benefit, and Claims Shield consumables protection.",
            "logo": "/assets/SBI.png",
            "coverage": "₹3 Lakh - ₹2 Crore",
            "theme_primary": "#00B5EF",
            "theme_secondary": "#292075",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "arogya-supreme",
            "company_id": "sbi-general",
            "name": "Arogya Supreme",
            "slug": "arogya-supreme",
            "subtitle": "Comprehensive health coverage with 537 Day Care procedures, Single Private AC Room, domestic emergency evacuation, and 6 modular optional covers.",
            "tagline": "Comprehensive health coverage with 537 Day Care procedures, Single Private AC Room, domestic emergency evacuation, and 6 modular optional covers.",
            "description": "Comprehensive health coverage with 537 Day Care procedures, Single Private AC Room, domestic emergency evacuation, and 6 modular optional covers.",
            "logo": "/assets/SBI.png",
            "coverage": "₹1 Lakh - ₹5 Crore",
            "theme_primary": "#00B5EF",
            "theme_secondary": "#292075",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "health-alpha",
            "company_id": "sbi-general",
            "name": "Health Alpha",
            "slug": "health-alpha",
            "subtitle": "Flagship health protection featuring Endless Sum Insured, Restore Benefit, Day Care procedures, and 8 comprehensive modular lifestyle add-ons.",
            "tagline": "Flagship health protection featuring Endless Sum Insured, Restore Benefit, Day Care procedures, and 8 comprehensive modular lifestyle add-ons.",
            "description": "Flagship health protection featuring Endless Sum Insured, Restore Benefit, Day Care procedures, and 8 comprehensive modular lifestyle add-ons.",
            "logo": "/assets/SBI.png",
            "coverage": "₹5 Lakh - ₹5 Crore",
            "theme_primary": "#00B5EF",
            "theme_secondary": "#292075",
            "status": "active",
            "display_order": 3
      },
      {
            "id": "platinum-super-top-up",
            "company_id": "acko",
            "name": "Platinum Super Top Up",
            "slug": "platinum-super-top-up",
            "subtitle": "High-value super top-up health coverage from ₹10 Lakh to Unlimited Sum Insured with 100% bill payment and zero room rent limits.",
            "tagline": "High-value super top-up health coverage from ₹10 Lakh to Unlimited Sum Insured with 100% bill payment and zero room rent limits.",
            "description": "High-value super top-up health coverage from ₹10 Lakh to Unlimited Sum Insured with 100% bill payment and zero room rent limits.",
            "logo": "/assets/acko.png",
            "coverage": "₹10 Lakh - Unlimited",
            "theme_primary": "#511C53",
            "theme_secondary": "#00A99D",
            "status": "active",
            "display_order": 1
      },
      {
            "id": "platinum-lite",
            "company_id": "acko",
            "name": "Platinum Lite",
            "slug": "platinum-lite",
            "subtitle": "Comprehensive base health insurance with ₹10 Lakh to ₹1 Crore coverage, 100% bill payment with consumables, and 10% annual inflation protection.",
            "tagline": "Comprehensive base health insurance with ₹10 Lakh to ₹1 Crore coverage, 100% bill payment with consumables, and 10% annual inflation protection.",
            "description": "Comprehensive base health insurance with ₹10 Lakh to ₹1 Crore coverage, 100% bill payment with consumables, and 10% annual inflation protection.",
            "logo": "/assets/acko.png",
            "coverage": "₹10 Lakh - ₹1 Crore",
            "theme_primary": "#511C53",
            "theme_secondary": "#00A99D",
            "status": "active",
            "display_order": 2
      },
      {
            "id": "platinum",
            "company_id": "acko",
            "name": "Platinum",
            "slug": "platinum",
            "subtitle": "Premier high-value health insurance with ₹1 Crore and Unlimited Sum Insured options, zero room rent limits, zero waiting period, and 100% bill payment.",
            "tagline": "Premier high-value health insurance with ₹1 Crore and Unlimited Sum Insured options, zero room rent limits, zero waiting period, and 100% bill payment.",
            "description": "Premier high-value health insurance with ₹1 Crore and Unlimited Sum Insured options, zero room rent limits, zero waiting period, and 100% bill payment.",
            "logo": "/assets/acko.png",
            "coverage": "₹1 Crore - Unlimited",
            "theme_primary": "#511C53",
            "theme_secondary": "#00A99D",
            "status": "active",
            "display_order": 3
      }
];

    for (const p of realPlans) {
      const existing = await db.plans.findById(p.id);
      if (!existing) {
        await db.plans.create(p);
      } else {
        await db.plans.update(p.id, p);
      }
    }
    console.log(`✅ [Seed] Companies seeded: ${realCompanies.length} companies`);
    console.log(`✅ [Seed] Plans seeded: ${realPlans.length} plans`);

    // =========================================================================
    // 4. DETAILED CMS CONTENT FOR FLAGSHIP PLANS
    // =========================================================================

    // 4A. TATA AIG MEDICARE SELECT (FULL CONTENT & VARIANTS)
    await seedTataAigMedicareSelect();

    // 4B. HDFC ERGO OPTIMA SECURE+ (FULL CONTENT & VIDEOS)
    await seedHdfcOptimaSecurePlus();

    // 4C. STAR HEALTH SUPER STAR (FULL CONTENT & VARIANTS)
    await seedStarHealthSuperStar();

    // Clean up any obsolete demo data
    await cleanObsoleteDemoData();

    console.log('✅ [Seed] Plan variants seeded');
    console.log('✅ [Seed] Report cards seeded');
    console.log('✅ [Seed] Company strength seeded');
    console.log('✅ [Seed] Policy benefits seeded');
    console.log('✅ [Seed] Limitations seeded');
    console.log('✅ [Seed] Must know seeded');
    console.log('✅ [Seed] Best suited seeded');
    console.log('🎉 WHYINSURED Supabase seed completed successfully');
  } catch (error) {
    console.error('❌ Supabase seed failed:', error.message);
    throw error;
  }
}

// Helper: Seed Tata AIG Medicare Select
export async function seedTataAigMedicareSelect() {
  const planId = 'medicare-select';

  // 1. Variants
  const variants = [
    {
      id: 'var-medicare-select-standard',
      plan_id: planId,
      variant_key: 'standard',
      name: 'MediCare Select',
      room_category: 'Single Private Room',
      network_type: 'All Network Hospitals',
      sum_insured: '5 Lakhs – 3 Crore',
      coverage: '5 Lakhs – 3 Crore',
      tagline: 'Comprehensive coverage across all network hospitals with Single Private Room and Restore Infinity Plus.',
      badge: 'MOST POPULAR',
      is_popular: true,
      highlights: [
        'Available Sum Insured: 5 Lakhs – 3 Crore',
        'Hospital Type: All Network Hospitals',
        'Room Category: Single Private Room',
        'Restore Infinity Plus: Unlimited Restore',
        'Sub-Limit | Co-Pay: No Copay | No Sublimit'
      ],
      display_order: 1,
      status: 'active'
    },
    {
      id: 'var-medicare-select-smart',
      plan_id: planId,
      variant_key: 'smart',
      name: 'MediCare Select Smart',
      room_category: 'Twin Sharing',
      network_type: 'VPN Only*',
      sum_insured: '5 Lakhs – 25 Lakhs',
      coverage: '5 Lakhs – 25 Lakhs',
      tagline: 'Value-optimized healthcare with Twin Sharing room category across dedicated VPN network hospitals.',
      badge: 'SMART VALUE',
      is_popular: false,
      highlights: [
        'Available Sum Insured: 5 Lakhs – 25 Lakhs',
        'Hospital Type: VPN Only*',
        'Room Category: Twin Sharing',
        'Restore Infinity Plus: Unlimited Restore',
        'Sub-Limit | Co-Pay: No Copay | No Sublimit'
      ],
      display_order: 2,
      status: 'active'
    },
    {
      id: 'var-medicare-select-elite',
      plan_id: planId,
      variant_key: 'elite',
      name: 'MediCare Select Elite',
      room_category: 'Any Room',
      network_type: 'All Network Hospitals',
      sum_insured: '25 Lakhs – 3 Crore',
      coverage: '25 Lakhs – 3 Crore',
      tagline: 'Elite healthcare coverage with Any Room category, Inbuilt Consumables and Inbuilt 5X Super Charge Bonus.',
      badge: 'ELITE LUXURY',
      is_popular: false,
      highlights: [
        'Available Sum Insured: 25 Lakhs – 3 Crore',
        'Hospital Type: All Network Hospitals',
        'Room Category: Any Room',
        'Supercharge Bonus: Inbuilt up to 5X',
        'Consumables: Inbuilt 100% Included'
      ],
      display_order: 3,
      status: 'active'
    }
  ];

  const existingVars = await db.planVariants.findByPlanId(planId, { includeInactive: true });
  for (const v of variants) {
    const match = existingVars.find(x => x.id === v.id || x.variant_key === v.variant_key);
    if (!match) {
      await db.planVariants.create(v);
    } else {
      await db.planVariants.update(match.id, v);
    }
  }

  // 2. Report Card
  const rcItems = [
    {
      id: 'rc-tata-csr',
      plan_id: planId,
      metric_key: 'csr',
      title: 'Claim Settlement Ratio',
      subtitle: 'Claim Settlement Ratio',
      summary_value: '89.5%',
      explanation: 'On average, Tata AIG settled around 89.5% of claims over the last 3 years.',
      single_year: '89.5%',
      three_year_avg: '89.5%',
      display_order: 1,
      status: 'active'
    },
    {
      id: 'rc-tata-icr',
      plan_id: planId,
      metric_key: 'icr',
      title: 'Incurred Claim Ratio',
      subtitle: 'Incurred Claim Ratio',
      summary_value: '77.50%',
      explanation: 'For every ₹100 collected in premiums, Tata AIG spends about ₹77.50 on settling claims.',
      single_year: '77.50%',
      three_year_avg: '77.50%',
      display_order: 2,
      status: 'active'
    },
    {
      id: 'rc-tata-complaints',
      plan_id: planId,
      metric_key: 'complaint_volume',
      title: 'Complaints/10K',
      subtitle: 'Complaints/10K',
      summary_value: '11.6',
      explanation: 'Around 11.6 complaints per 10,000 claims settled, showing high customer satisfaction.',
      single_year: '11.6',
      three_year_avg: 'Low Volume',
      display_order: 3,
      status: 'active'
    }
  ];

  const existingRc = await db.reportCard.findByPlanId(planId, { includeInactive: true });
  for (const rc of rcItems) {
    const match = existingRc.find(x => x.id === rc.id || x.metric_key === rc.metric_key);
    if (!match) {
      await db.reportCard.create(rc);
    } else {
      await db.reportCard.update(match.id, rc);
    }
  }

  // 3. Company Strength
  const csItems = [
    {
      id: 'cs-tata-ownership',
      plan_id: planId,
      metric_key: 'ownership',
      title: 'OWNERSHIP / PERCENTAGE',
      summary_value: '74% / 26%',
      explanation: 'Tata AIG General Insurance is a trusted joint venture combining the legacy of Tata Group with the global underwriting expertise of American International Group (AIG).',
      items: [
        { name: 'Tata Group (Tata Sons)', value: '74%', label: 'Ownership' },
        { name: 'American International Group (AIG)', value: '26%', label: 'Ownership' }
      ],
      display_order: 1,
      status: 'active'
    },
    {
      id: 'cs-tata-rating',
      plan_id: planId,
      metric_key: 'creditRating',
      title: 'CREDIT RATING',
      summary_value: 'AAA',
      explanation: 'Credit ratings reflect the highest degree of safety regarding timely servicing of financial obligations.',
      items: [
        { agency: 'CRISIL', rating: 'AAA / Stable' },
        { agency: 'ICRA', rating: 'AAA / Stable' }
      ],
      display_order: 2,
      status: 'active'
    },
    {
      id: 'cs-tata-solvency',
      plan_id: planId,
      metric_key: 'solvency',
      title: 'CAPITAL STRENGTH',
      summary_value: '1.95×',
      explanation: 'Solvency ratio indicates financial capacity to settle claims even during unprecedented health emergencies.',
      items: [{ name: 'Solvency Ratio', value: '1.95×', label: 'Regulatory Min: 1.50×' }],
      display_order: 3,
      status: 'active'
    }
  ];

  const existingCs = await db.companyStrength.findByPlanId(planId, { includeInactive: true });
  for (const cs of csItems) {
    const match = existingCs.find(x => x.id === cs.id || x.metric_key === cs.metric_key);
    if (!match) {
      await db.companyStrength.create(cs);
    } else {
      await db.companyStrength.update(match.id, cs);
    }
  }

  // 4. Policy Benefits
  const benefits = [
    {
      plan_id: planId,
      category: 'MOST IMPORTANT',
      section: 'most_important',
      title: 'Single Private Room Category',
      summary: 'Room rent covered with zero proportionate deductions or capping on eligible private AC rooms.',
      detailed_description: 'Room rent covered with zero proportionate deductions or capping on eligible private AC rooms.',
      icon_type: 'home',
      video_url: '/assets/unlimited.mp4',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'MOST IMPORTANT',
      section: 'most_important',
      title: 'No ICU Sub-Limits',
      summary: 'Intensive Care Unit (ICU) charges covered 100% up to the sum insured with zero copay.',
      detailed_description: 'Intensive Care Unit (ICU) charges covered 100% up to the sum insured with zero copay.',
      icon_type: 'activity',
      video_url: '/assets/unlimited.mp4',
      display_order: 2,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'MOST IMPORTANT',
      section: 'most_important',
      title: 'Restore Infinity Plus',
      summary: 'Unlimited restoration of the base sum insured whenever exhausted during the policy year.',
      detailed_description: 'Unlimited restoration of the base sum insured whenever exhausted during the policy year.',
      icon_type: 'refresh-cw',
      video_url: '/assets/unlimited.mp4',
      display_order: 3,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'VALUE ADDED',
      section: 'value_added',
      title: 'Inbuilt Consumables (Elite)',
      summary: 'All 68 non-medical items such as gloves, masks, and surgical packs covered 100%.',
      detailed_description: 'All 68 non-medical items such as gloves, masks, and surgical packs covered 100%.',
      icon_type: 'shield',
      video_url: '/assets/2x coverage.mp4',
      display_order: 4,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'VALUE ADDED',
      section: 'value_added',
      title: 'Supercharge Bonus',
      summary: '50% cumulative bonus per claim-free renewal up to a maximum of 500% (5X).',
      detailed_description: '50% cumulative bonus per claim-free renewal up to a maximum of 500% (5X).',
      icon_type: 'trending-up',
      video_url: '/assets/2x coverage.mp4',
      display_order: 5,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'ADDITIONAL',
      section: 'additional',
      title: 'AYUSH Hospitalization',
      summary: 'Inpatient treatment in recognized Ayurveda, Yoga, Unani, Siddha, and Homeopathy hospitals.',
      detailed_description: 'Inpatient treatment in recognized Ayurveda, Yoga, Unani, Siddha, and Homeopathy hospitals.',
      icon_type: 'feather',
      display_order: 6,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'ADDITIONAL',
      section: 'additional',
      title: 'Day Care Treatments',
      summary: 'All surgical daycare treatments requiring less than 24 hours of hospitalization covered.',
      detailed_description: 'All surgical daycare treatments requiring less than 24 hours of hospitalization covered.',
      icon_type: 'check',
      display_order: 7,
      status: 'active'
    }
  ];

  const existingBen = await db.policyBenefits.findByPlanId(planId, { includeInactive: true });
  for (const b of benefits) {
    const match = existingBen.find(x => (b.id && x.id === b.id) || x.title.toLowerCase().trim() === b.title.toLowerCase().trim());
    const idToUse = b.id || `ben-${planId}-${slugify(b.title)}`;
    if (!match) {
      await db.policyBenefits.create({ ...b, id: idToUse });
    } else {
      await db.policyBenefits.update(match.id, b);
    }
  }

  // 5. Limitations
  const limitations = [
    {
      plan_id: planId,
      category: 'INITIAL WAITING',
      title: '30 Days Initial Waiting Period',
      waiting_period: '30 Days',
      description: 'Hospitalization for illnesses within the first 30 days is excluded, except accidental injuries.',
      video_url: '/assets/unlimited.mp4',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'SPECIFIED SURGERIES',
      title: '24 Months Specific Illnesses',
      waiting_period: '24 Months',
      description: 'Specific illnesses including cataract, hernia, joint replacement, and kidney stones covered after 2 years.',
      display_order: 2,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'PRE-EXISTING DISEASES',
      title: '36 Months Pre-Existing Disease (PED)',
      waiting_period: '36 Months',
      description: 'Conditions diagnosed prior to policy inception covered after 36 months of continuous coverage.',
      display_order: 3,
      status: 'active'
    }
  ];

  const existingLim = await db.limitations.findByPlanId(planId, { includeInactive: true });
  for (const l of limitations) {
    const match = existingLim.find(x => (l.id && x.id === l.id) || x.title.toLowerCase().trim() === l.title.toLowerCase().trim());
    const idToUse = l.id || `lim-${planId}-${slugify(l.title)}`;
    if (!match) {
      await db.limitations.create({ ...l, id: idToUse });
    } else {
      await db.limitations.update(match.id, l);
    }
  }

  // 6. Must Know
  const mkItems = [
    {
      plan_id: planId,
      title: 'Room Rent Condition',
      description: 'Single private room applies for standard; twin sharing for Smart variant. Verify variant before purchase.',
      icon_url: 'home',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      title: 'VPN Network Clause',
      description: 'Smart variant requires admission in Value Provider Network (VPN) hospitals to avoid co-pay.',
      icon_url: 'shield',
      display_order: 2,
      status: 'active'
    },
    {
      plan_id: planId,
      title: 'Consumables Rider',
      description: 'Consumables are inbuilt in Elite variant, but available as an optional rider on Standard and Smart.',
      icon_url: 'check',
      display_order: 3,
      status: 'active'
    }
  ];

  const existingMk = await db.mustKnow.findByPlanId(planId, { includeInactive: true });
  for (const mk of mkItems) {
    const match = existingMk.find(x => (mk.id && x.id === mk.id) || x.title.toLowerCase().trim() === mk.title.toLowerCase().trim());
    const idToUse = mk.id || `mk-${planId}-${slugify(mk.title)}`;
    if (!match) {
      await db.mustKnow.create({ ...mk, id: idToUse });
    } else {
      await db.mustKnow.update(match.id, mk);
    }
  }

  // 7. Best Suited
  const bsItems = [
    {
      plan_id: planId,
      heading: 'Growing Families',
      description: 'Designed for families requiring comprehensive private room coverage and unlimited restorations.',
      bullet_points: ['Single private AC room', 'Full restoration', 'Wide cashless hospital network'],
      icon_url: 'users',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      heading: 'Budget Conscious Buyers',
      description: 'Smart variant provides high sum insured protection at an economical price using the VPN network.',
      bullet_points: ['Low premium', 'Twin sharing room', 'Restore infinity benefit'],
      icon_url: 'trending-up',
      display_order: 2,
      status: 'active'
    }
  ];

  const existingBs = await db.bestSuited.findByPlanId(planId, { includeInactive: true });
  for (const bs of bsItems) {
    const match = existingBs.find(x => (bs.id && x.id === bs.id) || (x.heading || x.title || '').toLowerCase().trim() === (bs.heading || bs.title || '').toLowerCase().trim());
    const idToUse = bs.id || `bs-${planId}-${slugify(bs.heading || bs.title)}`;
    if (!match) {
      await db.bestSuited.create({ ...bs, id: idToUse });
    } else {
      await db.bestSuited.update(match.id, bs);
    }
  }
}

// Helper: Seed HDFC ERGO Optima Secure+
export async function seedHdfcOptimaSecurePlus() {
  const planId = 'hdfc-optima-secure-plus';

  // 1. Report Card
  const rcItems = [
    {
      id: 'rc-hdfc-csr',
      plan_id: planId,
      metric_key: 'csr',
      title: 'Claim Settlement Ratio',
      subtitle: 'Claim Settlement Ratio',
      summary_value: '98.7%',
      explanation: 'HDFC ERGO settled around 98.7% of all received claims with high customer retention.',
      single_year: '98.7%',
      three_year_avg: '98.4%',
      display_order: 1,
      status: 'active'
    },
    {
      id: 'rc-hdfc-icr',
      plan_id: planId,
      metric_key: 'icr',
      title: 'Incurred Claim Ratio',
      subtitle: 'Incurred Claim Ratio',
      summary_value: '68.20%',
      explanation: 'For every ₹100 collected in premiums, HDFC ERGO spends ₹68.20 on claim payouts.',
      single_year: '68.20%',
      three_year_avg: '70.10%',
      display_order: 2,
      status: 'active'
    },
    {
      id: 'rc-hdfc-complaints',
      plan_id: planId,
      metric_key: 'complaint_volume',
      title: 'Complaints/10K',
      subtitle: 'Complaints/10K',
      summary_value: '11.2',
      explanation: 'Around 11.2 complaints per 10,000 claims settled, representing top-tier service satisfaction.',
      single_year: '11.2',
      three_year_avg: 'Low Volume',
      display_order: 3,
      status: 'active'
    }
  ];

  const existingRc = await db.reportCard.findByPlanId(planId, { includeInactive: true });
  for (const rc of rcItems) {
    const match = existingRc.find(x => x.id === rc.id || x.metric_key === rc.metric_key);
    if (!match) {
      await db.reportCard.create(rc);
    } else {
      await db.reportCard.update(match.id, rc);
    }
  }

  // 2. Company Strength
  const csItems = [
    {
      id: 'cs-hdfc-ownership',
      plan_id: planId,
      metric_key: 'ownership',
      title: 'OWNERSHIP / PERCENTAGE',
      summary_value: '51% / 49%',
      explanation: 'Ownership represents the shareholding structure of HDFC ERGO General Insurance.',
      items: [
        { name: 'HDFC Bank', value: '51%', label: 'Ownership' },
        { name: 'ERGO International AG', value: '49%', label: 'Ownership' }
      ],
      video: '/assets/unlimited.mp4',
      video_url: '/assets/unlimited.mp4',
      display_order: 1,
      status: 'active'
    },
    {
      id: 'cs-hdfc-rating',
      plan_id: planId,
      metric_key: 'creditRating',
      title: 'CREDIT RATING',
      summary_value: 'AAA',
      explanation: 'Highest credit ratings indicating superior financial security.',
      items: [
        { agency: 'CRISIL', rating: 'AAA / Stable' },
        { agency: 'ICRA', rating: 'AAA / Stable' }
      ],
      display_order: 2,
      status: 'active'
    },
    {
      id: 'cs-hdfc-solvency',
      plan_id: planId,
      metric_key: 'solvency',
      title: 'CAPITAL STRENGTH',
      summary_value: '2.00×',
      explanation: 'Solvency ratio indicates financial capacity to honor policyholder commitments.',
      items: [{ name: 'Solvency Ratio', value: '2.00×', label: 'Regulatory benchmark: 1.50×' }],
      display_order: 3,
      status: 'active'
    }
  ];

  const existingCs = await db.companyStrength.findByPlanId(planId, { includeInactive: true });
  for (const cs of csItems) {
    const match = existingCs.find(x => x.id === cs.id || x.metric_key === cs.metric_key);
    if (!match) {
      await db.companyStrength.create(cs);
    } else {
      await db.companyStrength.update(match.id, cs);
    }
  }

  // 3. Policy Benefits
  const benefits = [
    {
      plan_id: planId,
      category: 'MOST IMPORTANT',
      section: 'most_important',
      title: 'Any Room Category',
      summary: '100% Cashless Policy with zero room rent capping across all hospital categories.',
      detailed_description: 'Any Room Category (Single, Twin, Suite, etc.) is covered under 100% Cashless Policy with no proportionate deductions or sub-limits.',
      icon_type: 'home',
      video_url: '/assets/unlimited.mp4',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'MOST IMPORTANT',
      section: 'most_important',
      title: 'No Limit on ICU, etc.',
      summary: 'Zero capping on Intensive Care Unit (ICU) charges and monitoring equipments.',
      detailed_description: 'No limit on ICU charges, monitoring equipment, specialist consultations, and associated critical care expenses.',
      icon_type: 'activity',
      video_url: '/assets/unlimited.mp4',
      display_order: 2,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'MOST IMPORTANT',
      section: 'most_important',
      title: 'Pre & Post Hospitalization',
      summary: 'Up to 60 days before admission & 180 days after discharge covered 100%.',
      detailed_description: 'Covers doctor consultations, diagnostic tests, and pharmacy expenses up to 60 days prior and 180 days after hospitalization.',
      icon_type: 'calendar',
      video_url: '/assets/unlimited.mp4',
      display_order: 3,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'MOST IMPORTANT',
      section: 'most_important',
      title: 'All Day Care Treatments Covered',
      summary: 'Covers all day care treatments that require less than 24 hours of hospitalization.',
      detailed_description: 'Medical advancements requiring less than 24 hours of admission are covered without restriction.',
      icon_type: 'check',
      video_url: '/assets/unlimited.mp4',
      display_order: 4,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'VALUE ADDED',
      section: 'value_added',
      title: '2X Secure Benefit',
      summary: 'Double coverage instantly from Day 1 without waiting for renewals.',
      detailed_description: 'Instantly doubles your coverage from Day 1 at no extra premium.',
      icon_type: 'shield',
      video_url: '/assets/2x coverage.mp4',
      display_order: 5,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'VALUE ADDED',
      section: 'value_added',
      title: 'Plus Benefit',
      summary: '100% additional sum insured on renewals irrespective of claims made.',
      detailed_description: 'Additional 100% sum insured added after 2 continuous claim-free renewals.',
      icon_type: 'trending-up',
      video_url: '/assets/2x coverage.mp4',
      display_order: 6,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'VALUE ADDED',
      section: 'value_added',
      title: 'Preventive Health Checkup',
      summary: 'Complimentary annual health checkup for all adult insured members upon renewal.',
      detailed_description: 'Comprehensive annual preventative health checkup tests provided cashless.',
      icon_type: 'heart',
      video_url: '/assets/Preventive.mp4',
      display_order: 7,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'ADDITIONAL',
      section: 'additional',
      title: 'AYUSH Hospitalization',
      summary: 'Ayurveda, Yoga, Unani, Siddha, and Homeopathy hospitalizations covered.',
      detailed_description: 'Non-allopathic medical treatments covered in government recognized AYUSH hospitals.',
      icon_type: 'feather',
      display_order: 8,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'ADDITIONAL',
      section: 'additional',
      title: 'Emergency Road & Air Ambulance',
      summary: 'Emergency road and air ambulance expenses covered up to specified limits.',
      detailed_description: 'Ambulance transfer to the nearest competent medical facility covered.',
      icon_type: 'truck',
      display_order: 9,
      status: 'active'
    }
  ];

  const existingBen = await db.policyBenefits.findByPlanId(planId, { includeInactive: true });
  for (const b of benefits) {
    const match = existingBen.find(x => (b.id && x.id === b.id) || x.title.toLowerCase().trim() === b.title.toLowerCase().trim());
    const idToUse = b.id || `ben-${planId}-${slugify(b.title)}`;
    if (!match) {
      await db.policyBenefits.create({ ...b, id: idToUse });
    } else {
      await db.policyBenefits.update(match.id, b);
    }
  }

  // 4. Limitations
  const limitations = [
    {
      plan_id: planId,
      category: 'INITIAL WAITING',
      title: 'Initial Waiting Period (30 Days)',
      waiting_period: '30 Days',
      description: 'An initial waiting period of 30 days applies from policy inception. Accidental injuries covered from Day 1.',
      video_url: '/assets/unlimited.mp4',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'SPECIFIC DISEASES',
      title: '2 Years Specific Illnesses',
      waiting_period: '2 Years',
      description: 'Cataract, hernia, hydrocele, joint replacement, and piles covered after 24 continuous months.',
      display_order: 2,
      status: 'active'
    },
    {
      plan_id: planId,
      category: 'PRE-EXISTING DISEASES',
      title: '3 Years Pre-Existing Conditions',
      waiting_period: '3 Years',
      description: 'Coverage for declared pre-existing diseases begins after 36 continuous months.',
      display_order: 3,
      status: 'active'
    }
  ];

  const existingLim = await db.limitations.findByPlanId(planId, { includeInactive: true });
  for (const l of limitations) {
    const match = existingLim.find(x => (l.id && x.id === l.id) || x.title.toLowerCase().trim() === l.title.toLowerCase().trim());
    const idToUse = l.id || `lim-${planId}-${slugify(l.title)}`;
    if (!match) {
      await db.limitations.create({ ...l, id: idToUse });
    } else {
      await db.limitations.update(match.id, l);
    }
  }

  // 5. Must Know
  const mkItems = [
    {
      plan_id: planId,
      title: 'DISCOUNT & PREMIUM',
      description: "Today's premium may not be tomorrow's premium. Discounts may change as per policy terms.",
      icon_url: 'dollar-sign',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      title: 'ROOM CATEGORY',
      description: 'Check your eligible room category before buying. "Any Room" covers without room rent capping.',
      icon_url: 'home',
      display_order: 2,
      status: 'active'
    },
    {
      plan_id: planId,
      title: 'HEALTH CHECK-UP',
      description: 'Available cashless upon policy renewal as per eligible sub-limits.',
      icon_url: 'heart',
      display_order: 3,
      status: 'active'
    }
  ];

  const existingMk = await db.mustKnow.findByPlanId(planId, { includeInactive: true });
  for (const mk of mkItems) {
    const match = existingMk.find(x => (mk.id && x.id === mk.id) || x.title.toLowerCase().trim() === mk.title.toLowerCase().trim());
    const idToUse = mk.id || `mk-${planId}-${slugify(mk.title)}`;
    if (!match) {
      await db.mustKnow.create({ ...mk, id: idToUse });
    } else {
      await db.mustKnow.update(match.id, mk);
    }
  }

  // 6. Best Suited
  const bsItems = [
    {
      plan_id: planId,
      heading: 'Growing Families',
      description: 'For families looking for comprehensive health protection and support against major medical expenses.',
      bullet_points: ['Family Floater cover', 'Full restoration', 'No sub-limits'],
      icon_url: 'users',
      display_order: 1,
      status: 'active'
    },
    {
      plan_id: planId,
      heading: 'Comprehensive Health Seekers',
      description: 'For people looking for broad health coverage with 4X protection and zero co-pay.',
      bullet_points: ['2X Secure cover', 'Restore infinity', 'Modern robotic surgeries'],
      icon_url: 'shield',
      display_order: 2,
      status: 'active'
    }
  ];

  const existingBs = await db.bestSuited.findByPlanId(planId, { includeInactive: true });
  for (const bs of bsItems) {
    const match = existingBs.find(x => (bs.id && x.id === bs.id) || (x.heading || x.title || '').toLowerCase().trim() === (bs.heading || bs.title || '').toLowerCase().trim());
    const idToUse = bs.id || `bs-${planId}-${slugify(bs.heading || bs.title)}`;
    if (!match) {
      await db.bestSuited.create({ ...bs, id: idToUse });
    } else {
      await db.bestSuited.update(match.id, bs);
    }
  }
}

// Helper: Seed Star Health Super Star
export async function seedStarHealthSuperStar() {
  const planId = 'star-super-star';

  const variants = [
    {
      id: 'var-star-super-star-classic',
      plan_id: planId,
      variant_key: 'classic',
      name: 'Super Star Classic',
      room_category: 'Any Room (for SI ≥ 7.5L)',
      network_type: 'All Network Hospitals',
      sum_insured: '₹5 Lakh - ₹1 Crore',
      coverage: '₹5 Lakh - ₹1 Crore',
      tagline: 'Comprehensive classic protection with 90/180 days pre/post hospitalization, Limitless Care, and Freeze Your Age.',
      badge: 'CLASSIC',
      is_popular: true,
      highlights: [
        'Room Rent: Any Room for SI ₹7.5L & above',
        'Pre/Post Hospitalization: 90 Days Pre & 180 Days Post',
        'Limitless Care: One unlimited claim cover in lifetime',
        'Automatic Restoration: Up to 100% SI, unlimited times'
      ],
      display_order: 1,
      status: 'active'
    },
    {
      id: 'var-star-super-star-secure',
      plan_id: planId,
      variant_key: 'secure',
      name: 'Super Star Secure',
      room_category: 'Any Room',
      network_type: 'All Network Hospitals',
      sum_insured: '₹7.5 Lakh - Unlimited',
      coverage: '₹7.5 Lakh - Unlimited',
      tagline: 'High-tier security cover with Any Room, Unlimited Sum Insured option, and Limitless Loyalty Bonus.',
      badge: 'SECURE',
      is_popular: false,
      highlights: [
        'Room Rent: Any Room with zero restriction',
        'Limitless Loyalty Bonus: 100% additional SI every renewal',
        'Durable Medical Equipment up to ₹1 Lakh',
        'Automatic Restoration: Up to 100%, unlimited times'
      ],
      display_order: 2,
      status: 'active'
    }
  ];

  const existingVars = await db.planVariants.findByPlanId(planId, { includeInactive: true });
  for (const v of variants) {
    const match = existingVars.find(x => x.id === v.id || x.variant_key === v.variant_key);
    if (!match) {
      await db.planVariants.create(v);
    } else {
      await db.planVariants.update(match.id, v);
    }
  }
}

// Helper: Clean obsolete demo data safely without dropping legitimate records
export async function cleanObsoleteDemoData() {
  try {
    // Only clean dummy test companies if created by accidental tests (prefix comp-test)
    const allCompanies = await db.companies.getAll();
    for (const c of allCompanies) {
      if (c.id && c.id.startsWith('comp-test-')) {
        await db.companies.delete(c.id);
      }
    }
  } catch (err) {
    // Non-blocking cleanup
  }
}

export default seedDatabase;
