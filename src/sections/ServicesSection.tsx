import React, { useState, useEffect } from 'react';
import { ArrowUpRight, CheckCircle2, ChevronRight, Layers, AlertCircle } from 'lucide-react';
import { SERVICES as STATIC_SERVICES } from '../data/services';
import { Service } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { publicApi } from '../lib/api';

interface ServicesSectionProps {
  onSelectServiceForBooking?: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceForBooking
}) => {
  const [services, setServices] = useState<any[]>(STATIC_SERVICES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicServices() {
      try {
        const res = await publicApi.getServices();
        if (res.success && Array.isArray(res.data) && res.data.length > 0 && isMounted) {
          // Merge database source of truth with presentation metadata
          const merged = res.data.map((dbSvc: any, index: number) => {
            const staticMatch = STATIC_SERVICES.find(
              s => s.name.toLowerCase() === dbSvc.name.toLowerCase() ||
                   (dbSvc.slug && s.id === dbSvc.slug)
            );

            return {
              id: dbSvc.slug || dbSvc.id || `svc-${index + 1}`,
              dbId: dbSvc.id,
              number: String(index + 1).padStart(2, '0'),
              name: dbSvc.name,
              category: dbSvc.category,
              shortDesc: dbSvc.short_description || dbSvc.description || staticMatch?.shortDesc || '',
              fullDesc: dbSvc.description || staticMatch?.fullDesc || '',
              image: dbSvc.image || staticMatch?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
              badge: staticMatch?.badge || dbSvc.category || 'Spatial Capability',
              features: staticMatch?.features || [
                'Sub-millimeter spatial accuracy & telemetry',
                'Interactive multi-device browser compatibility',
                'Cloud-hosted asset delivery with custom branding'
              ],
              deliverables: staticMatch?.deliverables || [
                'Interactive WebGL/HTML5 tour viewer bundle',
                'High-resolution spherical panorama masters'
              ],
              techStack: staticMatch?.techStack || ['Spatial LiDAR', 'WebXR', 'Three.js'],
              is_active: dbSvc.is_active !== undefined ? dbSvc.is_active : true,
              is_featured: dbSvc.is_featured || false,
              display_order: dbSvc.display_order ?? index + 1,
            };
          });

          setServices(merged);
          setError(null);
        }
      } catch (err: any) {
        console.warn('Could not fetch dynamic services from backend API, using fallback:', err.message);
        // Keep initial fallback, no page crash
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDynamicServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenService = (service: any) => {
    setSelectedService(service);
  };

  return (
    <section id="services" className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-tech-dots opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="cyan">CORE CAPABILITIES</Badge>
              <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                // Service Architecture
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white uppercase leading-tight">
              WHAT WE <span className="text-gradient-cyan">CREATE</span>
            </h2>
          </div>
          <p className="text-[#9BA3AE] text-base max-w-md">
            Specialized pillars bridging physical reality capture, spatial computing, and scalable digital platforms for modern enterprises.
          </p>
        </div>

        {/* Dynamic Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleOpenService(service)}
              className={`group relative rounded-2xl bg-[#101419] border transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer ${
                service.is_active === false
                  ? 'border-amber-500/30 opacity-90 hover:border-amber-500/60'
                  : 'border-white/10 hover:border-[#00F2FE]/50 hover:shadow-[0_10px_35px_-10px_rgba(0,242,254,0.2)] hover:-translate-y-1.5'
              }`}
            >
              {/* Visual Thumbnail Top */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0A0E14]">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.1] transition-transform duration-700 group-hover:scale-108 group-hover:brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101419] via-transparent to-black/40 pointer-events-none" />

                {/* Service Number Tag */}
                <div className="absolute top-4 left-4">
                  <span className="font-heading font-extrabold text-2xl sm:text-3xl text-white/90 group-hover:text-[#00F2FE] transition-colors">
                    {service.number}
                  </span>
                </div>

                {/* Top Right Availability or Arrow */}
                {service.is_active === false ? (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/90 text-[#07090C] text-[10px] font-mono font-bold tracking-wider uppercase shadow-lg">
                    Unavailable
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#07090C]/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#00F2FE] group-hover:text-[#07090C] group-hover:border-[#00F2FE] transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                )}

                {/* Badge Tag */}
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#07090C]/80 backdrop-blur-md text-[#CBD5E1] border border-white/10">
                    {service.badge}
                  </span>
                  {service.is_active === false && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Temporarily Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Text Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mb-3 group-hover:text-[#00F2FE] transition-colors tracking-tight flex items-center justify-between">
                    <span>{service.name}</span>
                  </h3>
                  <p className="text-sm text-[#9BA3AE] leading-relaxed line-clamp-3">
                    {service.shortDesc}
                  </p>
                </div>

                {/* Footer Link Prompt */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#CBD5E1] group-hover:text-[#00F2FE] transition-colors">
                  <span>{service.is_active === false ? 'View Details (Unavailable)' : 'Explore Capabilities'}</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Service Modal */}
      {selectedService && (
        <Modal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          title={selectedService.name}
          subtitle={`SERVICE ${selectedService.number} // ${selectedService.badge}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0A0E14] border border-white/10">
              <img
                src={selectedService.image}
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101419] to-transparent opacity-80" />
              {selectedService.is_active === false && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-[#07090C] text-xs font-mono font-bold tracking-wider uppercase">
                  Currently Unavailable
                </div>
              )}
            </div>

            {selectedService.is_active === false && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  This service is temporarily unavailable for direct booking. Please contact our spatial director for custom schedule availability.
                </span>
              </div>
            )}

            <div>
              <h4 className="text-sm font-mono text-[#00F2FE] uppercase tracking-wider mb-2">
                Overview
              </h4>
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                {selectedService.fullDesc}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-mono text-[#00F2FE] uppercase tracking-wider mb-3">
                Key Technical Capabilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedService.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#9BA3AE] bg-[#07090C] p-2.5 rounded-lg border border-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00F2FE] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-mono text-[#00F2FE] uppercase tracking-wider mb-3">
                Deliverable Formats
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedService.deliverables.map((deliv: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded bg-[#07090C] border border-white/10 text-xs font-mono text-white">
                    {deliv}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#9BA3AE]">
                Technology: {selectedService.techStack.join(' • ')}
              </div>

              {selectedService.is_active === false ? (
                <button
                  disabled
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-tech font-semibold bg-gray-800 text-gray-400 border border-white/10 cursor-not-allowed"
                >
                  <span>Currently Unavailable</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const serviceName = selectedService.name;
                    setSelectedService(null);
                    if (onSelectServiceForBooking) {
                      onSelectServiceForBooking(serviceName);
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-tech font-semibold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
                >
                  <span>Book This Service</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
