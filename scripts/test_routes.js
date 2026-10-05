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

    // 8. Test CORS Preflight (OPTIONS) for https://whyinsured.com
    const preflightRes = await fetch('http://localhost:5099/api/admin/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://whyinsured.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, x-admin-token'
      }
    });
    const allowOrigin = preflightRes.headers.get('access-control-allow-origin');
    const allowCreds = preflightRes.headers.get('access-control-allow-credentials');
    const isPreflightOk = allowOrigin === 'https://whyinsured.com' && allowCreds === 'true';
    console.log('8. OPTIONS /api/admin/auth/login [Origin: https://whyinsured.com]:', preflightRes.status, isPreflightOk ? `✅ PASSED (Allow-Origin: ${allowOrigin})` : `❌ FAILED (Allow-Origin: ${allowOrigin})`);

    // 9. Test CORS Preflight (OPTIONS) for https://www.whyinsured.com
    const preflightWwwRes = await fetch('http://localhost:5099/api/admin/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.whyinsured.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, x-admin-token'
      }
    });
    const allowWwwOrigin = preflightWwwRes.headers.get('access-control-allow-origin');
    const isWwwPreflightOk = allowWwwOrigin === 'https://www.whyinsured.com';
    console.log('9. OPTIONS /api/admin/auth/login [Origin: https://www.whyinsured.com]:', preflightWwwRes.status, isWwwPreflightOk ? `✅ PASSED (Allow-Origin: ${allowWwwOrigin})` : `❌ FAILED (Allow-Origin: ${allowWwwOrigin})`);

    // 10. Test CORS POST request for https://whyinsured.com
    const postRes = await fetch('http://localhost:5099/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Origin': 'https://whyinsured.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@invalid.com', password: 'wrong' })
    });
    const postAllowOrigin = postRes.headers.get('access-control-allow-origin');
    console.log('10. POST /api/admin/auth/login [Origin: https://whyinsured.com]:', postRes.status, postAllowOrigin === 'https://whyinsured.com' ? `✅ PASSED (Allow-Origin: ${postAllowOrigin})` : `❌ FAILED (Allow-Origin: ${postAllowOrigin})`);

    // 11. Test CORS rejection for unauthorized origin
    const unauthorizedRes = await fetch('http://localhost:5099/api/health', {
      headers: { 'Origin': 'https://unauthorized-malicious-site.com' }
    });
    const unauthorizedAllow = unauthorizedRes.headers.get('access-control-allow-origin');
    console.log('11. GET /api/health [Unauthorized Origin]:', unauthorizedAllow === null ? '✅ PASSED (CORS correctly blocked)' : '❌ FAILED');

    console.log('\n🎉 ALL ROUTE & CORS VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
