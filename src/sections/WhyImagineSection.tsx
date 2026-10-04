import React from 'react';
import { Badge } from '../components/Badge';
import { Eye, Box, Video, Cpu, ArrowUpRight } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

interface WhyImagineSectionProps {
  onStartProject: () => void;
}

export const WhyImagineSection: React.FC<WhyImagineSectionProps> = ({
  onStartProject
}) => {
  const capabilityBlocks = [
    {
      code: "01",
      title: "360°",
      subtitle: "IMMERSIVE EXPERIENCES",
      icon: Eye,
      accent: "from-[#00F2FE]/20 to-transparent",
      borderColor: "hover:border-[#00F2FE]/60",
      iconColor: "text-[#00F2FE]",
      desc: "Ultra-high dynamic range 8K-16K panoramic photography, guided tour scripts, custom interactive floorplans, and audio-visual hotspot overlays.",
      features: ["8K HDR spherical imagery", "Multi-floor navigation radar", "Interactive media hotspots", "Cross-platform WebXR"]
    },
    {
      code: "02",
      title: "3D",
      subtitle: "VISUALIZATION",
      icon: Box,
      accent: "from-[#4FACFE]/20 to-transparent",
      borderColor: "hover:border-[#4FACFE]/60",
      iconColor: "text-[#4FACFE]",
      desc: "Architectural 3D modeling, real-time lighting simulations, material fidelity, interior walkthrough animations, and unbuilt spatial prototyping.",
      features: ["Physically-based ray-tracing", "Parametric CAD/BIM conversion", "Sun-angle daylight simulation", "Unreal Engine 5 walkthroughs"]
    },
    {
      code: "03",
      title: "AERIAL",
      subtitle: "CAPTURE",
      icon: Video,
      accent: "from-[#38BDF8]/20 to-transparent",
      borderColor: "hover:border-[#38BDF8]/60",
      iconColor: "text-[#38BDF8]",
      desc: "DGCA-compliant drone operations, 4K/6K aerial cinematography, 2D orthomosaic maps, elevation models, and time-lapse construction documentation.",
      features: ["ProRes 4K/6K cinematography", "Georeferenced orthomosaic mapping", "Site elevation models", "Licensed commercial flight"]
    },
    {
      code: "04",
      title: "DIGITAL",
      subtitle: "TECHNOLOGY",
      icon: Cpu,
      accent: "from-[#8A2387]/20 to-transparent",
      borderColor: "hover:border-[#8A2387]/60",
      iconColor: "text-[#C084FC]",
      desc: "Central Reservation Systems (CRS), GST-compliant invoicing software, property availability engines, and real-time client analytics.",
      features: ["Custom direct booking engines", "Automated GST invoicing SaaS", "Interactive space reservation", "Zero-commission payment integration"]
    }
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden border-t border-white/10">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <Badge variant="cyan">THE SPATIAL ADVANTAGE</Badge>
            <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
              // Core Value Architecture
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-white uppercase leading-[1.05]">
            REALITY IS 3D.<br />
            <span className="text-gradient-cyan">YOUR DIGITAL PRESENCE SHOULD BE TOO.</span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-[#9BA3AE] max-w-2xl mx-auto leading-relaxed">
            Flat 2D photographs and static PDF brochures can no longer capture the depth, scale, and emotional atmosphere of modern architectural spaces.
          </p>
        </div>

        {/* 4 Visual Capability Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {capabilityBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.code}
                className={`relative rounded-2xl bg-[#101419] border border-white/10 ${block.borderColor} p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:shadow-2xl hover:-translate-y-1`}
              >
                {/* Subtle gradient corner */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${block.accent} pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100`} />

                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#07090C] border border-white/10 flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${block.iconColor}`} />
                      </div>
                      <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                        // CAPABILITY {block.code}
                      </span>
                    </div>

                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-white/20 group-hover:text-white/40 transition-colors">
                      {block.code}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">
                    {block.title}
                  </h3>
                  <div className={`font-mono text-xs font-semibold ${block.iconColor} tracking-wider uppercase mb-4`}>
                    {block.subtitle}
                  </div>

                  <p className="text-sm text-[#9BA3AE] leading-relaxed mb-6">
                    {block.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-2">
                  {block.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-mono text-[#CBD5E1]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#101419] via-[#131B24] to-[#101419] border border-[#00F2FE]/30 p-8 sm:p-12 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">
            Ready to Transform Your Real-World Space?
          </h3>
          <p className="text-sm sm:text-base text-[#9BA3AE] max-w-xl mx-auto mb-8">
            Consult directly with our Pune/Pimpri team to determine the optimal spatial capture, 3D rendering, or software workflow for your property.
          </p>
          <button
            onClick={onStartProject}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-tech font-bold text-sm bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all cursor-pointer"
          >
            <span>Start a Project Consultation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
