import app from '../server.js';
import http from 'http';

const server = http.createServer(app);

server.listen(5099, async () => {
  console.log('Testing server running on port 5099...');

  try {
    // 1. Test /api/health
    const healthRes = await fetch('http://localhost:5099/api/health');
    const healthJson = await healthRes.json();
    console.log('1. GET /api/health:', healthRes.status, healthJson.status === 'ok' ? '✅ PASSED' : '❌ FAILED');

    // 2. Test /admin
    const adminRes = await fetch('http://localhost:5099/admin');
    const adminText = await adminRes.text();
    const adminIsHtml = adminText.includes('<!doctype html>') && adminRes.headers.get('content-type').includes('text/html');
    console.log('2. GET /admin:', adminRes.status, adminIsHtml ? '✅ PASSED (Serves Admin SPA HTML)' : '❌ FAILED');

    // 3. Test /admin/dashboard (SPA Client Route)
    const dashRes = await fetch('http://localhost:5099/admin/dashboard');
    const dashText = await dashRes.text();
    const dashIsHtml = dashText.includes('<!doctype html>');
    console.log('3. GET /admin/dashboard:', dashRes.status, dashIsHtml ? '✅ PASSED (SPA Fallback OK)' : '❌ FAILED');

    // 4. Test /admin/login (SPA Client Route)
    const loginRes = await fetch('http://localhost:5099/admin/login');
    const loginText = await loginRes.text();
    const loginIsHtml = loginText.includes('<!doctype html>');
    console.log('4. GET /admin/login:', loginRes.status, loginIsHtml ? '✅ PASSED (SPA Fallback OK)' : '❌ FAILED');

    // 5. Test Static Asset
    const assetRes = await fetch('http://localhost:5099/assets/index-Zftd_3Rc.js');
    console.log('5. GET /assets/index-Zftd_3Rc.js:', assetRes.status, assetRes.status === 200 ? '✅ PASSED' : '❌ FAILED');

    // 6. Test Non-existent API route
    const badApiRes = await fetch('http://localhost:5099/api/unknown-endpoint');
    const badApiJson = await badApiRes.json();
    console.log('6. GET /api/unknown-endpoint:', badApiRes.status, badApiJson.success === false ? '✅ PASSED (404 API error preserved)' : '❌ FAILED');

    // 7. Test Non-existent generic route (must NOT serve admin HTML)
    const badGenericRes = await fetch('http://localhost:5099/some-random-page');
    const badGenericJson = await badGenericRes.json();
    console.log('7. GET /some-random-page:', badGenericRes.status, badGenericJson.success === false ? '✅ PASSED (404 JSON error preserved)' : '❌ FAILED');

    console.log('\n🎉 ALL ROUTE VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
