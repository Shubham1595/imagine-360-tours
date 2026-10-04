import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { projectApi, bookingApi, enquiryApi } from '../../lib/api';
import {
  LayoutDashboard,
  Box,
  Calendar,
  MessageSquare,
  FileText,
  User as UserIcon,
  LogOut,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

interface UserDashboardProps {
  onNavigateHome: () => void;
  initialTab?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onNavigateHome,
  initialTab = 'overview',
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [projects, setProjects] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projRes, bookRes, enqRes] = await Promise.allSettled([
          projectApi.list(),
          bookingApi.list(),
          enquiryApi.list(),
        ]);

        if (projRes.status === 'fulfilled' && projRes.value.success) {
          setProjects(projRes.value.data || []);
        }
        if (bookRes.status === 'fulfilled' && bookRes.value.success) {
          setBookings(bookRes.value.data || []);
        }
        if (enqRes.status === 'fulfilled' && enqRes.value.success) {
          setEnquiries(enqRes.value.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Active Projects', icon: Box, count: projects.length },
    { id: 'bookings', label: 'Bookings & Shoots', icon: Calendar, count: bookings.length },
    { id: 'enquiries', label: 'My Enquiries', icon: MessageSquare, count: enquiries.length },
    { id: 'documents', label: 'Documents & Deliverables', icon: FileText },
    { id: 'profile', label: 'Account Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#101419] border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#07090C] border border-[#00F2FE]/40 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full border border-[#00F2FE] border-dashed group-hover:rotate-180 transition-transform duration-500" />
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-white tracking-tight">
                  IMAGINE <span className="text-[#00F2FE]">360</span>
                </span>
                <span className="block font-mono text-[9px] text-[#9BA3AE] uppercase tracking-wider">
                  Client Portal
                </span>
              </div>
            </button>
          </div>

          {/* User badge */}
          <div className="p-4 mx-4 my-4 rounded-xl bg-[#07090C] border border-white/5">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[11px] font-mono text-[#9BA3AE] truncate">{user?.email}</div>
            <div className="mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 uppercase">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-tech transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00F2FE]/15 to-[#4FACFE]/10 text-[#00F2FE] border border-[#00F2FE]/30 font-semibold'
                      : 'text-[#9BA3AE] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#07090C] text-xs font-mono text-[#9BA3AE] hover:text-white transition-colors cursor-pointer"
          >
            <span>Visit Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-tech text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 mb-8 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00F2FE] uppercase tracking-wider mb-1">
              <span>// Client Workspace</span>
              <span>•</span>
              <span>Pune / Pimpri-Chinchwad</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight uppercase">
              {activeTab === 'overview' && `Welcome Back, ${user?.name?.split(' ')[0] || 'Client'}`}
              {activeTab === 'projects' && 'Active Spatial Projects'}
              {activeTab === 'bookings' && 'Scheduled Shoot Bookings'}
              {activeTab === 'enquiries' && 'Your Project Inquiries'}
              {activeTab === 'documents' && 'Spatial Asset Deliverables'}
              {activeTab === 'profile' && 'User Profile & Preferences'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono bg-[#101419] border border-white/10 hover:border-[#00F2FE]/40 text-white transition-colors cursor-pointer"
            >
              <span>Explore 360 Tours</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00F2FE]" />
            </button>
          </div>
        </div>

        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-2xl bg-[#101419] border border-white/10">
                <div className="flex items-center justify-between text-[#9BA3AE] mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">Active Projects</span>
                  <Box className="w-5 h-5 text-[#00F2FE]" />
                </div>
                <div className="text-3xl font-heading font-bold text-white">
                  {projects.length}
                </div>
                <div className="text-[11px] font-mono text-[#9BA3AE] mt-2">
                  Spatial scans & 3D models
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#101419] border border-white/10">
                <div className="flex items-center justify-between text-[#9BA3AE] mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">Bookings</span>
                  <Calendar className="w-5 h-5 text-[#4FACFE]" />
                </div>
                <div className="text-3xl font-heading font-bold text-white">
                  {bookings.length}
                </div>
                <div className="text-[11px] font-mono text-[#9BA3AE] mt-2">
                  Scheduled on-site captures
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#101419] border border-white/10">
                <div className="flex items-center justify-between text-[#9BA3AE] mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">Open Enquiries</span>
                  <MessageSquare className="w-5 h-5 text-[#8A2387]" />
                </div>
                <div className="text-3xl font-heading font-bold text-white">
                  {enquiries.length}
                </div>
                <div className="text-[11px] font-mono text-[#9BA3AE] mt-2">
                  Submitted project scopes
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#101419] border border-white/10">
                <div className="flex items-center justify-between text-[#9BA3AE] mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">Pending Actions</span>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-heading font-bold text-white">
                  {enquiries.filter(e => e.status === 'NEW').length + bookings.filter(b => b.status === 'PENDING').length}
                </div>
                <div className="text-[11px] font-mono text-[#9BA3AE] mt-2">
                  Awaiting team review
                </div>
              </div>
            </div>

            {/* Recent Deliverables / Projects */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#101419] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-bold text-white">
                  Current Project Status
                </h3>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs font-mono text-[#00F2FE] hover:underline"
                >
                  View All Projects →
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="py-8 text-center text-[#9BA3AE] font-mono text-xs border border-dashed border-white/10 rounded-xl">
                  No active projects currently provisioned. Commission a 360° capture or spatial scan to begin.
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-[#07090C] border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{p.project_name}</div>
                        <div className="text-xs font-mono text-[#9BA3AE] mt-0.5">
                          {p.service?.name || 'Spatial Capture'} • Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded text-xs font-mono bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-[#9BA3AE] font-mono text-sm bg-[#101419] rounded-2xl border border-white/10">
                  No projects on record.
                </div>
              ) : (
                projects.map((p) => (
                  <div key={p.id} className="p-6 rounded-2xl bg-[#101419] border border-white/10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-wider">
                          PROJECT // {p.status}
                        </span>
                        <h3 className="text-lg font-heading font-bold text-white mt-1">{p.project_name}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-mono bg-white/5 text-white border border-white/10">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#9BA3AE] leading-relaxed">
                      {p.notes || 'Project underway with Imagine 360 spatial production team.'}
                    </p>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#CBD5E1]">
                      <span>Lead Tech: {p.manager?.name || 'Assigned Producer'}</span>
                      <span className="text-[#00F2FE]">Status: {p.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="py-12 text-center text-[#9BA3AE] font-mono text-sm bg-[#101419] rounded-2xl border border-white/10">
                No active bookings found.
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="p-5 rounded-xl bg-[#101419] border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{b.service?.name || 'On-Site Spatial Capture'}</div>
                    <div className="text-xs font-mono text-[#9BA3AE] mt-1">
                      Scheduled Date: {new Date(b.booking_date).toLocaleDateString()} • Booking ID: {b.id.substring(0, 8)}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded text-xs font-mono bg-[#4FACFE]/10 text-[#4FACFE] border border-[#4FACFE]/30">
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {enquiries.length === 0 ? (
              <div className="py-12 text-center text-[#9BA3AE] font-mono text-sm bg-[#101419] rounded-2xl border border-white/10">
                No project enquiries submitted.
              </div>
            ) : (
              enquiries.map((e) => (
                <div key={e.id} className="p-6 rounded-2xl bg-[#101419] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#00F2FE]">{e.project_type}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">{e.status}</span>
                  </div>
                  <p className="text-sm text-[#CBD5E1]">{e.description}</p>
                  <div className="text-xs font-mono text-[#9BA3AE] pt-2 border-t border-white/10 flex items-center justify-between">
                    <span>Budget: {e.budget || 'Custom'}</span>
                    <span>Submitted: {new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 5. Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-8 rounded-2xl bg-[#101419] border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#07090C] border border-[#00F2FE]/30 flex items-center justify-center mx-auto text-[#00F2FE]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-white">Spatial Asset Deliverables Archive</h3>
            <p className="text-xs text-[#9BA3AE] max-w-md mx-auto leading-relaxed">
              Upon completion of on-site capture and spatial reconstruction, your 8K HDR tour packages, WebXR links, orthomosaic GeoTIFFs, and BIM models appear here for direct download.
            </p>
          </div>
        )}

        {/* 6. Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-xl p-8 rounded-2xl bg-[#101419] border border-white/10 space-y-6">
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Account Information</h3>
              <p className="text-xs text-[#9BA3AE]">Your verified user profile in Imagine 360 Tours platform.</p>
            </div>
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#07090C] border border-white/5">
                <span className="text-[#9BA3AE] block mb-1">NAME</span>
                <span className="text-white font-semibold">{user?.name}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#07090C] border border-white/5">
                <span className="text-[#9BA3AE] block mb-1">EMAIL</span>
                <span className="text-white font-semibold">{user?.email}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#07090C] border border-white/5">
                <span className="text-[#9BA3AE] block mb-1">ROLE</span>
                <span className="text-[#00F2FE] font-semibold">{user?.role}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
