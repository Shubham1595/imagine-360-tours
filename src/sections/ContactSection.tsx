import React, { useState, useEffect } from 'react';
import { Badge } from '../components/Badge';
import { COMPANY_INFO } from '../data/company';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, ArrowRight } from 'lucide-react';

import { enquiryApi, publicApi } from '../lib/api';

interface ContactSectionProps {
  initialProjectType?: string;
}

const DEFAULT_PROJECT_TYPES = [
  "360° Virtual Tours",
  "Drone & Aerial Capture",
  "3D Visualization",
  "Digital Twins",
  "Photogrammetry & LiDAR",
  "Business Technology",
  "Other"
];

const BUDGET_RANGES = [
  "Under ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,50,000",
  "₹1,50,000 - ₹5,00,000",
  "₹5,00,000+"
];

export const ContactSection: React.FC<ContactSectionProps> = ({
  initialProjectType
}) => {
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    projectType: initialProjectType || '360° Virtual Tours',
    projectLocation: '',
    estimatedBudget: '₹25,000 - ₹50,000',
    projectDescription: ''
  });

  useEffect(() => {
    let isMounted = true;
    publicApi.getServices().then(res => {
      if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAvailableServices(res.data);
      }
    }).catch(err => {
      console.warn('Could not load services for contact form:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (formData.phone.length < 8) {
      errs.phone = 'Please provide a valid contact number';
    }
    if (!formData.projectDescription.trim()) {
      errs.projectDescription = 'Please briefly outline your space or project requirements';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await enquiryApi.submit({
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        project_type: formData.projectType,
        project_location: formData.projectLocation,
        budget: formData.estimatedBudget,
        description: formData.projectDescription,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || 'Failed to submit enquiry. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden border-t border-white/10">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[500px] bg-[#00F2FE]/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="cyan">INITIATE COMMISSION</Badge>
            <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
              // Project Inquiries
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white uppercase leading-tight">
            LET'S BUILD SOMETHING<br />
            <span className="text-gradient-cyan">PEOPLE CAN EXPERIENCE.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#9BA3AE]">
            Share your property location and project scope. Our Pune/Pimpri technical production team will review and respond with a customized spatial capture plan within 24 hours.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Enquiry Form (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-[#101419] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Subtle glow border */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#00F2FE]/10 via-transparent to-transparent pointer-events-none" />

            {isSubmitted ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE] flex items-center justify-center mx-auto text-[#00F2FE]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                  Project Brief Received
                </h3>
                <p className="text-sm text-[#9BA3AE] max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{formData.name}</span>. Our spatial director will review your scope for <span className="text-[#00F2FE] font-mono">{formData.projectType}</span> and contact you shortly.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        company: '',
                        email: '',
                        phone: '',
                        projectType: '360° Virtual Tour',
                        projectLocation: '',
                        estimatedBudget: '₹25,000 - ₹50,000',
                        projectDescription: ''
                      });
                    }}
                    className="px-6 py-2.5 rounded-lg bg-[#07090C] border border-white/10 text-xs font-mono text-white hover:border-[#00F2FE]/40 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {serverError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono">
                    {serverError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full bg-[#07090C] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                        errors.name ? 'border-red-500' : 'border-white/10 focus:border-[#00F2FE]'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1 font-mono">{errors.name}</p>}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Horizon Real Estate"
                      className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F2FE] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className={`w-full bg-[#07090C] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#00F2FE]'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1 font-mono">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className={`w-full bg-[#07090C] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-white/10 focus:border-[#00F2FE]'
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-red-400 mt-1 font-mono">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Project Type */}
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                      Project Type *
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F2FE] transition-colors cursor-pointer"
                    >
                      {availableServices.length > 0 ? (
                        availableServices.map((svc) => (
                          <option
                            key={svc.id}
                            value={svc.name}
                            disabled={svc.is_active === false}
                            className={svc.is_active === false ? "bg-[#101419] text-gray-500" : "bg-[#101419] text-white"}
                          >
                            {svc.name}{svc.is_active === false ? ' (Currently unavailable)' : ''}
                          </option>
                        ))
                      ) : (
                        DEFAULT_PROJECT_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-[#101419] text-white">
                            {type}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Project Location */}
                  <div>
                    <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                      Project Location / City
                    </label>
                    <input
                      type="text"
                      value={formData.projectLocation}
                      onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                      placeholder="e.g. Baner, Pune / Lonavala"
                      className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F2FE] transition-colors"
                    />
                  </div>
                </div>

                {/* Estimated Budget */}
                <div>
                  <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                    Estimated Budget Bracket
                  </label>
                  <select
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F2FE] transition-colors cursor-pointer"
                  >
                    {BUDGET_RANGES.map((range) => (
                      <option key={range} value={range} className="bg-[#101419] text-white">
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-xs font-mono text-[#CBD5E1] uppercase tracking-wider mb-2">
                    Project Description & Requirements *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    placeholder="Tell us about the property, approximate square footage, timeline, and key visual or software deliverables..."
                    className={`w-full bg-[#07090C] border rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                      errors.projectDescription ? 'border-red-500' : 'border-white/10 focus:border-[#00F2FE]'
                    }`}
                  />
                  {errors.projectDescription && (
                    <p className="text-xs text-red-400 mt-1 font-mono">{errors.projectDescription}</p>
                  )}
                </div>

                {/* CTA Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-tech font-bold text-base bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_25px_rgba(0,242,254,0.45)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Brief...</span>
                  ) : (
                    <>
                      <span>START MY PROJECT</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Studio Direct Contact & Coordinates (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101419] border border-white/10 rounded-2xl p-8 space-y-6">
              <div>
                <span className="font-mono text-xs text-[#00F2FE] uppercase tracking-wider">
                  Direct Studio Access
                </span>
                <h3 className="text-2xl font-heading font-bold text-white mt-1">
                  Imagine 360 Tours
                </h3>
                <p className="text-sm text-[#9BA3AE] mt-2">
                  Pune / Pimpri-Chinchwad, Maharashtra
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#07090C] border border-white/5 hover:border-[#00F2FE]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#101419] border border-white/10 flex items-center justify-center text-[#00F2FE] group-hover:bg-[#00F2FE] group-hover:text-[#07090C] transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#9BA3AE] block">PHONE DIRECT</span>
                    <span className="text-sm font-semibold text-white font-mono">{COMPANY_INFO.phoneDisplay}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#07090C] border border-white/5 hover:border-[#00F2FE]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#101419] border border-white/10 flex items-center justify-center text-[#00F2FE] group-hover:bg-[#00F2FE] group-hover:text-[#07090C] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#9BA3AE] block">EMAIL INQUIRIES</span>
                    <span className="text-sm font-semibold text-white font-mono break-all">{COMPANY_INFO.email}</span>
                  </div>
                </a>

                <a
                  href={COMPANY_INFO.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#07090C] border border-white/5 hover:border-[#00F2FE]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#101419] border border-white/10 flex items-center justify-center text-[#00F2FE] group-hover:bg-[#00F2FE] group-hover:text-[#07090C] transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#9BA3AE] block">WHATSAPP CHAT</span>
                    <span className="text-sm font-semibold text-white font-mono">Chat with Technical Lead</span>
                  </div>
                </a>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-3 text-xs font-mono text-[#9BA3AE]">
                <Clock className="w-4 h-4 text-[#00F2FE]" />
                <span>{COMPANY_INFO.operatingHours}</span>
              </div>
            </div>

            {/* Factual Geographic Coverage Card */}
            <div className="bg-[#101419] border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-tech font-semibold text-sm">
                <MapPin className="w-4 h-4 text-[#00F2FE]" />
                <span>Deployment Coverage</span>
              </div>
              <p className="text-xs text-[#9BA3AE] leading-relaxed">
                Field capture teams readily deployable across Pune, Pimpri-Chinchwad, Hinjawadi, Talegaon, Chakan, Lonavala, Mumbai Metropolitan Region, and Western Maharashtra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
