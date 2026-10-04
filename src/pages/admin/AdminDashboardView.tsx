import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import {
  Users,
  Target,
  Flame,
  Clock,
  AlertTriangle,
  HelpCircle,
  FolderKanban,
  CalendarCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Layers,
  Globe,
} from 'lucide-react';
import {
  SALES_STAGES,
  ORDERED_STAGES,
} from '../../data/crmConstants';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, reportsRes] = await Promise.allSettled([
        adminApi.getDashboardStats(),
        adminApi.getReports(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value.success) {
        setReports(reportsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider">
            Loading Live Metrics from MySQL...
          </span>
        </div>
      </div>
    );
  }

  const totalLeads = stats?.totalLeads || 0;
  const coldCount = stats?.coldLeads || 0;
  const warmCount = stats?.warmLeads || 0;
  const hotCount = stats?.hotLeads || 0;

  const coldPct = totalLeads ? Math.round((coldCount / totalLeads) * 100) : 0;
  const warmPct = totalLeads ? Math.round((warmCount / totalLeads) * 100) : 0;
  const hotPct = totalLeads ? Math.round((hotCount / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Executive Command Center</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20">
              LIVE MYSQL
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Real-time telemetry, lead pipeline distribution, follow-ups, and conversion tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00F2FE]' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => onNavigateTab('crm')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F2FE] text-black font-semibold text-xs hover:bg-[#00F2FE]/90 transition-colors shadow-lg shadow-[#00F2FE]/20"
          >
            Launch CRM
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Website Status & CMS Command Center Bar (Section 35) */}
      <div className="bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00F2FE]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              WEBSITE / CMS STATUS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F2FE] border border-[#00F2FE]/20">
              Live Database
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('services')}
              className="text-xs font-mono text-[#00F2FE] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Services</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => onNavigateTab('website-settings')}
              className="text-xs font-mono text-[#9BA3AE] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Website Settings</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-center">
          <div className="p-3 rounded-xl bg-[#07090C] border border-white/5">
            <div className="text-[11px] text-[#9BA3AE]">Total Services</div>
            <div className="text-lg font-bold text-white mt-1">
              {stats?.websiteStatus?.servicesTotal ?? 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090C] border border-emerald-500/20">
            <div className="text-[11px] text-emerald-400">Available</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {stats?.websiteStatus?.servicesAvailable ?? 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090C] border border-amber-500/20">
            <div className="text-[11px] text-amber-300">Unavailable</div>
            <div className="text-lg font-bold text-amber-300 mt-1">
              {stats?.websiteStatus?.servicesUnavailable ?? 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090C] border border-red-500/20">
            <div className="text-[11px] text-red-400">Hidden</div>
            <div className="text-lg font-bold text-red-400 mt-1">
              {stats?.websiteStatus?.servicesHidden ?? 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090C] border border-cyan-500/20">
            <div className="text-[11px] text-[#00F2FE]">Featured</div>
            <div className="text-lg font-bold text-[#00F2FE] mt-1">
              {stats?.websiteStatus?.featuredServices ?? 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090C] border border-white/5">
            <div className="text-[11px] text-[#9BA3AE]">Public Projects</div>
            <div className="text-lg font-bold text-white mt-1">
              {stats?.websiteStatus?.publicProjects ?? 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#07090C] border border-purple-500/20">
            <div className="text-[11px] text-purple-400">Pending Enquiries</div>
            <div className="text-lg font-bold text-purple-300 mt-1">
              {stats?.websiteStatus?.pendingEnquiries ?? stats?.newEnquiries ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* 9 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-[#101419] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9BA3AE] font-medium">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {stats?.totalCustomers || 0}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#9BA3AE] flex items-center gap-1 group-hover:text-blue-400">
            <span>View directory</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Total Leads */}
        <div
          onClick={() => onNavigateTab('crm')}
          className="bg-[#101419] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9BA3AE] font-medium">Total Leads</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {totalLeads}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#9BA3AE] flex items-center gap-1 group-hover:text-purple-400">
            <span>Open pipeline</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Cold Leads */}
        <div
          onClick={() => onNavigateTab('crm')}
          className="bg-[#101419] p-4 rounded-xl border border-white/10 hover:border-slate-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cold Leads</span>
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center">
              <span className="text-xs font-bold">❄</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-300 tracking-tight">
              {coldCount}
            </span>
            <span className="text-[10px] font-mono text-slate-400">({coldPct}%)</span>
          </div>
          <div className="mt-2 text-[10px] text-[#9BA3AE]">Inactive / Low intent</div>
        </div>

        {/* Warm Leads */}
        <div
          onClick={() => onNavigateTab('crm')}
          className="bg-[#101419] p-4 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">Warm Leads</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {warmCount}
            </span>
            <span className="text-[10px] font-mono text-amber-400/80">({warmPct}%)</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400/70">Scheduled follow-ups</div>
        </div>

        {/* Hot Leads */}
        <div
          onClick={() => onNavigateTab('crm')}
          className="bg-[#101419] p-4 rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-medium">Hot Leads</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
              {hotCount}
            </span>
            <span className="text-[10px] font-mono text-rose-400/80">({hotPct}%)</span>
          </div>
          <div className="mt-2 text-[10px] text-rose-400/70">Ready for project</div>
        </div>

        {/* Today's Follow-ups */}
        <div
          onClick={() => onNavigateTab('followups')}
          className="bg-[#101419] p-4 rounded-xl border border-[#00F2FE]/20 hover:border-[#00F2FE]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#00F2FE] font-medium">Today's Calls</span>
            <div className="w-8 h-8 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#00F2FE] tracking-tight">
              {stats?.todayFollowUps || 0}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#00F2FE]/80 flex items-center gap-1">
            <span>Due today</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Overdue Follow-ups */}
        <div
          onClick={() => onNavigateTab('followups')}
          className={`bg-[#101419] p-4 rounded-xl border transition-all cursor-pointer group ${
            stats?.overdueFollowUps > 0
              ? 'border-red-500/40 bg-red-500/5'
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400 font-medium">Overdue Calls</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-400 tracking-tight">
              {stats?.overdueFollowUps || 0}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-red-400/80">Requires immediate call</div>
        </div>

        {/* New Enquiries */}
        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-[#101419] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-400 font-medium">New Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {stats?.newEnquiries || 0}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#9BA3AE] flex items-center gap-1 group-hover:text-indigo-400">
            <span>Website submissions</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Active Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="bg-[#101419] p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {stats?.activeProjects || 0}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400/80">In production / review</div>
        </div>
      </div>

      {/* HOT OPPORTUNITIES PIPELINE V2 */}
      <div className="bg-gradient-to-r from-rose-950/30 via-[#101419] to-amber-950/20 p-6 rounded-2xl border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
              </span>
              <h2 className="font-heading font-extrabold text-lg text-white tracking-tight uppercase">
                Hot Opportunities & High-Value Pipeline
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                LEVEL 1 HOT
              </span>
            </div>
            <p className="text-xs text-[#9BA3AE] mt-1 font-mono">
              Real-time monitoring of deals with active client intent, quotation stage, and verbal commitment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('followups')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Discussion Schedule</span>
            </button>
            <button
              onClick={() => onNavigateTab('kanban')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono font-bold shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
            >
              <span>Hot Pipeline Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Hot Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 relative z-10">
          {/* Active Hot Leads */}
          <div
            onClick={() => onNavigateTab('crm')}
            className="p-3.5 rounded-xl bg-[#07090C] border border-rose-500/20 hover:border-rose-500/50 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">Active Hot Leads</div>
            <div className="mt-2 text-2xl font-mono font-extrabold text-rose-400">
              {stats?.hotOpportunities?.activeHotLeads ?? hotCount}
            </div>
            <div className="mt-1 text-[10px] text-rose-400/80 flex items-center gap-1">
              <span>View in CRM</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Project Discussion Today */}
          <div
            onClick={() => onNavigateTab('followups')}
            className="p-3.5 rounded-xl bg-[#07090C] border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">Discussions Today</div>
            <div className="mt-2 text-2xl font-mono font-extrabold text-amber-400">
              {stats?.hotOpportunities?.projectDiscussionToday ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-amber-400/80 flex items-center gap-1">
              <span>Touchpoints</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Quotation Pending */}
          <div
            onClick={() => onNavigateTab('crm')}
            className="p-3.5 rounded-xl bg-[#07090C] border border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">Quotation Sent</div>
            <div className="mt-2 text-2xl font-mono font-extrabold text-blue-400">
              {stats?.hotOpportunities?.quotationPending ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-blue-400/80 flex items-center gap-1">
              <span>Stage 04</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Negotiation */}
          <div
            onClick={() => onNavigateTab('crm')}
            className="p-3.5 rounded-xl bg-[#07090C] border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">Negotiation</div>
            <div className="mt-2 text-2xl font-mono font-extrabold text-purple-400">
              {stats?.hotOpportunities?.negotiation ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-purple-400/80 flex items-center gap-1">
              <span>Stage 05</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Verbal Commitment */}
          <div
            onClick={() => onNavigateTab('crm')}
            className="p-3.5 rounded-xl bg-[#07090C] border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">Verbal Commit</div>
            <div className="mt-2 text-2xl font-mono font-extrabold text-emerald-400">
              {stats?.hotOpportunities?.verbalCommitment ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-emerald-400/80 flex items-center gap-1">
              <span>Stage 06</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Overdue Follow-ups */}
          <div
            onClick={() => onNavigateTab('followups')}
            className={`p-3.5 rounded-xl bg-[#07090C] border transition-all cursor-pointer group ${
              (stats?.hotOpportunities?.overdueFollowUps ?? 0) > 0
                ? 'border-red-500/50 bg-red-950/20 ring-1 ring-red-500/30'
                : 'border-white/10'
            }`}
          >
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase">Hot Overdue</div>
            <div
              className={`mt-2 text-2xl font-mono font-extrabold ${
                (stats?.hotOpportunities?.overdueFollowUps ?? 0) > 0
                  ? 'text-red-400 animate-pulse'
                  : 'text-white'
              }`}
            >
              {stats?.hotOpportunities?.overdueFollowUps ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-red-400/80 flex items-center gap-1">
              <span>Urgent action</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Lead Pipeline Distribution */}
        <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                  Lead Classification Funnel
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-0.5">COLD / WARM / HOT primary distribution</p>
              </div>
              <span className="text-xs font-mono text-white font-semibold">{totalLeads} Total</span>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden flex my-4">
              <div
                style={{ width: `${coldPct}%` }}
                className="h-full bg-slate-500 transition-all duration-500"
                title={`Cold: ${coldCount} (${coldPct}%)`}
              />
              <div
                style={{ width: `${warmPct}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Warm: ${warmCount} (${warmPct}%)`}
              />
              <div
                style={{ width: `${hotPct}%` }}
                className="h-full bg-rose-500 transition-all duration-500"
                title={`Hot: ${hotCount} (${hotPct}%)`}
              />
            </div>

            {/* Detailed Row Cards */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090C] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">COLD Leads</div>
                    <div className="text-[10px] text-[#9BA3AE]">Not interested / No requirement</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-300">{coldCount}</div>
                  <div className="font-mono text-[10px] text-slate-500">{coldPct}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090C] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">WARM Leads</div>
                    <div className="text-[10px] text-[#9BA3AE]">Active follow-up scheduled</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-amber-400">{warmCount}</div>
                  <div className="font-mono text-[10px] text-amber-500/80">{warmPct}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#07090C] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">HOT Leads</div>
                    <div className="text-[10px] text-[#9BA3AE]">Project / Proposal / Close stage</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-rose-400">{hotCount}</div>
                  <div className="font-mono text-[10px] text-rose-500/80">{hotPct}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#9BA3AE]">Enforce strict follow-ups for WARM leads</span>
            <button
              onClick={() => onNavigateTab('kanban')}
              className="text-xs text-[#00F2FE] hover:underline flex items-center gap-1 font-medium"
            >
              Open Pipeline Kanban
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Conversion & Follow-up Telemetry */}
        <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading mb-4">
              Conversion & Call Telemetry
            </h3>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-xl bg-[#07090C] border border-white/5">
                <div className="text-xs text-[#9BA3AE]">Lead-to-Project Conversion</div>
                <div className="mt-2 text-2xl font-bold font-mono text-[#00F2FE]">
                  {reports?.conversionRates?.conversionPercentage || 0}%
                </div>
                <div className="mt-1 text-[10px] text-[#9BA3AE]">
                  {reports?.conversionRates?.totalProjects || 0} projects from {totalLeads} leads
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#07090C] border border-white/5">
                <div className="text-xs text-[#9BA3AE]">Follow-up Completed Rate</div>
                <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
                  {reports?.followUpCompletionRate?.completed || 0}
                </div>
                <div className="mt-1 text-[10px] text-[#9BA3AE]">
                  {reports?.followUpCompletionRate?.pending || 0} pending,{' '}
                  {reports?.followUpCompletionRate?.overdue || 0} overdue
                </div>
              </div>
            </div>

            {/* Calls in past 7 days */}
            <div>
              <div className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
                <span>Recent Call Activity (Last 7 Days)</span>
                <span className="text-[10px] text-[#9BA3AE] font-mono">Logged Calls</span>
              </div>
              <div className="space-y-2">
                {reports?.callsPerDay && reports.callsPerDay.length > 0 ? (
                  reports.callsPerDay.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-[#9BA3AE] w-24 shrink-0">{item.date}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, item.count * 20)}%` }}
                          className="h-full bg-[#00F2FE]"
                        />
                      </div>
                      <span className="font-mono text-white w-8 text-right">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-[#9BA3AE] font-mono">
                    No calls logged in the last 7 days.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#9BA3AE]">Schedule next customer touchpoint</span>
            <button
              onClick={() => onNavigateTab('followups')}
              className="text-xs text-[#00F2FE] hover:underline flex items-center gap-1 font-medium"
            >
              View Follow-up Schedule
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. Leads by Service */}
        <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Leads By Spatial Service
            </h3>
            <span className="text-xs text-[#9BA3AE]">Database Service Catalog</span>
          </div>

          <div className="space-y-3">
            {reports?.leadsByService && reports.leadsByService.length > 0 ? (
              reports.leadsByService.slice(0, 6).map((item: any, idx: number) => {
                const maxCount = Math.max(...reports.leadsByService.map((s: any) => s.count), 1);
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-medium truncate max-w-[240px]">
                        {item.serviceName}
                      </span>
                      <span className="font-mono text-[#00F2FE]">{item.count} leads</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-[#00F2FE]"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#9BA3AE]">
                No service-specific leads assigned yet.
              </div>
            )}
          </div>
        </div>

        {/* 4. Leads by Source */}
        <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Acquisition Source Attribution
            </h3>
            <span className="text-xs text-[#9BA3AE]">Website & Inbound</span>
          </div>

          <div className="space-y-3">
            {reports?.leadsBySource && reports.leadsBySource.length > 0 ? (
              reports.leadsBySource.map((item: any, idx: number) => {
                const totalSrc = reports.leadsBySource.reduce((acc: number, c: any) => acc + c.count, 0) || 1;
                const pct = Math.round((item.count / totalSrc) * 100);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-[#07090C] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white capitalize">{item.source}</div>
                      <div className="text-[10px] text-[#9BA3AE]">{pct}% of total inbound</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white">{item.count}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#9BA3AE]">
                No lead sources recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8 Sales Stages Distribution & Velocity Funnel */}
      <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE]">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                8 Sales Stages Progression (Level 2 Sub-Stages)
              </h3>
            </div>
            <p className="text-xs text-[#9BA3AE] mt-0.5">
              Tracking lead progression through the structured 8-stage spatial technology sales cycle.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('kanban')}
            className="flex items-center gap-1.5 text-xs text-[#00F2FE] hover:underline font-mono"
          >
            <span>Open 8-Stage Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ORDERED_STAGES.map((stageKey) => {
            const stage = SALES_STAGES[stageKey];
            const found = reports?.stageBreakdown?.find((s: any) => s.stage === stageKey);
            const count = found?.count || 0;
            const isWon = stageKey === 'CLOSED_WON';
            const isLost = stageKey === 'CLOSED_LOST';

            return (
              <div
                key={stageKey}
                onClick={() => onNavigateTab('kanban')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isWon
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                    : isLost
                    ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/60'
                    : 'bg-[#07090C] border-white/5 hover:border-[#00F2FE]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#9BA3AE] mb-1">
                    <span className="font-bold text-white/70">{stage.stepNumber}</span>
                    <span>{stage.defaultProbability}% win</span>
                  </div>
                  <div className="font-heading font-bold text-xs text-white group-hover:text-[#00F2FE] transition-colors line-clamp-2">
                    {stage.shortLabel}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5 flex items-baseline justify-between">
                  <span className="font-mono text-xl font-extrabold text-white">
                    {count}
                  </span>
                  <span className="text-[10px] font-mono text-[#9BA3AE]">deals</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
