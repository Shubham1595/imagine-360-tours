import { Industry } from '../types';

export const INDUSTRIES: Industry[] = [
  {
    id: "real-estate",
    name: "REAL ESTATE",
    tag: "Residential & Commercial Brokerage",
    valueProp: "Sell and lease properties faster with interactive spatial walk-throughs that close out-of-town buyers.",
    description: "Empower potential homeowners, investors, and corporate tenants to experience properties 24/7 with realistic dimension perception, floor-plan navigation, and immersive 360° panoramas.",
    useCases: ["Luxury penthouses & gated communities", "Commercial office floor plates", "Pre-sale show-flats & sample apartments", "Google Street View property presence"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "hotels-resorts",
    name: "HOTELS & RESORTS",
    tag: "Hospitality & Experiential Venues",
    valueProp: "Elevate direct booking conversions by showcasing scenic views, luxury suites, and event spaces.",
    description: "Let travelers explore their exact room category, private balconies, poolside cabanas, and banquet halls before confirming their stay, eliminating reservation anxiety and boosting direct revenue.",
    useCases: ["Boutique luxury resort tours", "Destination wedding lawn inspections", "Conference room 360 interactive layouts", "Direct booking engine integration"],
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "architecture",
    name: "ARCHITECTURE",
    tag: "Design Studios & Interior Firms",
    valueProp: "Bring blueprint concepts to life with hyper-realistic CGI, dynamic lighting, and spatial prototypes.",
    description: "Bridge the gap between technical drafts and client imagination with photorealistic 3D visual models, walkthrough animations, and interactive material switchers.",
    useCases: ["Pre-construction investor presentations", "Daylight & sun angle analysis renders", "Material & finish variation switchers", "Virtual unbuilt walkthroughs"],
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "construction",
    name: "CONSTRUCTION",
    tag: "EPC, Contractors & Project Management",
    valueProp: "Monitor milestone progress, verify as-built conditions, and prevent costly structural disputes.",
    description: "Periodic drone orthomosaics and high-resolution 360° site logs provide stakeholder clarity, verify contractor timelines, and document MEP installation prior to wall sealing.",
    useCases: ["Monthly drone progress logs", "Pre-pour and MEP spatial documentation", "As-built BIM clash inspections", "Subcontractor milestone audits"],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "retail",
    name: "RETAIL & SHOWROOMS",
    tag: "Flagships, Dealerships & Boutiques",
    valueProp: "Turn flagship physical storefronts into interactive shoppable digital showrooms.",
    description: "Allow customers worldwide to explore your brand interior, click on display items for instant specifications or purchase links, and discover your physical presence.",
    useCases: ["Shoppable luxury boutique tours", "Automotive showroom vehicle walk-arounds", "Franchise brand standardization audits", "Virtual storefronts with cart sync"],
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "industrial",
    name: "INDUSTRIAL & PLANTS",
    tag: "Manufacturing, Warehouses & Energy",
    valueProp: "Enable remote engineering audits, safety orientations, and digital twin asset tracking.",
    description: "Scan complex factories and distribution centers with LiDAR precision to create operational digital twins that reduce travel costs and improve plant safety protocols.",
    useCases: ["Factory layout optimization", "Remote OEM technician equipment audits", "Safety induction virtual training", "Asset metadata hotspot tagging"],
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "education",
    name: "EDUCATION & CAMPUSES",
    tag: "Universities, Schools & Research Centers",
    valueProp: "Engage outstation and international students with interactive virtual campus open-days.",
    description: "Give prospective students, parents, and researchers a detailed walk-around of academic halls, high-tech laboratories, sports complexes, and hostel amenities.",
    useCases: ["Virtual admissions open days", "Campus orientation map overlays", "Specialized lab & research facility tours", "Alumni fundraising presentations"],
    image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "events",
    name: "EVENTS & VENUES",
    tag: "Convention Centers & Experiential Arenas",
    valueProp: "Streamline event planner negotiations with spatial dimensions and stage sightline previews.",
    description: "Enable event organizers to inspect stage heights, seating sightlines, entry gates, and stall layouts in 360°, accelerating booking decisions and sponsorship commitments.",
    useCases: ["Exhibition hall booth layout previews", "Concert stadium sightline simulations", "Banquet seating configuration tests", "Sponsor branding placement reviews"],
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop"
  }
];
