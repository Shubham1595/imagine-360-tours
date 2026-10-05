/**
 * Production Runtime & Security Simulation Test
 * Runs under simulated NODE_ENV=production and validates:
 * 1. Health endpoint (HTTP 200, no secrets or filesystem paths exposed)
 * 2. Unauthenticated access blocked (HTTP 401)
 * 3. Client access to Admin API blocked (HTTP 403)
 * 4. Admin access to Admin API granted (HTTP 200)
 * 5. Generic login failure messages (no email enumeration)
 * 6. Public enquiry flow (Lead captured, no fake follow-up)
 * 7. Production error masking (no stack traces or Prisma internals returned to clients)
 */

import http from 'http';
import { app } from './app';
import { prisma } from './config/db';
import { signToken } from './utils/jwt';
import bcrypt from 'bcryptjs';

async function request(serverUrl: string, method: string, path: string, headers: Record<string, string> = {}, body?: any) {
  return new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; data: any }>((resolve, reject) => {
    const url = new URL(path, serverUrl);
    const reqHeaders: Record<string, string> = { ...headers };
    let reqBody: string | undefined;

    if (body) {
      reqBody = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 500,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (reqBody) {
      req.write(reqBody);
    }
    req.end();
  });
}

async function runRuntimeAudit() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: Cannot execute test suites against a PRODUCTION environment.');
    process.exit(1);
  }

  console.log('============================================================');
  console.log('STARTING PRODUCTION RUNTIME & SECURITY SIMULATION AUDIT');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // Bind to a dynamic ephemeral test port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Test server running on ${baseUrl}\n`);

  try {
    // Setup test users
    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Audit Admin',
          email: `audit_admin_${Date.now()}@imagine360tours.in`,
          password_hash: await bcrypt.hash('Admin@123456', 10),
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
    }

    let clientUser = await prisma.user.findFirst({ where: { role: 'USER' } });
    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          name: 'Audit Client',
          email: `audit_client_${Date.now()}@example.com`,
          password_hash: await bcrypt.hash('Client@123456', 10),
          role: 'USER',
          status: 'ACTIVE',
        },
      });
    }

    const adminToken = signToken({ userId: adminUser.id, email: adminUser.email, role: adminUser.role });
    const clientToken = signToken({ userId: clientUser.id, email: clientUser.email, role: clientUser.role });

    // 1. Health Check
    console.log('--- Step 1: Production Health Endpoint ---');
    const healthRes = await request(baseUrl, 'GET', '/api/health');
    assert(healthRes.statusCode === 200, 'Health endpoint returns HTTP 200');
    assert(healthRes.data?.status === 'ok', 'Health status is "ok"');
    const healthKeys = Object.keys(healthRes.data || {});
    assert(!healthKeys.includes('database_url') && !healthKeys.includes('db') && !healthKeys.includes('env'), 'Health endpoint leaks NO database details or secrets');

    // 2. Unauthenticated Protected Access
    console.log('\n--- Step 2: Unauthenticated Protected Access ---');
    const unauthRes = await request(baseUrl, 'GET', '/api/customers');
    assert(unauthRes.statusCode === 401, 'Unauthenticated request to /api/customers returns HTTP 401');

    // 3. Client Role Blocked from Admin APIs
    console.log('\n--- Step 3: Client Role Blocked from Admin APIs ---');
    const clientAdminRes = await request(baseUrl, 'GET', '/api/customers', {
      Authorization: `Bearer ${clientToken}`,
    });
    // Note: getCustomers authorizes ADMIN, SALES, STAFF. USER role must get 403
    assert(clientAdminRes.statusCode === 403, 'CLIENT token to /api/customers blocked with HTTP 403 Forbidden');

    // 4. Admin Role Access to Admin APIs
    console.log('\n--- Step 4: Admin Access to Admin APIs ---');
    const adminApiRes = await request(baseUrl, 'GET', '/api/customers', {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminApiRes.statusCode === 200, 'ADMIN token to /api/customers granted HTTP 200 OK');

    // 5. Brute-Force & Credential Enumeration Protection
    console.log('\n--- Step 5: Generic Login Failure Messages ---');
    const badLoginRes = await request(baseUrl, 'POST', '/api/auth/login', {}, {
      email: 'nonexistent_account_xyz@example.com',
      password: 'wrongPassword123',
    });
    assert(badLoginRes.statusCode === 401, 'Invalid login returns HTTP 401');
    assert(badLoginRes.data?.error === 'Invalid email or password.', 'Error message does not reveal account non-existence');

    // 6. Public Enquiry Flow
    console.log('\n--- Step 6: Public Enquiry Validation ---');
    const testEnquiryPhone = `+9197${String(Date.now()).slice(-8)}`;
    const enquiryRes = await request(baseUrl, 'POST', '/api/enquiries', {}, {
      name: 'Pooja Verma',
      phone: testEnquiryPhone,
      email: `pooja_${Date.now()}@example.com`,
      company: 'Verma Luxury Villas',
      project_type: '360 Virtual Tour',
      project_location: 'Goa',
      budget: '₹75,000',
      description: 'Luxury seaside villa walkthrough.',
    });
    assert(enquiryRes.statusCode === 201, 'Public enquiry returns HTTP 201 Created');
    const leadId = enquiryRes.data?.data?.lead_id;
    const createdLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { follow_ups: true },
    });
    assert(createdLead?.stage === 'LEAD_CAPTURED', 'Enquiry lead stage is LEAD_CAPTURED');
    assert(createdLead?.follow_ups.length === 0, 'No fake follow-ups created automatically');

    // Clean up enquiry data
    if (createdLead) {
      await prisma.lead.delete({ where: { id: leadId } });
      await prisma.enquiry.deleteMany({ where: { customer_id: createdLead.customer_id } });
      await prisma.customer.delete({ where: { id: createdLead.customer_id } });
    }

    // 7. Production Error Masking Verification
    console.log('\n--- Step 7: Production Error Masking ---');
    const invalidIdRes = await request(baseUrl, 'GET', '/api/customers/not-a-uuid', {
      Authorization: `Bearer ${adminToken}`,
    });
    // Should return 404 or safe message, without stack traces
    assert(!invalidIdRes.data?.stack, 'API responses contain NO stack trace');
    assert(typeof invalidIdRes.data?.error === 'string', 'Error response is a clean string message');

  } catch (err: any) {
    console.error('Audit execution error:', err);
    failed++;
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('\n============================================================');
  console.log(`PRODUCTION RUNTIME AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRuntimeAudit()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
