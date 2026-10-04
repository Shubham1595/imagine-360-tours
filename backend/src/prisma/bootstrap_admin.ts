/**
 * Production Database Bootstrap Script
 *
 * Securely provisions the initial SUPER_ADMIN account and core service catalog.
 * DOES NOT create demo users, fake customers, dummy leads, or test credentials.
 *
 * Usage:
 *   ADMIN_EMAIL="admin@imagine360tours.in" ADMIN_PASSWORD="<secure-password>" npx tsx src/prisma/bootstrap_admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CORE_SERVICES = [
  {
    name: '360° Virtual Tours',
    slug: '360-virtual-tours',
    category: 'Spatial Capture',
    short_description: 'Interactive walkthroughs & VR experiences for commercial, hospitality & real estate spaces.',
    description: 'Immersive digital experiences for properties, hotels, resorts, commercial spaces and businesses.',
    price: 38000.00,
    duration: '4-7 business days',
    is_active: true,
    is_visible: true,
    is_featured: true,
    display_order: 1,
  },
  {
    name: 'Drone & Aerial Capture',
    slug: 'drone-aerial-capture',
    category: 'Aerial & Survey',
    short_description: 'High-resolution aerial 4K/6K cinema video, oblique mapping, and site documentation.',
    description: 'Cinematic aerial photography, 4K/6K video, mapping and site documentation.',
    price: 24000.00,
    duration: '2-4 business days',
    is_active: true,
    is_visible: true,
    is_featured: true,
    display_order: 2,
  },
  {
    name: '3D Visualization',
    slug: '3d-visualization',
    category: 'Architectural CGI',
    short_description: 'Photorealistic architectural CGI renders, flythrough animations, and presentation visuals.',
    description: 'Photorealistic architectural renders, walkthroughs and presentation visuals.',
    price: 18500.00,
    duration: '3-5 business days',
    is_active: true,
    is_visible: true,
    is_featured: true,
    display_order: 3,
  },
  {
    name: 'Digital Twins',
    slug: 'digital-twins',
    category: 'Spatial Computing',
    short_description: 'Interactive digital twin replicas of physical spaces with IoT and spatial telemetry.',
    description: 'Interactive digital representations of real-world environments with spatial telemetry.',
    price: 85000.00,
    duration: '7-14 business days',
    is_active: true,
    is_visible: true,
    is_featured: true,
    display_order: 4,
  },
  {
    name: 'Photogrammetry & LiDAR',
    slug: 'photogrammetry-lidar',
    category: 'Survey & Point Cloud',
    short_description: 'High-precision millimeter LiDAR scanning, dense point clouds, and BIM-ready datasets.',
    description: 'Spatial capture, mapping, reconstruction and BIM-ready data.',
    price: 120000.00,
    duration: '10-20 business days',
    is_active: true,
    is_visible: true,
    is_featured: true,
    display_order: 5,
  },
  {
    name: 'Business Technology',
    slug: 'business-technology',
    category: 'SaaS & Platforms',
    short_description: 'Custom booking engines, interactive web platforms, and spatial software integrations.',
    description: 'Booking engines, billing systems, SaaS solutions and custom digital platforms.',
    price: 12500.00,
    duration: '10-15 business days',
    is_active: true,
    is_visible: true,
    is_featured: true,
    display_order: 6,
  },
];

const BASELINE_SETTINGS = [
  { key: 'company_name', value: 'Imagine 360 Tours', category: 'general', is_public: true },
  { key: 'legal_name', value: 'Imagine 360 Tours', category: 'general', is_public: true },
  { key: 'tagline', value: 'See Your World From Every Angle.', category: 'general', is_public: true },
  { key: 'subheading', value: '360° experiences, aerial capture, 3D visualization and spatial technology that turn real spaces into unforgettable digital experiences.', category: 'general', is_public: true },
  { key: 'phone', value: '+91 9561909070', category: 'contact', is_public: true },
  { key: 'phone_display', value: '+91 95619 09070', category: 'contact', is_public: true },
  { key: 'email', value: 'Imagine360tours@gmail.com', category: 'contact', is_public: true },
  { key: 'address', value: 'Pune / Pimpri-Chinchwad, Maharashtra, India', category: 'contact', is_public: true },
  { key: 'business_hours', value: 'Mon - Sat: 9:00 AM - 7:00 PM IST', category: 'contact', is_public: true },
  { key: 'whatsapp', value: 'https://wa.me/919561909070', category: 'social', is_public: true },
  { key: 'instagram', value: 'https://instagram.com/imagine360tours', category: 'social', is_public: true },
  { key: 'linkedin', value: 'https://linkedin.com/company/imagine360tours', category: 'social', is_public: true },
  { key: 'youtube', value: 'https://youtube.com/@imagine360tours', category: 'social', is_public: true },
  { key: 'seo_title', value: 'Imagine 360 Tours | 3D Digital Twins, LiDAR & Spatial Capture', category: 'seo', is_public: true },
  { key: 'seo_description', value: 'Next-generation 360° virtual tours, 3D laser scanning LiDAR, BIM point clouds and aerial drone surveys in Pune, Pimpri-Chinchwad & India.', category: 'seo', is_public: true },
];

async function bootstrap() {
  console.log('============================================================');
  console.log('STARTING PRODUCTION BOOTSTRAP (SUPER_ADMIN & CORE SERVICES)');
  console.log('============================================================\n');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@imagine360tours.in').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Ashish (Super Admin)';
  const adminPhone = process.env.ADMIN_PHONE || '+919561909070';

  if (!adminPassword || adminPassword.length < 8) {
    console.error('ERROR: ADMIN_PASSWORD environment variable is required and must be at least 8 characters long.');
    console.error('Example: ADMIN_PASSWORD="your-strong-production-password" npx tsx src/prisma/bootstrap_admin.ts');
    process.exit(1);
  }

  // 1. Seed Core Services Catalog
  console.log('1. Checking Core Services Catalog...');
  for (const s of CORE_SERVICES) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
      console.log(`   ✔ Created service: ${s.name}`);
    } else {
      console.log(`   - Service already exists: ${s.name}`);
    }
  }

  // 2. Seed Baseline Website Settings
  console.log('\n2. Checking Baseline Website Settings...');
  for (const item of BASELINE_SETTINGS) {
    const existing = await prisma.websiteSetting.findUnique({ where: { key: item.key } });
    if (!existing) {
      await prisma.websiteSetting.create({ data: item });
      console.log(`   ✔ Created website setting: ${item.key}`);
    } else {
      console.log(`   - Website setting already exists: ${item.key}`);
    }
  }

  // 3. Check for existing SUPER_ADMIN
  console.log('\n3. Checking SUPER_ADMIN account...');
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: 'SUPER_ADMIN' },
      ],
    },
  });

  if (existingAdmin) {
    console.log(`   ✔ A SUPER_ADMIN account already exists (${existingAdmin.email}).`);
    console.log('   Preserving existing account without modifying credentials.');
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password_hash: passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log(`   ✔ Successfully provisioned initial SUPER_ADMIN: ${newAdmin.email}`);
  }

  console.log('\n============================================================');
  console.log('PRODUCTION BOOTSTRAP COMPLETED SUCCESSFULLY');
  console.log('============================================================\n');
}

bootstrap()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Bootstrap failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
