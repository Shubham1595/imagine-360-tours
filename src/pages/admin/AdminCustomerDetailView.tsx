import React, { useState, useEffect } from 'react';
import { customerApi, leadApi, followUpApi, projectApi } from '../../lib/api';
import {
  CLASSIFICATIONS,
  SALES_STAGES,
  ORDERED_STAGES,
  LeadClassification,
  LeadStage,
  formatCurrencyINR,
  formatDateDisplay,
  HOT_PROJECT_PURPOSES,
} from '../../data/crmConstants';
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Box,
  FileText,
  User,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Share2,
  TrendingUp,
  Flame,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';
import { CallCustomerModal } from './CallCustomerModal';
import { StageTransitionModal } from './StageTransitionModal';
import { ProjectDiscussionModal } from './ProjectDiscussionModal';
import { Modal } from '../../components/Modal';
import { CustomerMiniMap } from '../../components/CustomerMiniMap';

interface AdminCustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
}

export const AdminCustomerDetailView: React.FC<AdminCustomerDetailViewProps> = ({
  customerId,
  onBack,
}) => {
  const [customer, setCustomer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isProjectDiscussionOpen, setIsProjectDiscussionOpen] = useState(false);

  // Classification Change Modal
  const [isClassificationModalOpen, setIsClassificationModalOpen] = useState(false);
  const [targetClassification, setTargetClassification] = useState<LeadClassification>('WARM');
  const [classReason, setClassReason] = useState('');
  const [classFollowUpDate, setClassFollowUpDate] = useState('');
  const [classFollowUpTime, setClassFollowUpTime] = useState('11:00 AM');

  // Quick Note Modal
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const fetchCustomer = async () => {
    setIsLoading(true);
    try {
      const res = await customerApi.getById(customerId);
      if (res.success && res.data) {
        setCustomer(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const latestLead = customer?.leads?.[0];
  const currentClassification: LeadClassification =
    latestLead?.classification || latestLead?.status || 'WARM';
  const currentStage: LeadStage =
    latestLead?.stage || 'LEAD_CAPTURED';

  const classMeta = CLASSIFICATIONS[currentClassification] || CLASSIFICATIONS.WARM;
  const stageMeta = SALES_STAGES[currentStage] || SALES_STAGES.LEAD_CAPTURED;

  // Active Pending Follow-Up
  const activeFollowUp = customer?.follow_ups?.find((f: any) => f.status === 'PENDING');
  const isHotLead = currentClassification === 'HOT';

  const handleUpdateClassification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestLead) return;

    try {
      await leadApi.updateStatus(latestLead.id, {
        classification: targetClassification,
        status: targetClassification,
        reason: classReason,
        follow_up_date: targetClassification === 'WARM' ? classFollowUpDate : undefined,
        follow_up_time: targetClassification === 'WARM' ? classFollowUpTime : undefined,
      });
      setIsClassificationModalOpen(false);
      fetchCustomer();
    } catch (err: any) {
      alert(err.message || 'Error updating lead classification');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestLead || !noteText) return;

    try {
      await leadApi.updateStatus(latestLead.id, {
        notes: noteText,
      });
      setIsNoteOpen(false);
      setNoteText('');
      fetchCustomer();
    } catch (err: any) {
      alert(err.message || 'Error adding note');
    }
  };

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const handleCreateProjectConfirm = async () => {
    if (!latestLead) return;
    if (!window.confirm(`Create active project for ${customer.name} in the production pipeline?`)) return;

    setIsCreatingProject(true);
    try {
      const res = await leadApi.createProject(latestLead.id);
      if (res.success) {
        alert(res.message || 'Project created successfully!');
        fetchCustomer();
      } else {
        alert(res.message || res.error || 'Failed to create project');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#9BA3AE]">Loading Customer 360 Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9BA3AE] hover:text-white transition-colors"
            title="Back to CRM Table"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-bold text-2xl text-white tracking-tight">
                {customer.name}
              </h1>
              {customer.company && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-[#CBD5E1] border border-white/10">
                  {customer.company}
                </span>
              )}
              {customer.website && (
                <a
                  href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 hover:bg-[#00F2FE]/20 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Open company website"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-[#9BA3AE] mt-0.5">
              Client ID: <span className="font-mono text-[11px] text-[#00F2FE]">{customer.id}</span> • Source: {customer.source}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCallOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Customer</span>
          </button>

          {isHotLead && (
            <button
              onClick={() => setIsProjectDiscussionOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Project Discussion</span>
            </button>
          )}

          {latestLead && (
            <button
              onClick={() => setIsStageModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-[#00F2FE]/20"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Change Stage</span>
            </button>
          )}

          <button
            onClick={() => setIsNoteOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors"
          >
            + Note
          </button>

          <a
            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
            title="Open WhatsApp chat"
          >
            <Share2 className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 4 CORE CONCEPTS (Item 11: Display as four separate concepts, never combine into one status) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Concept 1: CLASSIFICATION */}
        <div className="p-4 rounded-2xl bg-[#101419] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase tracking-wider">
              1. Classification
            </div>
            <div className="text-[11px] font-mono text-[#9BA3AE]/70 mt-0.5">
              "How interested is the customer?"
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`w-3 h-3 rounded-full ${classMeta.dotColor} animate-pulse`} />
              <span className="font-heading font-extrabold text-xl text-white">
                {classMeta.label}
              </span>
            </div>
            <p className="text-[11px] text-[#9BA3AE] mt-1 line-clamp-2">
              {classMeta.tagline}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#9BA3AE]">{classMeta.shortLabel}</span>
            <button
              onClick={() => {
                setTargetClassification(currentClassification);
                setIsClassificationModalOpen(true);
              }}
              className="text-[11px] font-mono text-[#00F2FE] hover:underline cursor-pointer"
            >
              Update Interest →
            </button>
          </div>
        </div>

        {/* Concept 2: CURRENT STAGE */}
        <div className="p-4 rounded-2xl bg-[#101419] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase tracking-wider">
              2. Sales Stage
            </div>
            <div className="text-[11px] font-mono text-[#9BA3AE]/70 mt-0.5">
              "Where are we in the process?"
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="font-mono text-xs text-[#00F2FE] font-bold">
                {stageMeta.stepNumber}
              </span>
              <span className="font-heading font-extrabold text-lg text-white truncate">
                {stageMeta.shortLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#9BA3AE] mt-1 line-clamp-2">
              {stageMeta.description}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {stageMeta.defaultProbability}% win prob
            </span>
            {latestLead && (
              <button
                onClick={() => setIsStageModalOpen(true)}
                className="text-[11px] font-mono text-[#00F2FE] hover:underline cursor-pointer"
              >
                Change Stage →
              </button>
            )}
          </div>
        </div>

        {/* Concept 3: NEXT ACTION */}
        <div className="p-4 rounded-2xl bg-[#101419] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase tracking-wider">
              3. Next Action
            </div>
            <div className="text-[11px] font-mono text-[#9BA3AE]/70 mt-0.5">
              "What should we do next?"
            </div>
            <div className="font-heading font-bold text-sm text-white mt-3 truncate">
              {activeFollowUp?.next_action || activeFollowUp?.purpose || (isHotLead ? 'Project Discussion' : 'Follow-up Call')}
            </div>
            <p className="text-[11px] text-[#CBD5E1] mt-1 line-clamp-2">
              {activeFollowUp?.notes || 'Pending direct action touchpoint with key stakeholder.'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#9BA3AE]">Action Item</span>
            {isHotLead ? (
              <button
                onClick={() => setIsProjectDiscussionOpen(true)}
                className="text-[11px] font-mono text-rose-400 hover:underline cursor-pointer"
              >
                Project Discussion →
              </button>
            ) : (
              <button
                onClick={() => setIsCallOpen(true)}
                className="text-[11px] font-mono text-emerald-400 hover:underline cursor-pointer"
              >
                Call Customer →
              </button>
            )}
          </div>
        </div>

        {/* Concept 4: NEXT FOLLOW-UP */}
        <div className="p-4 rounded-2xl bg-[#101419] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#9BA3AE] uppercase tracking-wider">
              4. Next Follow-up
            </div>
            <div className="text-[11px] font-mono text-[#9BA3AE]/70 mt-0.5">
              "When should we do it?"
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="font-heading font-bold text-sm text-white truncate">
                {activeFollowUp
                  ? `${formatDateDisplay(activeFollowUp.scheduled_date)} • ${activeFollowUp.scheduled_time}`
                  : 'No Pending Task'}
              </span>
            </div>
            <p className="text-[11px] text-[#9BA3AE] mt-1 truncate">
              Assigned: {activeFollowUp?.assigned_user?.name || customer.assigned_user?.name || 'Ashish'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                activeFollowUp
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-[#9BA3AE]'
              }`}
            >
              {activeFollowUp ? 'PENDING' : 'UP TO DATE'}
            </span>
            <button
              onClick={() => setIsCallOpen(true)}
              className="text-[11px] font-mono text-[#00F2FE] hover:underline cursor-pointer"
            >
              Log Touchpoint →
            </button>
          </div>
        </div>
      </div>

      {/* CLOSED WON - EXPLICIT CREATE PROJECT BANNER (Item 6) */}
      {currentStage === 'CLOSED_WON' && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              🏆
            </div>
            <div>
              <div className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                <span>Deal Closed Won</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for Production
                </span>
              </div>
              <div className="text-xs text-[#CBD5E1] mt-0.5 font-mono">
                Commercials confirmed: {formatCurrencyINR(latestLead?.estimated_deal_value)}. Click below to explicitly create the project in MySQL.
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateProjectConfirm}
            disabled={isCreatingProject}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
          >
            <FolderKanban className="w-4 h-4" />
            <span>{isCreatingProject ? 'Creating Project...' : 'CREATE PROJECT'}</span>
          </button>
        </div>
      )}

      {/* Visual Pipeline Stepper (01 -> 08) */}
      <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {ORDERED_STAGES.map((stg, idx) => {
              const meta = SALES_STAGES[stg];
              const isCurrent = currentStage === stg;
              const currentIndex = ORDERED_STAGES.indexOf(currentStage);
              const isPassed = idx < currentIndex && currentStage !== 'CLOSED_LOST';
              const isLost = stg === 'CLOSED_LOST' && isCurrent;

              return (
                <div
                  key={stg}
                  onClick={() => {
                    if (latestLead) setIsStageModalOpen(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isCurrent
                      ? isLost
                        ? 'bg-red-500/20 border-red-500 text-white font-bold ring-1 ring-red-500/40'
                        : stg === 'CLOSED_WON'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold ring-1 ring-emerald-500/40'
                        : 'bg-[#00F2FE]/20 border-[#00F2FE] text-white font-bold ring-1 ring-[#00F2FE]/40'
                      : isPassed
                      ? 'bg-[#07090C] border-emerald-500/30 text-emerald-400'
                      : 'bg-[#07090C] border-white/5 text-[#9BA3AE] opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="text-[10px] font-mono flex items-center justify-between">
                    <span>{meta.stepNumber}</span>
                    {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="text-[11px] font-medium mt-1 truncate">
                    {meta.shortLabel}
                  </div>
                </div>
              );
            })}
          </div>

        {/* LEVEL 3: WHAT NEEDS TO HAPPEN NEXT? & LEVEL 4: COMMERCIAL VALUE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-white/10">
          {/* Section 15: DEDICATED HOT PROJECT DISCUSSION CARD (Level 3) */}
          <div className="lg:col-span-2">
            {isHotLead ? (
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-4 shadow-lg shadow-rose-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <Flame className="w-4 h-4" />
                    <span>Project Discussion Action Center</span>
                  </div>
                  <button
                    onClick={() => setIsProjectDiscussionOpen(true)}
                    className="px-3 py-1 rounded-lg text-xs font-mono bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/40 transition-colors"
                  >
                    + Schedule Discussion
                  </button>
                </div>

                {activeFollowUp ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#07090C] border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-mono text-[#9BA3AE]">Next Discussion</span>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-400" />
                        <span>{formatDateDisplay(activeFollowUp.scheduled_date)} • {activeFollowUp.scheduled_time}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#07090C] border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-mono text-[#9BA3AE]">Discussion Purpose</span>
                      <div className="font-semibold text-white truncate">
                        {activeFollowUp.purpose || activeFollowUp.reason || 'Scope Finalization'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#07090C] border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-mono text-[#9BA3AE]">Next Action / Deliverable</span>
                      <div className="text-[#CBD5E1] truncate">
                        {activeFollowUp.next_action || 'Review technical proposal'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#07090C] border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-mono text-[#9BA3AE]">Assigned Executive</span>
                      <div className="text-white font-medium">
                        {activeFollowUp.assigned_user?.name || customer.assigned_user?.name || 'Ashish'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#07090C] border border-white/5 text-center text-xs text-[#9BA3AE]">
                    No active project discussion scheduled yet for this HOT lead.
                    <button
                      onClick={() => setIsProjectDiscussionOpen(true)}
                      className="block mx-auto mt-2 text-[#00F2FE] hover:underline"
                    >
                      Schedule Project Discussion Now →
                    </button>
                  </div>
                )}

                {/* Quick actions for HOT Opportunity */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/20 text-xs">
                  <button
                    onClick={() => setIsCallOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    Call Client
                  </button>
                  <button
                    onClick={() => setIsProjectDiscussionOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setIsNoteOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => setIsStageModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 hover:bg-[#00F2FE]/20 font-semibold"
                  >
                    Advance to Verbal Commitment / Won
                  </button>
                </div>
              </div>
            ) : (
              /* WARM or COLD Level 3 Card */
              <div className="p-5 rounded-2xl bg-[#07090C] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#9BA3AE]">
                    Level 3: Scheduled Follow-up Touchpoint
                  </span>
                  {activeFollowUp && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      PENDING
                    </span>
                  )}
                </div>

                {activeFollowUp ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Clock className="w-4 h-4 text-[#00F2FE]" />
                      <span>{formatDateDisplay(activeFollowUp.scheduled_date)} at {activeFollowUp.scheduled_time}</span>
                    </div>
                    <div className="text-[#9BA3AE]">
                      Purpose: <strong className="text-white">{activeFollowUp.purpose || activeFollowUp.reason}</strong>
                    </div>
                    {activeFollowUp.notes && (
                      <p className="p-2.5 rounded bg-[#101419] border border-white/5 text-[#CBD5E1]">
                        "{activeFollowUp.notes}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-[#9BA3AE]">
                    No follow-up currently scheduled.
                    <button
                      onClick={() => {
                        setTargetClassification('WARM');
                        setIsClassificationModalOpen(true);
                      }}
                      className="block mx-auto mt-2 text-[#00F2FE] hover:underline"
                    >
                      Schedule Follow-up →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LEVEL 4: COMMERCIAL VALUE & LEVEL 5: RESPONSIBILITY */}
          <div className="p-5 rounded-2xl bg-[#07090C] border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BA3AE] block">
                Level 4: Commercial Valuation
              </span>

              <div className="p-3 rounded-xl bg-[#101419] border border-white/5 flex items-center justify-between">
                <span className="text-[#9BA3AE]">Estimated Deal Value:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {formatCurrencyINR(latestLead?.estimated_deal_value)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#101419] border border-white/5 flex items-center justify-between">
                <span className="text-[#9BA3AE]">Closing Probability:</span>
                <span className="font-mono text-sm font-bold text-[#00F2FE]">
                  {latestLead?.closing_probability || stageMeta.defaultProbability}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#101419] border border-white/5 flex items-center justify-between">
                <span className="text-[#9BA3AE]">Expected Closing Date:</span>
                <span className="font-mono text-xs text-white">
                  {formatDateDisplay(latestLead?.expected_closing_date)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BA3AE] block mb-1.5">
                Level 5: Assigned Sales Executive
              </span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] text-xs font-bold">
                  {customer.assigned_user?.name?.[0] || 'A'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {customer.assigned_user?.name || 'Ashish (Super Admin)'}
                  </div>
                  <div className="text-[10px] font-mono text-[#9BA3AE]">
                    {customer.assigned_user?.email || 'admin@imagine360tours.in'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER 360 PROFILE & LOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#101419] p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
                  Customer 360 Account Overview
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#9BA3AE]">
                Account ID: {customer.id.slice(0, 8)}...
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs mt-4">
              <div className="p-3 rounded-xl bg-[#07090C] border border-white/5 space-y-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#9BA3AE] block uppercase">Company</span>
                  <div className="font-bold text-white text-sm">{customer.company || 'Individual Account'}</div>
                  <div className="text-[#9BA3AE] text-xs">Primary Contact: <strong className="text-white">{customer.name}</strong></div>
                </div>

                {customer.website ? (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#CBD5E1]">
                      <span className="text-sm">🌐</span>
                      <span className="text-[10px] font-mono text-[#9BA3AE] uppercase font-bold tracking-wider">Website</span>
                    </div>
                    <div className="font-mono text-xs text-white truncate" title={customer.website}>
                      {customer.website.replace(/^https?:\/\//i, '')}
                    </div>
                    <a
                      href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 text-[#00F2FE] text-xs font-semibold border border-[#00F2FE]/30 transition-colors cursor-pointer"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-[#9BA3AE]/50 text-[11px] italic">No website on record</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#07090C] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#9BA3AE] block">Direct Communication</span>
                <div className="text-white font-mono flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email ? (
                  <div className="text-[#9BA3AE] font-mono flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-[#00F2FE]" />
                    <span>{customer.email}</span>
                  </div>
                ) : (
                  <div className="text-[#9BA3AE]/50 text-[11px] italic">No email on record</div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#07090C] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#9BA3AE] block">Channel Source & Service</span>
                <div className="text-white font-semibold">{customer.source || 'Direct Outreach'}</div>
                <div className="text-[#00F2FE] text-[11px] font-mono">
                  {latestLead?.service?.name ? `Service: ${latestLead.service.name}` : 'Spatial 360 Walkthroughs'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#07090C] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#9BA3AE] block">Customer Status & History</span>
                <div className="text-white font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${classMeta.dotColor}`} />
                  <span>{classMeta.label} ({stageMeta.shortLabel})</span>
                </div>
                <div className="text-[#9BA3AE] text-[11px] font-mono">
                  Created {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="p-3 rounded-xl bg-[#07090C] border border-white/5 text-xs text-[#CBD5E1] mt-2">
              <span className="text-[10px] font-mono text-[#9BA3AE] block mb-0.5">Account Notes:</span>
              <p className="italic">"{customer.notes}"</p>
            </div>
          )}
        </div>

        {/* Section 8: Compact Customer Location Card & Mini Map (approx 300-400px wide on desktop) */}
        <div className="lg:col-span-1">
          <CustomerMiniMap
            customerId={customer.id}
            customerName={customer.name}
            company={customer.company}
            address={customer.address}
            city={customer.city}
            state={customer.state}
            pincode={customer.pincode}
            latitude={customer.latitude}
            longitude={customer.longitude}
            mapUrl={customer.map_url}
            onLocationUpdated={fetchCustomer}
          />
        </div>
      </div>

      {/* ACTIVITY & INTERACTION TIMELINE */}
      <div className="bg-[#101419] p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-white">
            Customer Activity & Interaction Timeline
          </h2>
          <span className="text-xs font-mono text-[#9BA3AE]">
            Live MySQL Log
          </span>
        </div>

        {/* Timeline items */}
        <div className="space-y-4">
          {/* Calls */}
          {customer.call_logs && customer.call_logs.length > 0 ? (
            customer.call_logs.map((call: any) => {
              const callClass = call.outcome as LeadClassification;
              const meta = CLASSIFICATIONS[callClass] || CLASSIFICATIONS.WARM;

              return (
                <div
                  key={call.id}
                  className="p-4 rounded-xl bg-[#07090C] border border-white/5 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">CALL LOGGED</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeStyle}`}>
                          Outcome: {call.outcome}
                        </span>
                        {call.lead?.stage && (
                          <span className="text-[10px] font-mono text-[#00F2FE]">
                            Stage: {SALES_STAGES[call.lead.stage as LeadStage]?.shortLabel || call.lead.stage}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#9BA3AE]">
                        {new Date(call.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[#CBD5E1] leading-relaxed">
                      {call.notes || 'No detailed call notes recorded.'}
                    </p>

                    <div className="mt-2 text-[10px] font-mono text-[#9BA3AE] flex items-center gap-3">
                      <span>Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s</span>
                      <span>Staff: {call.admin?.name || 'Admin'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[#9BA3AE] bg-[#07090C] rounded-xl border border-white/5">
              No calls logged yet. Use the "Call Customer" button above to initiate.
            </div>
          )}
        </div>
      </div>

      {/* Call Customer Modal */}
      {isCallOpen && (
        <CallCustomerModal
          isOpen={isCallOpen}
          onClose={() => setIsCallOpen(false)}
          customer={{
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            company: customer.company,
            serviceName: latestLead?.service?.name,
            currentStatus: currentClassification,
            currentStage: currentStage,
            leadId: latestLead?.id,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            pincode: customer.pincode,
            latitude: customer.latitude,
            longitude: customer.longitude,
            map_url: customer.map_url,
          }}
          onCallLogged={() => {
            setIsCallOpen(false);
            fetchCustomer();
          }}
        />
      )}

      {/* Stage Transition Modal */}
      {isStageModalOpen && latestLead && (
        <StageTransitionModal
          isOpen={isStageModalOpen}
          onClose={() => setIsStageModalOpen(false)}
          lead={{
            id: latestLead.id,
            classification: currentClassification,
            stage: currentStage,
            customer: { id: customer.id, name: customer.name, company: customer.company },
            service: latestLead.service,
            estimated_deal_value: latestLead.estimated_deal_value,
            expected_closing_date: latestLead.expected_closing_date,
            closing_probability: latestLead.closing_probability,
          }}
          onStageUpdated={() => {
            setIsStageModalOpen(false);
            fetchCustomer();
          }}
        />
      )}

      {/* Project Discussion Modal */}
      {isProjectDiscussionOpen && latestLead && (
        <ProjectDiscussionModal
          isOpen={isProjectDiscussionOpen}
          onClose={() => setIsProjectDiscussionOpen(false)}
          lead={{
            id: latestLead.id,
            customer: { id: customer.id, name: customer.name, company: customer.company },
            service: latestLead.service,
            estimated_deal_value: latestLead.estimated_deal_value,
            assigned_user: customer.assigned_user,
          }}
          onScheduled={() => {
            setIsProjectDiscussionOpen(false);
            fetchCustomer();
          }}
        />
      )}

      {/* Classification Change Modal */}
      {isClassificationModalOpen && (
        <Modal
          isOpen={isClassificationModalOpen}
          onClose={() => setIsClassificationModalOpen(false)}
          title="Update Primary Lead Classification"
          subtitle={`Customer: ${customer.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateClassification} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-[#9BA3AE] block mb-1">
                Select Classification *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['COLD', 'WARM', 'HOT'] as LeadClassification[]).map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setTargetClassification(c)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs ${
                      targetClassification === c
                        ? c === 'HOT'
                          ? 'bg-rose-950 border-rose-500 text-rose-300'
                          : c === 'WARM'
                          ? 'bg-amber-950 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-500 text-slate-300'
                        : 'bg-[#07090C] border-white/10 text-[#9BA3AE]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {targetClassification === 'WARM' && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="text-[11px] font-mono text-amber-400 font-bold">
                  WARM Follow-up Schedule (Required)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={classFollowUpDate}
                    onChange={(e) => setClassFollowUpDate(e.target.value)}
                    className="bg-[#07090C] border border-amber-500/30 rounded px-2 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="11:30 AM"
                    value={classFollowUpTime}
                    onChange={(e) => setClassFollowUpTime(e.target.value)}
                    className="bg-[#07090C] border border-amber-500/30 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                Reason / Update Notes
              </label>
              <textarea
                rows={2}
                value={classReason}
                onChange={(e) => setClassReason(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsClassificationModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00F2FE] text-black font-semibold text-xs"
              >
                Save Classification
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Note Modal */}
      {isNoteOpen && (
        <Modal
          isOpen={isNoteOpen}
          onClose={() => setIsNoteOpen(false)}
          title="Add Customer Discussion Note"
          subtitle={`Lead: ${customer.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                Internal Account Notes
              </label>
              <textarea
                rows={4}
                required
                placeholder="Enter client updates, property specifications, or pricing thoughts..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNoteOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00F2FE] text-black font-semibold text-xs"
              >
                Append Note
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
