import { app } from './app';
import http from 'http';

async function runHealthAndSecurityTests() {
  console.log('====================================================');
  console.log('STARTING PRODUCTION HEALTH & SECURITY TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  // Start temporary test server
  const testPort = 5999;
  const server = app.listen(testPort, '127.0.0.1');

  try {
    // TEST 1: GET /api/health returns 200 and status: 'ok'
    const healthRes = await fetch(`http://127.0.0.1:${testPort}/api/health`);
    const healthJson: any = await healthRes.json();

    assert(
      healthRes.status === 200 && healthJson.status === 'ok',
      'TEST 1: GET /api/health returns 200 OK and status: "ok"',
      `Status: ${healthRes.status}, Body: ${JSON.stringify(healthJson)}`
    );

    // TEST 2: Verify zero sensitive information is leaked in /api/health
    const healthString = JSON.stringify(healthJson).toLowerCase();
    const sensitiveWords = ['password', 'root', 'ashish', 'secret', 'mysql', 'prisma', 'e:\\', 'c:\\', 'port'];
    const hasLeak = sensitiveWords.some(w => healthString.includes(w));
    assert(
      !hasLeak,
      'TEST 2: GET /api/health exposes zero credentials, secrets, paths, or database internals'
    );

    // TEST 3: Unauthenticated request to protected endpoint returns 401
    const unauthRes = await fetch(`http://127.0.0.1:${testPort}/api/customers`);
    const unauthJson: any = await unauthRes.json();
    assert(
      unauthRes.status === 401 && unauthJson.success === false,
      'TEST 3: Protected API /api/customers strictly rejects unauthenticated requests with 401'
    );

    // TEST 4: Invalid route returns 404
    const notFoundRes = await fetch(`http://127.0.0.1:${testPort}/api/non_existent_route`);
    assert(
      notFoundRes.status === 404,
      'TEST 4: Non-existent routes return standard 404'
    );

    console.log('\n====================================================');
    console.log(`HEALTH & SECURITY TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runHealthAndSecurityTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
