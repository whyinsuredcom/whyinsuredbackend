import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Verifying WHYINSURED Backend & Admin Panel production build...');

const requiredPaths = [
  { path: 'public/index.html', desc: 'Admin Panel SPA Entrypoint' },
  { path: 'public/assets', desc: 'Admin Panel Static Assets Directory' },
  { path: 'uploads', desc: 'Uploaded Media Directory' },
  { path: 'data/whyinsured_db.json', desc: 'Database Seed Inventory' },
  { path: 'server.js', desc: 'Backend Express Server' },
  { path: 'vercel.json', desc: 'Vercel Deployment Configuration' }
];

let allPassed = true;

for (const item of requiredPaths) {
  const fullPath = path.join(rootDir, item.path);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeStr = stats.isDirectory()
      ? `${fs.readdirSync(fullPath).length} items`
      : `${(stats.size / 1024).toFixed(1)} KB`;
    console.log(`  ✅ [FOUND] ${item.desc} (${item.path}) - ${sizeStr}`);
  } else {
    console.error(`  ❌ [MISSING] ${item.desc} (${item.path})`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\n❌ Build verification failed: Required production assets are missing.');
  process.exit(1);
}

console.log('\n🎉 Production verification successful: Admin Panel and backend assets ready for Vercel deployment.');
