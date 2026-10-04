import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { leadApi } from '../../lib/api';
import { HOT_PROJECT_PURPOSES } from '../../data/crmConstants';
import {
  Calendar,
  Clock,
  Briefcase,
  DollarSign,
  User,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ProjectDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    customer: { id: string; name: string; company?: string | null };
    service?: { id: string; name: string } | null;
    estimated_deal_value?: number | null;
    assigned_user?: { id: string; name: string } | null;
  } | null;
  onScheduled: () => void;
}

export const ProjectDiscussionModal: React.FC<ProjectDiscussionModalProps> = ({
  isOpen,
  onClose,
  lead,
  onScheduled,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [scheduledDate, setScheduledDate] = useState<string>(
    tomorrow.toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>('11:30 AM');
  const [purpose, setPurpose] = useState<string>('Scope Finalization');
  const [nextAction, setNextAction] = useState<string>(
    'Review technical walkthrough scope & quotation'
  );
  const [expectedStartDate, setExpectedStartDate] = useState<string>('');
  const [projectValue, setProjectValue] = useState<string>(
    lead?.estimated_deal_value ? String(lead.estimated_deal_value) : ''
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    if (!scheduledDate || !scheduledTime) {
      setError('Discussion date and time are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await leadApi.scheduleProjectFollowUp(lead.id, {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        purpose,
        type: 'PROJECT_DISCUSSION',
        next_action: nextAction,
        notes: notes || undefined,
        expected_start_date: expectedStartDate || undefined,
        estimated_project_value: projectValue ? Number(projectValue) : undefined,
      });

      if (res.success) {
        onScheduled();
        onClose();
      } else {
        setError(res.error || 'Failed to schedule project discussion.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while scheduling project discussion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Project Discussion Follow-up"
      subtitle={`HOT Opportunity: ${lead.customer.name} ${lead.customer.company ? `• ${lead.customer.company}` : ''}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                Active Hot Opportunity
              </div>
              <div className="text-[11px] text-[#9BA3AE]">
                Service: <span className="text-[#00F2FE]">{lead.service?.name || 'Spatial Architecture & Twin'}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
              Discussion Date *
            </label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
              Discussion Time *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 11:30 AM"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
            Discussion Purpose *
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
          >
            {HOT_PROJECT_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Next Action */}
        <div>
          <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
            Next Action / Deliverable
          </label>
          <input
            type="text"
            placeholder="e.g. Present drone sample & architectural estimate"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
          />
        </div>

        {/* Value and Expected Start */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
              Estimated Project Value (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                placeholder="e.g. 180000"
                value={projectValue}
                onChange={(e) => setProjectValue(e.target.value)}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono focus:border-[#00F2FE] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
              Expected Project Start Date
            </label>
            <input
              type="date"
              value={expectedStartDate}
              onChange={(e) => setExpectedStartDate(e.target.value)}
              className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-[#00F2FE] focus:outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">
            Discussion Agenda & Client Requirements
          </label>
          <textarea
            rows={2}
            placeholder="Key discussion points, stakeholders attending, specific questions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
          />
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black shadow-lg shadow-[#00F2FE]/20 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              'Scheduling...'
            ) : (
              <>
                <span>Schedule Project Discussion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
