import React, { useState, useEffect } from 'react';
import { followUpApi } from '../../lib/api';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Phone,
  AlertCircle,
  RefreshCw,
  X,
  ChevronRight,
  Flame,
  Briefcase,
  DollarSign,
  TrendingUp,
  Tag,
  ArrowRight,
  Filter,
  MapPin,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { CallCustomerModal } from './CallCustomerModal';
import { Modal } from '../../components/Modal';
import {
  formatCurrencyINR,
  HOT_PROJECT_PURPOSES,
  CLASSIFICATIONS,
  SALES_STAGES,
  ORDERED_STAGES,
  LeadClassification,
  LeadStage,
} from '../../data/crmConstants';

interface AdminFollowUpsViewProps {
  onSelectCustomer: (customerId: string) => void;
}

export const AdminFollowUpsView: React.FC<AdminFollowUpsViewProps> = ({ onSelectCustomer }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'completed' | 'all'>('today');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [counts, setCounts] = useState<{ today: number; overdue: number; upcoming: number; completed: number }>({
    today: 0,
    overdue: 0,
    upcoming: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Complete Follow-up Modal
  const [completingFollowUp, setCompletingFollowUp] = useState<any | null>(null);
  const [outcome, setOutcome] = useState<'COLD' | 'WARM' | 'HOT'>('WARM');
  const [selectedStage, setSelectedStage] = useState<LeadStage>('LEAD_CAPTURED');
  const [nextAction, setNextAction] = useState<string>('');
  const [completeNotes, setCompleteNotes] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('11:30 AM');
  const [nextReason, setNextReason] = useState('Sequential Follow-Up');
  const [nextFollowUpType, setNextFollowUpType] = useState<string>('GENERAL_FOLLOW_UP');
  const [scheduleNextFollowUp, setScheduleNextFollowUp] = useState<boolean>(false);

  // Call modal
  const [activeCallCustomer, setActiveCallCustomer] = useState<any | null>(null);

  const fetchFollowUps = async () => {
    setIsLoading(true);
    try {
      const res = await followUpApi.list(activeTab, typeFilter !== 'ALL' ? typeFilter : undefined);
      if (res.success && res.data) {
        setFollowUps(res.data);
        if (res.meta?.counts) {
          setCounts(res.meta.counts);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [activeTab, typeFilter]);

  const handleOpenComplete = (f: any) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNextDate(tomorrow.toISOString().split('T')[0]);
    setCompletingFollowUp(f);
    const initialOutcome = f.lead?.classification || (f.type === 'PROJECT_DISCUSSION' ? 'HOT' : 'WARM');
    setOutcome(initialOutcome);
    setSelectedStage((f.lead?.stage as LeadStage) || 'LEAD_CAPTURED');
    setNextAction(f.next_action || (initialOutcome === 'HOT' ? 'Project Discussion' : ''));
    setNextFollowUpType(initialOutcome === 'HOT' ? 'PROJECT_DISCUSSION' : 'GENERAL_FOLLOW_UP');
    setScheduleNextFollowUp(false);
    setCompleteNotes('');
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowUp) return;

    try {
      await followUpApi.complete(completingFollowUp.id, {
        outcome,
        stage: selectedStage,
        next_action: nextAction || undefined,
        notes: completeNotes,
        next_follow_up_date: scheduleNextFollowUp && nextDate && nextTime ? nextDate : undefined,
        next_follow_up_time: scheduleNextFollowUp && nextDate && nextTime ? nextTime : undefined,
        next_follow_up_reason: scheduleNextFollowUp ? nextReason : undefined,
        next_follow_up_type: scheduleNextFollowUp ? (outcome === 'HOT' ? 'PROJECT_DISCUSSION' : nextFollowUpType) : undefined,
      });

      setCompletingFollowUp(null);
      fetchFollowUps();
    } catch (err: any) {
      alert(err.message || 'Error completing follow-up');
    }
  };

  const handleCancelFollowUp = async (id: string) => {
    if (!window.confirm('Cancel this scheduled follow-up?')) return;
    try {
      await followUpApi.update(id, { status: 'CANCELLED' });
      fetchFollowUps();
    } catch (err: any) {
      alert(err.message || 'Error cancelling follow-up');
    }
  };

  const projectDiscussionCount = followUps.filter(
    (f) => f.type === 'PROJECT_DISCUSSION' || f.lead?.classification === 'HOT'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight uppercase flex items-center gap-3">
            <span>Follow-Up Operations & Discussions</span>
            {projectDiscussionCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                {projectDiscussionCount} HOT Discussions
              </span>
            )}
          </h2>
          <p className="text-xs font-mono text-[#9BA3AE] mt-0.5">
            Level 3 action execution: Manage sequential WARM touchpoints and HOT project scope discussions.
          </p>
        </div>

        {/* Status Filter Tabs & Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeline Tabs */}
          <div className="flex items-center gap-1 bg-[#101419] p-1 rounded-xl border border-white/10 overflow-x-auto font-mono text-xs">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'today' ? 'bg-[#00F2FE] text-[#07090C] font-bold' : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              <span>Today's</span>
              <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px]">{counts.today}</span>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'overdue' ? 'bg-red-500 text-white font-bold' : 'text-red-400 hover:text-red-300'
              }`}
            >
              <span>Overdue</span>
              <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px]">{counts.overdue}</span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'upcoming' ? 'bg-[#4FACFE] text-[#07090C] font-bold' : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              <span>Upcoming</span>
              <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px]">{counts.upcoming}</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'completed' ? 'bg-emerald-500 text-[#07090C] font-bold' : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              <span>Completed</span>
              <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px]">{counts.completed}</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'all' ? 'bg-white/20 text-white font-bold' : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              All
            </button>
          </div>

          {/* Type Filter Pill Switcher */}
          <div className="flex items-center gap-1 bg-[#101419] p-1 rounded-xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('PROJECT_DISCUSSION')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                typeFilter === 'PROJECT_DISCUSSION'
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Project Discussions</span>
            </button>
            <button
              onClick={() => setTypeFilter('QUOTATION_FOLLOW_UP')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                typeFilter === 'QUOTATION_FOLLOW_UP' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              Quotes
            </button>
            <button
              onClick={() => setTypeFilter('SITE_VISIT')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                typeFilter === 'SITE_VISIT' ? 'bg-[#00F2FE] text-black font-bold shadow-md shadow-[#00F2FE]/20' : 'text-[#00F2FE] hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Site Visits</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 py-16 text-center text-[#9BA3AE] font-mono text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00F2FE]" />
            <span>Loading follow-up tasks from MySQL...</span>
          </div>
        ) : followUps.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-[#9BA3AE] font-mono text-xs bg-[#101419] rounded-2xl border border-white/10">
            No follow-ups found for the selected "{activeTab}" filter.
          </div>
        ) : (
          followUps.map((f) => {
            const isSiteVisit = f.type === 'SITE_VISIT';
            const isHotDiscussion = f.type === 'PROJECT_DISCUSSION' || f.lead?.classification === 'HOT';
            const leadStage = f.lead?.stage as LeadStage | undefined;
            const stageMeta = leadStage ? SALES_STAGES[leadStage] : null;

            return (
              <div
                key={f.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                  isSiteVisit
                    ? 'bg-[#0B1519] border-[#00F2FE]/40 hover:border-[#00F2FE] ring-1 ring-[#00F2FE]/20'
                    : isHotDiscussion
                    ? 'bg-[#120B0E] border-rose-500/30 hover:border-rose-500/60 ring-1 ring-rose-500/20'
                    : 'bg-[#101419] border-white/10 hover:border-[#00F2FE]/40'
                }`}
              >
                <div>
                  {/* Top Bar with Type & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      {isSiteVisit ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Site Visit
                        </span>
                      ) : isHotDiscussion ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          HOT Project Discussion
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-white/5 text-[#CBD5E1] border border-white/10">
                          {f.type?.replace(/_/g, ' ') || 'General Follow-up'}
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        f.status === 'COMPLETED'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                          : f.status === 'OVERDUE'
                          ? 'bg-red-950/40 text-red-300 border border-red-500/30'
                          : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      onClick={() => onSelectCustomer(f.customer_id)}
                      className="font-heading font-bold text-base text-white hover:text-[#00F2FE] transition-colors text-left"
                    >
                      {f.customer?.name}
                    </button>
                    {f.lead?.classification && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          f.lead.classification === 'HOT'
                            ? 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                            : f.lead.classification === 'WARM'
                            ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {f.lead.classification}
                      </span>
                    )}
                  </div>

                  {/* Company & Phone */}
                  <div className="text-xs font-mono text-[#CBD5E1] space-y-1 mb-3">
                    {f.customer?.company && (
                      <div className="text-[#9BA3AE] text-[11px] truncate flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-[#9BA3AE]" />
                        <span>{f.customer.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-white">
                      <Phone className="w-3.5 h-3.5 text-[#00F2FE]" />
                      <span>{f.customer?.phone}</span>
                    </div>
                  </div>

                  {/* Sales Stage Badge (Level 2) */}
                  {stageMeta && (
                    <div className="mb-3 flex items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-[#9BA3AE]">Sales Stage:</span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${stageMeta.badgeStyle}`}>
                        {stageMeta.stepNumber} {stageMeta.label}
                      </span>
                    </div>
                  )}

                  {/* Site Visit Specific Location Box (Section 15) */}
                  {isSiteVisit && (
                    <div className="p-3 rounded-xl bg-[#07090C] border border-[#00F2FE]/30 font-mono text-xs space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-[11px] text-[#00F2FE] font-bold">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>📍 Site Visit Location</span>
                        </span>
                        {f.customer?.city && (
                          <span className="text-[10px] text-[#9BA3AE]">{f.customer.city}</span>
                        )}
                      </div>
                      <div className="text-white text-xs font-sans line-clamp-2">
                        {[f.customer?.address, f.customer?.city, f.customer?.state, f.customer?.pincode].filter(Boolean).join(', ') || 'No street address recorded.'}
                      </div>
                      {f.customer?.latitude && f.customer?.longitude && (
                        <div className="text-[10px] text-[#9BA3AE] flex items-center gap-1">
                          <span>Coordinates:</span>
                          <span className="text-[#00F2FE]">{Number(f.customer.latitude).toFixed(4)}, {Number(f.customer.longitude).toFixed(4)}</span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-white/5 text-[10px] text-[#9BA3AE] flex items-center justify-between">
                        <span>Assigned Executive:</span>
                        <span className="text-white font-medium">{f.assigned_user?.name || 'Ashish (Admin)'}</span>
                      </div>
                    </div>
                  )}

                  {/* Scheduled Time & Details Box */}
                  <div className={`p-3 rounded-xl border font-mono text-xs space-y-2 ${
                    isSiteVisit
                      ? 'bg-[#07090C] border-[#00F2FE]/20'
                      : isHotDiscussion
                      ? 'bg-rose-950/20 border-rose-500/20'
                      : 'bg-[#07090C] border-white/5'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 font-semibold text-[11px] ${
                        isSiteVisit
                          ? 'text-[#00F2FE]'
                          : isHotDiscussion
                          ? 'text-rose-300'
                          : 'text-amber-300'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(f.scheduled_date).toLocaleDateString()} @ {f.scheduled_time}
                        </span>
                      </div>
                      {f.purpose && (
                        <span className="text-[10px] text-white/80 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                          {f.purpose}
                        </span>
                      )}
                    </div>

                    {/* Specific Hot Discussion Telemetry */}
                    {isHotDiscussion && (
                      <div className="pt-2 border-t border-white/5 space-y-1 text-[11px]">
                        {f.next_action && (
                          <div className="text-white/90">
                            <span className="text-rose-400 font-bold">Next Action: </span>
                            {f.next_action}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-[#9BA3AE] pt-1">
                          {f.estimated_project_value ? (
                            <span className="text-emerald-400 font-bold">
                              Est. Value: {formatCurrencyINR(f.estimated_project_value)}
                            </span>
                          ) : f.lead?.estimated_deal_value ? (
                            <span className="text-emerald-400 font-bold">
                              Est. Value: {formatCurrencyINR(f.lead.estimated_deal_value)}
                            </span>
                          ) : null}

                          {f.expected_start_date && (
                            <span>
                              Start: {new Date(f.expected_start_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {f.reason && !isHotDiscussion && (
                      <div className="text-[#CBD5E1] text-[11px] line-clamp-2">
                        {f.reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                {isSiteVisit ? (
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      {/* Open Location */}
                      {(f.customer?.map_url || (f.customer?.latitude && f.customer?.longitude)) ? (
                        <a
                          href={f.customer?.map_url || `https://www.google.com/maps?q=${f.customer?.latitude},${f.customer?.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1 text-[11px] font-mono cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-[#00F2FE]" />
                          <span>Open Location</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-[#9BA3AE]/40 border border-white/5 flex items-center gap-1 text-[11px] font-mono cursor-not-allowed"
                        >
                          <ExternalLink className="w-3 h-3 opacity-40" />
                          <span>Open Location</span>
                        </button>
                      )}

                      {/* Get Directions */}
                      {f.customer?.latitude && f.customer?.longitude ? (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${f.customer?.latitude},${f.customer?.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30 flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Directions</span>
                        </a>
                      ) : f.customer?.map_url ? (
                        <a
                          href={f.customer.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30 flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Directions</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-[#9BA3AE]/40 border border-white/5 flex items-center gap-1 text-[11px] font-mono cursor-not-allowed"
                        >
                          <Navigation className="w-3 h-3 opacity-40" />
                          <span>Directions</span>
                        </button>
                      )}
                    </div>

                    {/* Complete Visit */}
                    {f.status !== 'COMPLETED' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCancelFollowUp(f.id)}
                          className="px-2 py-1.5 rounded-lg text-[10px] text-[#9BA3AE] hover:text-red-400 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleOpenComplete(f)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-500 text-emerald-300 hover:text-[#07090C] border border-emerald-500/30 transition-colors text-[11px] font-bold cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete Visit</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#9BA3AE] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completed
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 font-mono text-xs">
                    <button
                      onClick={() =>
                        setActiveCallCustomer({
                          id: f.customer_id,
                          name: f.customer?.name,
                          phone: f.customer?.phone,
                          company: f.customer?.company,
                          currentStatus: f.lead?.classification || f.lead?.status || 'WARM',
                          leadId: f.lead_id,
                          serviceName: f.lead?.service?.name,
                          address: f.customer?.address,
                          city: f.customer?.city,
                          state: f.customer?.state,
                          pincode: f.customer?.pincode,
                          latitude: f.customer?.latitude,
                          longitude: f.customer?.longitude,
                          map_url: f.customer?.map_url,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#00F2FE]/10 hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#07090C] border border-[#00F2FE]/30 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Client</span>
                    </button>

                    {f.status !== 'COMPLETED' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCancelFollowUp(f.id)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] text-[#9BA3AE] hover:text-red-400 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleOpenComplete(f)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-500 text-emerald-300 hover:text-[#07090C] border border-emerald-500/30 transition-colors text-[11px] font-bold cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#9BA3AE] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completed
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Complete Follow-up Modal */}
      {completingFollowUp && (
        <Modal
          isOpen={!!completingFollowUp}
          onClose={() => setCompletingFollowUp(null)}
          title="Complete Follow-Up Touchpoint"
          subtitle={`CLIENT // ${completingFollowUp.customer?.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmComplete} className="space-y-4 font-mono text-xs">
            {/* Current Status Reference Card */}
            <div className="p-3 rounded-xl bg-[#07090C] border border-white/10 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[#9BA3AE] block text-[10px] uppercase">Current Classification</span>
                <span className={`font-bold uppercase ${
                  completingFollowUp.lead?.classification === 'HOT' ? 'text-rose-400' :
                  completingFollowUp.lead?.classification === 'WARM' ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {completingFollowUp.lead?.classification || 'WARM'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#9BA3AE] block text-[10px] uppercase">Current Sales Stage</span>
                <span className="font-bold text-[#00F2FE]">
                  {completingFollowUp.lead?.stage ? SALES_STAGES[completingFollowUp.lead.stage as LeadStage]?.label : '01 — Lead Captured'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[#CBD5E1] uppercase mb-1.5 font-bold">
                Update Lead Classification (Optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOutcome('COLD')}
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    outcome === 'COLD'
                      ? 'bg-blue-950/60 border-blue-400 text-blue-300 shadow-md'
                      : 'bg-[#07090C] border-white/10 text-[#9BA3AE]'
                  }`}
                >
                  ❄️ COLD
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('WARM')}
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    outcome === 'WARM'
                      ? 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-[#07090C] border-white/10 text-[#9BA3AE]'
                  }`}
                >
                  🔥 WARM
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('HOT')}
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    outcome === 'HOT'
                      ? 'bg-rose-950/60 border-rose-400 text-rose-300 shadow-md'
                      : 'bg-[#07090C] border-white/10 text-[#9BA3AE]'
                  }`}
                >
                  🚀 HOT
                </button>
              </div>
            </div>

            {/* Sales Stage Selector (Defaults to current stage, not auto-advanced) */}
            <div>
              <label className="block text-[#CBD5E1] uppercase mb-1 font-bold">
                Sales Pipeline Stage (Independent)
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as LeadStage)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-2.5 py-2 text-white font-mono text-xs"
              >
                {ORDERED_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {SALES_STAGES[stg].stepNumber} {SALES_STAGES[stg].label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[#9BA3AE] block mt-1">
                Completing a follow-up never auto-advances the stage. Change only if explicitly agreed with client.
              </span>
            </div>

            {/* Next Action input */}
            <div>
              <label className="block text-[#CBD5E1] uppercase mb-1 font-bold">
                Next Action / Deliverable
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Scope Finalization, Send Quotation, Site Visit"
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
              />
            </div>

            {/* Optional Next Follow-up Scheduling */}
            <div className="p-3.5 rounded-xl border border-white/10 bg-[#07090C] space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-xs font-bold text-white">
                  <input
                    type="checkbox"
                    checked={scheduleNextFollowUp}
                    onChange={(e) => setScheduleNextFollowUp(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-[#00F2FE]"
                  />
                  <span>Schedule New Follow-up Touchpoint (Optional)</span>
                </span>
                <span className="text-[10px] font-mono text-[#9BA3AE]">Optional</span>
              </label>

              {scheduleNextFollowUp && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#CBD5E1] uppercase mb-1">Date *</label>
                      <input
                        type="date"
                        required={scheduleNextFollowUp}
                        value={nextDate}
                        onChange={(e) => setNextDate(e.target.value)}
                        className="w-full bg-[#101419] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#CBD5E1] uppercase mb-1">Time *</label>
                      <input
                        type="text"
                        required={scheduleNextFollowUp}
                        value={nextTime}
                        onChange={(e) => setNextTime(e.target.value)}
                        placeholder="11:30 AM"
                        className="w-full bg-[#101419] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#CBD5E1] uppercase mb-1">Follow-up Type</label>
                    <select
                      value={nextFollowUpType}
                      onChange={(e) => setNextFollowUpType(e.target.value)}
                      className="w-full bg-[#101419] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="GENERAL_FOLLOW_UP">General Follow-up</option>
                      <option value="PROJECT_DISCUSSION">Project Discussion</option>
                      <option value="QUOTATION_FOLLOW_UP">Quotation Follow-up</option>
                      <option value="MEETING">Meeting</option>
                      <option value="SITE_VISIT">Site Visit</option>
                      <option value="TECHNICAL_DISCUSSION">Technical Discussion</option>
                      <option value="SCOPE_FINALIZATION">Scope Finalization</option>
                      <option value="PRICING_DISCUSSION">Pricing Discussion</option>
                      <option value="CONTRACT_DISCUSSION">Contract Discussion</option>
                      <option value="PROJECT_KICKOFF">Project Kickoff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#CBD5E1] uppercase mb-1">Purpose</label>
                    <input
                      type="text"
                      value={nextReason}
                      onChange={(e) => setNextReason(e.target.value)}
                      placeholder={outcome === 'HOT' ? 'Scope Finalization & Commercials' : 'Sequential Discussion'}
                      className="w-full bg-[#101419] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[#CBD5E1] uppercase mb-1 font-bold">Completion Notes</label>
              <textarea
                rows={3}
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                placeholder="Discussion summary, client requirements, quotations or agreements reached..."
                className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-white text-xs font-mono"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingFollowUp(null)}
                className="px-4 py-2 rounded-lg text-[#9BA3AE] bg-[#07090C] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg font-tech font-bold bg-[#00F2FE] text-[#07090C] cursor-pointer"
              >
                Confirm Completion
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Call modal */}
      {activeCallCustomer && (
        <CallCustomerModal
          isOpen={!!activeCallCustomer}
          onClose={() => setActiveCallCustomer(null)}
          customer={activeCallCustomer}
          onCallLogged={fetchFollowUps}
        />
      )}
    </div>
  );
};
