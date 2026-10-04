import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw, ZoomIn, ZoomOut, Layers, Radio, Sparkles, CheckCircle2, ChevronRight, Activity, Crosshair } from 'lucide-react';
import { Badge } from '../components/Badge';

interface Hotspot {
  id: string;
  title: string;
  tag: string;
  position: [number, number, number];
  metric: string;
  desc: string;
  status: 'OPTIMAL' | 'ACTIVE' | 'CALIBRATED';
  details: string[];
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'atrium-360',
    title: 'Double-Height Atrium',
    tag: '360° HDR Node #01',
    position: [0, 1.2, 1.4],
    metric: '16K Spherical HDR',
    desc: 'Central grand atrium with natural daylight skylight. Optical capture synchronized with floor plan waypoint.',
    status: 'ACTIVE',
    details: ['Color Gamut: DCI-P3 Calibrated', 'Dynamic Range: 14.2 EV Stops', 'Spatial Audio: Ambisonic B-format', 'Virtual Tour Anchor: Level 00 - Reception']
  },
  {
    id: 'structural-lidar',
    title: 'Cantilever Structural Truss',
    tag: 'LiDAR Telemetry #02',
    position: [1.8, 3.2, 0.5],
    metric: '±1.2mm Tolerance',
    desc: 'Dense terrestrial LiDAR scan verifying steel deflection and as-built alignment against BIM structural model.',
    status: 'CALIBRATED',
    details: ['Scan Density: 6.8 million pts/m²', 'Deviation vs CAD: 0.08% within ASTM E57', 'Point Cloud Format: LAS & IFC', 'Verification Date: Q3 Survey']
  },
  {
    id: 'mep-shaft',
    title: 'HVAC & MEP Smart Core',
    tag: 'Digital Twin Asset #03',
    position: [-1.6, 2.5, -0.8],
    metric: '2,400 CFM Telemetry',
    desc: 'Integrated digital twin layer linking physical airflow sensors and maintenance schedules to spatial geometry.',
    status: 'OPTIMAL',
    details: ['Chilled Water Loop: 7.2°C Supply', 'BIM Asset ID: MEP-AHU-CORE-B1', 'Preventive Service: 42 Days Remaining', 'IoT Telemetry: Live MQTT Stream']
  },
  {
    id: 'rooftop-solar',
    title: 'Skydeck & Solar Pavilion',
    tag: 'Aerial UAV Survey #04',
    position: [0.2, 4.8, 0],
    metric: '48.5 kWp Capacity',
    desc: 'Drone photogrammetry inspection showing solar panel tilt angles, shadow vectors, and viewing deck perimeter.',
    status: 'ACTIVE',
    details: ['UAV Survey Altitude: 45m AGL', 'Ground Sampling Distance: 1.1 cm/px', 'Irradiance Factor: 94.2%', 'Rooftop Lounge Sightlines: 360° Unobstructed']
  }
];

export const DigitalTwinViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(HOTSPOTS[0]);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');
  const [isRotating, setIsRotating] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(9);
  const [telemetryRotation, setTelemetryRotation] = useState({ x: 0, y: 35, z: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e14);
    scene.fog = new THREE.FogExp2(0x0a0e14, 0.05);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 6, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.8);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const secondaryLight = new THREE.DirectionalLight(0x4facfe, 1.2);
    secondaryLight.position.set(-10, 8, -10);
    scene.add(secondaryLight);

    const rimLight = new THREE.PointLight(0x8a2387, 2, 20);
    rimLight.position.set(0, -2, 0);
    scene.add(rimLight);

    // Building Root Group
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    // Ground Grid & Base Plinth
    const gridHelper = new THREE.GridHelper(24, 24, 0x00f2fe, 0x1b2838);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Plinth
    const plinthGeo = new THREE.BoxGeometry(7, 0.2, 6);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.8
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.1;
    buildingGroup.add(plinth);

    // Multi-tier Modern Architectural Model
    // 1. Lower Podium
    const podiumGeo = new THREE.BoxGeometry(5.2, 1.2, 4.4);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x111927,
      roughness: 0.3,
      metalness: 0.7
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = 0.8;
    buildingGroup.add(podium);

    // 2. Glass Tower Core
    const towerGeo = new THREE.BoxGeometry(3.6, 3.4, 3.2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f2fe,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85,
      ior: 1.5
    });
    const tower = new THREE.Mesh(towerGeo, glassMat);
    tower.position.set(0.2, 3.1, 0);
    buildingGroup.add(tower);

    // 3. Illuminated Floor Slabs
    for (let i = 1; i <= 4; i++) {
      const slabGeo = new THREE.BoxGeometry(3.8, 0.1, 3.4);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.15
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0.2, 1.4 + i * 0.8, 0);
      buildingGroup.add(slab);
    }

    // 4. Cantilevered Upper Terrace
    const cantileverGeo = new THREE.BoxGeometry(4.2, 0.4, 2.6);
    const cantileverMat = new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      metalness: 0.9,
      roughness: 0.2
    });
    const cantilever = new THREE.Mesh(cantileverGeo, cantileverMat);
    cantilever.position.set(0.6, 4.6, 0.5);
    buildingGroup.add(cantilever);

    // 5. Rooftop Canopy / Solar Truss
    const roofTrussGeo = new THREE.BoxGeometry(3.4, 0.15, 2.8);
    const roofTrussMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x4facfe,
      emissiveIntensity: 0.3
    });
    const roofTruss = new THREE.Mesh(roofTrussGeo, roofTrussMat);
    roofTruss.position.set(0.2, 5.0, 0);
    buildingGroup.add(roofTruss);

    // 6. Architectural Columns & Vertical Bracing
    for (let x of [-1.5, 1.7]) {
      for (let z of [-1.3, 1.3]) {
        const colGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.4, 16);
        const colMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 });
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(x + 0.2, 3.1, z);
        buildingGroup.add(col);
      }
    }

    // Wireframe Mesh for mode switching
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    // 3D Hotspot Spheres & Glow rings
    const hotspotMeshes: { id: string; mesh: THREE.Group }[] = [];
    HOTSPOTS.forEach((spot) => {
      const hGroup = new THREE.Group();
      hGroup.position.set(...spot.position);

      const dotGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      hGroup.add(dot);

      const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0x00f2fe, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      hGroup.add(ring);

      buildingGroup.add(hGroup);
      hotspotMeshes.push({ id: spot.id, mesh: hGroup });
    });

    // Raycasting for hotspot click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      for (const item of hotspotMeshes) {
        const intersects = raycaster.intersectObjects(item.mesh.children);
        if (intersects.length > 0) {
          const found = HOTSPOTS.find(h => h.id === item.id);
          if (found) {
            setActiveHotspot(found);
            break;
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // Orbit Drag Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      buildingGroup.rotation.y += deltaX * 0.008;
      buildingGroup.rotation.x = Math.max(-0.4, Math.min(0.6, buildingGroup.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };

      setTelemetryRotation({
        x: Math.round(buildingGroup.rotation.x * 57.3),
        y: Math.round((buildingGroup.rotation.y % (Math.PI * 2)) * 57.3),
        z: 0
      });
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.005;
      const newDist = Math.max(5, Math.min(14, camera.position.length() + zoomFactor));
      camera.position.setLength(newDist);
      setCameraDistance(Math.round(newDist));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow auto rotation if enabled
      if (isRotating && !isDragging) {
        buildingGroup.rotation.y += 0.003;
        setTelemetryRotation(prev => ({
          ...prev,
          y: Math.round((buildingGroup.rotation.y % (Math.PI * 2)) * 57.3)
        }));
      }

      // Animate hotspot pulse
      hotspotMeshes.forEach((item, index) => {
        const ring = item.mesh.children[1];
        if (ring) {
          const scale = 1 + Math.sin(elapsedTime * 3 + index) * 0.25;
          ring.scale.set(scale, scale, scale);
        }
      });

      // Update material by renderMode
      if (renderMode === 'wireframe') {
        (tower as any).material = wireframeMat;
        (podium as any).material = wireframeMat;
        (cantilever as any).material = wireframeMat;
      } else if (renderMode === 'xray') {
        (tower as any).material = new THREE.MeshBasicMaterial({ color: 0x8a2387, wireframe: true, transparent: true, opacity: 0.6 });
        (podium as any).material = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: false, transparent: true, opacity: 0.25 });
        (cantilever as any).material = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
      } else {
        (tower as any).material = glassMat;
        (podium as any).material = podiumMat;
        (cantilever as any).material = cantileverMat;
      }

      camera.lookAt(0, 2.5, 0);
      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight || 550;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('pointerdown', onPointerDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [renderMode, isRotating]);

  return (
    <section id="digital-twin" className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden border-t border-b border-white/10">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#00F2FE]/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="cyan">DIGITAL TWIN / 01</Badge>
              <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                // Interactive 3D Spatial Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white uppercase max-w-2xl leading-[1.1]">
              DON'T JUST SHOW IT.<br />
              <span className="text-gradient-cyan">LET PEOPLE EXPERIENCE IT.</span>
            </h2>
          </div>
          <p className="text-[#9BA3AE] text-base max-w-md">
            Transform physical environments into interactive digital experiences. Orbit, zoom, inspect structural tolerances, and click real-time spatial telemetry nodes.
          </p>
        </div>

        {/* 3D Canvas Box + HUD UI */}
        <div className="relative rounded-2xl border border-white/15 bg-[#0A0E14] overflow-hidden shadow-2xl">
          {/* Top Technical Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#101419]/90 backdrop-blur-md z-20 relative">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
                <span className="font-mono text-xs font-semibold text-white">SPATIAL SCANNER V4.2</span>
              </div>
              <span className="hidden sm:inline-block text-xs font-mono text-[#9BA3AE]">
                LAT: 18.6279° N | LON: 73.8009° E (PUNE)
              </span>
            </div>

            {/* Mode Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#07090C] rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setRenderMode('solid')}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                    renderMode === 'solid' ? 'bg-[#00F2FE] text-[#07090C] font-bold' : 'text-[#9BA3AE] hover:text-white'
                  }`}
                  title="Photorealistic architectural glass & lighting"
                >
                  Solid PBR
                </button>
                <button
                  onClick={() => setRenderMode('wireframe')}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                    renderMode === 'wireframe' ? 'bg-[#00F2FE] text-[#07090C] font-bold' : 'text-[#9BA3AE] hover:text-white'
                  }`}
                  title="LiDAR Point Mesh & Wireframe"
                >
                  LiDAR Mesh
                </button>
                <button
                  onClick={() => setRenderMode('xray')}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                    renderMode === 'xray' ? 'bg-[#00F2FE] text-[#07090C] font-bold' : 'text-[#9BA3AE] hover:text-white'
                  }`}
                  title="X-Ray Structural Heatmap"
                >
                  X-Ray
                </button>
              </div>

              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`p-2 rounded-lg border transition-colors ${
                  isRotating
                    ? 'border-[#00F2FE]/40 bg-[#00F2FE]/10 text-[#00F2FE]'
                    : 'border-white/10 bg-[#07090C] text-[#9BA3AE] hover:text-white'
                }`}
                title="Toggle Auto-Rotation"
              >
                <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative h-[480px] sm:h-[620px] w-full select-none cursor-grab active:cursor-grabbing">
            {webglSupported ? (
              <div ref={mountRef} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090C] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#101419] border border-white/15 flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-[#00F2FE]" />
                </div>
                <h4 className="text-xl font-heading font-bold text-white mb-2">WebGL Hardware Acceleration Inactive</h4>
                <p className="text-sm text-[#9BA3AE] max-w-md mb-6">
                  Interactive 3D viewing operates best with GPU acceleration enabled. You can still preview our high-definition renders and virtual tours below.
                </p>
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
                  alt="3D Spatial Architecture Rendering Fallback"
                  className="rounded-xl max-h-60 object-cover border border-white/10"
                />
              </div>
            )}

            {/* In-Canvas HUD Elements (Overlaid) */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none hidden sm:block">
              <div className="glass-panel rounded-lg p-3 text-xs font-mono space-y-1 text-[#9BA3AE] border border-white/10">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span>CAMERA TELEMETRY</span>
                </div>
                <div>ROT Y: {telemetryRotation.y}°</div>
                <div>ROT X: {telemetryRotation.x}°</div>
                <div>RANGE: {cameraDistance}m</div>
                <div className="text-[#00F2FE] pt-1 border-t border-white/10">INTERACTIVE HOTSPOTS: 4</div>
              </div>
            </div>

            {/* In-Canvas Instruction Tag */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
              <div className="bg-[#07090C]/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 font-mono text-[11px] text-[#9BA3AE] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F2FE]" />
                <span>Drag to Orbit • Scroll to Zoom • Click Hotspots</span>
              </div>
            </div>

            {/* Hotspot Drawer Panel (Right Side) */}
            {activeHotspot && (
              <div className="absolute top-4 right-4 z-20 max-w-xs sm:max-w-sm w-full bg-[#101419]/95 backdrop-blur-xl border border-white/15 rounded-xl p-4 sm:p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00F2FE]" />
                    <span className="font-mono text-xs text-[#00F2FE] uppercase tracking-wider">
                      {activeHotspot.tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                    {activeHotspot.status}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-heading font-bold text-white mb-1">
                  {activeHotspot.title}
                </h4>
                <div className="font-mono text-xs text-white/90 font-semibold mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span>Metric: {activeHotspot.metric}</span>
                </div>
                <p className="text-xs text-[#9BA3AE] mb-3 leading-relaxed">
                  {activeHotspot.desc}
                </p>

                {/* Details List */}
                <div className="space-y-1.5 border-t border-white/10 pt-3 mb-4">
                  {activeHotspot.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-mono text-[#CBD5E1]">
                      <span className="w-1 h-1 rounded-full bg-[#00F2FE]" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Hotspot Switchers */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="font-mono text-[10px] text-[#9BA3AE] uppercase">Select Node:</span>
                  <div className="flex items-center gap-1">
                    {HOTSPOTS.map((h, i) => (
                      <button
                        key={h.id}
                        onClick={() => setActiveHotspot(h)}
                        className={`w-6 h-6 rounded text-xs font-mono transition-all cursor-pointer ${
                          activeHotspot.id === h.id
                            ? 'bg-[#00F2FE] text-[#07090C] font-bold shadow-[0_0_8px_#00F2FE]'
                            : 'bg-white/5 text-[#9BA3AE] hover:text-white'
                        }`}
                      >
                        0{i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10 bg-[#0D1117] divide-x divide-white/10">
            <div className="p-3 sm:p-4 text-center">
              <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">SURVEY PRECISION</div>
              <div className="text-sm sm:text-base font-mono font-bold text-white">± 1.2 Millimeters</div>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">POINT DENSITY</div>
              <div className="text-sm sm:text-base font-mono font-bold text-[#00F2FE]">6.8M Pts / m²</div>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">FRAMEWORK</div>
              <div className="text-sm sm:text-base font-mono font-bold text-white">WebGL / WebXR Native</div>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">INTERACTIVE HOTSPOTS</div>
              <div className="text-sm sm:text-base font-mono font-bold text-[#4FACFE]">4 Verified Telemetry Nodes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
