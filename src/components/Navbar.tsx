import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Globe, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection?: string;
  onOpenBookModal?: () => void;
  onNavigateToAuth?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  activeSection = 'hero',
  onOpenBookModal,
  onNavigateToAuth
}) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Work', href: '#work', id: 'work' },
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'Industries', href: '#industries', id: 'industries' },
    { label: 'About', href: '#about', id: 'about' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#07090C]/85 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-2xl'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('hero');
              }}
              className="flex items-center gap-3 group text-white"
            >
              {/* Spatial 360 Emblem */}
              <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-[#101419] border border-white/15 group-hover:border-[#00F2FE]/60 transition-colors">
                <div className="w-4 h-4 rounded-full border-2 border-[#00F2FE] border-dashed group-hover:rotate-180 transition-transform duration-700" />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg sm:text-xl tracking-tight flex items-center gap-1.5">
                  IMAGINE <span className="text-[#00F2FE]">360</span>
                </span>
                <span className="font-mono text-[9px] tracking-widest text-[#9BA3AE] uppercase -mt-1">
                  Spatial Tech Studio
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-[#101419]/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`px-4 py-2 text-sm font-tech rounded-full transition-all duration-200 cursor-pointer ${
                    activeSection === item.id
                      ? 'text-[#00F2FE] bg-white/5 font-semibold'
                      : 'text-[#9BA3AE] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="hidden lg:flex items-center gap-2 text-xs font-mono text-[#9BA3AE] hover:text-white transition-colors px-2 py-1"
                title="Call Imagine 360"
              >
                <Phone className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>+91 95619 09070</span>
              </a>

              {/* Portal / Sign In */}
              <button
                onClick={() => {
                  if (onNavigateToAuth) {
                    if (user) {
                      onNavigateToAuth(user.role === 'USER' ? '/client' : '/admin');
                    } else {
                      onNavigateToAuth('/login');
                    }
                  } else {
                    window.history.pushState(null, '', user ? (user.role === 'USER' ? '/client' : '/admin') : '/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium bg-[#101419] border border-white/10 text-[#00F2FE] hover:border-[#00F2FE]/50 hover:bg-[#00F2FE]/5 transition-all cursor-pointer"
              >
                <span>{user ? (user.role === 'USER' ? 'Client Portal' : 'Admin CRM') : 'Portal'}</span>
              </button>

              <button
                onClick={() => handleLinkClick('contact')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-tech font-semibold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-105 transition-all cursor-pointer"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => handleLinkClick('contact')}
                className="text-xs font-tech font-medium px-3 py-1.5 rounded-md bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE]"
              >
                Inquire
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-[#9BA3AE] hover:text-white rounded-lg bg-[#101419] border border-white/10"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#07090C]/98 backdrop-blur-2xl flex flex-col justify-between p-6 pt-28 md:hidden">
          <div className="space-y-6">
            <p className="text-xs font-mono tracking-widest text-[#00F2FE] uppercase">
              // Navigation
            </p>
            <div className="flex flex-col gap-4">
              {navLinks.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className="flex items-center justify-between text-2xl font-heading font-medium text-white hover:text-[#00F2FE] py-2 border-b border-white/5 text-left transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-mono text-[#9BA3AE]">0{idx + 1}</span>
                </button>
              ))}
              <button
                onClick={() => handleLinkClick('pricing')}
                className="flex items-center justify-between text-2xl font-heading font-medium text-white hover:text-[#00F2FE] py-2 border-b border-white/5 text-left transition-colors"
              >
                <span>Book a Service</span>
                <span className="text-xs font-mono text-[#9BA3AE]">05</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateToAuth) {
                    if (user) {
                      onNavigateToAuth(user.role === 'USER' ? '/client' : '/admin');
                    } else {
                      onNavigateToAuth('/login');
                    }
                  } else {
                    window.history.pushState(null, '', user ? (user.role === 'USER' ? '/client' : '/admin') : '/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="flex items-center justify-between text-2xl font-heading font-medium text-[#00F2FE] py-2 border-b border-white/5 text-left transition-colors"
              >
                <span>{user ? (user.role === 'USER' ? 'Client Portal' : 'Admin CRM') : 'Portal Sign In'}</span>
                <span className="text-xs font-mono text-[#00F2FE]">06</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <button
              onClick={() => handleLinkClick('contact')}
              className="w-full py-4 rounded-xl font-tech font-bold text-center bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] text-base shadow-[0_0_25px_rgba(0,242,254,0.3)] flex items-center justify-center gap-2"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>

            <div className="text-center font-mono text-xs text-[#9BA3AE] space-y-1">
              <div>{COMPANY_INFO.location}</div>
              <div className="text-[#00F2FE]">{COMPANY_INFO.phoneDisplay}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
