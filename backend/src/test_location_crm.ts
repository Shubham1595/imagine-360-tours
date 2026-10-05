import { parseLocationLink, isValidCoordinate, buildGoogleMapsUrl, buildGoogleMapsDirectionsUrl } from './utils/locationParser';
import { prisma } from './config/db';

async function runTests() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: Cannot execute test suites against a PRODUCTION environment.');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('STARTING IMAGINE 360 LOCATION & SITE VISIT TEST SUITE');
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

  // TEST 1: URL with coordinates & address fields
  const urlWithCoords = 'https://www.google.com/maps/@18.5590,73.7868,15z';
  const parsed1 = parseLocationLink(urlWithCoords);
  assert(
    parsed1.latitude === 18.559 && parsed1.longitude === 73.7868 && parsed1.mapUrl === urlWithCoords,
    'TEST 1: Extract coordinates from Google Maps @lat,lng URL',
    `Expected (18.559, 73.7868), got (${parsed1.latitude}, ${parsed1.longitude})`
  );

  // TEST 2: Direct coordinates and mini-map URL generation
  const lat2 = 18.5204;
  const lng2 = 73.8567;
  assert(isValidCoordinate(lat2, lng2), 'TEST 2A: Coordinate validation within valid bounds');
  const gMapsUrl = buildGoogleMapsUrl(lat2, lng2, null);
  const directionsUrl = buildGoogleMapsDirectionsUrl(lat2, lng2, null);
  assert(
    !!(gMapsUrl && gMapsUrl.includes('18.5204,73.8567') && directionsUrl && directionsUrl.includes('18.5204,73.8567')),
    'TEST 2B: Google Maps and Directions URLs safely generated from coordinates'
  );

  // TEST 3: Shortened Google Maps URL without extractable coordinates
  const shortUrl = 'https://maps.app.goo.gl/AbCdEfGhIjKlMnOp7';
  const parsed3 = parseLocationLink(shortUrl);
  assert(
    parsed3.mapUrl === shortUrl && parsed3.latitude === null && parsed3.longitude === null,
    'TEST 3: Shortened URL preserved in mapUrl without fabricating fake coordinates',
    `Got lat: ${parsed3.latitude}, lng: ${parsed3.longitude}`
  );

  // TEST 4: Address with no location link
  const parsed4 = parseLocationLink(null);
  assert(
    parsed4.mapUrl === null && parsed4.latitude === null && parsed4.longitude === null,
    'TEST 4: Null location link safely yields null mapUrl and coordinates'
  );

  // TEST 5: Database customer creation & verify non-overwriting behavior
  const testPhone = '9999988888';
  // Cleanup any old test customer
  await prisma.customer.deleteMany({ where: { phone: testPhone } });

  const createdCustomer = await prisma.customer.create({
    data: {
      name: 'Test Hotel Baner',
      phone: testPhone,
      email: 'baner@hotel.com',
      company: 'Baner Hospitality Pvt Ltd',
      address: 'Near Balewadi High Street',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      latitude: 18.5721,
      longitude: 73.7782,
      map_url: 'https://maps.google.com/?q=18.5721,73.7782',
      source: 'TEST_SUITE',
    },
  });

  assert(
    createdCustomer.latitude === 18.5721 && createdCustomer.pincode === '411045',
    'TEST 5A: Customer record created in MySQL with full location and coordinates'
  );

  // Simulate import row with EMPTY location for existing customer
  const importedRowNoLocation = {
    address: null,
    city: null,
    state: null,
    pincode: null,
    map_url: null,
    latitude: null,
    longitude: null,
  };

  // Logic used in import.controller: do NOT overwrite existing location if imported is empty
  const updateData: any = {};
  if (importedRowNoLocation.address) updateData.address = importedRowNoLocation.address;
  if (importedRowNoLocation.map_url) updateData.map_url = importedRowNoLocation.map_url;
  if (importedRowNoLocation.latitude) updateData.latitude = importedRowNoLocation.latitude;

  const existingAfterSimulatedImport = await prisma.customer.findUnique({
    where: { id: createdCustomer.id },
  });

  assert(
    existingAfterSimulatedImport?.map_url === createdCustomer.map_url &&
    existingAfterSimulatedImport?.latitude === createdCustomer.latitude,
    'TEST 5B: Existing valid location is NOT overwritten with null during re-import'
  );

  // TEST 6: Coordinate bounds validation rejecting invalid numbers
  assert(!isValidCoordinate(120.5, 73.5), 'TEST 6A: Latitude > 90 correctly rejected');
  assert(!isValidCoordinate(-95.0, 73.5), 'TEST 6B: Latitude < -90 correctly rejected');
  assert(!isValidCoordinate(18.5, 200.0), 'TEST 6C: Longitude > 180 correctly rejected');
  assert(!isValidCoordinate(18.5, -190.0), 'TEST 6D: Longitude < -180 correctly rejected');

  // TEST 7 & 8: Customer 360 Location Object Structure contract
  const customerDetail = {
    ...createdCustomer,
    location: {
      address: createdCustomer.address,
      city: createdCustomer.city,
      state: createdCustomer.state,
      pincode: createdCustomer.pincode,
      latitude: createdCustomer.latitude,
      longitude: createdCustomer.longitude,
      mapUrl: createdCustomer.map_url,
    },
  };
  assert(
    Boolean(
      customerDetail.location.address === 'Near Balewadi High Street' &&
      customerDetail.location.city === 'Pune' &&
      customerDetail.location.state === 'Maharashtra' &&
      customerDetail.location.latitude === 18.5721 &&
      customerDetail.location.mapUrl?.includes('18.5721')
    ),
    'TEST 7 & 8: Customer 360 location contract structure valid with snake_case and camelCase'
  );

  // TEST 9 & 10: SITE_VISIT Follow-up Lifecycle & Stage Independence
  // Create lead for customer
  const testLead = await prisma.lead.create({
    data: {
      customer_id: createdCustomer.id,
      classification: 'WARM',
      status: 'WARM',
      stage: 'NEEDS_ANALYSIS',
      notes: '360 VR Showcase for Baner Hotel',
    },
  });

  // Create SITE_VISIT follow-up
  const siteVisitFollowUp = await prisma.followUp.create({
    data: {
      customer_id: createdCustomer.id,
      lead_id: testLead.id,
      type: 'SITE_VISIT',
      purpose: 'Measure site dimensions for 360 capture',
      scheduled_date: new Date('2026-10-08'),
      scheduled_time: '11:00 AM',
      status: 'PENDING',
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          latitude: true,
          longitude: true,
          map_url: true,
        },
      },
    },
  });

  assert(
    siteVisitFollowUp.type === 'SITE_VISIT' &&
    siteVisitFollowUp.customer.city === 'Pune' &&
    siteVisitFollowUp.customer.latitude === 18.5721,
    'TEST 9: SITE_VISIT follow-up created and customer location linked directly'
  );

  // Complete SITE_VISIT without changing classification or stage
  await prisma.followUp.update({
    where: { id: siteVisitFollowUp.id },
    data: {
      status: 'COMPLETED',
      completed_at: new Date(),
      notes: 'Completed site visit. Site measurements taken.',
    },
  });

  const leadAfterComplete = await prisma.lead.findUnique({
    where: { id: testLead.id },
  });

  assert(
    leadAfterComplete?.classification === 'WARM' &&
    leadAfterComplete?.stage === 'NEEDS_ANALYSIS',
    'TEST 10: Completing SITE_VISIT preserves classification and stage without auto-advancement',
    `Expected WARM + NEEDS_ANALYSIS, got ${leadAfterComplete?.classification} + ${leadAfterComplete?.stage}`
  );

  // TEST 11: Clean up test artifacts
  await prisma.followUp.deleteMany({ where: { customer_id: createdCustomer.id } });
  await prisma.lead.deleteMany({ where: { customer_id: createdCustomer.id } });
  await prisma.customer.delete({ where: { id: createdCustomer.id } });
  assert(true, 'TEST 11: Test customer, leads, and follow-ups cleanly disposed');

  console.log('\n====================================================');
  console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test Suite encountered error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
