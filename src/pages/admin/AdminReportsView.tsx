import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Flame,
  Clock,
  CheckCircle2,
  Users,
  Target,
  RefreshCw,
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getReports();
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const handleExportCSV = () => {
    if (!reports) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Leads', reports.conversionRates?.totalLeads || 0],
      ['Hot Leads', reports.conversionRates?.hotLeads || 0],
      ['Total Projects', reports.conversionRates?.totalProjects || 0],
      ['Conversion Rate (%)', `${reports.conversionRates?.conversionPercentage || 0}%`],
      ['Completed Follow-ups', reports.followUpCompletionRate?.completed || 0],
      ['Pending Follow-ups', reports.followUpCompletionRate?.pending || 0],
      ['Overdue Follow-ups', reports.followUpCompletionRate?.overdue || 0],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `imagine360_crm_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>CRM Analytics & Executive Intelligence</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F2FE] border border-[#00F2FE]/20">
              Live SQL Aggregates
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Conversion funnels, spatial service popularity, sales activity velocity, and pipeline velocity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between bg-[#101419] p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#00F2FE]" />
          <span className="text-xs text-white font-medium">Reporting Window:</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last Quarter' },
            { id: 'all', label: 'All-Time Historical' },
          ].map(w => (
            <button
              key={w.id}
              onClick={() => setDateRange(w.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                dateRange === w.id
                  ? 'bg-[#00F2FE]/10 border-[#00F2FE] text-[#00F2FE]'
                  : 'bg-[#07090C] border-white/5 text-[#9BA3AE] hover:text-white'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Calculating Analytics from MySQL...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Funnel conversion summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#101419] p-5 rounded-2xl border border-white/10">
              <span className="text-xs text-[#9BA3AE]">Total Inbound Leads</span>
              <div className="mt-2 text-2xl font-bold font-mono text-white">
                {reports?.conversionRates?.totalLeads || 0}
              </div>
              <span className="text-[10px] text-[#9BA3AE]">All channels combined</span>
            </div>

            <div className="bg-[#101419] p-5 rounded-2xl border border-rose-500/20">
              <span className="text-xs text-rose-400">High-Intent Hot Leads</span>
              <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
                {reports?.conversionRates?.hotLeads || 0}
              </div>
              <span className="text-[10px] text-rose-400/80">Ready for project creation</span>
            </div>

            <div className="bg-[#101419] p-5 rounded-2xl border border-emerald-500/20">
              <span className="text-xs text-emerald-400">Converted Projects</span>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
                {reports?.conversionRates?.totalProjects || 0}
              </div>
              <span className="text-[10px] text-emerald-400/80">In production / delivered</span>
            </div>

            <div className="bg-[#101419] p-5 rounded-2xl border border-[#00F2FE]/20">
              <span className="text-xs text-[#00F2FE]">Lead-to-Project Yield</span>
              <div className="mt-2 text-2xl font-bold font-mono text-[#00F2FE]">
                {reports?.conversionRates?.conversionPercentage || 0}%
              </div>
              <span className="text-[10px] text-[#00F2FE]/80">Effective conversion rate</span>
            </div>
          </div>

          {/* Deep Dives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Follow-up discipline breakdown */}
            <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading mb-4">
                Follow-up Execution & SLA Compliance
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#07090C] border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Completed Follow-ups</div>
                      <div className="text-[10px] text-[#9BA3AE]">Sales calls executed on schedule</div>
                    </div>
                  </div>
                  <div className="text-lg font-mono font-bold text-emerald-400">
                    {reports?.followUpCompletionRate?.completed || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#07090C] border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Pending Follow-ups</div>
                      <div className="text-[10px] text-[#9BA3AE]">Upcoming customer calls</div>
                    </div>
                  </div>
                  <div className="text-lg font-mono font-bold text-amber-400">
                    {reports?.followUpCompletionRate?.pending || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#07090C] border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Overdue Follow-ups</div>
                      <div className="text-[10px] text-red-400/80">Scheduled date passed without call</div>
                    </div>
                  </div>
                  <div className="text-lg font-mono font-bold text-red-400">
                    {reports?.followUpCompletionRate?.overdue || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Service Interest Ranking */}
            <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading mb-4">
                Service Demand Volume
              </h3>

              <div className="space-y-3">
                {reports?.leadsByService && reports.leadsByService.length > 0 ? (
                  reports.leadsByService.map((svc: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#07090C] border border-white/5 flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-white truncate max-w-[260px]">
                        {svc.serviceName}
                      </span>
                      <span className="font-mono text-xs text-[#00F2FE] font-bold">
                        {svc.count} Leads
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-[#9BA3AE]">
                    No service volume recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
