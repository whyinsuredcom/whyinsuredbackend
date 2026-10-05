import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded reliably from backend/.env as well as process.cwd()
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : new Proxy({}, {
      get(target, prop) {
        const url = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          throw new Error('Supabase credentials missing: Please define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env');
        }
        const client = createClient(url, key);
        const val = client[prop];
        return typeof val === 'function' ? val.bind(client) : val;
      }
    });

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (error) {
    throw error;
  }

  return data;
}
