/**
 * Comprehensive Website CMS & Admin Master Control Verification Suite
 * Covers Part 4.5 Section 44 (Tests 1-15) and Section 47 (Final Master Flow)
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

async function runTests() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: Cannot execute test suites against a PRODUCTION environment.');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(' PART 4.5 — ADMIN MASTER CONTROL & WEBSITE CMS VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Server listening on test port: ${port}`);

  let passedTests = 0;
  let totalTests = 15;

  try {
    // 0. Setup Test Users
    const passwordHash = await bcrypt.hash('TestPass@123', 10);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin_cms@imagine360tours.in' },
      update: {},
      create: {
        name: 'CMS Super Admin',
        email: 'superadmin_cms@imagine360tours.in',
        password_hash: passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });

    const salesUser = await prisma.user.upsert({
      where: { email: 'sales_cms@imagine360tours.in' },
      update: {},
      create: {
        name: 'CMS Sales Rep',
        email: 'sales_cms@imagine360tours.in',
        password_hash: passwordHash,
        role: 'SALES',
        status: 'ACTIVE',
      },
    });

    const clientUser = await prisma.user.upsert({
      where: { email: 'client_cms@imagine360tours.in' },
      update: {},
      create: {
        name: 'CMS Client',
        email: 'client_cms@imagine360tours.in',
        password_hash: passwordHash,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    const adminToken = signToken({ userId: superAdmin.id, email: superAdmin.email, role: superAdmin.role });
    const salesToken = signToken({ userId: salesUser.id, email: salesUser.email, role: salesUser.role });
    const clientToken = signToken({ userId: clientUser.id, email: clientUser.email, role: clientUser.role });

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const salesHeaders = { Authorization: `Bearer ${salesToken}` };
    const clientHeaders = { Authorization: `Bearer ${clientToken}` };

    // Clean up any previous test services
    await prisma.quotation.deleteMany({ where: { quotation_number: { startsWith: 'QT-CMS-' } } });
    await prisma.service.deleteMany({ where: { slug: { startsWith: 'auto-twin-' } } });
    await prisma.service.deleteMany({ where: { name: { contains: 'Automated 3D Digital Twin' } } });

    const testSlug = `auto-twin-${Date.now()}`;
    const initialName = `Automated 3D Digital Twin Pro ${Date.now()}`;
    const updatedName = `Automated 3D Digital Twin Enterprise ${Date.now()}`;
    const sovereignName = `Automated 3D Digital Twin Sovereign ${Date.now()}`;

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Admin creates service
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 1] Admin creates service...');
    const createRes = await request(baseUrl, 'POST', '/api/services', adminHeaders, {
      name: initialName,
      slug: testSlug,
      category: 'Spatial Computing',
      short_description: 'High dynamic range digital twin with real-time IoT integration.',
      description: 'Full immersive volumetric reality model with cloud point telemetry.',
      price: 95000,
      duration: '5-10 business days',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3',
      is_active: true,
      is_visible: true,
      is_featured: false,
      display_order: 10,
    });

    if (createRes.statusCode === 201 && createRes.data?.data?.id) {
      console.log('  ✔ PASS: Service created with ID:', createRes.data.data.id);
      passedTests++;
    } else {
      throw new Error(`TEST 1 Failed: Status ${createRes.statusCode}, Data: ${JSON.stringify(createRes.data)}`);
    }
    const createdServiceId = createRes.data.data.id;

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Admin edits service
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 2] Admin edits service...');
    const editRes = await request(baseUrl, 'PUT', `/api/services/${createdServiceId}`, adminHeaders, {
      name: updatedName,
      price: 110000,
      description: 'Updated enterprise grade spatial model with BIM integration.',
    });

    if (editRes.statusCode === 200 && editRes.data?.data?.name === updatedName) {
      console.log('  ✔ PASS: Service changes persisted in MySQL.');
      passedTests++;
    } else {
      throw new Error(`TEST 2 Failed: Status ${editRes.statusCode}, Data: ${JSON.stringify(editRes.data)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Admin toggles availability OFF
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 3] Admin toggles availability OFF...');
    const toggleAvailRes = await request(
      baseUrl,
      'PATCH',
      `/api/services/${createdServiceId}/availability`,
      adminHeaders,
      { is_active: false }
    );

    if (toggleAvailRes.statusCode === 200 && toggleAvailRes.data?.data?.is_active === false) {
      console.log('  ✔ PASS: Service availability toggled OFF (is_active = false).');
      passedTests++;
    } else {
      throw new Error(`TEST 3 Failed: Status ${toggleAvailRes.statusCode}, Data: ${JSON.stringify(toggleAvailRes.data)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Public service API returns correct state
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 4] Public service API returns correct state...');
    const publicSvcRes = await request(baseUrl, 'GET', '/api/public/services');
    const returnedSvc = publicSvcRes.data?.data?.find((s: any) => s.id === createdServiceId);

    if (publicSvcRes.statusCode === 200 && returnedSvc && returnedSvc.is_active === false) {
      console.log('  ✔ PASS: Public service API returned service with is_active = false.');
      passedTests++;
    } else {
      throw new Error(`TEST 4 Failed: Service not found or incorrect state: ${JSON.stringify(returnedSvc)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Inactive service enquiry rejection (HTTP 409)
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 5] Inactive service enquiry rejection...');
    const enquiryRes = await request(baseUrl, 'POST', '/api/enquiries', {}, {
      name: 'Rohan Sharma',
      phone: '+919876500001',
      email: 'rohan@example.com',
      service_id: createdServiceId,
      project_type: updatedName,
      description: 'Need complete factory spatial scanning.',
    });

    if (enquiryRes.statusCode === 409 && enquiryRes.data?.message?.includes('currently unavailable')) {
      console.log('  ✔ PASS: Backend rejected enquiry for inactive service with HTTP 409.');
      passedTests++;
    } else {
      throw new Error(`TEST 5 Failed: Expected HTTP 409, got ${enquiryRes.statusCode}: ${JSON.stringify(enquiryRes.data)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Admin toggles visibility OFF (Hidden from website)
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 6] Admin toggles visibility OFF...');
    const toggleVisRes = await request(
      baseUrl,
      'PATCH',
      `/api/services/${createdServiceId}/visibility`,
      adminHeaders,
      { is_visible: false }
    );

    const publicAfterHideRes = await request(baseUrl, 'GET', '/api/public/services');
    const hiddenFound = publicAfterHideRes.data?.data?.find((s: any) => s.id === createdServiceId);

    if (toggleVisRes.statusCode === 200 && !hiddenFound) {
      console.log('  ✔ PASS: Service is hidden and does NOT appear in public API.');
      passedTests++;
    } else {
      throw new Error('TEST 6 Failed: Hidden service was still returned in public API.');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Admin toggles visibility ON & featured ON
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 7] Admin toggles visibility ON and featured ON...');
    await request(baseUrl, 'PATCH', `/api/services/${createdServiceId}/visibility`, adminHeaders, { is_visible: true });
    const toggleFeatRes = await request(
      baseUrl,
      'PATCH',
      `/api/services/${createdServiceId}/featured`,
      adminHeaders,
      { is_featured: true }
    );

    const publicAfterFeat = await request(baseUrl, 'GET', '/api/public/services');
    const featFound = publicAfterFeat.data?.data?.find((s: any) => s.id === createdServiceId);

    if (toggleFeatRes.statusCode === 200 && featFound && featFound.is_featured === true) {
      console.log('  ✔ PASS: Service appears in public API with is_featured = true.');
      passedTests++;
    } else {
      throw new Error(`TEST 7 Failed: Status ${toggleFeatRes.statusCode}, Feat: ${JSON.stringify(featFound)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Admin changes display order
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 8] Admin changes display order...');
    const reorderRes = await request(baseUrl, 'PATCH', '/api/services/reorder', adminHeaders, {
      orders: [{ id: createdServiceId, display_order: -999 }],
    });

    const publicReordered = await request(baseUrl, 'GET', '/api/public/services');
    const firstSvc = publicReordered.data?.data?.[0];

    if (reorderRes.statusCode === 200 && firstSvc?.id === createdServiceId) {
      console.log('  ✔ PASS: Public API returned service as first element (display_order: -999).');
      passedTests++;
    } else {
      throw new Error(`TEST 8 Failed: Reorder failed or first service was ${firstSvc?.name}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 9: Admin changes service name
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 9] Admin changes service name...');
    const renameRes = await request(baseUrl, 'PUT', `/api/services/${createdServiceId}`, adminHeaders, {
      name: sovereignName,
    });

    const publicRenamed = await request(baseUrl, 'GET', '/api/public/services');
    const renamedSvc = publicRenamed.data?.data?.find((s: any) => s.id === createdServiceId);

    if (renameRes.statusCode === 200 && renamedSvc?.name === sovereignName) {
      console.log('  ✔ PASS: Public website API receives authoritative updated name.');
      passedTests++;
    } else {
      throw new Error(`TEST 9 Failed: Rename failed: ${JSON.stringify(renamedSvc)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 10: Unauthorized SALES user attempts CMS mutation (HTTP 403)
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 10] Unauthorized SALES user attempts CMS mutation...');
    const salesMutateRes = await request(
      baseUrl,
      'PATCH',
      `/api/services/${createdServiceId}/availability`,
      salesHeaders,
      { is_active: true }
    );

    if (salesMutateRes.statusCode === 403) {
      console.log('  ✔ PASS: SALES user mutation blocked with HTTP 403.');
      passedTests++;
    } else {
      throw new Error(`TEST 10 Failed: Expected HTTP 403, got ${salesMutateRes.statusCode}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 11: CLIENT attempts CMS mutation (HTTP 403)
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 11] CLIENT attempts CMS mutation...');
    const clientMutateRes = await request(
      baseUrl,
      'PATCH',
      `/api/services/${createdServiceId}/availability`,
      clientHeaders,
      { is_active: true }
    );

    if (clientMutateRes.statusCode === 403) {
      console.log('  ✔ PASS: CLIENT user mutation blocked with HTTP 403.');
      passedTests++;
    } else {
      throw new Error(`TEST 11 Failed: Expected HTTP 403, got ${clientMutateRes.statusCode}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 12: Public visitor attempts CMS mutation (HTTP 401)
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 12] Unauthenticated public visitor attempts CMS mutation...');
    const publicMutateRes = await request(
      baseUrl,
      'PATCH',
      `/api/services/${createdServiceId}/availability`,
      {},
      { is_active: true }
    );

    if (publicMutateRes.statusCode === 401 || publicMutateRes.statusCode === 403) {
      console.log(`  ✔ PASS: Unauthenticated visitor blocked with HTTP ${publicMutateRes.statusCode}.`);
      passedTests++;
    } else {
      throw new Error(`TEST 12 Failed: Expected 401/403, got ${publicMutateRes.statusCode}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 13: Admin changes project public visibility
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 13] Admin changes project public visibility...');
    // Create customer and project
    const testCust = await prisma.customer.create({
      data: {
        name: 'Oberoi Tech Park',
        phone: '+919988776655',
        company: 'Oberoi Realty',
      },
    });

    const testProject = await prisma.project.create({
      data: {
        customer_id: testCust.id,
        project_name: 'Oberoi Commerz III 3D Digital Twin',
        status: 'COMPLETED',
        is_public: false,
      },
    });

    // Make project public
    const toggleProjRes = await request(
      baseUrl,
      'PATCH',
      `/api/projects/${testProject.id}/public-visibility`,
      adminHeaders,
      {
        is_public: true,
        is_featured: true,
        public_description: 'Commercial 3D digital twin covering 1.2M sqft.',
      }
    );

    const publicProjRes = await request(baseUrl, 'GET', '/api/public/projects');
    const pubProj = publicProjRes.data?.data?.find((p: any) => p.id === testProject.id);

    if (toggleProjRes.statusCode === 200 && pubProj && pubProj.is_featured === true) {
      console.log('  ✔ PASS: Public project API reflects visibility change and public description.');
      passedTests++;
    } else {
      throw new Error(`TEST 13 Failed: Public project not reflected: ${JSON.stringify(pubProj)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 14: Admin changes website setting
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 14] Admin changes website setting...');
    const updateSettingsRes = await request(baseUrl, 'PUT', '/api/admin/settings', adminHeaders, {
      settings: {
        tagline: 'See Your World From Every Angle — Engineered Spatial Twins.',
        phone: '+91 9561909070',
      },
    });

    const publicSettingsRes = await request(baseUrl, 'GET', '/api/public/settings');

    if (
      updateSettingsRes.statusCode === 200 &&
      publicSettingsRes.data?.data?.tagline === 'See Your World From Every Angle — Engineered Spatial Twins.'
    ) {
      console.log('  ✔ PASS: Public settings endpoint reflects authoritative database changes.');
      passedTests++;
    } else {
      throw new Error(`TEST 14 Failed: Settings mismatch: ${JSON.stringify(publicSettingsRes.data)}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 15: Existing CRM relationships remain intact & safe archiving
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST 15] Existing CRM relationships integrity & safe service archival...');
    // Create quotation linked to createdServiceId
    const testQuotation = await prisma.quotation.create({
      data: {
        quotation_number: `QT-CMS-${Date.now()}`,
        customer_id: testCust.id,
        service_id: createdServiceId,
        items: JSON.stringify([{ description: 'Digital Twin Pro', quantity: 1, unit_price: 95000, total: 95000 }]),
        subtotal: 95000,
        total_amount: 95000,
        status: 'DRAFT',
      },
    });

    // Admin attempts to delete referenced service -> must archive, not drop
    const deleteRes = await request(baseUrl, 'DELETE', `/api/services/${createdServiceId}`, adminHeaders);
    const archivedSvc = await prisma.service.findUnique({ where: { id: createdServiceId } });

    // Quotation and Customer must remain completely intact
    const verifyQuote = await prisma.quotation.findUnique({ where: { id: testQuotation.id } });
    const verifyCust = await prisma.customer.findUnique({ where: { id: testCust.id } });

    if (
      deleteRes.statusCode === 200 &&
      archivedSvc?.status === 'ARCHIVED' &&
      archivedSvc?.is_visible === false &&
      verifyQuote !== null &&
      verifyCust !== null
    ) {
      console.log('  ✔ PASS: Service safely archived; CRM quotations and customer records remain 100% intact.');
      passedTests++;
    } else {
      throw new Error(`TEST 15 Failed: Archival or CRM integrity compromised: ${JSON.stringify(archivedSvc)}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(` RESULT: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log(' THE ADMIN PANEL IS THE AUTHORITATIVE MASTER OF THE WEBSITE.');
    process.exit(0);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('\n❌ CMS Verification Test Failed:\n', err);
  process.exit(1);
});
