import React from 'react';
import { Badge } from '../components/Badge';
import { COMPANY_INFO } from '../data/company';
import { CheckCircle2, ShieldCheck, Target, Layers, Cpu, Compass, MapPin } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-4xl mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="cyan">ABOUT IMAGINE 360</Badge>
            <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
              // Studio Context
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-white uppercase leading-[1.05]">
            WE BUILD EXPERIENCES<br />
            <span className="text-gradient-cyan">AROUND REAL SPACES.</span>
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-[#CBD5E1] leading-relaxed">
            Imagine 360 Tours operates at the intersection of visual storytelling, spatial technology, and digital software solutions. We help property developers, architects, hoteliers, and industrial operators capture, communicate, and commercialize physical real estate.
          </p>
        </div>

        {/* 3 Core Intersection Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-[#101419] border border-white/10 hover:border-[#00F2FE]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#07090C] border border-white/10 flex items-center justify-center text-[#00F2FE] mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <div className="font-mono text-xs text-[#00F2FE] uppercase tracking-wider mb-2">01 // VISUAL</div>
            <h3 className="text-2xl font-heading font-bold text-white mb-3">
              Visual Storytelling
            </h3>
            <p className="text-sm text-[#9BA3AE] leading-relaxed">
              Cinematic camera movement, HDR dynamic range balance, tailored architectural lighting, and narrative scene sequencing that highlight spatial grandeur.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#101419] border border-white/10 hover:border-[#4FACFE]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#07090C] border border-white/10 flex items-center justify-center text-[#4FACFE] mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <div className="font-mono text-xs text-[#4FACFE] uppercase tracking-wider mb-2">02 // SPATIAL</div>
            <h3 className="text-2xl font-heading font-bold text-white mb-3">
              Spatial Technology
            </h3>
            <p className="text-sm text-[#9BA3AE] leading-relaxed">
              Industrial-grade LiDAR scanning, photogrammetric dense point clouds, calibrated RTK drone aerial mapping, and BIM-compatible coordinate registration.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#101419] border border-white/10 hover:border-[#8A2387]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#07090C] border border-white/10 flex items-center justify-center text-[#C084FC] mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="font-mono text-xs text-[#C084FC] uppercase tracking-wider mb-2">03 // SOFTWARE</div>
            <h3 className="text-2xl font-heading font-bold text-white mb-3">
              Digital Solutions
            </h3>
            <p className="text-sm text-[#9BA3AE] leading-relaxed">
              Interactive WebXR/WebGL viewers, Central Reservation Systems (CRS), GST billing software, and custom booking engines that turn viewers into revenue.
            </p>
          </div>
        </div>

        {/* Mission & Approach Detailed Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Mission */}
          <div className="lg:col-span-5 bg-[#101419] p-8 sm:p-10 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#00F2FE]">
                <Target className="w-5 h-5" />
                <span className="font-mono text-xs uppercase tracking-wider font-semibold">Our Mission</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
                Bridging Physical Reality and the Web
              </h3>
              <p className="text-base text-[#CBD5E1] leading-relaxed mb-6">
                "{COMPANY_INFO.mission}"
              </p>
              <p className="text-sm text-[#9BA3AE] leading-relaxed">
                Rather than treating 360° capture as simple photography, we approach spatial documentation as a rigorous engineering and visual discipline designed to deliver measurable commercial value.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-[#9BA3AE]">
              <MapPin className="w-4 h-4 text-[#00F2FE]" />
              <span>Headquartered in Pune / Pimpri-Chinchwad, Maharashtra</span>
            </div>
          </div>

          {/* Approach */}
          <div className="lg:col-span-7 bg-[#101419] p-8 sm:p-10 rounded-2xl border border-white/10 space-y-6">
            <div className="flex items-center gap-2 text-[#00F2FE]">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">Our Technical Approach</span>
            </div>

            <div className="space-y-6">
              {COMPANY_INFO.approach.map((item, idx) => (
                <div key={idx} className="pb-5 border-b border-white/10 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-heading font-bold text-lg text-white">
                      0{idx + 1}. {item.title}
                    </span>
                  </div>
                  <p className="text-sm text-[#9BA3AE] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Hardware & Stack (Factual) */}
        <div className="rounded-2xl bg-[#0D1117] border border-white/10 p-8 sm:p-10">
          <div className="max-w-2xl mb-8">
            <div className="font-mono text-xs text-[#00F2FE] uppercase tracking-wider mb-2">
              // PRODUCTION HARDWARE & SOFTWARE
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Calibrated Capture & Computing Stack
            </h3>
            <p className="text-sm text-[#9BA3AE] mt-2">
              We leverage standardized industrial capture gear and modern rendering pipelines to ensure consistent color accuracy, geometric fidelity, and high framerates.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#07090C] border border-white/5">
              <span className="text-[#00F2FE] block mb-1">OPTICAL & 360°</span>
              <span className="text-white font-semibold">Insta360 Pro 2 / Matterport Pro3</span>
            </div>
            <div className="p-4 rounded-xl bg-[#07090C] border border-white/5">
              <span className="text-[#00F2FE] block mb-1">UAV & AERIAL</span>
              <span className="text-white font-semibold">DJI Inspire 3 & Mavic Cine</span>
            </div>
            <div className="p-4 rounded-xl bg-[#07090C] border border-white/5">
              <span className="text-[#00F2FE] block mb-1">3D ENGINES</span>
              <span className="text-white font-semibold">Unreal Engine 5 / Three.js</span>
            </div>
            <div className="p-4 rounded-xl bg-[#07090C] border border-white/5">
              <span className="text-[#00F2FE] block mb-1">SURVEY & GIS</span>
              <span className="text-white font-semibold">LiDAR Point Cloud / Revit BIM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
