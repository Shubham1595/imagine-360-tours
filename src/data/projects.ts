import { Project } from '../types';

export const PROJECTS: Project[] = [
  {
    id: "luxury-residence-pune",
    slug: "luxury-residence",
    title: "Luxury Residence",
    category: "360°",
    clientType: "High-End Residential Developer",
    location: "Koregaon Park, Pune",
    year: "2025",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop"
    ],
    overview: "A flagship ultra-luxury penthouse development required an immersive digital presentation to engage high-net-worth NRI and remote buyers without requiring immediate in-person site visits.",
    challenge: "The client needed to convey bespoke marble textures, expansive ceiling heights, and customized ambient lighting accurately across remote devices while integrating live floorplans.",
    solution: "Engineered an 8K HDR 360° virtual tour with synchronized multi-level floor plan navigators, custom interactive finish switchers, and audio-guided walkthrough chapters.",
    results: [
      "Enabled remote NRI buyers across Dubai and Singapore to tour with zero latency",
      "Integrated directly into high-converting sales gallery iPads and web landing page",
      "Reduced unqualified walk-in site visits by 40% while accelerating verified deals"
    ],
    deliverables: [
      "Interactive 360° Web Tour with custom branding",
      "Synchronized 2D architectural floor plan overlay",
      "High-resolution panorama archival pack",
      "Embeddable iframe and QR code promotional kit"
    ],
    interactiveType: "360",
    tags: ["360° VR", "Ultra-Luxury", "Floorplan Sync", "High-End Residential"]
  },
  {
    id: "resort-aerial-survey-lonavala",
    slug: "resort-aerial-survey",
    title: "Resort Aerial Survey",
    category: "DRONE",
    clientType: "Luxury Eco-Hospitality Group",
    location: "Lonavala / Western Ghats",
    year: "2025",
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
    ],
    overview: "A 45-acre hillside eco-resort property required both a cinematic marketing film and a georeferenced topographic survey for expansion planning and villa placement.",
    challenge: "Steep elevation changes, heavy tree canopy, and variable mountain wind conditions required precision flight planning and DGCA-compliant safety envelopes.",
    solution: "Conducted automated dual-grid UAV flights using high-resolution drone cameras to generate cinematic 4K video reels and an accurate 2D orthomosaic elevation model.",
    results: [
      "Produced a viral promotional aerial film utilized across international hospitality campaigns",
      "Provided engineering teams with accurate topographic contour overlays",
      "Identified ideal scenic vantage points for future infinity pool construction"
    ],
    deliverables: [
      "4K 60fps cinematic aerial showcase film",
      "High-resolution 360° aerial sky panoramas",
      "Georeferenced orthomosaic site map (GeoTIFF)",
      "Digital Surface Model (DSM) elevation dataset"
    ],
    interactiveType: "drone",
    tags: ["Aerial Cinematography", "Orthomosaic", "Resort & Eco-Tourism", "Drone Survey"]
  },
  {
    id: "commercial-property-pimpri",
    slug: "commercial-property",
    title: "Commercial Property",
    category: "COMMERCIAL",
    clientType: "Commercial Real Estate Fund",
    location: "Bhosari MIDC / Pimpri, Pune",
    year: "2024",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
    ],
    overview: "A modern Grade-A IT & manufacturing commercial campus spanning 250,000 sq.ft. needed a comprehensive leasing portal with interactive floor inspection.",
    challenge: "Prospective corporate tenants wanted to visualize floor plate dividability, electrical/HVAC shafts, and loading dock access without disrupting existing operational tenants.",
    solution: "Created an all-in-one commercial leasing twin combining 360° floor inspections, drone campus fly-arounds, and customizable tenant division layouts.",
    results: [
      "Accelerated corporate lease negotiations by presenting interactive space options",
      "Enabled facilities management to tag structural and utility access panels",
      "Achieved 100% occupancy within 5 months of marketing launch"
    ],
    deliverables: [
      "Full-campus 360° commercial tour",
      "Drone aerial campus approach & parking coverage",
      "Space planning CAD layouts & floorplate schematics",
      "Digital brochure integration with direct leasing inquiry CTA"
    ],
    interactiveType: "360",
    tags: ["Commercial Real Estate", "Grade-A Office", "Campus Virtual Tour", "Leasing Portal"]
  },
  {
    id: "architectural-concept-baner",
    slug: "architectural-concept",
    title: "Architectural Concept",
    category: "3D",
    clientType: "Modern Architecture Practice",
    location: "Baner, Pune",
    year: "2025",
    heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop"
    ],
    overview: "Photorealistic 3D visualization and animated walkthrough for a proposed biophilic mixed-use commercial tower prior to municipal sanctioning and groundbreaking.",
    challenge: "Accurately depicting complex parametric wooden louvers, natural canopy lighting, and glass reflectivity under different sunlight angles throughout the day.",
    solution: "Built a high-fidelity 3D model in Unreal Engine with ray-traced global illumination, lush botanical assets, and cinematic camera choreography.",
    results: [
      "Approved unanimously by the developer board and investment partners",
      "Featured across architectural journals and pre-launch promotional billboards",
      "Allowed mechanical and structural engineers to detect facade clearance clashes early"
    ],
    deliverables: [
      "Cinematic 4K 60fps walkthrough film",
      "Set of 12 ultra-high-resolution 8K marketing renders",
      "Day/Night transition lighting studies",
      "Interactive 360° panoramic rendered hotspots"
    ],
    interactiveType: "3D",
    tags: ["Architectural CGI", "Unreal Engine 5", "Photorealistic 3D", "Biophilic Design"]
  },
  {
    id: "hospitality-experience-goa",
    slug: "hospitality-experience",
    title: "Hospitality Experience",
    category: "COMMERCIAL",
    clientType: "Boutique Heritage Resort",
    location: "North Goa / Konkan Coast",
    year: "2024",
    heroImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
    ],
    overview: "A seaside luxury boutique resort wanted to elevate its direct booking conversion rate and reduce dependency on high-commission OTA portals.",
    challenge: "Static photos failed to convey the seamless connection between the private plunge pool villas, beach access, and garden dining pavilions.",
    solution: "Delivered a complete visual suite: 360° room walkthroughs, sunset drone footage, and a custom direct booking engine with interactive villa selection.",
    results: [
      "Increased direct website reservations by 34% in the first quarter",
      "Guests spend an average of 4.2 minutes interacting with the 360° tour",
      "Seamless integration with their existing CRS & GST invoicing system"
    ],
    deliverables: [
      "Interactive 360° Resort Navigation Experience",
      "Drone sunset & beachfront promotional video",
      "Direct room reservation booking module integration",
      "Optimized assets for Google Hotel Listings & Street View"
    ],
    interactiveType: "360",
    tags: ["Hospitality", "Resort 360", "Direct Booking Engine", "Drone Video"]
  },
  {
    id: "digital-twin-facility-chakan",
    slug: "digital-twin",
    title: "Digital Twin",
    category: "DIGITAL",
    clientType: "Automotive Precision Manufacturer",
    location: "Chakan Industrial Corridor, Pune",
    year: "2025",
    heroImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop"
    ],
    overview: "A high-precision auto component manufacturing plant required an interactive spatial digital twin for overseas executive audits, equipment inventory, and vendor training.",
    challenge: "Complex machinery clusters, tight pipe networks, and strict security protocols with zero interference permitted on active assembly lines.",
    solution: "Carried out precision LiDAR terrestrial scanning and high-density photogrammetry to generate a browser-based 3D digital twin with IoT telemetry and machinery spec overlays.",
    results: [
      "Enabled German and Japanese technical teams to audit plant layout remotely",
      "Reduced vendor site visits by 65% during new robotics assembly line integration",
      "Integrated machine maintenance history directly into spatial hotspot tags"
    ],
    deliverables: [
      "Browser-accessible 3D Digital Twin model with hotspot telemetry",
      "Full dense point cloud dataset (E57 format)",
      "BIM-compatible Revit as-built structural model",
      "Detailed spatial dimension inspection report"
    ],
    interactiveType: "bim",
    tags: ["Digital Twin", "LiDAR Survey", "Industrial IoT", "BIM 3D", "Smart Factory"]
  }
];
