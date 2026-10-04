import React, { useState, useEffect } from 'react';
import { adminApi, publicApi } from '../../lib/api';
import {
  Globe,
  Save,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const AdminWebsiteSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    company_name: 'Imagine 360 Tours',
    legal_name: 'Imagine 360 Tours',
    tagline: 'See Your World From Every Angle.',
    subheading: '360° experiences, aerial capture, 3D visualization and spatial technology that turn real spaces into unforgettable digital experiences.',
    phone: '+91 9561909070',
    phone_display: '+91 95619 09070',
    email: 'Imagine360tours@gmail.com',
    address: 'Pune / Pimpri-Chinchwad, Maharashtra, India',
    business_hours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
    whatsapp: 'https://wa.me/919561909070',
    instagram: 'https://instagram.com/imagine360tours',
    linkedin: 'https://linkedin.com/company/imagine360tours',
    youtube: 'https://youtube.com/@imagine360tours',
    seo_title: 'Imagine 360 Tours | 3D Digital Twins, LiDAR & Spatial Capture',
    seo_description: 'Next-generation 360° virtual tours, 3D laser scanning LiDAR, BIM point clouds and aerial drone surveys in Pune, Pimpri-Chinchwad & India.',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err: any) {
      console.warn('Could not fetch admin settings, trying public endpoint:', err.message);
      try {
        const pubRes = await publicApi.getSettings();
        if (pubRes.success && pubRes.data) {
          setSettings(prev => ({ ...prev, ...pubRes.data }));
        }
      } catch (e) {
        setFeedback({ message: 'Failed to load website settings.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        setFeedback({
          message: 'Website settings saved and updated in the database. Changes reflect immediately on the public website.',
          type: 'success',
        });
      } else {
        setFeedback({ message: res.error || 'Failed to save settings.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Error saving settings.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#00F2FE] tracking-widest uppercase">
              WEBSITE / CMS MASTER
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Website Settings & Business Profile</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Database Source of Truth
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Admin controls for public company details, contact information, social channels, and search engine optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-mono border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Settings Form */}
      {isLoading ? (
        <div className="py-24 text-center bg-[#101419] rounded-2xl border border-white/10">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Website Settings from MySQL...</div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Company Profile */}
          <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00F2FE]" />
              <span>Company Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Company Display Name</label>
                <input
                  type="text"
                  required
                  value={settings.company_name || ''}
                  onChange={e => handleChange('company_name', e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Legal Registered Name</label>
                <input
                  type="text"
                  value={settings.legal_name || ''}
                  onChange={e => handleChange('legal_name', e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={e => handleChange('tagline', e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Subheading / Value Proposition</label>
              <textarea
                rows={2}
                value={settings.subheading || ''}
                onChange={e => handleChange('subheading', e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#00F2FE]" />
              <span>Contact & Operational Hours</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Primary Phone</label>
                <input
                  type="text"
                  required
                  value={settings.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Public Email</label>
                <input
                  type="email"
                  required
                  value={settings.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Physical Address / Headquarters</label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Business Hours</label>
                <input
                  type="text"
                  value={settings.business_hours || ''}
                  onChange={e => handleChange('business_hours', e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social Channels */}
          <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#00F2FE]" />
              <span>Social Links & Messaging</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">WhatsApp Link</label>
                <input
                  type="text"
                  value={settings.whatsapp || ''}
                  onChange={e => handleChange('whatsapp', e.target.value)}
                  placeholder="https://wa.me/..."
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Instagram Profile</label>
                <input
                  type="text"
                  value={settings.instagram || ''}
                  onChange={e => handleChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">LinkedIn Company Page</label>
                <input
                  type="text"
                  value={settings.linkedin || ''}
                  onChange={e => handleChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">YouTube Channel</label>
                <input
                  type="text"
                  value={settings.youtube || ''}
                  onChange={e => handleChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Search Engine Optimization */}
          <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Search className="w-4 h-4 text-[#00F2FE]" />
              <span>Search Engine Optimization (SEO Defaults)</span>
            </h2>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Default Meta Title</label>
              <input
                type="text"
                value={settings.seo_title || ''}
                onChange={e => handleChange('seo_title', e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Default Meta Description</label>
              <textarea
                rows={2}
                value={settings.seo_description || ''}
                onChange={e => handleChange('seo_description', e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#101419] border border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-[#9BA3AE]">
              <ShieldAlert className="w-4 h-4 text-[#00F2FE]" />
              <span>All changes are logged in the Governance Audit Trail.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-tech font-bold text-xs bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to Database...' : 'Save Website Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
