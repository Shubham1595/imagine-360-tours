import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Compass, ShieldCheck, Play, Scan, Box, Layers, Video } from 'lucide-react';
import { Badge } from '../components/Badge';
import { TechnicalGrid } from '../components/TechnicalGrid';

interface HeroSectionProps {
  onExploreWork: () => void;
  onStartProject: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreWork,
  onStartProject
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 sm:py-32 overflow-hidden bg-[#07090C]">
      {/* Background Grid & Vignette */}
      <TechnicalGrid />

      {/* Floating Technical Labels (Interactive parallax position) */}
      <div 
        className="absolute top-28 left-[8%] hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#101419]/80 backdrop-blur-md transition-transform duration-300 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * -12}px, ${mousePosition.y * -12}px)`
        }}
      >
        <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />
        <span className="font-mono text-xs tracking-widest text-[#FFFFFF]">360° CAPTURE</span>
        <span className="text-[10px] font-mono text-[#9BA3AE]">8K HDR</span>
      </div>

      <div 
        className="absolute top-36 right-[10%] hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#101419]/80 backdrop-blur-md transition-transform duration-300 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 16}px, ${mousePosition.y * 16}px)`
        }}
      >
        <Scan className="w-3.5 h-3.5 text-[#00F2FE]" />
        <span className="font-mono text-xs tracking-widest text-[#FFFFFF]">SPATIAL DATA</span>
        <span className="text-[10px] font-mono text-[#9BA3AE]">LiDAR / BIM</span>
      </div>

      <div 
        className="absolute bottom-28 left-[12%] hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#101419]/80 backdrop-blur-md transition-transform duration-300 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * -18}px, ${mousePosition.y * 18}px)`
        }}
      >
        <Box className="w-3.5 h-3.5 text-[#4FACFE]" />
        <span className="font-mono text-xs tracking-widest text-[#FFFFFF]">3D VISUALIZATION</span>
        <span className="text-[10px] font-mono text-[#9BA3AE]">Ray-Traced CGI</span>
      </div>

      <div 
        className="absolute bottom-32 right-[12%] hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#101419]/80 backdrop-blur-md transition-transform duration-300 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 14}px, ${mousePosition.y * -14}px)`
        }}
      >
        <Layers className="w-3.5 h-3.5 text-[#8A2387]" />
        <span className="font-mono text-xs tracking-widest text-[#FFFFFF]">DIGITAL TWIN</span>
        <span className="text-[10px] font-mono text-[#9BA3AE]">WebXR Telemetry</span>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="cyan">IMAGINE 360 TOURS • PUNE / PIMPRI</Badge>
          <span className="hidden sm:inline-block font-mono text-xs text-[#9BA3AE]">
            Spatial Technology & Visual Experiences
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight text-white uppercase leading-[1.05] sm:leading-[1.02] mb-8">
          SEE YOUR WORLD<br />
          <span className="text-gradient-cyan">FROM EVERY ANGLE.</span>
        </h1>

        {/* Subheading */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-[#9BA3AE] font-normal leading-relaxed mb-10">
          360° experiences, aerial capture, 3D visualization and spatial technology that turn real spaces into unforgettable digital experiences.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-14">
          <button
            onClick={onExploreWork}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-tech font-bold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_35px_rgba(0,242,254,0.45)] hover:scale-[1.02] transition-all cursor-pointer shadow-lg"
          >
            <span>Explore Our Work</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onStartProject}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-tech font-semibold bg-[#101419] text-white border border-white/15 hover:border-[#00F2FE]/50 hover:bg-[#161C24] hover:shadow-[0_0_20px_rgba(0,242,254,0.2)] transition-all cursor-pointer"
          >
            <span>Start a Project</span>
            <ArrowUpRight className="w-5 h-5 text-[#00F2FE]" />
          </button>
        </div>

        {/* Spatial Preview Hero Card with Mouse Tilt */}
        <div 
          className="relative max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-2xl transition-transform duration-200"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * -3}deg) rotateY(${mousePosition.x * 4}deg)`
          }}
        >
          <div className="relative rounded-xl overflow-hidden bg-[#0A0E14] border border-white/10 group aspect-[16/9] sm:aspect-[21/9]">
            {/* Cinematic Background Architectural Drone Image */}
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"
              alt="Cinematic Modern Architectural Environment"
              className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-105"
            />

            {/* Spatial Overlay UI */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090C] via-transparent to-black/30 pointer-events-none" />

            {/* Radar Corner Scope */}
            <div className="absolute top-4 left-4 flex items-center gap-3 bg-[#07090C]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
              <span>LIVE SPATIAL DEMO</span>
              <span className="text-[#9BA3AE] hidden sm:inline">• 4K HDR SENSOR</span>
            </div>

            {/* Center Interactive Anchor */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={onExploreWork}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#07090C]/80 hover:bg-[#00F2FE] text-white hover:text-[#07090C] border border-white/20 hover:border-[#00F2FE] backdrop-blur-xl transition-all duration-300 group/btn cursor-pointer shadow-2xl"
              >
                <div className="w-7 h-7 rounded-full bg-[#00F2FE]/20 group-hover/btn:bg-[#07090C]/20 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span className="font-tech text-xs sm:text-sm font-semibold tracking-wide uppercase">
                  View Spatial Showreel
                </span>
              </button>
            </div>

            {/* Bottom Telemetry Strip */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#9BA3AE] bg-[#07090C]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>PIMPRI-CHINCHWAD • PUNE</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <span>LAT 18.6279° N</span>
                <span>LON 73.8009° E</span>
                <span className="text-[#00F2FE]">360° SPATIAL ENGINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
