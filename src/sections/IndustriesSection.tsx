import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, ChevronRight, Building2, Hotel, Compass, Hammer, ShoppingBag, Factory, GraduationCap, PartyPopper } from 'lucide-react';
import { INDUSTRIES } from '../data/industries';
import { Industry } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

interface IndustriesSectionProps {
  onStartProjectForIndustry?: (industryName: string) => void;
}

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({
  onStartProjectForIndustry
}) => {
  const [activeIndustry, setActiveIndustry] = useState<Industry | null>(null);

  const industryIcons: Record<string, any> = {
    'real-estate': Building2,
    'hotels-resorts': Hotel,
    'architecture': Compass,
    'construction': Hammer,
    'retail': ShoppingBag,
    'industrial': Factory,
    'education': GraduationCap,
    'events': PartyPopper
  };

  return (
    <section id="industries" className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="cyan">SECTOR EXPERTISE</Badge>
              <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                // Domain Adaptations
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white uppercase leading-tight">
              BUILT FOR <span className="text-gradient-cyan">REAL-WORLD SPACES</span>
            </h2>
          </div>
          <p className="text-[#9BA3AE] text-base max-w-md">
            Tailored spatial scanning, CGI modeling, and software workflows engineered around specific industry economics and physical workflows.
          </p>
        </div>

        {/* 8 Interactive Industry Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INDUSTRIES.map((ind) => {
            const Icon = industryIcons[ind.id] || Building2;
            return (
              <div
                key={ind.id}
                onClick={() => setActiveIndustry(ind)}
                className="group relative rounded-2xl bg-[#101419] border border-white/10 hover:border-[#00F2FE]/50 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-between hover:shadow-[0_10px_30px_-10px_rgba(0,242,254,0.2)] hover:-translate-y-1.5"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0E14]">
                  <img
                    src={ind.image}
                    alt={ind.name}
                    className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.1] transition-transform duration-700 group-hover:scale-110 group-hover:brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-[#101419]/40 to-transparent pointer-events-none" />

                  {/* Icon */}
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-lg bg-[#07090C]/85 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#00F2FE]">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Arrow */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#07090C]/85 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-[#00F2FE] group-hover:text-[#07090C] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-white group-hover:text-[#00F2FE] transition-colors mb-2 tracking-tight">
                      {ind.name}
                    </h3>
                    <p className="text-xs text-[#9BA3AE] leading-relaxed line-clamp-2">
                      {ind.valueProp}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#CBD5E1] group-hover:text-[#00F2FE]">
                    <span>View Applications</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Industry Details Modal */}
      {activeIndustry && (
        <Modal
          isOpen={!!activeIndustry}
          onClose={() => setActiveIndustry(null)}
          title={activeIndustry.name}
          subtitle={`SECTOR // ${activeIndustry.tag}`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0A0E14] border border-white/10">
              <img
                src={activeIndustry.image}
                alt={activeIndustry.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="text-xs font-mono text-[#00F2FE] uppercase tracking-wider mb-2">
                Value Proposition
              </h4>
              <p className="text-base font-heading font-medium text-white leading-relaxed">
                "{activeIndustry.valueProp}"
              </p>
              <p className="text-sm text-[#9BA3AE] mt-3 leading-relaxed">
                {activeIndustry.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono text-[#00F2FE] uppercase tracking-wider mb-3">
                Key Industry Use Cases
              </h4>
              <div className="space-y-2">
                {activeIndustry.useCases.map((uc, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-[#CBD5E1] bg-[#07090C] p-2.5 rounded-lg border border-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                    <span>{uc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  const industryName = activeIndustry.name;
                  setActiveIndustry(null);
                  if (onStartProjectForIndustry) {
                    onStartProjectForIndustry(industryName);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-tech font-semibold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
              >
                <span>Request Industry Consultation</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
