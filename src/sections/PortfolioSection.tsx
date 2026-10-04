import React, { useState, useEffect } from 'react';
import { ArrowUpRight, MapPin, Calendar, Tag, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { PROJECTS as STATIC_PROJECTS } from '../data/projects';
import { Project } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { publicApi } from '../lib/api';

interface PortfolioSectionProps {
  onSelectProject: (project: Project) => void;
}

type FilterCategory = 'ALL' | '360°' | 'DRONE' | '3D' | 'ARCHITECTURE' | 'COMMERCIAL' | 'DIGITAL';

const FILTERS: FilterCategory[] = ['ALL', '360°', 'DRONE', '3D', 'ARCHITECTURE', 'COMMERCIAL', 'DIGITAL'];

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  onSelectProject
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [projectsList, setProjectsList] = useState<Project[]>(STATIC_PROJECTS);

  useEffect(() => {
    let isMounted = true;
    publicApi.getProjects().then(res => {
      if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Map database public projects to presentation model
        const dynamicList: Project[] = res.data.map((dbProj: any, idx: number) => {
          const categoryTag = dbProj.service?.category?.toUpperCase() || '3D';
          let category: any = '3D';
          if (categoryTag.includes('360')) category = '360°';
          else if (categoryTag.includes('DRONE') || categoryTag.includes('AERIAL')) category = 'DRONE';
          else if (categoryTag.includes('COMMERCIAL')) category = 'COMMERCIAL';
          else if (categoryTag.includes('DIGITAL') || categoryTag.includes('SAAS')) category = 'DIGITAL';

          return {
            id: dbProj.id,
            slug: dbProj.id,
            title: dbProj.project_name,
            clientType: 'Commercial Enterprise',
            location: 'Pune / Mumbai, India',
            year: new Date().getFullYear().toString(),
            category,
            heroImage: dbProj.cover_image || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200',
            galleryImages: [dbProj.cover_image || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200'],
            overview: dbProj.public_description || 'High-fidelity spatial reality capture and 3D architectural digital twin.',
            challenge: 'Precision capture in active operational environment',
            solution: 'Sub-millimeter LiDAR and HDR spherical photogrammetry',
            results: ['100% geometric accuracy', 'Zero downtime'],
            deliverables: ['Interactive 3D Web Viewer', 'BIM Point Cloud'],
            tags: [dbProj.service?.name || 'Digital Twin', 'Photogrammetry'],
            interactiveType: '3D' as const,
          };
        });

        // Combine dynamic database public projects with static showcases
        setProjectsList([...dynamicList, ...STATIC_PROJECTS]);
      }
    }).catch(err => {
      console.warn('Could not load public projects:', err);
    });

    return () => { isMounted = false; };
  }, []);

  const filteredProjects = activeFilter === 'ALL'
    ? projectsList
    : projectsList.filter(p => {
        if (activeFilter === 'ARCHITECTURE') {
          return p.category === '3D' || p.tags.some(t => t.toLowerCase().includes('architectural') || t.toLowerCase().includes('residential'));
        }
        return p.category === activeFilter;
      });

  return (
    <section id="work" className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="cyan">PORTFOLIO INDEX</Badge>
              <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                // Selected Case Studies
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white uppercase leading-tight">
              SELECTED <span className="text-gradient-cyan">WORK</span>
            </h2>
          </div>
          <p className="text-[#9BA3AE] text-base max-w-md">
            Engineered reality captures, 3D renderings, and spatial twins deployed for premier real estate developers, hospitality groups, and industrial brands.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === cat
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-[#101419] text-[#9BA3AE] hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry / Cinematic Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div
              key={`${project.id}-${idx}`}
              onClick={() => onSelectProject(project)}
              className="group relative rounded-2xl bg-[#101419] border border-white/10 hover:border-[#00F2FE]/60 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-between hover:shadow-[0_15px_40px_-15px_rgba(0,242,254,0.25)] hover:-translate-y-1.5"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#0A0E14]">
                <img
                  src={project.heroImage}
                  alt={project.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-108 group-hover:brightness-95"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-transparent to-black/30 pointer-events-none" />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-[#07090C]/85 backdrop-blur-md text-[#00F2FE] border border-[#00F2FE]/30 uppercase">
                    {project.category}
                  </span>
                </div>

                {/* Top Right Action Arrow */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#07090C]/85 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#00F2FE] group-hover:text-[#07090C] group-hover:border-[#00F2FE] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                {/* Interactive Mode Badge */}
                {project.interactiveType && (
                  <div className="absolute bottom-3 right-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[#9BA3AE]">
                      {project.interactiveType.toUpperCase()} ENABLED
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#9BA3AE] mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>{project.location}</span>
                    <span>•</span>
                    <span>{project.year}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-white group-hover:text-[#00F2FE] transition-colors mb-2 tracking-tight">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#9BA3AE] line-clamp-2 leading-relaxed mb-4">
                    {project.overview}
                  </p>
                </div>

                {/* Tags and Case Study Prompt */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 2).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#07090C] text-[#CBD5E1] border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs font-mono text-[#00F2FE] flex items-center gap-1">
                    <span>Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
