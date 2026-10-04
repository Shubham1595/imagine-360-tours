import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { leadApi, projectApi } from '../../lib/api';
import {
  SALES_STAGES,
  ORDERED_STAGES,
  CLASSIFICATIONS,
  LOST_REASONS,
  LeadClassification,
  LeadStage,
  formatCurrencyINR,
} from '../../data/crmConstants';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Briefcase,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface StageTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    classification: LeadClassification;
    stage: LeadStage;
    customer: { id: string; name: string; company?: string | null };
    service?: { id: string; name: string } | null;
    estimated_deal_value?: number | null;
    expected_closing_date?: string | null;
    closing_probability?: number | null;
  } | null;
  onStageUpdated: () => void;
}

export const StageTransitionModal: React.FC<StageTransitionModalProps> = ({
  isOpen,
  onClose,
  lead,
  onStageUpdated,
}) => {
  const currentClassification = lead?.classification || 'WARM';
  const currentStage = lead?.stage || 'LEAD_CAPTURED';

  const [selectedStage, setSelectedStage] = useState<LeadStage>(currentStage);
  const [dealValue, setDealValue] = useState<string>(
    lead?.estimated_deal_value ? String(lead.estimated_deal_value) : ''
  );
  const [closingDate, setClosingDate] = useState<string>(
    lead?.expected_closing_date
      ? new Date(lead.expected_closing_date).toISOString().split('T')[0]
      : ''
  );
  const [closingProb, setClosingProb] = useState<number>(
    lead?.closing_probability ?? SALES_STAGES[currentStage]?.defaultProbability ?? 50
  );
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [lostReason, setLostReason] = useState<string>('Budget');

  // Closed won specifics
  const [closedDate, setClosedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [createProject, setCreateProject] = useState<boolean>(false);
  const [cancelFollowUps, setCancelFollowUps] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStageSelect = (stage: LeadStage) => {
    setSelectedStage(stage);
    setClosingProb(SALES_STAGES[stage].defaultProbability);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setError(null);

    if (selectedStage === 'CLOSED_LOST') {
      if (!lostReason) {
        setError('Lost reason is required when transitioning to Closed Lost.');
        return;
      }
      if (!notes || notes.trim().length === 0) {
        setError('Explanatory transition notes are required when transitioning to Closed Lost.');
        return;
      }
    }

    if (selectedStage === 'CLOSED_WON' && (!dealValue || Number(dealValue) <= 0)) {
      setError('Final Deal Value is required when marking a deal as Closed Won.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        stage: selectedStage,
        notes: notes || undefined,
        reason: reason || undefined,
        expected_closing_date: closingDate || undefined,
        estimated_deal_value: dealValue ? Number(dealValue) : undefined,
        closing_probability: closingProb,
      };

      if (selectedStage === 'CLOSED_LOST') {
        payload.lost_reason = lostReason;
        payload.closed_date = closedDate;
        payload.cancel_pending_follow_ups = cancelFollowUps;
      }

      if (selectedStage === 'CLOSED_WON') {
        payload.closed_date = closedDate;
        payload.create_project = createProject;
        payload.service_id = lead.service?.id;
      }

      const res = await leadApi.updateStage(lead.id, payload);
      if (res.success) {
        onStageUpdated();
        onClose();
      } else {
        setError(res.error || 'Failed to update sales stage.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving stage transition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !lead) return null;

  const currentClassMeta = CLASSIFICATIONS[currentClassification];
  const targetStageMeta = SALES_STAGES[selectedStage];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Sales Pipeline Stage"
      subtitle={`Customer: ${lead.customer.name} ${lead.customer.company ? `(${lead.customer.company})` : ''}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header context card */}
        <div className="p-4 rounded-xl bg-[#07090C] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono text-[#9BA3AE] uppercase tracking-wider">
              Primary Lead Classification
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${currentClassMeta.dotColor}`} />
              <span className="font-heading font-bold text-base text-white">
                {currentClassMeta.label}
              </span>
              <span className="text-xs text-[#9BA3AE]">({currentClassMeta.tagline})</span>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] font-mono text-[#9BA3AE] uppercase tracking-wider">
              Current Stage
            </div>
            <div className="text-xs font-mono font-bold text-[#00F2FE] mt-1">
              {SALES_STAGES[currentStage]?.label}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Stage Selection Grid */}
        <div>
          <label className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider block mb-2">
            Select New Sales Sub-Stage *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ORDERED_STAGES.map((stg) => {
              const meta = SALES_STAGES[stg];
              const isSelected = selectedStage === stg;
              const isWon = stg === 'CLOSED_WON';
              const isLost = stg === 'CLOSED_LOST';

              return (
                <button
                  type="button"
                  key={stg}
                  onClick={() => handleStageSelect(stg)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? isWon
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : isLost
                        ? 'bg-red-500/20 border-red-400 text-white shadow-lg shadow-red-500/20'
                        : 'bg-[#00F2FE]/15 border-[#00F2FE] text-white shadow-lg shadow-[#00F2FE]/20'
                      : 'bg-[#07090C] border-white/5 hover:border-white/20 text-[#9BA3AE] hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-[#00F2FE]">
                    {meta.stepNumber}
                  </div>
                  <div className="text-xs font-semibold mt-1 truncate">
                    {meta.shortLabel}
                  </div>
                  <div className="text-[10px] font-mono mt-1 opacity-70">
                    {meta.defaultProbability}% Prob.
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#9BA3AE] mt-2 italic">
            "{targetStageMeta.description}"
          </p>
        </div>

        {/* Dynamic Fields based on Selected Stage */}
        {selectedStage === 'CLOSED_LOST' ? (
          /* CLOSED LOST FORM */
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase font-mono">
              <AlertCircle className="w-4 h-4" />
              <span>Closed Lost Details (Mandatory)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-red-200 block mb-1">
                  Primary Reason for Lost Deal *
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full bg-[#07090C] border border-red-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {LOST_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-mono text-red-200 block mb-1">
                  Closed Date *
                </label>
                <input
                  type="date"
                  required
                  value={closedDate}
                  onChange={(e) => setClosedDate(e.target.value)}
                  className="w-full bg-[#07090C] border border-red-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={cancelFollowUps}
                onChange={(e) => setCancelFollowUps(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-red-500 focus:ring-0"
              />
              <span className="text-xs text-red-200">
                Cancel all pending sales follow-ups for this lead
              </span>
            </label>
          </div>
        ) : selectedStage === 'CLOSED_WON' ? (
          /* CLOSED WON FORM */
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Closed Won Deal Execution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-emerald-200 block mb-1">
                  Final Deal Value (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 180000"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full bg-[#07090C] border border-emerald-500/40 rounded-lg pl-7 pr-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-emerald-200 block mb-1">
                  Confirmation Date *
                </label>
                <input
                  type="date"
                  required
                  value={closedDate}
                  onChange={(e) => setClosedDate(e.target.value)}
                  className="w-full bg-[#07090C] border border-emerald-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={createProject}
                onChange={(e) => setCreateProject(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-[#00F2FE] focus:ring-0"
              />
              <span className="text-xs text-white">
                Automatically create active project in Project Management pipeline
              </span>
            </label>
          </div>
        ) : (
          /* STANDARD STAGE COMMERCIAL FIELDS */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                Estimated Deal Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00F2FE] text-xs font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                Closing Probability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={closingProb}
                onChange={(e) => setClosingProb(Number(e.target.value))}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
                Expected Closing Date
              </label>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Transition Notes & Rationale */}
        <div>
          <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
            Transition Rationale / Discussion Notes
          </label>
          <textarea
            rows={3}
            placeholder="Record client feedback, pricing scope details, or discussion milestones..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#00F2FE] focus:outline-none placeholder-[#9BA3AE]/50"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center gap-1.5 ${
              selectedStage === 'CLOSED_WON'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                : selectedStage === 'CLOSED_LOST'
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                : 'bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black shadow-[#00F2FE]/20'
            }`}
          >
            {isSubmitting ? (
              'Updating Pipeline in MySQL...'
            ) : (
              <>
                <span>Commit Stage Transition</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
