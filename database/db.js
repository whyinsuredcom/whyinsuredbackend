import crypto from 'crypto';
import { supabase } from './supabase.js';

// =============================================================================
// Password Hashing & Verification (PBKDF2 SHA-512)
// Preserved exactly compatible with existing password hashes
// =============================================================================
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}

// Deprecated JSON persistence helpers preserved for backward compatibility
export function readData() {
  console.warn('[db.js] readData() is deprecated; database is now running on Supabase.');
  return {};
}

export function writeData() {
  console.warn('[db.js] writeData() is deprecated; database is now running on Supabase.');
}

// =============================================================================
// JSONB Field Normalization & Schema Sanitization Helper
// Ensures arrays/objects are stored as native JSON and non-schema columns (e.g. external_url)
// are stripped before querying PostgREST to prevent schema cache errors.
// =============================================================================
const JSONB_COLUMNS = {
  plan_variants: ['highlights', 'data'],
  company_strength: ['items'],
  policy_benefits: ['points', 'steps', 'tier_data'],
  limitations: ['disease_list', 'exclusions_list'],
  must_know: ['points'],
  best_suited: ['bullet_points', 'highlights']
};

const ALLOWED_COLUMNS = {
  policy_benefits: [
    'id', 'plan_id', 'category', 'title', 'description', 'icon', 'video', 'status',
    'display_order', 'created_at', 'updated_at', 'section', 'subtitle', 'badge',
    'summary', 'detailed_description', 'intro', 'points', 'steps', 'icon_type',
    'icon_url', 'video_url', 'tier_data'
  ],
  limitations: [
    'id', 'plan_id', 'title', 'description', 'icon', 'status', 'display_order',
    'created_at', 'updated_at', 'category', 'waiting_period', 'summary',
    'disease_list', 'exclusions_list', 'icon_url', 'video_url'
  ],
  must_know: [
    'id', 'plan_id', 'title', 'description', 'icon', 'video', 'status',
    'display_order', 'created_at', 'updated_at', 'summary', 'points',
    'icon_url', 'video_url'
  ],
  best_suited: [
    'id', 'plan_id', 'title', 'description', 'icon', 'status', 'display_order',
    'created_at', 'updated_at', 'heading', 'summary', 'badge', 'bullet_points',
    'highlights', 'icon_url', 'video_url'
  ],
  plan_variants: [
    'id', 'plan_id', 'name', 'slug', 'description', 'data', 'status',
    'display_order', 'created_at', 'updated_at', 'variant_key', 'room_category',
    'network_type', 'sum_insured', 'coverage', 'tagline', 'badge', 'is_popular',
    'highlights'
  ],
  report_cards: [
    'id', 'plan_id', 'label', 'value', 'description', 'icon', 'video', 'status',
    'display_order', 'created_at', 'updated_at', 'metric_key', 'title', 'subtitle',
    'summary_value', 'explanation', 'single_year', 'single_year_label',
    'three_year_avg', 'three_year_avg_label'
  ],
  company_strength: [
    'id', 'plan_id', 'title', 'value', 'description', 'icon', 'video', 'status',
    'display_order', 'created_at', 'updated_at', 'metric_key', 'summary_value',
    'explanation', 'items'
  ],
  plans: [
    'id', 'company_id', 'name', 'slug', 'subtitle', 'description', 'logo',
    'theme_color', 'status', 'display_order', 'created_at', 'updated_at',
    'coverage', 'tagline', 'theme_primary', 'theme_secondary'
  ],
  companies: [
    'id', 'name', 'slug', 'logo', 'description', 'website', 'theme_color',
    'status', 'display_order', 'created_at', 'updated_at', 'full_name',
    'website_url', 'primary_color', 'secondary_color', 'ownership',
    'credit_rating', 'solvency_ratio', 'aum', 'gdpi'
  ]
};

function normalizePayload(tableName, payload) {
  const columns = JSONB_COLUMNS[tableName];
  if (columns) {
    for (const col of columns) {
      if (payload[col] !== undefined) {
        if (typeof payload[col] === 'string') {
          try {
            payload[col] = JSON.parse(payload[col]);
          } catch (e) {
            payload[col] = [payload[col]];
          }
        } else if (!Array.isArray(payload[col]) && typeof payload[col] !== 'object' && payload[col] !== null) {
          payload[col] = [payload[col]];
        }
      }
    }
  }

  // Schema compatibility: video vs video_url mapping
  if (tableName === 'company_strength' || tableName === 'report_cards') {
    if (payload.video_url !== undefined) {
      if (payload.video === undefined) {
        payload.video = payload.video_url;
      }
      delete payload.video_url;
    }
  }

  // Limitations compatibility: duration_tag -> waiting_period
  if (tableName === 'limitations') {
    if (payload.duration_tag !== undefined && !payload.waiting_period) {
      payload.waiting_period = payload.duration_tag;
    }
  }

  // Best Suited compatibility: title -> heading
  if (tableName === 'best_suited') {
    if (payload.title !== undefined && !payload.heading) {
      payload.heading = payload.title;
    }
  }

  // Strip non-schema properties (e.g. external_url) to protect PostgREST schema cache
  const allowed = ALLOWED_COLUMNS[tableName];
  if (allowed) {
    const allowedSet = new Set(allowed);
    for (const key of Object.keys(payload)) {
      if (!allowedSet.has(key)) {
        delete payload[key];
      }
    }
  } else if (payload.external_url !== undefined) {
    delete payload.external_url;
  }
}

function formatRecord(tableName, record) {
  if (!record) return record;
  if (tableName === 'company_strength' || tableName === 'report_cards') {
    if (record.video && !record.video_url) {
      record.video_url = record.video;
    }
  }
  return record;
}

// =============================================================================
// Supabase Collection Adapter Factory
// Exposes the familiar async collection interface over Supabase tables
// =============================================================================
function createSupabaseCollection(tableName, idPrefix) {
  return {
    async getAll(filterFn) {
      let query = supabase.from(tableName).select('*');
      if (tableName !== 'admins') {
        query = query.order('display_order', { ascending: true, nullsFirst: false });
      } else {
        query = query.order('created_at', { ascending: true });
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`[Supabase ${tableName}.getAll] ${error.message}`);
      }

      const list = (data || []).map(r => formatRecord(tableName, r));
      return filterFn ? list.filter(filterFn) : list;
    },

    async findById(id) {
      if (!id) return null;
      const targetId = String(id).trim();
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (error) {
        throw new Error(`[Supabase ${tableName}.findById] ${error.message}`);
      }
      return formatRecord(tableName, data) || null;
    },

    async findByField(fieldName, value) {
      if (value === undefined || value === null) return null;
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(fieldName, value)
        .limit(1);

      if (error) {
        throw new Error(`[Supabase ${tableName}.findByField(${fieldName})] ${error.message}`);
      }
      return (data && data.length > 0) ? formatRecord(tableName, data[0]) : null;
    },

    async findByPlanId(planId, options = {}) {
      const { includeInactive = false, category, section } = options;
      if (!planId) return [];

      let query = supabase
        .from(tableName)
        .select('*')
        .eq('plan_id', String(planId).trim());

      if (!includeInactive) {
        query = query.in('status', ['active', 'published']);
      }

      if (category) {
        query = query.ilike('category', `%${category}%`);
      }

      if (section) {
        query = query.ilike('section', `%${section}%`);
      }

      query = query.order('display_order', { ascending: true, nullsFirst: false });

      const { data, error } = await query;
      if (error) {
        throw new Error(`[Supabase ${tableName}.findByPlanId] ${error.message}`);
      }
      return (data || []).map(r => formatRecord(tableName, r));
    },

    async findByCompanyId(companyId, options = {}) {
      const { includeInactive = false } = options;
      if (!companyId) return [];

      let query = supabase
        .from(tableName)
        .select('*')
        .eq('company_id', String(companyId).trim());

      if (!includeInactive) {
        query = query.in('status', ['active', 'published']);
      }

      query = query.order('display_order', { ascending: true, nullsFirst: false });

      const { data, error } = await query;
      if (error) {
        throw new Error(`[Supabase ${tableName}.findByCompanyId] ${error.message}`);
      }
      return (data || []).map(r => formatRecord(tableName, r));
    },

    async create(item) {
      const now = new Date().toISOString();
      const generatedId = (item.id && String(item.id).trim().length > 0)
        ? String(item.id).trim()
        : `${idPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      let displayOrder = Number(item.display_order);
      if (isNaN(displayOrder) && tableName !== 'admins') {
        let maxQuery = supabase
          .from(tableName)
          .select('display_order')
          .order('display_order', { ascending: false, nullsFirst: false })
          .limit(1);

        if (item.plan_id) {
          maxQuery = maxQuery.eq('plan_id', item.plan_id);
        } else if (item.company_id) {
          maxQuery = maxQuery.eq('company_id', item.company_id);
        }

        const { data: maxRows } = await maxQuery;
        const maxVal = maxRows && maxRows[0] && maxRows[0].display_order ? Number(maxRows[0].display_order) : 0;
        displayOrder = maxVal + 1;
      }

      const payload = {
        ...item,
        id: generatedId,
        status: item.status || 'active',
        created_at: item.created_at || now,
        updated_at: now
      };

      if (!isNaN(displayOrder) && tableName !== 'admins') {
        payload.display_order = displayOrder;
      }

      normalizePayload(tableName, payload);

      const { data, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(`[Supabase ${tableName}.create] ${error.message}`);
      }
      return formatRecord(tableName, data);
    },

    async update(id, updates) {
      if (!id) return null;
      const targetId = String(id).trim();
      const now = new Date().toISOString();
      const cleanUpdates = { ...updates, updated_at: now };
      delete cleanUpdates.id; // Protect primary key

      if (cleanUpdates.display_order !== undefined && cleanUpdates.display_order !== null) {
        cleanUpdates.display_order = Number(cleanUpdates.display_order);
      }

      normalizePayload(tableName, cleanUpdates);

      const { data, error } = await supabase
        .from(tableName)
        .update(cleanUpdates)
        .eq('id', targetId)
        .select()
        .maybeSingle();

      if (error) {
        throw new Error(`[Supabase ${tableName}.update] ${error.message}`);
      }
      return formatRecord(tableName, data) || null;
    },

    async delete(id) {
      if (!id) return false;
      const targetId = String(id).trim();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', targetId);

      if (error) {
        throw new Error(`[Supabase ${tableName}.delete] ${error.message}`);
      }
      return true;
    },

    async deleteByPlanId(planId) {
      if (!planId) return false;
      const targetPlanId = String(planId).trim();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('plan_id', targetPlanId);

      if (error) {
        throw new Error(`[Supabase ${tableName}.deleteByPlanId] ${error.message}`);
      }
      return true;
    },

    async toggleStatus(id) {
      if (!id) return null;
      const existing = await this.findById(id);
      if (!existing) return null;

      const current = existing.status;
      const nextStatus = (current === 'active' || current === 'published') ? 'inactive' : 'active';
      return await this.update(id, { status: nextStatus });
    },

    async reorder(items) {
      if (!Array.isArray(items) || items.length === 0) return false;
      const now = new Date().toISOString();

      const updates = items.map(item => {
        if (!item || !item.id) return Promise.resolve();
        return supabase
          .from(tableName)
          .update({
            display_order: Number(item.display_order),
            updated_at: now
          })
          .eq('id', String(item.id).trim());
      });

      const results = await Promise.all(updates);
      for (const res of results) {
        if (res && res.error) {
          throw new Error(`[Supabase ${tableName}.reorder] ${res.error.message}`);
        }
      }
      return true;
    },

    async count(filterFn) {
      if (!filterFn) {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          throw new Error(`[Supabase ${tableName}.count] ${error.message}`);
        }
        return count || 0;
      }

      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        throw new Error(`[Supabase ${tableName}.count] ${error.message}`);
      }
      return (data || []).filter(filterFn).length;
    }
  };
}

// =============================================================================
// Exported Database Interface
// =============================================================================
export const db = {
  admins: createSupabaseCollection('admins', 'admin'),
  companies: createSupabaseCollection('companies', 'comp'),
  plans: createSupabaseCollection('plans', 'plan'),
  planVariants: createSupabaseCollection('plan_variants', 'var'),
  reportCard: createSupabaseCollection('report_cards', 'rc'),
  reportCards: createSupabaseCollection('report_cards', 'rc'),
  companyStrength: createSupabaseCollection('company_strength', 'cs'),
  companyStrengths: createSupabaseCollection('company_strength', 'cs'),
  policyBenefits: createSupabaseCollection('policy_benefits', 'ben'),
  planFeatures: createSupabaseCollection('policy_benefits', 'ben'),
  limitations: createSupabaseCollection('limitations', 'lim'),
  mustKnow: createSupabaseCollection('must_know', 'mk'),
  bestSuited: createSupabaseCollection('best_suited', 'bs'),

  // Relational Helper: Get Company with all child plans
  async getCompanyWithPlans(companyIdOrSlug, includeInactive = false) {
    if (!companyIdOrSlug) return null;
    const target = String(companyIdOrSlug).trim();

    const { data: company, error: compErr } = await supabase
      .from('companies')
      .select('*')
      .or(`id.eq.${target},slug.eq.${target}`)
      .maybeSingle();

    if (compErr || !company) return null;

    let plansQuery = supabase
      .from('plans')
      .select('*')
      .eq('company_id', company.id)
      .order('display_order', { ascending: true, nullsFirst: false });

    if (!includeInactive) {
      plansQuery = plansQuery.in('status', ['active', 'published']);
    }

    const { data: plans, error: planErr } = await plansQuery;
    if (planErr) {
      throw new Error(`[db.getCompanyWithPlans] Failed to load plans: ${planErr.message}`);
    }

    return {
      ...company,
      plans: plans || []
    };
  },

  // Relational Helper: Get Plan with all 7 nested CMS sections
  async getPlanWithAllSections(planIdOrSlug, includeInactive = false) {
    if (!planIdOrSlug) return null;
    const target = String(planIdOrSlug).trim();

    const { data: plan, error: planErr } = await supabase
      .from('plans')
      .select('*')
      .or(`id.eq.${target},slug.eq.${target}`)
      .maybeSingle();

    if (planErr || !plan) return null;
    const planId = plan.id;

    // Find parent company
    let company = null;
    if (plan.company_id) {
      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('id', plan.company_id)
        .maybeSingle();
      company = comp || null;
    }

    const filterStatus = (query) => {
      if (includeInactive) return query;
      return query.in('status', ['active', 'published']);
    };

    // Load all 7 sections in parallel
    const [
      variantsRes,
      reportCardRes,
      companyStrengthRes,
      policyBenefitsRes,
      limitationsRes,
      mustKnowRes,
      bestSuitedRes
    ] = await Promise.all([
      filterStatus(supabase.from('plan_variants').select('*').eq('plan_id', planId).order('display_order', { ascending: true, nullsFirst: false })),
      filterStatus(supabase.from('report_cards').select('*').eq('plan_id', planId).order('display_order', { ascending: true, nullsFirst: false })),
      filterStatus(supabase.from('company_strength').select('*').eq('plan_id', planId).order('display_order', { ascending: true, nullsFirst: false })),
      filterStatus(supabase.from('policy_benefits').select('*').eq('plan_id', planId).order('display_order', { ascending: true, nullsFirst: false })),
      filterStatus(supabase.from('limitations').select('*').eq('plan_id', planId).order('display_order', { ascending: true, nullsFirst: false })),
      filterStatus(supabase.from('must_know').select('*').eq('plan_id', planId).order('display_order', { ascending: true, nullsFirst: false })),
      filterStatus(supabase.from('best_suited').select('*').eq('plan_id', planId).order('display_order', { ascending: true, nullsFirst: false }))
    ]);

    return {
      ...plan,
      company,
      variants: variantsRes.data || [],
      reportCard: reportCardRes.data || [],
      companyStrength: companyStrengthRes.data || [],
      policyBenefits: policyBenefitsRes.data || [],
      limitations: limitationsRes.data || [],
      mustKnow: mustKnowRes.data || [],
      bestSuited: bestSuitedRes.data || []
    };
  }
};

export default db;
