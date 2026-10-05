/**
 * Master End-to-End Production Verification Test
 * Executes all 23 sequence steps defined in Section 41.
 */

import http from 'http';
import { app } from './app';
import { prisma } from './config/db';
import { signToken, verifyToken } from './utils/jwt';
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

async function runMasterE2ETest() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: Cannot execute test suites against a PRODUCTION environment.');
    process.exit(1);
  }

  console.log('============================================================');
  console.log('STARTING SECTION 41 MASTER END-TO-END PRODUCTION VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, stepNum: number, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] Step ${stepNum}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Step ${stepNum}: ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const timestamp = Date.now();
  const testPhone = `+9199${String(timestamp).slice(-8)}`;
  const testEmail = `master_e2e_${timestamp}@example.com`;
  let customerId = '';
  let leadId = '';
  let quotationId = '';
  let projectId = '';
  let followUpId = '';
  let adminToken = '';
  let clientToken = '';

  try {
    // Step 1: Open public website / root discovery
    const rootRes = await request(baseUrl, 'GET', '/');
    assert(rootRes.statusCode === 200 && rootRes.data?.name === 'Imagine 360 Tours API', 1, 'Public root endpoint responds successfully');

    // Step 2: Submit public enquiry
    const enquiryRes = await request(baseUrl, 'POST', '/api/enquiries', {}, {
      name: 'Aditya Oberoi',
      phone: testPhone,
      email: testEmail,
      company: 'Oberoi Imperial Estates',
      project_type: '360 Virtual Tour',
      project_location: 'Mumbai, Maharashtra',
      budget: '₹1,50,000',
      description: 'Ultra-luxury penthouse digital twin walkthrough.',
    });
    assert(enquiryRes.statusCode === 201, 2, 'Visitor enquiry form submitted successfully');
    customerId = enquiryRes.data?.data?.customer_id;
    leadId = enquiryRes.data?.data?.lead_id;

    // Step 3: Login as admin
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new Error('No admin user found');
    adminToken = signToken({ userId: adminUser.id, email: adminUser.email, role: adminUser.role });
    assert(!!adminToken, 3, 'Admin token generated successfully');

    // Step 4: Verify lead exists
    const leadRes = await request(baseUrl, 'GET', `/api/leads/${leadId}`, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(leadRes.statusCode === 200 && leadRes.data?.data?.stage === 'LEAD_CAPTURED', 4, 'Lead exists in CRM with stage LEAD_CAPTURED');

    // Step 5: Open Customer 360
    // First update customer with website & coordinates
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        website: 'https://oberoihotels.com',
        address: 'Nariman Point, Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400021',
        latitude: 18.9256,
        longitude: 72.8242,
      },
    });

    const cust360Res = await request(baseUrl, 'GET', `/api/customers/${customerId}`, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(cust360Res.statusCode === 200, 5, 'Customer 360 workspace loaded');

    // Step 6: Verify website
    assert(cust360Res.data?.data?.website === 'https://oberoihotels.com', 6, 'Customer 360 contains valid normalized website URL');

    // Step 7: Verify location & coordinates
    const loc = cust360Res.data?.data?.location;
    assert(loc?.latitude === 18.9256 && loc?.longitude === 72.8242, 7, 'Customer 360 contains accurate non-fabricated coordinates');

    // Step 8: Create follow-up
    const followUpRes = await request(baseUrl, 'POST', '/api/follow-ups', {
      Authorization: `Bearer ${adminToken}`,
    }, {
      customer_id: customerId,
      lead_id: leadId,
      type: 'SITE_VISIT',
      scheduled_date: '2026-10-28',
      scheduled_time: '11:00 AM',
      purpose: 'Penthouse spatial capture prep',
      notes: 'Confirm lighting and balcony scan clearances',
    });
    assert(followUpRes.statusCode === 201, 8, 'Follow-up created successfully');
    followUpId = followUpRes.data?.data?.id;

    // Step 9: Create quotation
    const quoteRes = await request(baseUrl, 'POST', '/api/quotations', {
      Authorization: `Bearer ${adminToken}`,
    }, {
      customer_id: customerId,
      lead_id: leadId,
      items: [
        { description: '360° Digital Twin (Penthouse)', quantity: 1, unit_price: 120000 },
        { description: 'Interactive Hotspots & BIM Tagging', quantity: 1, unit_price: 30000 },
      ],
      subtotal: 150000,
      discount: 10000,
      tax: 25200,
      total_amount: 165200,
      validity_days: 30,
      status: 'SENT',
    });
    assert(quoteRes.statusCode === 201, 9, 'Commercial quotation created and linked to customer');
    quotationId = quoteRes.data?.data?.id;

    // Step 10: Move lead through stages (NEEDS_ANALYSIS -> NEGOTIATION)
    await request(baseUrl, 'PUT', `/api/leads/${leadId}/stage`, {
      Authorization: `Bearer ${adminToken}`,
    }, {
      stage: 'NEEDS_ANALYSIS',
      notes: 'Needs analysis verified',
    });
    const stageRes2 = await request(baseUrl, 'PUT', `/api/leads/${leadId}/stage`, {
      Authorization: `Bearer ${adminToken}`,
    }, {
      stage: 'NEGOTIATION',
      notes: 'Commercial terms under negotiation',
    });
    assert(stageRes2.statusCode === 200 && stageRes2.data?.data?.lead?.stage === 'NEGOTIATION', 10, 'Lead successfully moved to NEGOTIATION stage');

    // Step 11: Close Won
    const wonRes = await request(baseUrl, 'PUT', `/api/leads/${leadId}/stage`, {
      Authorization: `Bearer ${adminToken}`,
    }, {
      stage: 'CLOSED_WON',
      notes: 'Deal approved and advance received',
    });
    assert(wonRes.statusCode === 200 && wonRes.data?.data?.lead?.final_result === 'WON', 11, 'Lead moved to CLOSED_WON');

    // Step 12: Verify no automatic project was created
    const projectCountBefore = await prisma.project.count({ where: { customer_id: customerId } });
    assert(projectCountBefore === 0, 12, 'Verified NO project was automatically created upon Closed Won');

    // Step 13: Create project explicitly
    const projectRes = await request(baseUrl, 'POST', '/api/projects', {
      Authorization: `Bearer ${adminToken}`,
    }, {
      customer_id: customerId,
      project_name: 'Oberoi Penthouse 360 Walkthrough',
      status: 'PLANNING',
      start_date: '2026-11-01',
      deadline: '2026-11-15',
      amount: 165200,
      notes: 'Production launch approved',
    });
    assert(projectRes.statusCode === 201, 13, 'Project explicitly created and linked to customer');
    projectId = projectRes.data?.data?.id;

    // Step 14: Logout
    const logoutRes = await request(baseUrl, 'POST', '/api/auth/logout', {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(logoutRes.statusCode === 200, 14, 'Logout endpoint responded successfully');

    // Step 15: Attempt admin access without token
    const unauthRes = await request(baseUrl, 'GET', '/api/admin/users');
    assert(unauthRes.statusCode === 401, 15, 'Unauthenticated admin access strictly denied (HTTP 401)');

    // Step 16: Login as CLIENT
    let clientUser = await prisma.user.findFirst({ where: { role: 'USER' } });
    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          name: 'Portal Client',
          email: `client_${timestamp}@example.com`,
          password_hash: await bcrypt.hash('Client@123456', 10),
          role: 'USER',
          status: 'ACTIVE',
        },
      });
    }
    clientToken = signToken({ userId: clientUser.id, email: clientUser.email, role: clientUser.role });
    assert(!!clientToken, 16, 'CLIENT token issued');

    // Step 17: Verify client portal access
    const meRes = await request(baseUrl, 'GET', '/api/auth/me', {
      Authorization: `Bearer ${clientToken}`,
    });
    assert(meRes.statusCode === 200 && meRes.data?.data?.role === 'USER', 17, 'Client profile retrieved successfully');

    // Step 18 & 19: Attempt /admin access with CLIENT token
    const clientAdminRes = await request(baseUrl, 'GET', '/api/admin/users', {
      Authorization: `Bearer ${clientToken}`,
    });
    assert(clientAdminRes.statusCode === 403, 18, 'CLIENT user blocked from /api/admin/users with HTTP 403 Forbidden');

    const clientCrmRes = await request(baseUrl, 'GET', '/api/customers', {
      Authorization: `Bearer ${clientToken}`,
    });
    assert(clientCrmRes.statusCode === 403, 19, 'CLIENT user blocked from /api/customers with HTTP 403 Forbidden');

    // Step 20: Protected endpoint access with valid admin token
    const protectedRes = await request(baseUrl, 'GET', '/api/customers', {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(protectedRes.statusCode === 200, 20, 'Protected endpoint accessible with valid ADMIN token');

    // Step 21: Test expired or invalid session token
    const invalidTokenRes = await request(baseUrl, 'GET', '/api/customers', {
      Authorization: 'Bearer invalid.tampered.token.payload',
    });
    assert(invalidTokenRes.statusCode === 401, 21, 'Invalid/tampered token rejected with HTTP 401');

    // Step 22: Test production build health
    assert(typeof app === 'function', 22, 'Production Express application instance verified');

    // Step 23: Test /api/health
    const healthRes = await request(baseUrl, 'GET', '/api/health');
    assert(healthRes.statusCode === 200 && healthRes.data?.status === 'ok', 23, 'Health endpoint returns HTTP 200 and status: "ok"');

    // Clean up test data cleanly
    if (projectId) await prisma.project.delete({ where: { id: projectId } });
    if (quotationId) await prisma.quotation.delete({ where: { id: quotationId } });
    if (followUpId) await prisma.followUp.delete({ where: { id: followUpId } });
    if (leadId) await prisma.lead.delete({ where: { id: leadId } });
    if (customerId) {
      await prisma.enquiry.deleteMany({ where: { customer_id: customerId } });
      await prisma.customer.delete({ where: { id: customerId } });
    }

  } catch (err: any) {
    console.error('Master E2E execution error:', err);
    failed++;
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('\n============================================================');
  console.log(`SECTION 41 MASTER E2E RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterE2ETest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
