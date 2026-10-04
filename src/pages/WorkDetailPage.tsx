import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, MapPin, Calendar, CheckCircle2, Shield, Layers, Eye, Share2, Copy, Check } from 'lucide-react';
import { Project } from '../types';
import { Badge } from '../components/Badge';

interface WorkDetailPageProps {
  project: Project;
  onBack: () => void;
  onStartProject: (projectType?: string) => void;
}

export const WorkDetailPage: React.FC<WorkDetailPageProps> = ({
  project,
  onBack,
  onStartProject
}) => {
  const [activeImage, setActiveImage] = useState<string>(project.heroImage);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#101419] border border-white/10 text-sm font-tech text-[#9BA3AE] hover:text-white hover:border-[#00F2FE]/50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Projects</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-[#101419] border border-white/10 text-[#9BA3AE] hover:text-[#00F2FE] transition-colors"
              title="Copy Case Study URL"
            >
              {copied ? <Check className="w-4 h-4 text-[#00F2FE]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onStartProject(project.category)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-tech font-semibold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
            >
              <span>Commission Similar Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Case Study Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="cyan">{project.category} CASE STUDY</Badge>
            <span className="font-mono text-xs text-[#9BA3AE]">{project.year} ARCHIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-tight uppercase mb-6 leading-tight">
            {project.title}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#101419] border border-white/10 font-mono text-xs">
            <div>
              <span className="text-[#9BA3AE] block mb-1">CLIENT TYPE</span>
              <span className="text-white font-semibold">{project.clientType}</span>
            </div>
            <div>
              <span className="text-[#9BA3AE] block mb-1">LOCATION</span>
              <span className="text-white font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00F2FE]" />
                {project.location}
              </span>
            </div>
            <div>
              <span className="text-[#9BA3AE] block mb-1">DISCIPLINE</span>
              <span className="text-[#00F2FE] font-semibold">{project.category}</span>
            </div>
            <div>
              <span className="text-[#9BA3AE] block mb-1">DATA FORMAT</span>
              <span className="text-white font-semibold">{project.interactiveType?.toUpperCase() || 'SPATIAL'}</span>
            </div>
          </div>
        </div>

        {/* Master Showcase Visual & Gallery */}
        <div className="space-y-4 mb-14">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0A0E14] border border-white/10 shadow-2xl">
            <img
              src={activeImage}
              alt={project.title}
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            <div className="absolute bottom-4 left-4 bg-[#07090C]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-[#00F2FE]">
              High-Fidelity Spatial Capture View
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setActiveImage(project.heroImage)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                activeImage === project.heroImage ? 'border-[#00F2FE] shadow-[0_0_10px_#00F2FE]' : 'border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={project.heroImage} alt="Main view" className="w-full h-full object-cover" />
            </button>
            {project.galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImage === img ? 'border-[#00F2FE] shadow-[0_0_10px_#00F2FE]' : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Deep Dive Case Study Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Story (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <div className="bg-[#101419] p-6 sm:p-8 rounded-2xl border border-white/10">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F2FE]" />
                Project Overview
              </h2>
              <p className="text-[#CBD5E1] text-base sm:text-lg leading-relaxed">
                {project.overview}
              </p>
            </div>

            {/* Challenge & Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-heading font-bold text-white mb-3 text-red-400">
                  The Spatial Challenge
                </h3>
                <p className="text-sm text-[#9BA3AE] leading-relaxed">
                  {project.challenge}
                </p>
              </div>

              <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-heading font-bold text-white mb-3 text-[#00F2FE]">
                  Our Technical Solution
                </h3>
                <p className="text-sm text-[#9BA3AE] leading-relaxed">
                  {project.solution}
                </p>
              </div>
            </div>

            {/* Measurable Results */}
            <div className="bg-[#101419] p-6 sm:p-8 rounded-2xl border border-white/10">
              <h3 className="text-lg font-heading font-bold text-white mb-4">
                Verified Outcomes & Impact
              </h3>
              <div className="space-y-3">
                {project.results.map((res, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-[#CBD5E1]">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
                    <span>{res}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Deliverables & Spec (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-heading font-bold text-white mb-4 uppercase tracking-wider text-xs font-mono text-[#00F2FE]">
                Deliverable Assets
              </h3>
              <ul className="space-y-2.5 text-xs font-mono text-[#CBD5E1]">
                {project.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#07090C] p-3 rounded-lg border border-white/5">
                    <span className="text-[#00F2FE]">0{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
              <h3 className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider mb-3">
                Applied Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t, idx) => (
                  <span key={idx} className="text-xs font-mono px-3 py-1 rounded bg-[#07090C] border border-white/10 text-white">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick CTA Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#101419] to-[#151D28] border border-[#00F2FE]/30 text-center space-y-4">
              <h4 className="font-heading font-bold text-lg text-white">
                Require Similar Spatial Capture?
              </h4>
              <p className="text-xs text-[#9BA3AE]">
                We deploy our survey and visualization crew across Pune, Maharashtra, and India.
              </p>
              <button
                onClick={() => onStartProject(project.category)}
                className="w-full py-3 rounded-xl text-sm font-tech font-bold bg-[#00F2FE] text-[#07090C] hover:shadow-[0_0_20px_#00F2FE] transition-all cursor-pointer"
              >
                Inquire About This Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
