import React from 'react';
import { Badge } from '../components/Badge';
import { Eye, Layers, Scan, Cpu, Sparkles } from 'lucide-react';

export const IntroSection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#00F2FE]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Intro Statement Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="cyan">SPATIAL PHILOSOPHY</Badge>
              <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                // Studio Manifesto
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-white uppercase leading-[1.04]">
              REAL SPACE.<br />
              <span className="text-gradient-accent">DIGITAL EXPERIENCE.</span>
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pl-6 border-l border-white/10 space-y-6">
            <p className="text-lg sm:text-xl text-[#CBD5E1] font-normal leading-relaxed">
              We combine visual storytelling, spatial capture and technology to help businesses present their spaces in ways people can explore, understand and remember.
            </p>
            <p className="text-sm sm:text-base text-[#9BA3AE] leading-relaxed">
              Based in Pune and Pimpri-Chinchwad, we work at the crossroads of architectural visualization, aerial cinematography, and spatial computing to deliver interactive digital assets that convert attention into bookings and sales.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#101419] border border-white/10">
                <div className="flex items-center gap-2 text-white font-tech font-semibold text-sm mb-1">
                  <Scan className="w-4 h-4 text-[#00F2FE]" />
                  <span>Sub-Millimeter</span>
                </div>
                <div className="text-xs text-[#9BA3AE]">Ground-truth reality accuracy</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#101419] border border-white/10">
                <div className="flex items-center gap-2 text-white font-tech font-semibold text-sm mb-1">
                  <Layers className="w-4 h-4 text-[#4FACFE]" />
                  <span>Zero-Install</span>
                </div>
                <div className="text-xs text-[#9BA3AE]">Interactive WebXR & WebGL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Large Cinematic Visual Showcase with Technical Scanning Overlays */}
        <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#101419] group shadow-2xl">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop"
              alt="High-Fidelity 3D Architectural Spatial Visualization"
              className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090C] via-transparent to-transparent opacity-80" />

            {/* Scanning Line Effect */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00F2FE] to-transparent opacity-75 animate-pulse" />

            {/* Overlaid HUD Pins */}
            <div className="absolute top-8 left-8 hidden sm:flex items-center gap-2 bg-[#07090C]/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-white">
              <span className="w-2 h-2 rounded-full bg-[#00F2FE]" />
              <span>SPATIAL RECONSTRUCTION MODE: ENABLED</span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-[#00F2FE] uppercase tracking-wider">
                  Case In Point • Architectural Visual
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
                  Physical Realism Meets Interactive Freedom
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#CBD5E1] bg-[#07090C]/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10">
                  8K Panorama • WebXR Compatible
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
