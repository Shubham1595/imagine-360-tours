import React, { useState } from 'react';
import { callApi } from '../../lib/api';
import { Modal } from '../../components/Modal';
import {
  CLASSIFICATIONS,
  SALES_STAGES,
  ORDERED_STAGES,
  COLD_REASONS,
  FOLLOW_UP_TYPES,
  LeadClassification,
  LeadStage,
  FollowUpType,
} from '../../data/crmConstants';
import {
  Phone,
  Clock,
  AlertCircle,
  Calendar,
  User,
  ArrowRight,
  Flame,
  CheckCircle2,
  Tag,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface CallCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    company?: string | null;
    serviceName?: string | null;
    currentStatus?: LeadClassification | string;
    currentStage?: LeadStage | string;
    leadId?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    map_url?: string | null;
  } | null;
  onCallLogged: () => void;
}

export const CallCustomerModal: React.FC<CallCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onCallLogged,
}) => {
  // Level 1: Primary Classification
  const initialClassification: LeadClassification =
    customer?.currentStatus === 'COLD' || customer?.currentStatus === 'HOT'
      ? (customer.currentStatus as LeadClassification)
      : 'WARM';

  // Level 2: Secondary Sales Stage
  const initialStage: LeadStage =
    (customer?.currentStage as LeadStage) || 'INITIAL_CONTACT';

  const [outcome, setOutcome] = useState<LeadClassification>(initialClassification);
  const [stage, setStage] = useState<LeadStage>(initialStage);
  const [durationSeconds, setDurationSeconds] = useState<number>(180);
  const [notes, setNotes] = useState<string>('');

  // Next Action (Independent)
  const [nextAction, setNextAction] = useState<string>(
    initialClassification === 'HOT' ? 'Project Discussion' : 'Follow-up Call'
  );

  // Follow-up Scheduling (Independent)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [scheduleFollowUp, setScheduleFollowUp] = useState<boolean>(initialClassification !== 'COLD');
  const [followUpDate, setFollowUpDate] = useState<string>(tomorrow.toISOString().split('T')[0]);
  const [followUpTime, setFollowUpTime] = useState<string>('11:30 AM');
  const [followUpType, setFollowUpType] = useState<FollowUpType>(
    initialClassification === 'HOT' ? 'PROJECT_DISCUSSION' : 'GENERAL_FOLLOW_UP'
  );
  const [followUpPurpose, setFollowUpPurpose] = useState<string>('Discussion on client requirements');

  // COLD specific reason if applicable
  const [coldReason, setColdReason] = useState<string>('No Current Requirement');

  // Commercial estimation
  const [dealValue, setDealValue] = useState<string>('');
  const [expectedStartDate, setExpectedStartDate] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setError(null);

    if (scheduleFollowUp && (!followUpDate || !followUpTime)) {
      setError('Please provide both follow-up date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await callApi.logCall({
        customer_id: customer.id,
        lead_id: customer.leadId || undefined,
        duration: durationSeconds,
        outcome,
        stage,
        notes: notes || undefined,
        next_action: nextAction || undefined,
        follow_up_date: scheduleFollowUp ? followUpDate : undefined,
        follow_up_time: scheduleFollowUp ? followUpTime : undefined,
        follow_up_purpose: scheduleFollowUp ? followUpPurpose : undefined,
        follow_up_reason: scheduleFollowUp ? followUpPurpose : undefined,
        follow_up_type: scheduleFollowUp ? followUpType : undefined,
        cold_reason: outcome === 'COLD' ? coldReason : undefined,
        expected_start_date: expectedStartDate || undefined,
        estimated_project_value: dealValue ? Number(dealValue) : undefined,
      });

      onCallLogged();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Sales Call & Touchpoint"
      subtitle={`Client: ${customer.name} ${customer.company ? `(${customer.company})` : ''}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Quick Header */}
        <div className="p-4 rounded-xl bg-[#07090C] border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm font-heading font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#00F2FE]" />
              <span>{customer.name}</span>
              {customer.company && <span className="text-xs text-[#9BA3AE]">({customer.company})</span>}
            </div>
            <div className="text-xs font-mono text-[#CBD5E1] mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <a href={`tel:${customer.phone}`} className="hover:underline">
                  {customer.phone}
                </a>
              </span>
              {customer.serviceName && (
                <span className="text-[#9BA3AE]">• Service: <strong className="text-[#00F2FE]">{customer.serviceName}</strong></span>
              )}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#9BA3AE]" />
            <span className="text-[11px] font-mono text-[#9BA3AE]">Duration:</span>
            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="bg-[#101419] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
            >
              <option value={60}>1 min</option>
              <option value={180}>3 mins</option>
              <option value={300}>5 mins</option>
              <option value={600}>10 mins</option>
              <option value={900}>15 mins</option>
              <option value={1200}>20+ mins</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. PRIMARY CLASSIFICATION (INDEPENDENT) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider">
              1. Lead Classification (Customer Interest Level) *
            </label>
            <span className="text-[10px] font-mono text-[#00F2FE]">Independent Choice</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['COLD', 'WARM', 'HOT'] as LeadClassification[]).map((cls) => {
              const meta = CLASSIFICATIONS[cls];
              const isSelected = outcome === cls;

              return (
                <button
                  type="button"
                  key={cls}
                  onClick={() => setOutcome(cls)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? cls === 'HOT'
                        ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-500/20 ring-1 ring-rose-500/50'
                        : cls === 'WARM'
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/50'
                        : 'bg-slate-900 border-slate-400 text-white shadow-lg shadow-slate-500/20 ring-1 ring-slate-400/50'
                      : 'bg-[#07090C] border-white/10 hover:border-white/20 text-[#9BA3AE] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heading font-bold text-sm tracking-wide">
                      {meta.label}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${meta.dotColor}`} />
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-80">
                    {meta.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SALES STAGE (INDEPENDENT) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider">
              2. Sales Pipeline Stage (Independent of Classification) *
            </label>
            <span className="text-[10px] font-mono text-[#9BA3AE]">Does not auto-change</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ORDERED_STAGES.map((stg) => {
              const meta = SALES_STAGES[stg];
              const isSelected = stage === stg;

              return (
                <button
                  type="button"
                  key={stg}
                  onClick={() => setStage(stg)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00F2FE]/20 border-[#00F2FE] text-white font-semibold ring-1 ring-[#00F2FE]/40'
                      : 'bg-[#07090C] border-white/5 text-[#9BA3AE] hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-[#00F2FE]">
                    {meta.stepNumber}
                  </div>
                  <div className="text-xs truncate">{meta.shortLabel}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. NEXT ACTION (INDEPENDENT) */}
        <div>
          <label className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider block mb-1">
            3. Next Action / Deliverable
          </label>
          <input
            type="text"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="e.g. Project Discussion, Quotation Follow-up, Scope Finalization"
            className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
          />
        </div>

        {/* 4. FOLLOW-UP SCHEDULING (INDEPENDENT) */}
        <div className="p-4 rounded-xl bg-[#07090C] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer font-heading">
              <input
                type="checkbox"
                checked={scheduleFollowUp}
                onChange={(e) => setScheduleFollowUp(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-[#00F2FE] focus:ring-0"
              />
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Schedule Follow-up Task</span>
              </span>
            </label>
            <span className="text-[10px] font-mono text-[#9BA3AE]">Source of Truth: follow_ups</span>
          </div>

          {scheduleFollowUp && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                    Follow-up Type *
                  </label>
                  <select
                    value={followUpType}
                    onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}
                    className="w-full bg-[#101419] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {FOLLOW_UP_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required={scheduleFollowUp}
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full bg-[#101419] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required={scheduleFollowUp}
                    placeholder="e.g. 11:30 AM"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full bg-[#101419] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 14: Site Visit Target Location */}
              {followUpType === 'SITE_VISIT' && (
                <div className="p-3 rounded-xl bg-[#101419] border border-[#00F2FE]/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#00F2FE] flex items-center gap-1.5 uppercase">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Target Site Visit Location</span>
                    </span>
                    {(customer.map_url || (customer.latitude && customer.longitude)) && (
                      <a
                        href={customer.map_url || `https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-[#00F2FE] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>View Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-white">
                    <strong>Customer:</strong> {customer.name} {customer.company ? `(${customer.company})` : ''}
                  </div>
                  <div className="text-xs text-[#CBD5E1]">
                    <strong>Location:</strong>{' '}
                    {[customer.address, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ') || 'No street address saved for customer.'}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                  Follow-up Purpose / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discuss virtual tour scope & commercial quotation"
                  value={followUpPurpose}
                  onChange={(e) => setFollowUpPurpose(e.target.value)}
                  className="w-full bg-[#101419] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* COLD Reason if outcome is COLD */}
        {outcome === 'COLD' && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
            <span className="text-xs font-bold text-slate-300 font-heading block">
              Cold Lead Drop-off Reason
            </span>
            <select
              value={coldReason}
              onChange={(e) => setColdReason(e.target.value)}
              className="w-full bg-[#07090C] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              {COLD_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Call Discussion Notes */}
        <div>
          <label className="text-xs font-mono text-[#9BA3AE] block mb-1">
            Call Discussion Notes
          </label>
          <textarea
            rows={2}
            placeholder="Record client discussion summary, requirements, or next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black shadow-lg shadow-[#00F2FE]/20 flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              'Logging Call in MySQL...'
            ) : (
              <>
                <span>Save Call & Update Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
