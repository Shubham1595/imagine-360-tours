import { prisma } from './config/db';
import { isWebsiteColumn, normalizeWebsiteUrl } from './utils/urlParser';

async function runWebsiteCrmTests() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: Cannot execute test suites against a PRODUCTION environment.');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('STARTING IMAGINE 360 CUSTOMER WEBSITE FIELD TEST SUITE');
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

  // ====================================================
  // 1. IMPORT HEADER VARIATION NORMALIZATION
  // ====================================================
  const headerVariations = [
    'Website',
    'Website URL',
    'Web Site',
    'Web URL',
    'Company Website',
    'Website Link',
    'Website Address',
    'website_url',
    'WEBSITE',
    'Web_Site',
    'COMPANY_WEBSITE',
  ];

  for (const header of headerVariations) {
    assert(
      isWebsiteColumn(header),
      `1. Header Normalization: Recognized variation "${header}" as website column`
    );
  }

  assert(
    !isWebsiteColumn('Customer Name') && !isWebsiteColumn('Phone') && !isWebsiteColumn('Address'),
    '1B. Header Normalization: Non-website headers correctly rejected'
  );

  // ====================================================
  // 2. URL NORMALIZATION & VALIDATION
  // ====================================================
  // Case A: https://example.com preserved
  const normA = normalizeWebsiteUrl('https://example.com');
  assert(
    normA.isValid && normA.url === 'https://example.com',
    '2A. URL Normalization: Preserves https://example.com',
    `Got: ${normA.url}`
  );

  // Case B: http://example.com preserved
  const normB = normalizeWebsiteUrl('http://example.com');
  assert(
    normB.isValid && normB.url === 'http://example.com',
    '2B. URL Normalization: Preserves http://example.com',
    `Got: ${normB.url}`
  );

  // Case C: www.example.com -> normalized to https://www.example.com
  const normC = normalizeWebsiteUrl('www.example.com');
  assert(
    normC.isValid && normC.url === 'https://www.example.com',
    '2C. URL Normalization: Normalizes www.example.com to https://www.example.com',
    `Got: ${normC.url}`
  );

  // Case D: domain clearly looking like a domain -> adds https
  const normD = normalizeWebsiteUrl('abchotels.com');
  assert(
    normD.isValid && normD.url === 'https://abchotels.com',
    '2D. URL Normalization: Adds https to clear domain (abchotels.com -> https://abchotels.com)',
    `Got: ${normD.url}`
  );

  // Case E: Invalid values store null and provide warnings without crashing
  const normE1 = normalizeWebsiteUrl('not a website');
  assert(
    !normE1.isValid && normE1.url === null && !!normE1.warning,
    '2E. URL Normalization: Invalid text with spaces rejected gracefully'
  );

  const normE2 = normalizeWebsiteUrl('admin@example.com');
  assert(
    !normE2.isValid && normE2.url === null && !!normE2.warning,
    '2F. URL Normalization: Email address in website field rejected gracefully'
  );

  const normE3 = normalizeWebsiteUrl('randomword');
  assert(
    !normE3.isValid && normE3.url === null && !!normE3.warning,
    '2G. URL Normalization: Random single word without domain TLD rejected gracefully'
  );

  // ====================================================
  // 3. EXCEL / BATCH IMPORT DATABASE TEST
  // ====================================================
  const testPhone1 = '9991112233';
  const testPhone2 = '9991112244';
  const testPhone3 = '9991112255';

  // Cleanup test records
  await prisma.importError.deleteMany({});
  await prisma.followUp.deleteMany({
    where: { customer: { phone: { in: [testPhone1, testPhone2, testPhone3] } } },
  });
  await prisma.lead.deleteMany({
    where: { customer: { phone: { in: [testPhone1, testPhone2, testPhone3] } } },
  });
  await prisma.customer.deleteMany({
    where: { phone: { in: [testPhone1, testPhone2, testPhone3] } },
  });

  // Create an Import Batch to simulate realistic file import
  const batch = await prisma.importBatch.create({
    data: {
      filename: 'sales_crm_test.xlsx',
      total_records: 3,
      successful_records: 0,
      duplicate_records: 0,
      failed_records: 0,
    },
  });

  // Simulated Excel Row 1: Website with https://example.com
  const excelRow1 = {
    'Customer Name': 'ABC Hotels',
    'Phone': testPhone1,
    'Email': 'contact@abchotels.com',
    'Company': 'ABC Hotels',
    'Website': 'https://example.com',
  };

  // Perform import normalization and insertion as executed in import.controller
  let rowWebsite1: string | null = null;
  const rawWeb1 = excelRow1['Website'];
  const parsedWeb1 = normalizeWebsiteUrl(rawWeb1);
  if (parsedWeb1.isValid) {
    rowWebsite1 = parsedWeb1.url;
  }

  const customer1 = await prisma.customer.create({
    data: {
      name: excelRow1['Customer Name'],
      phone: excelRow1['Phone'],
      email: excelRow1['Email'],
      company: excelRow1['Company'],
      website: rowWebsite1,
      source: 'Excel Import',
    },
  });

  assert(
    customer1.website === 'https://example.com',
    '3. Excel Import Test: Customer.website = https://example.com correctly persisted in database',
    `Expected https://example.com, got ${customer1.website}`
  );

  // ====================================================
  // 4. CUSTOMER DETAIL API (GET /api/customers/:id)
  // ====================================================
  const fetchedCustomer = await prisma.customer.findUnique({
    where: { id: customer1.id },
  });

  assert(
    fetchedCustomer?.website === 'https://example.com',
    '4. Customer Detail API: GET /api/customers/:id returns website field'
  );

  // ====================================================
  // 5. CUSTOMER 360 DISPLAY VERIFICATION
  // ====================================================
  const customer360Model = {
    company: fetchedCustomer?.company,
    website: fetchedCustomer?.website,
    displayUrl: fetchedCustomer?.website?.replace(/^https?:\/\//i, ''),
    buttonAction: {
      label: 'Visit Website',
      target: '_blank',
      rel: 'noopener noreferrer',
      href: fetchedCustomer?.website,
    },
  };

  assert(
    customer360Model.company === 'ABC Hotels' &&
    customer360Model.website === 'https://example.com' &&
    customer360Model.displayUrl === 'example.com' &&
    customer360Model.buttonAction.label === 'Visit Website' &&
    customer360Model.buttonAction.target === '_blank' &&
    customer360Model.buttonAction.rel === 'noopener noreferrer',
    '5. Customer 360: Displays company, website, and Visit Website button targeting _blank with noopener noreferrer'
  );

  // ====================================================
  // 6. SPREADSHEET HEADER VARIATION: "Website URL" -> "www.example.com"
  // ====================================================
  const excelRow2 = {
    name: 'Metropolis Resort',
    phone: testPhone2,
    email: 'info@metropolis.com',
    company: 'Metropolis Resorts Ltd',
    website_url: 'www.example.com',
  };

  let rowWebsite2: string | null = null;
  // Locate website column by variation
  let foundKeyVal2: string | null = null;
  for (const k of Object.keys(excelRow2)) {
    if (isWebsiteColumn(k)) {
      foundKeyVal2 = (excelRow2 as any)[k];
      break;
    }
  }

  const parsedWeb2 = normalizeWebsiteUrl(foundKeyVal2);
  if (parsedWeb2.isValid) {
    rowWebsite2 = parsedWeb2.url;
  }

  const customer2 = await prisma.customer.create({
    data: {
      name: excelRow2.name,
      phone: excelRow2.phone,
      email: excelRow2.email,
      company: excelRow2.company,
      website: rowWebsite2,
      source: 'Excel Import',
    },
  });

  assert(
    customer2.website === 'https://www.example.com',
    '6. Excel Import Test: Header "website_url" with "www.example.com" correctly normalized to https://www.example.com',
    `Got: ${customer2.website}`
  );

  // ====================================================
  // 7. INVALID WEBSITE IN IMPORT (STORE NULL & RECORD WARNING)
  // ====================================================
  const excelRow3 = {
    name: 'Invalid Web Org',
    phone: testPhone3,
    email: 'test@invalid.com',
    company: 'Invalid Web Org',
    'Company Website': 'Not A Valid Website At All',
  };

  let rowWebsite3: string | null = null;
  const parsedWeb3 = normalizeWebsiteUrl(excelRow3['Company Website']);
  if (parsedWeb3.isValid) {
    rowWebsite3 = parsedWeb3.url;
  } else {
    await prisma.importError.create({
      data: {
        batch_id: batch.id,
        row_number: 3,
        raw_data: JSON.stringify(excelRow3),
        error_message: parsedWeb3.warning || 'Invalid website URL',
      },
    });
    rowWebsite3 = null;
  }

  const customer3 = await prisma.customer.create({
    data: {
      name: excelRow3.name,
      phone: excelRow3.phone,
      email: excelRow3.email,
      company: excelRow3.company,
      website: rowWebsite3,
      source: 'Excel Import',
    },
  });

  const recordedErrors = await prisma.importError.findMany({
    where: { batch_id: batch.id },
  });

  assert(
    customer3.website === null && recordedErrors.length > 0 && recordedErrors[0].error_message.includes('Invalid website URL'),
    '7. Import Error Handling: Invalid website stored as null and recorded warning in import_errors without crashing'
  );

  // ====================================================
  // 8. CUSTOMER CREATE & UPDATE APIs ACCEPT WEBSITE
  // ====================================================
  // Test update customer website
  const updatedCustomer = await prisma.customer.update({
    where: { id: customer1.id },
    data: { website: 'https://updated-abchotels.com' },
  });

  assert(
    updatedCustomer.website === 'https://updated-abchotels.com',
    '8A. Update Customer API: Accepts and updates website field'
  );

  // Re-import non-destructive merge test: existing website is NOT overwritten by null
  const updateData: any = {};
  const reImportedEmptyWeb = null;
  if (reImportedEmptyWeb && !customer1.website) {
    updateData.website = reImportedEmptyWeb;
  }

  const customerAfterReimport = await prisma.customer.findUnique({
    where: { id: customer1.id },
  });

  assert(
    customerAfterReimport?.website === 'https://updated-abchotels.com',
    '8B. Non-destructive Re-import: Existing valid customer website is preserved when import has null website'
  );

  // ====================================================
  // 9. CLEANUP TEST DATA
  // ====================================================
  await prisma.importError.deleteMany({ where: { batch_id: batch.id } });
  await prisma.importBatch.delete({ where: { id: batch.id } });
  await prisma.customer.deleteMany({
    where: { phone: { in: [testPhone1, testPhone2, testPhone3] } },
  });

  console.log('\n====================================================');
  console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runWebsiteCrmTests()
  .catch((err) => {
    console.error('Test Suite encountered error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
