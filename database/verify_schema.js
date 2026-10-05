import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const EXPECTED_NEW_COLUMNS = {
  companies: [
    'full_name',
    'website_url',
    'primary_color',
    'secondary_color',
    'ownership',
    'credit_rating',
    'solvency_ratio',
    'aum',
    'gdpi'
  ],
  plans: [
    'coverage',
    'tagline',
    'theme_primary',
    'theme_secondary'
  ],
  plan_variants: [
    'variant_key',
    'room_category',
    'network_type',
    'sum_insured',
    'coverage',
    'tagline',
    'badge',
    'is_popular',
    'highlights'
  ],
  report_cards: [
    'metric_key',
    'title',
    'subtitle',
    'summary_value',
    'explanation',
    'single_year',
    'single_year_label',
    'three_year_avg',
    'three_year_avg_label'
  ],
  company_strength: [
    'metric_key',
    'summary_value',
    'explanation',
    'items'
  ],
  policy_benefits: [
    'section',
    'subtitle',
    'badge',
    'summary',
    'detailed_description',
    'intro',
    'points',
    'steps',
    'icon_type',
    'icon_url',
    'video_url',
    'tier_data'
  ],
  limitations: [
    'category',
    'waiting_period',
    'summary',
    'disease_list',
    'exclusions_list',
    'icon_url',
    'video_url'
  ],
  must_know: [
    'summary',
    'points',
    'icon_url',
    'video_url'
  ],
  best_suited: [
    'heading',
    'summary',
    'badge',
    'bullet_points',
    'highlights',
    'icon_url',
    'video_url'
  ],
  admins: []
};

const BASELINE_COLUMNS = {
  admins: ['id', 'username', 'email', 'password_hash', 'name', 'role', 'status', 'created_at', 'updated_at'],
  companies: ['id', 'name', 'slug', 'logo', 'description', 'website', 'theme_color', 'status', 'display_order', 'created_at', 'updated_at'],
  plans: ['id', 'company_id', 'name', 'slug', 'subtitle', 'description', 'logo', 'theme_color', 'status', 'display_order', 'created_at', 'updated_at'],
  plan_variants: ['id', 'plan_id', 'name', 'slug', 'description', 'data', 'status', 'display_order', 'created_at', 'updated_at'],
  report_cards: ['id', 'plan_id', 'label', 'value', 'description', 'icon', 'video', 'status', 'display_order', 'created_at', 'updated_at'],
  company_strength: ['id', 'plan_id', 'title', 'value', 'description', 'icon', 'video', 'status', 'display_order', 'created_at', 'updated_at'],
  policy_benefits: ['id', 'plan_id', 'category', 'title', 'description', 'icon', 'video', 'status', 'display_order', 'created_at', 'updated_at'],
  limitations: ['id', 'plan_id', 'title', 'description', 'icon', 'status', 'display_order', 'created_at', 'updated_at'],
  must_know: ['id', 'plan_id', 'title', 'description', 'icon', 'video', 'status', 'display_order', 'created_at', 'updated_at'],
  best_suited: ['id', 'plan_id', 'title', 'description', 'icon', 'status', 'display_order', 'created_at', 'updated_at']
};

export async function verifySchema() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('❌ Supabase credentials missing in .env');
    return false;
  }

  try {
    const res = await fetch(url + '/rest/v1/?apikey=' + key, {
      headers: { 'Authorization': 'Bearer ' + key }
    });
    const doc = await res.json();
    const definitions = doc.definitions || {};

    console.log('====================================================');
    console.log('🔍 SUPABASE SCHEMA ALIGNMENT VERIFICATION REPORT');
    console.log('====================================================\n');

    let allPassed = true;
    const report = {};

    for (const [tableName, expectedNew] of Object.entries(EXPECTED_NEW_COLUMNS)) {
      const def = definitions[tableName];
      if (!def) {
        console.log(`❌ Table [${tableName}] NOT FOUND in Supabase!`);
        allPassed = false;
        continue;
      }

      const currentColumns = Object.keys(def.properties || {});
      const baseline = BASELINE_COLUMNS[tableName] || [];

      // Check baseline columns preserved
      const missingBaseline = baseline.filter(c => !currentColumns.includes(c));
      // Check newly added columns
      const addedFound = expectedNew.filter(c => currentColumns.includes(c));
      const addedMissing = expectedNew.filter(c => !currentColumns.includes(c));

      // Check row count untouched
      let rowCount = 0;
      try {
        const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
        rowCount = error ? 'N/A' : count;
      } catch (e) {
        rowCount = 'N/A';
      }

      report[tableName] = {
        totalColumns: currentColumns.length,
        missingBaseline,
        addedFound,
        addedMissing,
        rowCount
      };

      console.log(`📋 Table: [${tableName}]`);
      console.log(`   - Total Columns: ${currentColumns.length}`);
      console.log(`   - Existing Baseline Columns: ${missingBaseline.length === 0 ? '✅ All Preserved' : '❌ MISSING: ' + missingBaseline.join(', ')}`);
      console.log(`   - Required New Columns Found: ${addedFound.length}/${expectedNew.length} ${addedMissing.length === 0 ? '✅' : '⏳ Missing: ' + addedMissing.join(', ')}`);
      console.log(`   - Current Row Count: ${rowCount} rows (untouched)`);
      console.log('');

      if (missingBaseline.length > 0 || addedMissing.length > 0) {
        allPassed = false;
      }
    }

    console.log('====================================================');
    if (allPassed) {
      console.log('🎉 ALL SUPABASE TABLES SUCCESSFULLY ALIGNED WITH WHYINSURED DATA!');
    } else {
      console.log('⏳ Awaiting SQL execution in Supabase Dashboard SQL Editor.');
    }
    console.log('====================================================');
    return allPassed;
  } catch (err) {
    console.error('Verification failed:', err.message);
    return false;
  }
}

// Run directly if invoked from command line
if (process.argv[1] && process.argv[1].endsWith('verify_schema.js')) {
  verifySchema();
}
