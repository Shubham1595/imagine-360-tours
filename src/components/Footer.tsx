import React from 'react';
import { ArrowUpRight, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenAccessibility?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPrivacy,
  onOpenTerms,
  onOpenAccessibility
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#07090C] border-t border-white/10 pt-20 pb-12 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#00F2FE]/5 via-transparent to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Large Statement */}
        <div className="border-b border-white/10 pb-16 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="font-mono text-xs text-[#00F2FE] tracking-widest uppercase mb-3">
                // Spatial Reality Engineering
              </p>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-white leading-[1.05]">
                IMAGINE IT.<br />
                <span className="text-[#9BA3AE]">CAPTURE IT.</span><br />
                <span className="text-gradient-cyan">EXPERIENCE IT.</span>
              </h2>
            </div>
            
            <div className="max-w-md space-y-4">
              <p className="text-[#9BA3AE] text-base leading-relaxed">
                Transforming physical environments into high-fidelity digital experiences. Serving real estate, hospitality, architecture, and industrial clients across Pune, Pimpri-Chinchwad, and worldwide.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-tech font-semibold bg-white text-[#07090C] hover:bg-[#00F2FE] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all cursor-pointer"
              >
                <span>Initiate Your Spatial Project</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#101419] border border-[#00F2FE]/40 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full border border-[#00F2FE] border-dashed" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                IMAGINE <span className="text-[#00F2FE]">360</span>
              </span>
            </div>
            <p className="text-sm text-[#9BA3AE] max-w-sm">
              "{COMPANY_INFO.tagline}" We bridge optical reality and interactive web technology for real estate, engineering, and enterprise operations.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={COMPANY_INFO.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#101419] border border-white/10 hover:border-[#00F2FE]/50 text-[#9BA3AE] hover:text-[#00F2FE] flex items-center justify-center transition-colors"
                title="Instagram (Official Profile)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={COMPANY_INFO.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#101419] border border-white/10 hover:border-[#00F2FE]/50 text-[#9BA3AE] hover:text-[#00F2FE] flex items-center justify-center transition-colors"
                title="LinkedIn (Official Profile)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href={COMPANY_INFO.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#101419] border border-white/10 hover:border-[#00F2FE]/50 text-[#9BA3AE] hover:text-[#00F2FE] flex items-center justify-center transition-colors"
                title="YouTube (Official Channel)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href={COMPANY_INFO.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#101419] border border-white/10 hover:border-[#00F2FE]/50 text-[#9BA3AE] hover:text-[#00F2FE] flex items-center justify-center transition-colors"
                title="WhatsApp Direct Contact"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-tech text-xs tracking-wider uppercase text-white font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#9BA3AE]">
              <li>
                <button onClick={() => onNavigate('work')} className="hover:text-white transition-colors cursor-pointer">
                  Work & Projects
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('industries')} className="hover:text-white transition-colors cursor-pointer">
                  Industries
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors cursor-pointer">
                  Book a Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <h4 className="font-tech text-xs tracking-wider uppercase text-white font-semibold">
              Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-[#9BA3AE]">
              <li>360° Virtual Tours</li>
              <li>Drone & Aerial Capture</li>
              <li>Architectural 3D Visuals</li>
              <li>Enterprise Digital Twins</li>
              <li>LiDAR & BIM Point Cloud</li>
              <li>GST SaaS & Booking Engines</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-tech text-xs tracking-wider uppercase text-white font-semibold">
              Studio Contact
            </h4>
            <ul className="space-y-3 text-sm text-[#9BA3AE]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.location}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00F2FE] shrink-0" />
                <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-white transition-colors">
                  {COMPANY_INFO.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#00F2FE] shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-white transition-colors break-all">
                  {COMPANY_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#9BA3AE]">
          <div>
            © {currentYear} Imagine 360 Tours. All rights reserved. Registered in Pune, Maharashtra.
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={onOpenTerms}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button 
              onClick={onOpenAccessibility}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Accessibility
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
