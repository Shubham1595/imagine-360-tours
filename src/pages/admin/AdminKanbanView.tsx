import React, { useState, useEffect } from 'react';
import { leadApi } from '../../lib/api';
import {
  Phone,
  Calendar,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers,
  DollarSign,
  TrendingUp,
  Filter,
  RefreshCw,
  Briefcase,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { StageTransitionModal } from './StageTransitionModal';
import { ProjectDiscussionModal } from './ProjectDiscussionModal';
import {
  CLASSIFICATIONS,
  SALES_STAGES,
  ORDERED_STAGES,
  LeadClassification,
  LeadStage,
  formatCurrencyINR,
  COLD_REASONS,
} from '../../data/crmConstants';

interface AdminKanbanViewProps {
  onSelectCustomer: (customerId: string) => void;
  onCallCustomer: (customer: any) => void;
}

export const AdminKanbanView: React.FC<AdminKanbanViewProps> = ({
  onSelectCustomer,
  onCallCustomer,
}) => {
  // Mode: 'CLASSIFICATION' (COLD/WARM/HOT) or 'STAGES' (8 Sales Stages)
  const [viewMode, setViewMode] = useState<'CLASSIFICATION' | 'STAGES'>('CLASSIFICATION');
  const [stageFilterClassification, setStageFilterClassification] = useState<string>('HOT');

  const [classificationColumns, setClassificationColumns] = useState<{
    COLD: any[];
    WARM: any[];
    HOT: any[];
  }>({ COLD: [], WARM: [], HOT: [] });

  const [stageColumns, setStageColumns] = useState<Record<LeadStage, any[]>>({
    LEAD_CAPTURED: [],
    INITIAL_CONTACT: [],
    NEEDS_ANALYSIS: [],
    QUOTATION_SENT: [],
    NEGOTIATION: [],
    VERBAL_COMMITMENT: [],
    CLOSED_WON: [],
    CLOSED_LOST: [],
  });

  const [classificationCounts, setClassificationCounts] = useState<{ COLD: number; WARM: number; HOT: number }>({
    COLD: 0,
    WARM: 0,
    HOT: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [stageModalLead, setStageModalLead] = useState<any | null>(null);
  const [projectDiscussionLead, setProjectDiscussionLead] = useState<any | null>(null);

  // Follow-up required modal when moving to WARM
  const [pendingWarmMove, setPendingWarmMove] = useState<{ leadId: string; customerId: string; customerName: string } | null>(null);
  const [warmDate, setWarmDate] = useState('');
  const [warmTime, setWarmTime] = useState('11:00 AM');
  const [warmReason, setWarmReason] = useState('Follow-up scheduled via Kanban');

  // Cold reason modal when moving to COLD
  const [pendingColdMove, setPendingColdMove] = useState<{ leadId: string; customerId: string; customerName: string } | null>(null);
  const [coldReason, setColdReason] = useState('No Immediate Requirement');

  const fetchKanban = async () => {
    setIsLoading(true);
    try {
      const res = await leadApi.kanban();
      if (res.success && res.data) {
        setClassificationColumns({
          COLD: res.data.COLD || [],
          WARM: res.data.WARM || [],
          HOT: res.data.HOT || [],
        });
        if (res.data.classificationCounts) {
          setClassificationCounts(res.data.classificationCounts);
        }
        if (res.data.stages) {
          setStageColumns(res.data.stages);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  const handleMoveClassification = async (leadId: string, currentLead: any, targetClassification: 'COLD' | 'WARM' | 'HOT') => {
    if (targetClassification === 'WARM') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setWarmDate(tomorrow.toISOString().split('T')[0]);
      setPendingWarmMove({
        leadId,
        customerId: currentLead.customer_id,
        customerName: currentLead.customer?.name || 'Customer',
      });
      return;
    }

    if (targetClassification === 'COLD') {
      setPendingColdMove({
        leadId,
        customerId: currentLead.customer_id,
        customerName: currentLead.customer?.name || 'Customer',
      });
      return;
    }

    // Moving to HOT
    try {
      await leadApi.updateStatus(leadId, {
        classification: 'HOT',
        status: 'HOT',
        reason: 'Upgraded to HOT opportunity via Kanban',
      });
      fetchKanban();
    } catch (err: any) {
      alert(err.message || 'Error updating classification');
    }
  };

  const handleConfirmWarmMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingWarmMove || !warmDate || !warmTime) return;

    try {
      await leadApi.updateStatus(pendingWarmMove.leadId, {
        classification: 'WARM',
        status: 'WARM',
        follow_up_date: warmDate,
        follow_up_time: warmTime,
        reason: warmReason,
      });
      setPendingWarmMove(null);
      fetchKanban();
    } catch (err: any) {
      alert(err.message || 'Error updating to WARM');
    }
  };

  const handleConfirmColdMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingColdMove) return;

    try {
      await leadApi.updateStatus(pendingColdMove.leadId, {
        classification: 'COLD',
        status: 'COLD',
        reason: coldReason,
      });
      setPendingColdMove(null);
      fetchKanban();
    } catch (err: any) {
      alert(err.message || 'Error updating to COLD');
    }
  };

  // Level 1 Column Config
  const classificationConfig: {
    id: LeadClassification;
    title: string;
    icon: string;
    headerStyle: string;
    badgeStyle: string;
    leads: any[];
  }[] = [
    {
      id: 'COLD',
      title: 'COLD PIPELINE',
      icon: '❄️',
      headerStyle: 'border-slate-700 bg-slate-900/30 text-slate-300',
      badgeStyle: 'bg-slate-900 text-slate-300 border-slate-700',
      leads: classificationColumns.COLD || [],
    },
    {
      id: 'WARM',
      title: 'WARM PIPELINE',
      icon: '🔥',
      headerStyle: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      badgeStyle: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
      leads: classificationColumns.WARM || [],
    },
    {
      id: 'HOT',
      title: 'HOT OPPORTUNITIES',
      icon: '🚀',
      headerStyle: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      badgeStyle: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
      leads: classificationColumns.HOT || [],
    },
  ];

  // Helper to compute total deal value in a list of leads
  const sumDealValues = (leads: any[]) => {
    return leads.reduce((sum, l) => sum + (Number(l.estimated_deal_value) || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-xl text-white tracking-tight uppercase">
              Sales Pipeline & Opportunity Kanban
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20">
              V2 MULTI-LEVEL
            </span>
          </div>
          <p className="text-xs font-mono text-[#9BA3AE] mt-0.5">
            Level 1 Primary Classifications (COLD / WARM / HOT) with Level 2 Sales Sub-Stages (01 to 08).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#07090C] p-1 rounded-xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => setViewMode('CLASSIFICATION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'CLASSIFICATION'
                  ? 'bg-[#00F2FE] text-[#07090C] font-bold shadow-md'
                  : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Level 1: COLD / WARM / HOT</span>
            </button>
            <button
              onClick={() => setViewMode('STAGES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'STAGES'
                  ? 'bg-[#00F2FE] text-[#07090C] font-bold shadow-md'
                  : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Level 2: 8 Sales Stages</span>
            </button>
          </div>

          <button
            onClick={fetchKanban}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9BA3AE] hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Refresh Kanban"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00F2FE]' : ''}`} />
          </button>
        </div>
      </div>

      {/* VIEW MODE A: LEVEL 1 PRIMARY CLASSIFICATION (COLD / WARM / HOT) */}
      {viewMode === 'CLASSIFICATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {classificationConfig.map((col) => {
            const leads = col.leads;
            const totalValue = sumDealValues(leads);

            return (
              <div
                key={col.id}
                className="rounded-2xl bg-[#101419] border border-white/10 p-4 sm:p-5 flex flex-col justify-between min-h-[640px] shadow-xl"
              >
                <div>
                  {/* Column Header */}
                  <div className={`p-3.5 rounded-xl border mb-4 flex items-center justify-between ${col.headerStyle}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{col.icon}</span>
                      <div>
                        <div className="font-heading font-extrabold text-sm tracking-tight text-white">
                          {col.title}
                        </div>
                        {totalValue > 0 && (
                          <div className="text-[10px] font-mono text-emerald-400 font-bold">
                            Pipeline: {formatCurrencyINR(totalValue)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${col.badgeStyle}`}>
                      {leads.length}
                    </span>
                  </div>

                  {/* Lead Cards List */}
                  <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                    {leads.length === 0 ? (
                      <div className="py-14 text-center text-[#9BA3AE] font-mono text-xs border border-dashed border-white/10 rounded-xl">
                        No leads in {col.id} pipeline
                      </div>
                    ) : (
                      leads.map((lead) => {
                        const stageMeta = lead.stage ? SALES_STAGES[lead.stage as LeadStage] : null;
                        const isHot = col.id === 'HOT';

                        return (
                          <div
                            key={lead.id}
                            className={`p-4 rounded-xl border transition-all space-y-3 group ${
                              isHot
                                ? 'bg-[#0E090B] border-rose-500/30 hover:border-rose-500/60 shadow-lg'
                                : 'bg-[#07090C] border-white/10 hover:border-[#00F2FE]/40'
                            }`}
                          >
                            {/* Customer Title & Call Button */}
                            <div className="flex items-start justify-between gap-2">
                              <button
                                onClick={() => onSelectCustomer(lead.customer_id)}
                                className="text-left font-heading font-bold text-sm text-white group-hover:text-[#00F2FE] transition-colors cursor-pointer"
                              >
                                {lead.customer?.name}
                              </button>
                              <button
                                onClick={() =>
                                  onCallCustomer({
                                    id: lead.customer_id,
                                    name: lead.customer?.name,
                                    phone: lead.customer?.phone,
                                    company: lead.customer?.company,
                                    serviceName: lead.service?.name,
                                    currentStatus: lead.classification || lead.status,
                                    leadId: lead.id,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-[#101419] border border-white/10 hover:bg-[#00F2FE] hover:text-[#07090C] text-[#00F2FE] transition-colors cursor-pointer"
                                title="Call customer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Company & Phone */}
                            <div className="text-[11px] font-mono text-[#9BA3AE] space-y-0.5">
                              {lead.customer?.company && (
                                <div className="truncate text-white/80 flex items-center gap-1.5">
                                  <Briefcase className="w-3 h-3 text-[#9BA3AE]" />
                                  <span>{lead.customer.company}</span>
                                </div>
                              )}
                              <div>{lead.customer?.phone}</div>
                            </div>

                            {/* Service Badge & Sales Sub-Stage */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#CBD5E1] border border-white/5 truncate max-w-full">
                                {lead.service?.name || 'General Inquiry'}
                              </span>

                              {stageMeta && (
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${stageMeta.badgeStyle}`}>
                                  {stageMeta.stepNumber} {stageMeta.shortLabel}
                                </span>
                              )}
                            </div>

                            {/* Commercial Deal Value & Probability (if recorded) */}
                            {(lead.estimated_deal_value || lead.closing_probability) && (
                              <div className="p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] flex items-center justify-between text-emerald-400">
                                <span className="font-bold">
                                  {lead.estimated_deal_value ? formatCurrencyINR(lead.estimated_deal_value) : 'Value TBD'}
                                </span>
                                {lead.closing_probability && (
                                  <span className="text-[10px] text-white/70">
                                    {lead.closing_probability}% Prob
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Follow up pill if scheduled */}
                            {lead.follow_ups?.[0] && (
                              <div className="text-[10px] font-mono text-amber-300 flex items-center gap-1.5 bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>
                                  Follow-up: {new Date(lead.follow_ups[0].scheduled_date).toLocaleDateString()} @ {lead.follow_ups[0].scheduled_time}
                                </span>
                              </div>
                            )}

                            {/* HOT Project Discussion Quick Action */}
                            {isHot && (
                              <button
                                onClick={() => setProjectDiscussionLead(lead)}
                                className="w-full py-1.5 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Flame className="w-3 h-3 text-rose-400" />
                                <span>Schedule Project Discussion</span>
                              </button>
                            )}

                            {/* Stage & Classification Actions Footer */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1 text-[10px] font-mono text-[#9BA3AE]">
                              {/* Advance Stage button */}
                              <button
                                onClick={() => setStageModalLead(lead)}
                                className="px-2 py-1 rounded bg-[#101419] hover:bg-white/10 text-white border border-white/10 flex items-center gap-1 cursor-pointer"
                              >
                                <span>Stage</span>
                                <ArrowRight className="w-2.5 h-2.5 text-[#00F2FE]" />
                              </button>

                              {/* Classification Shift buttons */}
                              <div className="flex items-center gap-1">
                                {col.id !== 'COLD' && (
                                  <button
                                    onClick={() => handleMoveClassification(lead.id, lead, 'COLD')}
                                    className="px-2 py-0.5 rounded bg-[#101419] hover:bg-blue-900/40 text-blue-300 border border-blue-500/20 cursor-pointer"
                                  >
                                    COLD
                                  </button>
                                )}
                                {col.id !== 'WARM' && (
                                  <button
                                    onClick={() => handleMoveClassification(lead.id, lead, 'WARM')}
                                    className="px-2 py-0.5 rounded bg-[#101419] hover:bg-amber-900/40 text-amber-300 border border-amber-500/20 cursor-pointer"
                                  >
                                    WARM
                                  </button>
                                )}
                                {col.id !== 'HOT' && (
                                  <button
                                    onClick={() => handleMoveClassification(lead.id, lead, 'HOT')}
                                    className="px-2 py-0.5 rounded bg-[#101419] hover:bg-rose-900/40 text-rose-300 border border-rose-500/20 cursor-pointer"
                                  >
                                    HOT
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Column Footer */}
                <div className="pt-4 border-t border-white/10 text-center font-mono text-[10px] text-[#9BA3AE]">
                  {CLASSIFICATIONS[col.id].tagline}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE B: LEVEL 2 8 SALES PIPELINE STAGES */}
      {viewMode === 'STAGES' && (
        <div className="space-y-4">
          {/* Sub-Stage Classification Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101419] p-3.5 rounded-xl border border-white/10 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#CBD5E1]">
              <Filter className="w-4 h-4 text-[#00F2FE]" />
              <span className="font-bold">Filter By Lead Classification:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setStageFilterClassification('HOT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                  stageFilterClassification === 'HOT'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-[#07090C] text-rose-400 border border-rose-500/30 hover:bg-rose-950/30'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>HOT</span>
              </button>
              <button
                onClick={() => setStageFilterClassification('WARM')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  stageFilterClassification === 'WARM'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                WARM
              </button>
              <button
                onClick={() => setStageFilterClassification('COLD')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  stageFilterClassification === 'COLD'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                COLD
              </button>
              <button
                onClick={() => setStageFilterClassification('ALL_ACTIVE')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  stageFilterClassification === 'ALL_ACTIVE'
                    ? 'bg-[#00F2FE] text-[#07090C] font-bold shadow-md'
                    : 'text-[#00F2FE] hover:text-[#00F2FE]/80 border border-[#00F2FE]/30'
                }`}
              >
                ALL ACTIVE
              </button>
              <button
                onClick={() => setStageFilterClassification('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  stageFilterClassification === 'ALL'
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-[#9BA3AE] hover:text-white'
                }`}
              >
                ALL PIPELINE
              </button>
            </div>
          </div>

          {/* Horizontal 8-Stage Pipeline Columns */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
            {ORDERED_STAGES.map((stageKey) => {
              const stage = SALES_STAGES[stageKey];
              let rawLeads = stageColumns[stageKey] || [];
              if (stageFilterClassification === 'ALL_ACTIVE') {
                rawLeads = rawLeads.filter(
                  (l) => l.stage !== 'CLOSED_LOST'
                );
              } else if (stageFilterClassification !== 'ALL') {
                rawLeads = rawLeads.filter(
                  (l) => l.classification === stageFilterClassification
                );
              }
              const stageTotalValue = sumDealValues(rawLeads);

              return (
                <div
                  key={stageKey}
                  className="w-80 shrink-0 rounded-2xl bg-[#101419] border border-white/10 p-4 flex flex-col justify-between min-h-[640px] shadow-xl"
                >
                  <div>
                    {/* Stage Header */}
                    <div className="pb-3 mb-3 border-b border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#00F2FE] font-bold">
                          {stage.stepNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-white border border-white/10">
                          {rawLeads.length} deals
                        </span>
                      </div>
                      <div className="font-heading font-extrabold text-sm text-white truncate">
                        {stage.label}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#9BA3AE]">
                        <span>{stage.defaultProbability}% default prob</span>
                        {stageTotalValue > 0 && (
                          <span className="text-emerald-400 font-bold">
                            {formatCurrencyINR(stageTotalValue)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
                      {rawLeads.length === 0 ? (
                        <div className="py-12 text-center text-[#9BA3AE] font-mono text-xs border border-dashed border-white/5 rounded-xl">
                          No leads in stage
                        </div>
                      ) : (
                        rawLeads.map((lead) => {
                          const isHotLead = lead.classification === 'HOT';
                          const isWarmLead = lead.classification === 'WARM';

                          return (
                            <div
                              key={lead.id}
                              className={`p-3.5 rounded-xl border transition-all space-y-2.5 group ${
                                isHotLead
                                  ? 'bg-[#0E090B] border-rose-500/30 hover:border-rose-500/60'
                                  : 'bg-[#07090C] border-white/10 hover:border-[#00F2FE]/40'
                              }`}
                            >
                              {/* Customer & Call */}
                              <div className="flex items-start justify-between gap-1.5">
                                <button
                                  onClick={() => onSelectCustomer(lead.customer_id)}
                                  className="text-left font-heading font-bold text-xs text-white group-hover:text-[#00F2FE] transition-colors cursor-pointer"
                                >
                                  {lead.customer?.name}
                                </button>
                                <button
                                  onClick={() =>
                                    onCallCustomer({
                                      id: lead.customer_id,
                                      name: lead.customer?.name,
                                      phone: lead.customer?.phone,
                                      company: lead.customer?.company,
                                      serviceName: lead.service?.name,
                                      currentStatus: lead.classification || lead.status,
                                      leadId: lead.id,
                                    })
                                  }
                                  className="p-1 rounded bg-[#101419] border border-white/10 hover:bg-[#00F2FE] hover:text-[#07090C] text-[#00F2FE] transition-colors cursor-pointer"
                                >
                                  <Phone className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Company */}
                              {lead.customer?.company && (
                                <div className="text-[10px] font-mono text-[#9BA3AE] truncate">
                                  {lead.customer.company}
                                </div>
                              )}

                              {/* Classification Pill & Service */}
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span
                                  className={`px-1.5 py-0.2 rounded border font-bold uppercase ${
                                    isHotLead
                                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                                      : isWarmLead
                                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                      : 'bg-slate-900 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {lead.classification || 'WARM'}
                                </span>

                                <span className="text-[#CBD5E1] truncate max-w-[140px]">
                                  {lead.service?.name || 'General'}
                                </span>
                              </div>

                              {/* Deal Value */}
                              {lead.estimated_deal_value && (
                                <div className="text-[11px] font-mono font-bold text-emerald-400 bg-black/40 p-1.5 rounded border border-white/5 flex items-center justify-between">
                                  <span>{formatCurrencyINR(lead.estimated_deal_value)}</span>
                                  {lead.closing_probability && (
                                    <span className="text-[10px] text-white/70">
                                      {lead.closing_probability}%
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Next Follow Up */}
                              {lead.follow_ups?.[0] && (
                                <div className="text-[10px] font-mono text-amber-300 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>
                                    {new Date(lead.follow_ups[0].scheduled_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}

                              {/* Card Actions */}
                              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                                <button
                                  onClick={() => setStageModalLead(lead)}
                                  className="w-full py-1 rounded bg-[#101419] hover:bg-[#00F2FE] hover:text-[#07090C] text-[#CBD5E1] border border-white/10 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <span>Advance Stage</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>

                                {isHotLead && (
                                  <button
                                    onClick={() => setProjectDiscussionLead(lead)}
                                    className="p-1 rounded bg-rose-950/60 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-colors cursor-pointer"
                                    title="Schedule Project Discussion"
                                  >
                                    <Flame className="w-3 h-3 text-rose-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-center font-mono text-[10px] text-[#9BA3AE]">
                    {stage.shortLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stage Transition Modal */}
      {stageModalLead && (
        <StageTransitionModal
          isOpen={!!stageModalLead}
          onClose={() => setStageModalLead(null)}
          lead={stageModalLead}
          onStageUpdated={() => {
            setStageModalLead(null);
            fetchKanban();
          }}
        />
      )}

      {/* Dedicated HOT Project Discussion Modal */}
      {projectDiscussionLead && (
        <ProjectDiscussionModal
          isOpen={!!projectDiscussionLead}
          onClose={() => setProjectDiscussionLead(null)}
          lead={projectDiscussionLead}
          onScheduled={() => {
            setProjectDiscussionLead(null);
            fetchKanban();
          }}
        />
      )}

      {/* Mandatory Follow-Up Modal for WARM Transition */}
      {pendingWarmMove && (
        <Modal
          isOpen={!!pendingWarmMove}
          onClose={() => setPendingWarmMove(null)}
          title="Schedule Follow-Up for WARM Lead"
          subtitle={`CLIENT // ${pendingWarmMove.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmWarmMove} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-mono">
              ⚠️ In Imagine 360 CRM, moving a lead to <strong>WARM</strong> strictly requires a confirmed follow-up date and time.
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Follow-Up Date *</label>
              <input
                type="date"
                required
                value={warmDate}
                onChange={(e) => setWarmDate(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Follow-Up Time *</label>
              <input
                type="text"
                required
                placeholder="e.g. 11:30 AM"
                value={warmTime}
                onChange={(e) => setWarmTime(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">Purpose / Reason</label>
              <input
                type="text"
                value={warmReason}
                onChange={(e) => setWarmReason(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingWarmMove(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-[#9BA3AE] bg-[#07090C] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-tech font-bold bg-[#00F2FE] text-[#07090C] cursor-pointer"
              >
                Confirm Move to WARM
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Drop-off Reason Modal for COLD Transition */}
      {pendingColdMove && (
        <Modal
          isOpen={!!pendingColdMove}
          onClose={() => setPendingColdMove(null)}
          title="Move Lead to COLD Pipeline"
          subtitle={`CLIENT // ${pendingColdMove.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmColdMove} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-200 text-xs font-mono">
              ❄️ Moving this lead to COLD. Please specify the drop-off or de-prioritization reason.
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1.5">
                Drop-off Reason *
              </label>
              <select
                value={coldReason}
                onChange={(e) => setColdReason(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
              >
                {COLD_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingColdMove(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-[#9BA3AE] bg-[#07090C] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-tech font-bold bg-blue-500 text-white cursor-pointer"
              >
                Confirm Move to COLD
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
