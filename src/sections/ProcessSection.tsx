import React, { useState } from 'react';
import { Camera, Cpu, Box, Eye, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { PROCESS_STEPS } from '../data/process';
import { Badge } from '../components/Badge';

export const ProcessSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const stepIcons = [Camera, Cpu, Box, Eye, Send];

  return (
    <section className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden border-t border-white/10">
      {/* Background radial highlight */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#00F2FE]/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="cyan">METHODOLOGY</Badge>
              <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                // 5-Stage Spatial Pipeline
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white uppercase leading-tight">
              FROM REALITY <span className="text-gradient-cyan">TO DIGITAL</span>
            </h2>
          </div>
          <p className="text-[#9BA3AE] text-base max-w-md">
            Our end-to-end engineering pipeline converts raw physical environments into high-precision, interactive spatial assets ready for deployment.
          </p>
        </div>

        {/* Process Step Tabs (Desktop Horizontal Timeline) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-10">
          {PROCESS_STEPS.map((step, idx) => {
            const Icon = stepIcons[idx];
            const isActive = activeStep === idx;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`relative text-left p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#101419] border-[#00F2FE] shadow-[0_0_20px_rgba(0,242,254,0.2)]'
                    : 'bg-[#0D1117] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] rounded-t-xl" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className={`font-heading font-extrabold text-2xl ${isActive ? 'text-[#00F2FE]' : 'text-white/40'}`}>
                    {step.number}
                  </span>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#00F2FE]' : 'text-[#9BA3AE]'}`} />
                </div>

                <div className="font-heading font-bold text-sm text-white uppercase tracking-tight mb-1">
                  {step.title}
                </div>
                <div className="text-xs text-[#9BA3AE] line-clamp-1">
                  {step.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep Dive Card */}
        <div className="relative rounded-2xl bg-[#101419] border border-white/15 p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Subtle cyan corner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00F2FE]/10 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="font-heading text-4xl sm:text-5xl font-extrabold text-[#00F2FE]">
                  {PROCESS_STEPS[activeStep].number}
                </span>
                <span className="text-sm font-mono text-[#CBD5E1] uppercase tracking-wider">
                  // STAGE: {PROCESS_STEPS[activeStep].title}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                {PROCESS_STEPS[activeStep].tagline}
              </h3>

              <p className="text-base text-[#CBD5E1] leading-relaxed">
                {PROCESS_STEPS[activeStep].description}
              </p>

              <div>
                <h4 className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider mb-2">
                  Specialized Instruments & Hardware:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {PROCESS_STEPS[activeStep].tools.map((tool, tIdx) => (
                    <span key={tIdx} className="px-3 py-1 rounded bg-[#07090C] border border-white/10 text-xs font-mono text-white">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#07090C] p-6 rounded-xl border border-white/10 space-y-4">
              <div className="font-mono text-xs text-[#00F2FE] uppercase tracking-wider">
                Stage Deliverable Milestone
              </div>
              <div className="text-lg font-heading font-bold text-white">
                {PROCESS_STEPS[activeStep].deliverable}
              </div>
              <div className="text-xs text-[#9BA3AE] leading-relaxed pt-2 border-t border-white/10">
                Rigorous quality control verifies sensor calibration, optical sharpness, and coordinate alignment before progressing to subsequent pipeline phases.
              </div>

              <div className="flex items-center justify-between pt-4 text-xs font-mono">
                <span className="text-[#9BA3AE]">Progress: Step {activeStep + 1} of 5</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                    className="px-3 py-1 rounded bg-[#101419] border border-white/10 text-white disabled:opacity-30 cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    disabled={activeStep === PROCESS_STEPS.length - 1}
                    onClick={() => setActiveStep(prev => Math.min(PROCESS_STEPS.length - 1, prev + 1))}
                    className="px-3 py-1 rounded bg-[#00F2FE] text-[#07090C] font-bold disabled:opacity-30 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
