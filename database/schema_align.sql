-- =============================================================================
-- WHYINSURED Supabase Schema Alignment
-- Safe, non-destructive migration script using ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- =============================================================================

-- 1. COMPANIES
ALTER TABLE companies ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_color text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS secondary_color text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ownership text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS credit_rating text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS solvency_ratio text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS aum text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS gdpi text;

-- 2. PLANS
ALTER TABLE plans ADD COLUMN IF NOT EXISTS coverage text;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS theme_primary text;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS theme_secondary text;

-- 3. PLAN VARIANTS
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS variant_key text;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS room_category text;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS network_type text;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS sum_insured text;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS coverage text;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false;
ALTER TABLE plan_variants ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;

-- 4. REPORT CARDS
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS metric_key text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS summary_value text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS explanation text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS single_year text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS single_year_label text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS three_year_avg text;
ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS three_year_avg_label text;

-- 5. COMPANY STRENGTH
ALTER TABLE company_strength ADD COLUMN IF NOT EXISTS metric_key text;
ALTER TABLE company_strength ADD COLUMN IF NOT EXISTS summary_value text;
ALTER TABLE company_strength ADD COLUMN IF NOT EXISTS explanation text;
ALTER TABLE company_strength ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;

-- 6. POLICY BENEFITS
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS detailed_description text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS intro text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS points jsonb DEFAULT '[]'::jsonb;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS steps jsonb DEFAULT '[]'::jsonb;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS icon_type text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS icon_url text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE policy_benefits ADD COLUMN IF NOT EXISTS tier_data jsonb DEFAULT '{}'::jsonb;

-- 7. LIMITATIONS & WAITING PERIODS
ALTER TABLE limitations ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE limitations ADD COLUMN IF NOT EXISTS waiting_period text;
ALTER TABLE limitations ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE limitations ADD COLUMN IF NOT EXISTS disease_list jsonb DEFAULT '[]'::jsonb;
ALTER TABLE limitations ADD COLUMN IF NOT EXISTS exclusions_list jsonb DEFAULT '[]'::jsonb;
ALTER TABLE limitations ADD COLUMN IF NOT EXISTS icon_url text;
ALTER TABLE limitations ADD COLUMN IF NOT EXISTS video_url text;

-- 8. MUST KNOW
ALTER TABLE must_know ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE must_know ADD COLUMN IF NOT EXISTS points jsonb DEFAULT '[]'::jsonb;
ALTER TABLE must_know ADD COLUMN IF NOT EXISTS icon_url text;
ALTER TABLE must_know ADD COLUMN IF NOT EXISTS video_url text;

-- 9. BEST SUITED / PERFECT FOR
ALTER TABLE best_suited ADD COLUMN IF NOT EXISTS heading text;
ALTER TABLE best_suited ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE best_suited ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE best_suited ADD COLUMN IF NOT EXISTS bullet_points jsonb DEFAULT '[]'::jsonb;
ALTER TABLE best_suited ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;
ALTER TABLE best_suited ADD COLUMN IF NOT EXISTS icon_url text;
ALTER TABLE best_suited ADD COLUMN IF NOT EXISTS video_url text;
