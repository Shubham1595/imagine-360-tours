import { PricingPlan } from '../types';

export const PRICING_SERVICES: PricingPlan[] = [
  // 1. Spatial & Virtual Tours
  {
    id: "essential-spatial-render",
    category: "Spatial",
    name: "Essential Spatial Render",
    tagline: "High-resolution architectural still rendering and 360° panoramic preview.",
    startingPrice: "₹18,500",
    priceNote: "Starting estimate / project scope dependent",
    duration: "3 - 5 business days",
    idealFor: "Architects, interior designers, and individual property sellers",
    deliverables: [
      "2-3 Ultra-HD 4K architectural renders",
      "1x 360° Interactive Panoramic Web Viewer",
      "Color grading & daylight adjustment",
      "Commercial marketing rights"
    ],
    features: [
      "Physically accurate texture mapping",
      "Interior / Exterior view options",
      "Social media ready formats",
      "Web iframe embed code"
    ]
  },
  {
    id: "interactive-3d-walkthrough",
    category: "Spatial",
    name: "Interactive 3D Walkthrough",
    tagline: "Comprehensive 360° HDR spatial capture with integrated floorplan navigation.",
    startingPrice: "₹38,000",
    priceNote: "Standard up to 2,500 sq.ft.",
    duration: "4 - 7 business days",
    idealFor: "Luxury residential projects, boutique hotels, commercial showrooms",
    popular: true,
    deliverables: [
      "Full 360° HDR virtual tour walkthrough",
      "Interactive 2D schematic floor plan",
      "Up to 15 multimedia information hotspots",
      "1-year hosted link & cloud maintenance"
    ],
    features: [
      "Custom branded interface & logo overlay",
      "Measurement inspection tool",
      "Mobile, desktop & VR headset responsive",
      "Google Street View sync option"
    ]
  },
  {
    id: "enterprise-digital-twin",
    category: "Spatial",
    name: "Enterprise Digital Twin",
    tagline: "Full volumetric 3D digital twin with spatial telemetry and asset metadata.",
    startingPrice: "₹85,000",
    priceNote: "Custom quote based on square footage & complexity",
    duration: "7 - 14 business days",
    idealFor: "Commercial campuses, industrial facilities, large resort properties",
    deliverables: [
      "Complete 3D textured mesh & digital twin model",
      "Web-accessible spatial telemetry viewer",
      "Asset metadata tagging & IoT linkage ready",
      "Raw OBJ/glTF file exports"
    ],
    features: [
      "Infinite orbit & dollhouse visual perspective",
      "Collaborative inspection annotations",
      "Security-controlled access tiers",
      "Enterprise cloud hosting SLA"
    ]
  },

  // 2. Aerial & Survey
  {
    id: "site-recon-cinematic-capture",
    category: "Aerial & Survey",
    name: "Site Recon & Cinematic Capture",
    tagline: "DGCA-compliant 4K/6K drone videography and panoramic aerial site mapping.",
    startingPrice: "₹24,000",
    priceNote: "Per flight session / location",
    duration: "2 - 4 business days",
    idealFor: "Real estate developers, construction firms, event venues",
    deliverables: [
      "Master 4K aerial cinematic film reel",
      "10x High-resolution aerial master stills",
      "High-altitude 360° aerial sky panorama",
      "Raw uncompressed footage archive"
    ],
    features: [
      "Licensed commercial UAV pilot operation",
      "ProRes / 10-bit D-Log color profile",
      "Surrounding landmark & connectivity highlight",
      "Safety compliant airspace clearances"
    ]
  },
  {
    id: "precision-photogrammetry-orthomosaic",
    category: "Aerial & Survey",
    name: "Precision Photogrammetry & Orthomosaic",
    tagline: "Survey-grade 2D orthophotos and 3D digital surface reconstruction.",
    startingPrice: "₹55,000",
    priceNote: "Up to 15 acres baseline",
    duration: "5 - 8 business days",
    idealFor: "Civil engineers, land developers, solar installation planners",
    deliverables: [
      "Georeferenced GeoTIFF orthomosaic map",
      "Digital Surface Model (DSM) & elevation contours",
      "Volumetric cut/fill measurement report",
      "Point cloud data (.LAS / .XYZ)"
    ],
    features: [
      "Sub-5cm Ground Sampling Distance (GSD)",
      "Ground Control Points (GCP) alignment",
      "GIS & AutoCAD compatibility",
      "Topographic terrain visualization"
    ]
  },
  {
    id: "enterprise-lidar-bim-twin",
    category: "Aerial & Survey",
    name: "Enterprise LiDAR & BIM Digital Twin",
    tagline: "Terrestrial laser scanning producing millimeter point clouds and Revit BIM models.",
    startingPrice: "₹1,20,000",
    priceNote: "Engineering scope evaluated per site",
    duration: "10 - 20 business days",
    idealFor: "Heritage restoration, MEP contractors, industrial plant engineering",
    deliverables: [
      "Dense millimeter point cloud (.E57 / .RCP)",
      "LOD 200 - 350 BIM Architectural/Structural model",
      "As-built 2D CAD elevations and floorplans",
      "Deviation & clash detection report"
    ],
    features: [
      "Terrestrial phase-shift laser accuracy (±2mm)",
      "Full interior and exterior scan registration",
      "Revit / ArchiCAD / Navisworks native delivery",
      "Structural deformation verification"
    ]
  },

  // 3. SaaS & Billing
  {
    id: "gst-saas-starter",
    category: "SaaS & Billing",
    name: "GST SaaS Starter",
    tagline: "Modern cloud-based GST billing and quotation platform for growing businesses.",
    startingPrice: "₹1,499 / mo",
    priceNote: "Billed annually or ₹1,999 monthly",
    duration: "Instant onboarding",
    idealFor: "Independent contractors, creative studios, spatial freelancers",
    deliverables: [
      "GST-compliant automated invoices & e-way bills",
      "Custom branded invoice templates",
      "Payment link generation with UPI & QR",
      "Basic sales tax & GSTR summary reports"
    ],
    features: [
      "Single admin account with 500 invoices/mo",
      "Client management CRM",
      "Automated WhatsApp & Email delivery",
      "Cloud data backup & SSL security"
    ]
  },
  {
    id: "gst-saas-business-pro",
    category: "SaaS & Billing",
    name: "GST SaaS Business Pro",
    tagline: "Multi-user business billing, expense tracking, inventory and client portal.",
    startingPrice: "₹3,999 / mo",
    priceNote: "Billed annually or ₹4,999 monthly",
    duration: "1 business day setup",
    idealFor: "Commercial agencies, architectural firms, mid-sized enterprises",
    popular: true,
    deliverables: [
      "Multi-branch GST accounting & reconciliation",
      "Dedicated client approval portal",
      "Inventory & asset tracking modules",
      "Direct CA / Accountant export format"
    ],
    features: [
      "Up to 10 staff seats with permission controls",
      "E-invoicing government API integration",
      "Recurring billing & auto payment reminders",
      "Priority phone & WhatsApp support"
    ]
  },
  {
    id: "gst-saas-enterprise",
    category: "SaaS & Billing",
    name: "GST SaaS Enterprise",
    tagline: "Tailored enterprise ERP/billing platform with custom integrations & SLA.",
    startingPrice: "Custom Quote",
    priceNote: "Tailored to organizational volume",
    duration: "2 - 4 weeks implementation",
    idealFor: "Multi-entity corporations, hotel groups, large industrial distributors",
    deliverables: [
      "Custom ERP & accounting database deployment",
      "Bespoke payment workflow automation",
      "Dedicated account manager & 99.9% SLA",
      "Custom API endpoints for legacy ERP sync"
    ],
    features: [
      "Unlimited users & transactions",
      "On-premise or private cloud hosting option",
      "Custom security audits & compliance reports",
      "Dedicated training sessions for finance teams"
    ]
  },

  // 4. CRS & Hospitality
  {
    id: "hospitality-crs",
    category: "CRS & Hospitality",
    name: "Hospitality CRS",
    tagline: "Essential direct booking engine and channel manager for boutique stays.",
    startingPrice: "₹5,500 / mo",
    priceNote: "+ One-time setup fee",
    duration: "5 - 7 business days",
    idealFor: "Boutique villas, homestays, single-property boutique hotels",
    deliverables: [
      "Direct website booking widget with instant payment",
      "Interactive 360° room selector module",
      "Two-way calendar sync with Airbnb & OTAs",
      "Guest confirmation automated SMS & Email"
    ],
    features: [
      "Zero commission on direct reservations",
      "Integrated UPI & international card payments",
      "Promo codes & seasonal dynamic pricing",
      "Mobile-friendly guest check-in portal"
    ]
  },
  {
    id: "hotels-resorts-crs",
    category: "CRS & Hospitality",
    name: "Hotels & Resorts CRS",
    tagline: "Full-scale Central Reservation System with multi-room inventory & food/beverage add-ons.",
    startingPrice: "₹12,500 / mo",
    priceNote: "Designed for 20-100 room properties",
    duration: "10 - 15 business days",
    idealFor: "Mid-to-large luxury resorts, boutique hotel groups, experiential stays",
    popular: true,
    deliverables: [
      "Multi-category room & villa inventory engine",
      "Add-on packages (Spa, Dining, Tours) booking flow",
      "Full integration with PMS and front-desk software",
      "Interactive spatial resort map navigation"
    ],
    features: [
      "Real-time dynamic yield management",
      "Corporate rate & agent portal login",
      "GST auto-split billing at checkout",
      "Comprehensive revenue analytics dashboard"
    ]
  },
  {
    id: "hotel-chains-groups-crs",
    category: "CRS & Hospitality",
    name: "Hotel Chains & Groups CRS",
    tagline: "Enterprise multi-property CRS, loyalty rewards system, and unified customer profiles.",
    startingPrice: "Custom Quote",
    priceNote: "Multi-property enterprise infrastructure",
    duration: "3 - 6 weeks implementation",
    idealFor: "Hotel chains, resort collections, hospitality management companies",
    deliverables: [
      "Unified multi-destination search & reservation hub",
      "Guest loyalty points and member tier architecture",
      "Centralized revenue and distribution control center",
      "Deep API connectivity to Opera, Fidelio, and custom PMS"
    ],
    features: [
      "Multi-currency & multi-language engine",
      "White-labeled custom mobile web application",
      "Dedicated technical architect and 24/7 mission-critical support",
      "Custom spatial 360° virtual tour suite integration"
    ]
  }
];
