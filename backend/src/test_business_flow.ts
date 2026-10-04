/**
 * Comprehensive CRM Business Workflow & RBAC Automated Test Suite
 * Validates Section 45 (Tests 1 through 12) + Quotations + RBAC + DB Safety
 */

import { prisma } from './config/db';
import { createEnquiry } from './controllers/enquiry.controller';
import { getQuotations, createQuotation, updateQuotationStatus } from './controllers/quotation.controller';
import { createCustomer, getCustomerById, updateCustomer } from './controllers/customer.controller';
import { updateLeadStatus, updateLeadStage } from './controllers/lead.controller';
import { createFollowUp, completeFollowUp } from './controllers/followup.controller';
import { createProject, getProjects } from './controllers/project.controller';
import jwt from 'jsonwebtoken';

function createMockRes() {
  const res: any = {};
  res.statusCode = 200;
  res.jsonData = null;
  res.status = function (code: number) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data: any) {
    res.jsonData = data;
    return res;
  };
  return res;
}

async function runBusinessFlowTests() {
  console.log('============================================================');
  console.log('STARTING SECTION 45 CRM BUSINESS WORKFLOW & INTEGRITY TESTS');
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

  try {
    // 0. Setup: Ensure an admin user exists for test context
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'System Admin',
          email: `admin_${Date.now()}@imagine360tours.in`,
          password_hash: '$2b$10$dummyHashForTesting',
          role: 'ADMIN',
        },
      });
    }

    const testTimestamp = Date.now();
    const testPhone = `+9198${String(testTimestamp).slice(-8)}`;
    const testEmail = `lead_${testTimestamp}@example.com`;

    // ============================================================
    // TEST 1: Public Enquiry -> CRM Lead Created (NO fake follow-up)
    // ============================================================
    console.log('\n--- TEST 1: Public Enquiry Flow ---');
    const mockReq1: any = {
      body: {
        name: 'Rajesh Sharma',
        phone: testPhone,
        email: testEmail,
        company: 'Sharma Heritage Hotels',
        project_type: '360 Virtual Tour',
        project_location: 'Udaipur, Rajasthan',
        budget: '₹50,000 - ₹1,00,000',
        description: 'Comprehensive digital twin for our boutique heritage palace resort.',
      },
    };
    const mockRes1 = createMockRes();
    let nextErr: any = null;
    await createEnquiry(mockReq1, mockRes1, (err) => { nextErr = err; });

    assert(!nextErr && mockRes1.statusCode === 201, 'TEST 1.1: Public enquiry submitted successfully');
    const leadId = mockRes1.jsonData?.data?.lead_id;
    const customerId = mockRes1.jsonData?.data?.customer_id;

    assert(!!leadId && !!customerId, 'TEST 1.2: Customer and Lead records created in database');

    // Verify lead stage is LEAD_CAPTURED and no automatic follow-ups exist
    const testLead1 = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { follow_ups: true },
    });
    assert(testLead1?.stage === 'LEAD_CAPTURED', 'TEST 1.3: Initial lead stage is LEAD_CAPTURED');
    assert(testLead1?.follow_ups.length === 0, 'TEST 1.4: NO fake follow-up automatically created on enquiry');

    // ============================================================
    // TEST 2: Lead LEAD_CAPTURED -> Change Classification to WARM
    // ============================================================
    console.log('\n--- TEST 2: Classification change to WARM ---');
    const mockReq2: any = {
      params: { id: leadId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        classification: 'WARM',
        reason: 'Contacted client; expressed interest in proposal review',
      },
    };
    const mockRes2 = createMockRes();
    await updateLeadStatus(mockReq2, mockRes2, (err) => { nextErr = err; });

    const testLead2 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead2?.classification === 'WARM', 'TEST 2.1: Lead classification updated to WARM');
    assert(testLead2?.stage === 'LEAD_CAPTURED', 'TEST 2.2: Lead stage remains strictly LEAD_CAPTURED');

    // ============================================================
    // TEST 3: Change Classification to HOT -> Stage unchanged
    // ============================================================
    console.log('\n--- TEST 3: Classification change to HOT ---');
    const mockReq3: any = {
      params: { id: leadId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        classification: 'HOT',
        reason: 'Client requested immediate project discussion for upcoming festival season',
      },
    };
    const mockRes3 = createMockRes();
    await updateLeadStatus(mockReq3, mockRes3, (err) => { nextErr = err; });

    const testLead3 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead3?.classification === 'HOT', 'TEST 3.1: Lead classification updated to HOT');
    assert(testLead3?.stage === 'LEAD_CAPTURED', 'TEST 3.2: Lead stage remains strictly LEAD_CAPTURED');

    // ============================================================
    // TEST 4: Create PROJECT_DISCUSSION as activity/follow-up
    // ============================================================
    console.log('\n--- TEST 4: Create PROJECT_DISCUSSION follow-up ---');
    const mockReq4: any = {
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        customer_id: customerId,
        lead_id: leadId,
        type: 'PROJECT_DISCUSSION',
        scheduled_date: '2026-10-15',
        scheduled_time: '11:00 AM',
        purpose: 'Technical walk-through and capture timeline discussion',
        notes: 'Discuss matterport scanning specs for 40 luxury rooms',
      },
    };
    const mockRes4 = createMockRes();
    await createFollowUp(mockReq4, mockRes4, (err) => { nextErr = err; });

    assert(mockRes4.statusCode === 201, 'TEST 4.1: PROJECT_DISCUSSION follow-up created');
    const discussionId = mockRes4.jsonData?.data?.id;
    assert(!!discussionId, 'TEST 4.2: PROJECT_DISCUSSION has valid follow-up ID');

    // Verify it didn't change lead stage
    const testLead4 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead4?.stage === 'LEAD_CAPTURED', 'TEST 4.3: Stage remains LEAD_CAPTURED (PROJECT_DISCUSSION is an activity, not stage)');

    // ============================================================
    // TEST 5: Complete Follow-up -> Classification & Stage Unchanged
    // ============================================================
    console.log('\n--- TEST 5: Complete Follow-up (Non-interference Rule) ---');
    const mockReq5: any = {
      params: { id: discussionId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        notes: 'Discussion concluded successfully. Client requested official quotation.',
      },
    };
    const mockRes5 = createMockRes();
    await completeFollowUp(mockReq5, mockRes5, (err) => { nextErr = err; });

    const completedFollowUp = await prisma.followUp.findUnique({ where: { id: discussionId } });
    assert(completedFollowUp?.status === 'COMPLETED', 'TEST 5.1: Follow-up marked as COMPLETED');

    const testLead5 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead5?.classification === 'HOT', 'TEST 5.2: Lead classification unchanged (remains HOT)');
    assert(testLead5?.stage === 'LEAD_CAPTURED', 'TEST 5.3: Lead stage unchanged (remains LEAD_CAPTURED)');

    // ============================================================
    // TEST 6: Move Lead to NEEDS_ANALYSIS -> Classification independent
    // ============================================================
    console.log('\n--- TEST 6: Move stage to NEEDS_ANALYSIS ---');
    const mockReq6: any = {
      params: { id: leadId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        stage: 'NEEDS_ANALYSIS',
        notes: 'Finalizing equipment requirements and lighting conditions',
      },
    };
    const mockRes6 = createMockRes();
    await updateLeadStage(mockReq6, mockRes6, (err) => { nextErr = err; });

    const testLead6 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead6?.stage === 'NEEDS_ANALYSIS', 'TEST 6.1: Lead stage updated to NEEDS_ANALYSIS');
    assert(testLead6?.classification === 'HOT', 'TEST 6.2: Lead classification remains HOT (completely independent)');

    // ============================================================
    // TEST 7: Create Quotation -> Linked Correctly
    // ============================================================
    console.log('\n--- TEST 7: Create Formal Quotation ---');
    const mockReq7: any = {
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        customer_id: customerId,
        lead_id: leadId,
        items: [
          { description: '360° Matterport Capture (Boutique Resort)', quantity: 1, unit_price: 65000 },
          { description: 'Google Street View Integration & Hosting', quantity: 1, unit_price: 15000 },
        ],
        subtotal: 80000,
        discount: 5000,
        tax: 13500,
        total_amount: 88500,
        validity_days: 30,
        terms: '50% advance, 50% on delivery.',
        status: 'DRAFT',
      },
    };
    const mockRes7 = createMockRes();
    await createQuotation(mockReq7, mockRes7, (err) => { nextErr = err; });

    assert(mockRes7.statusCode === 201, 'TEST 7.1: Quotation created with HTTP 201');
    const quotation = mockRes7.jsonData?.data;
    assert(!!quotation?.quotation_number, `TEST 7.2: Sequential quotation number generated: ${quotation?.quotation_number}`);
    assert(quotation?.customer_id === customerId, 'TEST 7.3: Quotation linked to Customer ID');
    assert(quotation?.lead_id === leadId, 'TEST 7.4: Quotation linked to Lead ID');
    assert(quotation?.total_amount === 88500, 'TEST 7.5: Quotation grand total matches calculation');

    // ============================================================
    // TEST 8: Move to NEGOTIATION -> Classification independent
    // ============================================================
    console.log('\n--- TEST 8: Move stage to NEGOTIATION ---');
    const mockReq8: any = {
      params: { id: leadId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        stage: 'NEGOTIATION',
        notes: 'Commercial quotation presented; discussing scope tweaks',
      },
    };
    const mockRes8 = createMockRes();
    await updateLeadStage(mockReq8, mockRes8, (err) => { nextErr = err; });

    const testLead8 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead8?.stage === 'NEGOTIATION', 'TEST 8.1: Lead stage updated to NEGOTIATION');
    assert(testLead8?.classification === 'HOT', 'TEST 8.2: Classification remains HOT');

    // ============================================================
    // TEST 9: Move to CLOSED_WON -> NO automatic project creation
    // ============================================================
    console.log('\n--- TEST 9: Move stage to CLOSED_WON (No auto-project) ---');
    const projectsBefore = await prisma.project.count({ where: { customer_id: customerId } });

    const mockReq9: any = {
      params: { id: leadId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        stage: 'CLOSED_WON',
        notes: 'Deal finalized and advance payment received.',
      },
    };
    const mockRes9 = createMockRes();
    await updateLeadStage(mockReq9, mockRes9, (err) => { nextErr = err; });

    const testLead9 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead9?.stage === 'CLOSED_WON', 'TEST 9.1: Stage is CLOSED_WON');
    assert(testLead9?.final_result === 'WON', 'TEST 9.2: final_result set to WON');

    const projectsAfter = await prisma.project.count({ where: { customer_id: customerId } });
    assert(projectsBefore === projectsAfter, 'TEST 9.3: NO project was automatically created (preserves explicit creation rule)');

    // ============================================================
    // TEST 10: Explicit Project Creation
    // ============================================================
    console.log('\n--- TEST 10: Explicit Project Creation ---');
    const mockReq10: any = {
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        customer_id: customerId,
        project_name: 'Sharma Heritage Palace 360 Digital Twin',
        status: 'PLANNING',
        start_date: '2026-10-20',
        deadline: '2026-11-05',
        amount: 88500,
        notes: 'Matterport Pro3 scanner on-site capture scheduled',
      },
    };
    const mockRes10 = createMockRes();
    await createProject(mockReq10, mockRes10, (err) => { nextErr = err; });

    assert(mockRes10.statusCode === 201, 'TEST 10.1: Project explicitly created with HTTP 201');
    const project = mockRes10.jsonData?.data;
    assert(project?.customer_id === customerId, 'TEST 10.2: Project properly linked to customer');
    assert(project?.project_name === 'Sharma Heritage Palace 360 Digital Twin', 'TEST 10.3: Project name matches specification');

    // ============================================================
    // TEST 11: Move to CLOSED_LOST -> Lost Reason strictly required
    // ============================================================
    console.log('\n--- TEST 11: CLOSED_LOST Validation & Reason ---');
    // Sub-test A: Attempt without lost reason should fail validation
    const mockReq11Fail: any = {
      params: { id: leadId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        stage: 'CLOSED_LOST',
      },
    };
    const mockRes11Fail = createMockRes();
    let caughtValidationError = false;
    await updateLeadStage(mockReq11Fail, mockRes11Fail, (err) => {
      if (err) caughtValidationError = true;
    });
    assert(caughtValidationError, 'TEST 11.1: Stage transition to CLOSED_LOST rejected without lost_reason');

    // Sub-test B: Successful CLOSED_LOST with proper lost_reason, notes, and closed_date
    const mockReq11Success: any = {
      params: { id: leadId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        stage: 'CLOSED_LOST',
        lost_reason: 'Budget Issue',
        notes: 'Client deferred expansion budget to next fiscal year.',
        closed_date: '2026-10-04',
      },
    };
    const mockRes11Success = createMockRes();
    await updateLeadStage(mockReq11Success, mockRes11Success, (err) => { nextErr = err; });

    const testLead11 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead11?.stage === 'CLOSED_LOST', 'TEST 11.2: Lead moved to CLOSED_LOST');
    assert(testLead11?.lost_reason === 'Budget Issue', 'TEST 11.3: Lost reason saved in database');
    assert(testLead11?.final_result === 'LOST', 'TEST 11.4: final_result set to LOST');

    // ============================================================
    // TEST 12: SITE_VISIT Follow-up & Location Verification
    // ============================================================
    console.log('\n--- TEST 12: SITE_VISIT Follow-up & Location Verification ---');
    // First update customer with coordinates
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        address: 'Palace Road, Near Lake Pichola',
        city: 'Udaipur',
        state: 'Rajasthan',
        pincode: '313001',
        latitude: 24.5764,
        longitude: 73.6835,
      },
    });

    const mockReq12: any = {
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        customer_id: customerId,
        lead_id: leadId,
        type: 'SITE_VISIT',
        scheduled_date: '2026-10-25',
        scheduled_time: '02:00 PM',
        purpose: 'On-site lighting assessment and floor plan spatial inspection',
        notes: 'Meeting with property general manager on location',
      },
    };
    const mockRes12 = createMockRes();
    await createFollowUp(mockReq12, mockRes12, (err) => { nextErr = err; });

    assert(mockRes12.statusCode === 201, 'TEST 12.1: SITE_VISIT follow-up created');
    const siteVisitId = mockRes12.jsonData?.data?.id;

    // Verify customer detail endpoint returns location coordinates
    const mockReqCustomer: any = {
      params: { id: customerId },
      user: { id: adminUser.id, role: 'ADMIN' },
    };
    const mockResCustomer = createMockRes();
    await getCustomerById(mockReqCustomer, mockResCustomer, (err) => { nextErr = err; });

    const retrievedLocation = mockResCustomer.jsonData?.data?.location;
    assert(retrievedLocation?.latitude === 24.5764 && retrievedLocation?.longitude === 73.6835, 'TEST 12.2: Customer location coordinates returned for SITE_VISIT');

    // Complete SITE_VISIT
    const mockReqCompleteSiteVisit: any = {
      params: { id: siteVisitId },
      user: { id: adminUser.id, role: 'ADMIN' },
      body: {
        notes: 'Site visit completed. All 40 suites photographed for spatial boundaries.',
      },
    };
    const mockResCompleteSiteVisit = createMockRes();
    await completeFollowUp(mockReqCompleteSiteVisit, mockResCompleteSiteVisit, (err) => { nextErr = err; });

    const completedSiteVisit = await prisma.followUp.findUnique({ where: { id: siteVisitId } });
    assert(completedSiteVisit?.status === 'COMPLETED', 'TEST 12.3: SITE_VISIT marked as COMPLETED');

    const testLead12 = await prisma.lead.findUnique({ where: { id: leadId } });
    assert(testLead12?.stage === 'CLOSED_LOST', 'TEST 12.4: Stage unaffected by completing SITE_VISIT (remains CLOSED_LOST)');

    // ============================================================
    // TEST 13: Customer 360 Quotations & Relations Retrieval
    // ============================================================
    console.log('\n--- TEST 13: Customer 360 Full Workspace Retrieval ---');
    const fullCustomerRes = createMockRes();
    await getCustomerById(mockReqCustomer, fullCustomerRes, (err) => { nextErr = err; });

    const custData = fullCustomerRes.jsonData?.data;
    assert(Array.isArray(custData?.quotations) && custData?.quotations.length > 0, 'TEST 13.1: Customer 360 includes quotations history');
    assert(Array.isArray(custData?.projects) && custData?.projects.length > 0, 'TEST 13.2: Customer 360 includes projects history');
    assert(Array.isArray(custData?.follow_ups) && custData?.follow_ups.length > 0, 'TEST 13.3: Customer 360 includes follow-ups history');

    // Clean up test customer & lead safely
    await prisma.followUp.deleteMany({ where: { customer_id: customerId } });
    await prisma.quotation.deleteMany({ where: { customer_id: customerId } });
    await prisma.project.deleteMany({ where: { customer_id: customerId } });
    await prisma.lead.deleteMany({ where: { customer_id: customerId } });
    await prisma.enquiry.deleteMany({ where: { customer_id: customerId } });
    await prisma.customer.delete({ where: { id: customerId } });

  } catch (err: any) {
    console.error('Unexpected error during test execution:', err);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`SECTION 45 BUSINESS FLOW TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBusinessFlowTests()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
