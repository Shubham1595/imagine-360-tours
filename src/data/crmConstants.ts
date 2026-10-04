export type LeadClassification = 'COLD' | 'WARM' | 'HOT';

export type LeadStage =
  | 'LEAD_CAPTURED'
  | 'INITIAL_CONTACT'
  | 'NEEDS_ANALYSIS'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'VERBAL_COMMITMENT'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface ClassificationMeta {
  key: LeadClassification;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  badgeStyle: string;
  dotColor: string;
  bgGradient: string;
  borderColor: string;
}

export const CLASSIFICATIONS: Record<LeadClassification, ClassificationMeta> = {
  COLD: {
    key: 'COLD',
    label: 'Cold Lead',
    shortLabel: 'COLD',
    tagline: 'Low / no immediate interest',
    description: 'Customer is currently not interested, not ready, or has no immediate requirement.',
    badgeStyle: 'bg-slate-900/60 text-slate-300 border-slate-600/40',
    dotColor: 'bg-slate-400',
    bgGradient: 'from-slate-900/40 to-slate-950/40',
    borderColor: 'border-slate-700/50',
  },
  WARM: {
    key: 'WARM',
    label: 'Warm Lead',
    shortLabel: 'WARM',
    tagline: 'Interested but requires continued engagement',
    description: 'Customer has shown interest but requires continued discussion, clarification, follow-up or nurturing.',
    badgeStyle: 'bg-amber-950/50 text-amber-300 border-amber-500/40',
    dotColor: 'bg-amber-400',
    bgGradient: 'from-amber-950/30 to-slate-950/40',
    borderColor: 'border-amber-500/40',
  },
  HOT: {
    key: 'HOT',
    label: 'Hot Lead',
    shortLabel: 'HOT',
    tagline: 'High intent / active business opportunity',
    description: 'Customer has demonstrated strong interest and the opportunity is actively progressing toward project kickoff.',
    badgeStyle: 'bg-rose-950/60 text-rose-300 border-rose-500/50',
    dotColor: 'bg-rose-400',
    bgGradient: 'from-rose-950/40 to-slate-950/40',
    borderColor: 'border-rose-500/50',
  },
};

export interface StageMeta {
  key: LeadStage;
  stepNumber: string;
  label: string;
  shortLabel: string;
  description: string;
  defaultProbability: number;
  badgeStyle: string;
}

export const SALES_STAGES: Record<LeadStage, StageMeta> = {
  LEAD_CAPTURED: {
    key: 'LEAD_CAPTURED',
    stepNumber: '01',
    label: '01 — Lead Captured',
    shortLabel: 'Lead Captured',
    description: 'The lead has entered the CRM from website, referral, or inbound.',
    defaultProbability: 10,
    badgeStyle: 'bg-blue-950/40 text-blue-300 border-blue-500/30',
  },
  INITIAL_CONTACT: {
    key: 'INITIAL_CONTACT',
    stepNumber: '02',
    label: '02 — Initial Contact',
    shortLabel: 'Initial Contact',
    description: 'The sales executive has established first contact with the customer.',
    defaultProbability: 25,
    badgeStyle: 'bg-cyan-950/40 text-[#00F2FE] border-[#00F2FE]/30',
  },
  NEEDS_ANALYSIS: {
    key: 'NEEDS_ANALYSIS',
    stepNumber: '03',
    label: '03 — Needs Analysis',
    shortLabel: 'Needs Analysis',
    description: "The customer's spatial, virtual tour or architectural requirements are being analyzed.",
    defaultProbability: 40,
    badgeStyle: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30',
  },
  QUOTATION_SENT: {
    key: 'QUOTATION_SENT',
    stepNumber: '04',
    label: '04 — Quotation Sent',
    shortLabel: 'Quotation Sent',
    description: 'A formal commercial quotation or proposal has been submitted to the client.',
    defaultProbability: 55,
    badgeStyle: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
  },
  NEGOTIATION: {
    key: 'NEGOTIATION',
    stepNumber: '05',
    label: '05 — Negotiation',
    shortLabel: 'Negotiation',
    description: 'Pricing, deliverable scope, project terms or shoot dates are being discussed.',
    defaultProbability: 70,
    badgeStyle: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
  },
  VERBAL_COMMITMENT: {
    key: 'VERBAL_COMMITMENT',
    stepNumber: '06',
    label: '06 — Verbal Commitment',
    shortLabel: 'Verbal Commitment',
    description: 'Customer has explicitly indicated their agreement and intention to proceed.',
    defaultProbability: 85,
    badgeStyle: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
  },
  CLOSED_WON: {
    key: 'CLOSED_WON',
    stepNumber: '07',
    label: '07 — Closed Won',
    shortLabel: 'Closed Won',
    description: 'Business is confirmed. Ready to commission shoot and create active project.',
    defaultProbability: 100,
    badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold',
  },
  CLOSED_LOST: {
    key: 'CLOSED_LOST',
    stepNumber: '08',
    label: '08 — Closed Lost',
    shortLabel: 'Closed Lost',
    description: 'Opportunity has been closed without deal execution.',
    defaultProbability: 0,
    badgeStyle: 'bg-red-950/40 text-red-400 border-red-500/40',
  },
};

export const ORDERED_STAGES: LeadStage[] = [
  'LEAD_CAPTURED',
  'INITIAL_CONTACT',
  'NEEDS_ANALYSIS',
  'QUOTATION_SENT',
  'NEGOTIATION',
  'VERBAL_COMMITMENT',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export const COLD_REASONS = [
  'Not Interested',
  'No Current Requirement',
  'Budget Issue',
  'Already Working With Another Provider',
  'Contact Unreachable',
  'Requirement Postponed',
  'Other',
];

export const WARM_PURPOSES = [
  'Requirement Discussion',
  'Clarification',
  'Pricing Discussion',
  'Quotation Follow-up',
  'Virtual Tour Demo',
  'Meeting',
  'Decision Follow-up',
  'Other',
];

export type FollowUpType =
  | 'GENERAL_FOLLOW_UP'
  | 'PROJECT_DISCUSSION'
  | 'QUOTATION_FOLLOW_UP'
  | 'MEETING'
  | 'SITE_VISIT'
  | 'TECHNICAL_DISCUSSION'
  | 'SCOPE_FINALIZATION'
  | 'PRICING_DISCUSSION'
  | 'CONTRACT_DISCUSSION'
  | 'PROJECT_KICKOFF';

export const FOLLOW_UP_TYPES: { key: FollowUpType; label: string }[] = [
  { key: 'GENERAL_FOLLOW_UP', label: 'General Follow-up' },
  { key: 'PROJECT_DISCUSSION', label: 'Project Discussion' },
  { key: 'QUOTATION_FOLLOW_UP', label: 'Quotation Follow-up' },
  { key: 'MEETING', label: 'Meeting' },
  { key: 'SITE_VISIT', label: 'Site Visit' },
  { key: 'TECHNICAL_DISCUSSION', label: 'Technical Discussion' },
  { key: 'SCOPE_FINALIZATION', label: 'Scope Finalization' },
  { key: 'PRICING_DISCUSSION', label: 'Pricing Discussion' },
  { key: 'CONTRACT_DISCUSSION', label: 'Contract Discussion' },
  { key: 'PROJECT_KICKOFF', label: 'Project Kickoff' },
];

export const HOT_PROJECT_PURPOSES = [
  'Project Discussion',
  'Requirement Finalization',
  'Site Visit',
  'Technical Discussion',
  'Scope Finalization',
  'Pricing Discussion',
  'Contract Discussion',
  'Project Kickoff',
  'Documentation',
  'Other',
];

export const LOST_REASONS = [
  'Budget',
  'Competitor',
  'No Requirement',
  'Project Cancelled',
  'Project Postponed',
  'Unreachable',
  'Timing',
  'Other',
];

export const formatCurrencyINR = (amount?: number | string | null): string => {
  if (amount === undefined || amount === null || amount === '') return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatDateDisplay = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
