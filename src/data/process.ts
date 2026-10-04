import { ProcessStep } from '../types';

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "CAPTURE",
    tagline: "High-Fidelity Reality Ingestion",
    description: "Our field team conducts precision scanning using calibrated 360° optical rigs, DGCA-compliant aerial UAV drones, and millimeter-accuracy LiDAR scanners on-site.",
    tools: ["8K HDR 360° Rig", "RTK Drone System", "Terrestrial LiDAR", "Ground Control Points"],
    deliverable: "Raw high-density optical datasets & raw point-clouds"
  },
  {
    number: "02",
    title: "PROCESS",
    tagline: "Spatial Data Processing & Reconstruction",
    description: "Raw optical and geometric telemetry are photogrammetrically aligned, color-calibrated, and registered into mathematically cohesive coordinate frames and clean meshes.",
    tools: ["Photogrammetry Clusters", "Point-Cloud Registration", "Color Gamut Calibration", "Noise Decimation"],
    deliverable: "Dense aligned 3D point cloud & georeferenced spatial mesh"
  },
  {
    number: "03",
    title: "CREATE",
    tagline: "3D Modeling, Textures & Interactivity",
    description: "Our digital artists and spatial developers build photorealistic shaders, daylight simulation, interactive navigation nodes, and hotspot data triggers.",
    tools: ["Unreal Engine", "Three.js", "PBR Texture Pipelines", "UI Hotspot Authoring"],
    deliverable: "Interactive 3D scene, architectural renders & spatial overlays"
  },
  {
    number: "04",
    title: "EXPERIENCE",
    tagline: "Virtual Tours, Digital Twins & Polish",
    description: "Every visual layer is tested for seamless interaction across mobile, desktop, tablet, and VR headsets. Multi-floor plans, asset tags, and soundscapes are synced.",
    tools: ["WebXR Engine", "Touch Navigation Controls", "Floorplan Radar Sync", "Device Benchmarking"],
    deliverable: "Turnkey immersive viewer with sub-second responsive interaction"
  },
  {
    number: "05",
    title: "DEPLOY",
    tagline: "Website, Marketing & SaaS Integration",
    description: "We deploy the final assets directly into your digital workflow: website embeds, direct reservation engines, GST invoicing systems, and high-converting marketing campaigns.",
    tools: ["Cloud CDN Hosting", "Iframe API Embeds", "Direct Booking Engines", "Analytics Integration"],
    deliverable: "Live digital experience with performance metrics & client handoff"
  }
];
