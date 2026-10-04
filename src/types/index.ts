export interface Service {
  id: string;
  number: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  deliverables: string[];
  techStack: string[];
  image: string;
  badge: string;
  linkText?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: '360°' | 'DRONE' | '3D' | 'ARCHITECTURE' | 'COMMERCIAL' | 'DIGITAL';
  clientType: string;
  location: string;
  year: string;
  heroImage: string;
  galleryImages: string[];
  overview: string;
  challenge: string;
  solution: string;
  results: string[];
  deliverables: string[];
  interactiveType?: '360' | '3D' | 'drone' | 'bim';
  tags: string[];
}

export interface PricingPlan {
  id: string;
  category: 'Spatial' | 'Aerial & Survey' | 'SaaS & Billing' | 'CRS & Hospitality';
  name: string;
  tagline: string;
  startingPrice: string;
  priceNote?: string;
  duration?: string;
  idealFor: string;
  popular?: boolean;
  deliverables: string[];
  features: string[];
}

export interface Industry {
  id: string;
  name: string;
  tag: string;
  valueProp: string;
  description: string;
  useCases: string[];
  image: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  tagline: string;
  description: string;
  tools: string[];
  deliverable: string;
}
