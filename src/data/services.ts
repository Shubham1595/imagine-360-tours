import { Service } from '../types';

export const SERVICES: Service[] = [
  {
    id: "360-virtual-tours",
    number: "01",
    name: "360° VIRTUAL TOURS",
    shortDesc: "Immersive digital experiences for properties, hotels, resorts, commercial spaces and businesses.",
    fullDesc: "We create immersive 360-degree virtual tours that allow prospective buyers, guests, and clients to freely navigate properties as if they were physically present. Featuring high dynamic range capture, interactive floor plans, multi-level navigation, and multimedia information hotspots.",
    features: [
      "Ultra-crisp 8K HDR spherical captures",
      "Interactive 2D & 3D floorplan synchronization",
      "Embedded media hotspots (video, brochures, inquiry popups)",
      "VR headset & multi-device compatibility",
      "Google Street View & website embed integration"
    ],
    deliverables: [
      "Self-hosted HTML5 tour bundle",
      "High-res spherical panorama originals",
      "Interactive floor plan assets",
      "Cloud-hosted link with custom branding"
    ],
    techStack: ["Insta360 Pro 2", "Matterport Pro3", "Pano2VR", "WebXR", "Three.js"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    badge: "Immersive Spatial Walkthrough"
  },
  {
    id: "drone-aerial-capture",
    number: "02",
    name: "DRONE & AERIAL CAPTURE",
    shortDesc: "Cinematic aerial photography, video, mapping and site documentation.",
    fullDesc: "High-resolution drone cinematography and technical aerial surveys capturing angles impossible from the ground. Perfect for large-scale real estate, resort landscapes, construction progress monitoring, and industrial site documentation.",
    features: [
      "Cinematic 4K/6K ProRes aerial videography",
      "High-altitude 360° aerial panoramas",
      "Periodic time-lapse construction tracking",
      "Elevation & surrounding infrastructure contextualization",
      "Licensed and safety-certified UAV flight protocols"
    ],
    deliverables: [
      "Color-graded 4K/6K aerial film clips",
      "High-resolution aerial master stills",
      "Georeferenced site overview orthophotos",
      "Web & social media optimized video cuts"
    ],
    techStack: ["DJI Inspire 3", "DJI Mavic 3 Cine", "4K HDR Aerial Rig", "DaVinci Resolve"],
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop",
    badge: "Cinematic & Technical UAV"
  },
  {
    id: "3d-visualization",
    number: "03",
    name: "3D VISUALIZATION",
    shortDesc: "Photorealistic architectural renders, walkthroughs and presentation visuals.",
    fullDesc: "Bring unbuilt architecture and design concepts into vivid reality. We transform 2D CAD drawings, blueprints, and BIM plans into photorealistic exterior and interior architectural renderings, fly-through animations, and interactive spatial presentations.",
    features: [
      "Physically based material rendering & daylight simulation",
      "Cinematic interior & exterior architectural walkthroughs",
      "Photorealistic furniture staging & landscaping",
      "Pre-construction investor presentation decks",
      "Virtual show-apartment simulations"
    ],
    deliverables: [
      "Ultra-high resolution static render stills (up to 8K)",
      "60fps cinematic architectural fly-through videos",
      "360° virtual render panoramas",
      "Interactive material variation previews"
    ],
    techStack: ["Unreal Engine 5", "3ds Max", "V-Ray", "Blender", "Twinmotion"],
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    badge: "Architectural CGI"
  },
  {
    id: "digital-twins",
    number: "04",
    name: "DIGITAL TWINS",
    shortDesc: "Interactive digital representations of real-world environments.",
    fullDesc: "Create an exact, real-time spatial replica of your facility, hotel, or infrastructure. Our digital twins bridge visual immersion with spatial telemetry, asset tagging, and remote inspection capabilities.",
    features: [
      "Dimensionally accurate volumetric 3D mesh",
      "Real-time interactive orbit & walkthrough modes",
      "Custom IoT & asset metadata hotspot tags",
      "Facility management and space planning tools",
      "Accessible via modern web browsers with no software install"
    ],
    deliverables: [
      "Interactive WebGL/Three.js digital twin viewer",
      "OBJ/GLTF textured 3D mesh files",
      "Interactive spatial annotation database",
      "Exportable measurement reports"
    ],
    techStack: ["Matterport Cloud API", "Three.js", "WebAssembly", "glTF / USDZ", "Meshlab"],
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?q=80&w=1200&auto=format&fit=crop",
    badge: "Spatial Telemetry & 3D Web"
  },
  {
    id: "photogrammetry-lidar",
    number: "05",
    name: "PHOTOGRAMMETRY & LiDAR",
    shortDesc: "Spatial capture, mapping, reconstruction and BIM-ready data.",
    fullDesc: "Industrial-grade spatial digitisation utilizing structured light and laser scanning (LiDAR) coupled with multi-angle photogrammetry. Produces high-density point clouds and BIM-ready models for architectural restoration, civil engineering, and digital archives.",
    features: [
      "Millimeter-level laser scanning point clouds",
      "High-density mesh textured from 100+ Megapixel imagery",
      "CAD-ready as-built floorplans and elevations",
      "BIM (Building Information Modeling) conversion compatibility",
      "Orthomosaic 2D geographic maps with coordinate datum"
    ],
    deliverables: [
      "LAS / LAZ / E57 dense point cloud files",
      "Georeferenced GeoTIFF orthomosaic maps",
      "BIM-compatible IFC / Revit-ready 3D geometry",
      "CAD vector 2D floor plans & cross sections"
    ],
    techStack: ["Faro Focus LiDAR", "DJI Zenmuse L2", "RealityCapture", "Agisoft Metashape", "AutoCAD / Revit"],
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    badge: "Point Cloud & BIM Survey"
  },
  {
    id: "business-technology",
    number: "06",
    name: "BUSINESS TECHNOLOGY",
    shortDesc: "Booking engines, billing systems, SaaS solutions and custom digital platforms.",
    fullDesc: "Complete digital infrastructure built around spatial properties and commercial operations. We engineer robust Central Reservation Systems (CRS), GST-compliant invoicing software, custom client portals, and interactive booking engines.",
    features: [
      "Custom hospitality booking engines & direct reservation portals",
      "Automated GST billing, quotation & invoice generators",
      "Interactive floor-plan availability & desk/room reservations",
      "Payment gateway integration (Razorpay, Stripe, UPI)",
      "Admin analytics dashboard for occupancy & revenue metrics"
    ],
    deliverables: [
      "Cloud-hosted web application & custom domain deployment",
      "Admin management & reporting dashboard",
      "Role-based staff access controls",
      "RESTful API & webhook integrations"
    ],
    techStack: ["Next.js / React", "Node.js / Express", "PostgreSQL", "Razorpay / UPI", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    badge: "Custom SaaS & Booking Engines"
  }
];
