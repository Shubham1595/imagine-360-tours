import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CORE_SERVICES = [
  {
    name: '360° Virtual Tours',
    slug: '360-virtual-tours',
    category: 'Spatial Capture',
    short_description: 'Immersive digital experiences for properties, hotels, resorts, commercial spaces and businesses.',
    description: 'We create immersive 360-degree virtual tours that allow prospective buyers, guests, and clients to freely navigate properties as if they were physically present. Featuring high dynamic range capture, interactive floor plans, multi-level navigation, and multimedia information hotspots.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
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
    short_description: 'Cinematic aerial photography, video, mapping and site documentation.',
    description: 'High-resolution drone cinematography and technical aerial surveys capturing angles impossible from the ground. Perfect for large-scale real estate, resort landscapes, construction progress monitoring, and industrial site documentation.',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop',
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
    short_description: 'Photorealistic architectural renders, walkthroughs and presentation visuals.',
    description: 'Bring unbuilt architecture and design concepts into vivid reality. We transform 2D CAD drawings, blueprints, and BIM plans into photorealistic exterior and interior architectural renderings, fly-through animations, and interactive spatial presentations.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
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
    short_description: 'Interactive digital representations of real-world environments.',
    description: 'Create an exact, real-time spatial replica of your facility, hotel, or infrastructure. Our digital twins bridge visual immersion with spatial telemetry, asset tagging, and remote inspection capabilities.',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?q=80&w=1200&auto=format&fit=crop',
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
    short_description: 'Spatial capture, mapping, reconstruction and BIM-ready data.',
    description: 'Industrial-grade spatial digitisation utilizing structured light and laser scanning (LiDAR) coupled with multi-angle photogrammetry. Produces high-density point clouds and BIM-ready models for architectural restoration, civil engineering, and digital archives.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
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
    short_description: 'Booking engines, billing systems, SaaS solutions and custom digital platforms.',
    description: 'Complete digital infrastructure built around spatial properties and commercial operations. We engineer robust Central Reservation Systems (CRS), GST-compliant invoicing software, custom client portals, and interactive booking engines.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    price: 12500.00,
    duration: '10-15 business days',
    is_active: true,
    is_visible: true,
    is_featured: true,
    display_order: 6,
  },
];

const DEFAULT_SETTINGS = [
  { key: 'company_name', value: 'Imagine 360 Tours', category: 'general', is_public: true },
  { key: 'legal_name', value: 'Imagine 360 Tours', category: 'general', is_public: true },
  { key: 'tagline', value: 'See Your World From Every Angle.', category: 'general', is_public: true },
  { key: 'subheading', value: '360° experiences, aerial capture, 3D visualization and spatial technology that turn real spaces into unforgettable digital experiences.', category: 'general', is_public: true },
  { key: 'phone', value: '+91 9561909070', category: 'contact', is_public: true },
  { key: 'phone_display', value: '+91 95619 09070', category: 'contact', is_public: true },
  { key: 'email', value: 'Imagine360tours@gmail.com', category: 'contact', is_public: true },
  { key: 'address', value: 'Pune / Pimpri-Chinchwad, Maharashtra, India', category: 'contact', is_public: true },
  { key: 'business_hours', value: 'Mon - Sat: 9:00 AM - 7:00 PM IST', category: 'business', is_public: true },
  { key: 'whatsapp', value: 'https://wa.me/919561909070', category: 'social', is_public: true },
  { key: 'instagram', value: 'https://instagram.com/imagine360tours', category: 'social', is_public: true },
  { key: 'linkedin', value: 'https://linkedin.com/company/imagine360tours', category: 'social', is_public: true },
  { key: 'youtube', value: 'https://youtube.com/@imagine360tours', category: 'social', is_public: true },
  { key: 'seo_title', value: 'Imagine 360 Tours | 3D Digital Twins, LiDAR & Spatial Capture', category: 'seo', is_public: true },
  { key: 'seo_description', value: 'Next-generation 360° virtual tours, 3D laser scanning LiDAR, BIM point clouds and aerial drone surveys in Pune, Pimpri-Chinchwad & India.', category: 'seo', is_public: true },
];

async function seedCms() {
  console.log('🚀 Initializing CMS Services & Website Settings...');

  // 1. Seed or update core services
  for (const svc of CORE_SERVICES) {
    const existing = await prisma.service.findFirst({
      where: {
        OR: [
          { name: svc.name },
          { slug: svc.slug },
        ],
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          slug: svc.slug,
          short_description: existing.short_description || svc.short_description,
          image: existing.image || svc.image,
          display_order: existing.display_order || svc.display_order,
          is_active: existing.is_active !== undefined ? existing.is_active : true,
          is_visible: existing.is_visible !== undefined ? existing.is_visible : true,
          is_featured: existing.is_featured !== undefined ? existing.is_featured : true,
        },
      });
      console.log(`✔ Updated CMS fields for service: ${svc.name}`);
    } else {
      await prisma.service.create({
        data: svc,
      });
      console.log(`✔ Created service: ${svc.name}`);
    }
  }

  // 2. Seed website settings
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.websiteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✔ Seeded ${DEFAULT_SETTINGS.length} website settings.`);

  console.log('✅ CMS Initialization Complete.');
}

seedCms()
  .catch((e) => {
    console.error('CMS seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
