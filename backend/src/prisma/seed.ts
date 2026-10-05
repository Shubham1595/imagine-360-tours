import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

async function main() {
  // CRITICAL SAFETY CHECK: Refuse execution in production environment
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ FATAL: Cannot execute development seed script in a PRODUCTION environment.');
    console.error('Production databases must be bootstrapped using "npm run bootstrap:admin".');
    process.exit(1);
  }

  console.log('🌱 Starting Imagine 360 Tours development database seed...');

  const devAdminPassword = process.env.DEV_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'DevAdmin#2026';
  const devSalesPassword = process.env.DEV_SALES_PASSWORD || 'DevSales#2026';
  const devStaffPassword = process.env.DEV_STAFF_PASSWORD || 'DevStaff#2026';
  const devClientPassword = process.env.DEV_CLIENT_PASSWORD || 'DevClient#2026';

  // 1. Create Super Admin User
  const adminPassword = await bcrypt.hash(devAdminPassword, 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@imagine360tours.in' },
    update: {},
    create: {
      name: 'Ashish (Super Admin)',
      email: 'admin@imagine360tours.in',
      phone: '+919561909070',
      password_hash: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✔ Super Admin created:', superAdmin.email);

  // 2. Create Sales Manager User
  const salesPassword = await bcrypt.hash(devSalesPassword, 10);
  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@imagine360tours.in' },
    update: {},
    create: {
      name: 'Rajesh Patil (Sales Lead)',
      email: 'sales@imagine360tours.in',
      phone: '+919876543210',
      password_hash: salesPassword,
      role: 'SALES',
      status: 'ACTIVE',
    },
  });

  // 3. Create Staff User
  const staffPassword = await bcrypt.hash(devStaffPassword, 10);
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@imagine360tours.in' },
    update: {},
    create: {
      name: 'Vikram Joshi (Drone & LiDAR Tech)',
      email: 'staff@imagine360tours.in',
      phone: '+919876543211',
      password_hash: staffPassword,
      role: 'STAFF',
      status: 'ACTIVE',
    },
  });

  // 4. Create Standard Client User
  const clientPassword = await bcrypt.hash(devClientPassword, 10);
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@imagine360tours.in' },
    update: {},
    create: {
      name: 'Neha Deshmukh (Horizon Properties)',
      email: 'client@imagine360tours.in',
      phone: '+919876543212',
      password_hash: clientPassword,
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  // 5. Seed Core Services Catalog matching Imagine 360 offerings
  const servicesData = [
    {
      name: '360° Virtual Tours',
      category: 'Spatial Capture',
      description: 'Immersive digital experiences for properties, hotels, resorts, commercial spaces and businesses.',
      price: 38000.00,
      duration: '4-7 business days',
    },
    {
      name: 'Drone & Aerial Capture',
      category: 'Aerial & Survey',
      description: 'Cinematic aerial photography, 4K/6K video, mapping and site documentation.',
      price: 24000.00,
      duration: '2-4 business days',
    },
    {
      name: '3D Visualization',
      category: 'Architectural CGI',
      description: 'Photorealistic architectural renders, walkthroughs and presentation visuals.',
      price: 18500.00,
      duration: '3-5 business days',
    },
    {
      name: 'Digital Twins',
      category: 'Spatial Computing',
      description: 'Interactive digital representations of real-world environments with spatial telemetry.',
      price: 85000.00,
      duration: '7-14 business days',
    },
    {
      name: 'Photogrammetry & LiDAR',
      category: 'Survey & Point Cloud',
      description: 'Spatial capture, mapping, reconstruction and BIM-ready data.',
      price: 120000.00,
      duration: '10-20 business days',
    },
    {
      name: 'Business Technology',
      category: 'SaaS & Platforms',
      description: 'Booking engines, billing systems, SaaS solutions and custom digital platforms.',
      price: 12500.00,
      duration: '10-15 business days',
    },
    {
      name: 'Essential Spatial Render',
      category: 'Spatial Capture',
      description: 'High-resolution architectural still rendering and 360° panoramic preview.',
      price: 18500.00,
      duration: '3-5 business days',
    },
    {
      name: 'Interactive 3D Walkthrough',
      category: 'Spatial Capture',
      description: 'Comprehensive 360° HDR spatial capture with integrated floorplan navigation.',
      price: 38000.00,
      duration: '4-7 business days',
    },
    {
      name: 'Enterprise Digital Twin',
      category: 'Spatial Computing',
      description: 'Full volumetric 3D digital twin with spatial telemetry and asset metadata.',
      price: 85000.00,
      duration: '7-14 business days',
    },
    {
      name: 'Site Recon & Cinematic Capture',
      category: 'Aerial & Survey',
      description: 'DGCA-compliant 4K/6K drone videography and panoramic aerial site mapping.',
      price: 24000.00,
      duration: '2-4 business days',
    },
    {
      name: 'Precision Photogrammetry & Orthomosaic',
      category: 'Aerial & Survey',
      description: 'Survey-grade 2D orthophotos and 3D digital surface reconstruction.',
      price: 55000.00,
      duration: '5-8 business days',
    },
    {
      name: 'Enterprise LiDAR & BIM Digital Twin',
      category: 'Survey & Point Cloud',
      description: 'Terrestrial laser scanning producing millimeter point clouds and Revit BIM models.',
      price: 120000.00,
      duration: '10-20 business days',
    },
    {
      name: 'GST SaaS Starter',
      category: 'SaaS & Platforms',
      description: 'Modern cloud-based GST billing and quotation platform for growing businesses.',
      price: 1499.00,
      duration: 'Instant onboarding',
    },
    {
      name: 'GST SaaS Business Pro',
      category: 'SaaS & Platforms',
      description: 'Multi-user business billing, expense tracking, inventory and client portal.',
      price: 3999.00,
      duration: '1 business day setup',
    },
    {
      name: 'Hospitality CRS',
      category: 'SaaS & Platforms',
      description: 'Essential direct booking engine and channel manager for boutique stays.',
      price: 5500.00,
      duration: '5-7 business days',
    },
  ];

  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }
  console.log(`✔ Seeded ${servicesData.length} Imagine 360 services.`);

  // 6. Seed Sample Initial CRM Customers & Leads for Verification (Real development workflow)
  const virtualTourService = await prisma.service.findFirst({ where: { name: '360° Virtual Tours' } });
  const droneService = await prisma.service.findFirst({ where: { name: 'Drone & Aerial Capture' } });
  const lidarService = await prisma.service.findFirst({ where: { name: 'Enterprise LiDAR & BIM Digital Twin' } });

  const sampleCustomers = [
    {
      name: 'Anand Deshpande',
      phone: '+919822012345',
      email: 'anand@horizonestates.in',
      company: 'Horizon Luxury Residences',
      city: 'Koregaon Park, Pune',
      source: 'Website Enquiry Form',
      leadStatus: 'WARM' as const,
      serviceId: virtualTourService?.id,
      notes: 'Interested in ultra-luxury penthouse 360° walkthrough. Requested pricing.',
      callOutcome: 'WARM' as const,
      followUpScheduled: true,
      followUpReason: 'Review quotation with developer partners',
    },
    {
      name: 'Pooja Kulkarni',
      phone: '+919850023456',
      email: 'pooja@sereneresorts.com',
      company: 'Serene Eco-Resort',
      city: 'Lonavala, Western Ghats',
      source: 'Direct Referral',
      leadStatus: 'HOT' as const,
      serviceId: droneService?.id,
      notes: 'Ready for site survey next Tuesday. Budget approved for 4K aerial film.',
      callOutcome: 'HOT' as const,
      followUpScheduled: false,
    },
    {
      name: 'Suresh Shinde',
      phone: '+919923034567',
      email: 'suresh@autocoreeng.com',
      company: 'AutoCore Precision Engineering',
      city: 'Bhosari MIDC, Pimpri',
      source: 'Cold Outreach',
      leadStatus: 'COLD' as const,
      serviceId: lidarService?.id,
      notes: 'Currently using legacy CAD blueprints. Not looking to invest in LiDAR scan this quarter.',
      callOutcome: 'COLD' as const,
      followUpScheduled: false,
    },
  ];

  for (const sc of sampleCustomers) {
    let customer = await prisma.customer.findFirst({ where: { phone: sc.phone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: sc.name,
          phone: sc.phone,
          email: sc.email,
          company: sc.company,
          city: sc.city,
          source: sc.source,
          assigned_to: salesUser.id,
        },
      });

      const lead = await prisma.lead.create({
        data: {
          customer_id: customer.id,
          service_id: sc.serviceId,
          status: sc.leadStatus,
          notes: sc.notes,
        },
      });

      // Log a historical call
      await prisma.callLog.create({
        data: {
          customer_id: customer.id,
          lead_id: lead.id,
          admin_id: salesUser.id,
          duration: 320,
          outcome: sc.callOutcome,
          notes: `Initial qualification call. ${sc.notes}`,
        },
      });

      if (sc.followUpScheduled) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await prisma.followUp.create({
          data: {
            customer_id: customer.id,
            lead_id: lead.id,
            assigned_to: salesUser.id,
            scheduled_date: tomorrow,
            scheduled_time: '11:30 AM',
            reason: sc.followUpReason || 'Follow-up call',
            status: 'PENDING',
          },
        });
      }

      // Add a sample enquiry for the WARM customer
      if (sc.leadStatus === 'WARM') {
        await prisma.enquiry.create({
          data: {
            customer_id: customer.id,
            project_type: '360° Virtual Tour',
            project_location: 'Koregaon Park, Pune',
            budget: '₹25,000 - ₹50,000',
            description: 'Require 8K HDR walkthrough for a sample 4BHK apartment with interactive floor plans.',
            status: 'QUALIFIED',
          },
        });
      }

      // Add a sample active project for the HOT customer
      if (sc.leadStatus === 'HOT') {
        const startDate = new Date();
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 14);
        await prisma.project.create({
          data: {
            customer_id: customer.id,
            service_id: sc.serviceId,
            project_name: 'Serene Eco-Resort Aerial Showcase & Survey',
            status: 'PLANNING',
            start_date: startDate,
            deadline: deadline,
            amount: 45000.00,
            assigned_to: staffUser.id,
            notes: 'DGCA clearance received. Aerial drone flight scheduled.',
          },
        });
      }
    }
  }

  console.log('✔ Sample CRM verification records populated.');
  console.log('\n==================================================');
  console.log('🔑 DEVELOPMENT SEED ACCOUNTS CONFIGURED:');
  console.log('Super Admin: admin@imagine360tours.in (Password configured via DEV_ADMIN_PASSWORD or default)');
  console.log('Sales:       sales@imagine360tours.in (Password configured via DEV_SALES_PASSWORD or default)');
  console.log('Staff:       staff@imagine360tours.in (Password configured via DEV_STAFF_PASSWORD or default)');
  console.log('User/Client: client@imagine360tours.in (Password configured via DEV_CLIENT_PASSWORD or default)');
  console.log('==================================================\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
