import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SALES', 'STAFF', 'USER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  company: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  map_url: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
});

export const leadStageEnum = z.enum([
  'LEAD_CAPTURED',
  'INITIAL_CONTACT',
  'NEEDS_ANALYSIS',
  'QUOTATION_SENT',
  'NEGOTIATION',
  'VERBAL_COMMITMENT',
  'CLOSED_WON',
  'CLOSED_LOST',
]);

export const followUpTypeEnum = z.enum([
  'GENERAL_FOLLOW_UP',
  'PROJECT_DISCUSSION',
  'QUOTATION_FOLLOW_UP',
  'MEETING',
  'SITE_VISIT',
  'TECHNICAL_DISCUSSION',
  'SCOPE_FINALIZATION',
  'PRICING_DISCUSSION',
  'CONTRACT_DISCUSSION',
  'PROJECT_KICKOFF',
]);

export const leadStatusUpdateSchema = z.object({
  status: z.enum(['COLD', 'WARM', 'HOT']).optional(),
  classification: z.enum(['COLD', 'WARM', 'HOT']).optional(),
  stage: leadStageEnum.optional(),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  follow_up_date: z.string().optional().nullable(),
  follow_up_time: z.string().optional().nullable(),
  follow_up_purpose: z.string().optional().nullable(),
  next_action: z.string().optional().nullable(),
  estimated_deal_value: z.number().optional().nullable(),
  expected_closing_date: z.string().optional().nullable(),
  closing_probability: z.number().optional().nullable(),
  lost_reason: z.string().optional().nullable(),
});

export const leadStageUpdateSchema = z.object({
  stage: leadStageEnum,
  notes: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  expected_closing_date: z.string().optional().nullable(),
  estimated_deal_value: z.number().optional().nullable(),
  closing_probability: z.number().optional().nullable(),
  lost_reason: z.string().optional().nullable(),
  closed_date: z.string().optional().nullable(),
  create_project: z.boolean().optional().nullable(),
  service_id: z.string().optional().nullable(),
  cancel_pending_follow_ups: z.boolean().optional().default(true),
}).refine((data) => {
  if (data.stage === 'CLOSED_LOST') {
    return (
      !!data.lost_reason &&
      data.lost_reason.trim().length > 0 &&
      !!data.notes &&
      data.notes.trim().length > 0 &&
      !!data.closed_date &&
      data.closed_date.trim().length > 0
    );
  }
  return true;
}, {
  message: 'Lost reason, notes, and closed date are required when marking lead as Closed Lost',
  path: ['lost_reason'],
});

export const callLogSchema = z.object({
  customer_id: z.string().uuid('Valid customer ID is required'),
  lead_id: z.string().uuid().optional().nullable(),
  duration: z.number().int().nonnegative().default(0),
  outcome: z.enum(['COLD', 'WARM', 'HOT']),
  stage: leadStageEnum.optional().nullable(),
  notes: z.string().optional().nullable(),
  // Follow-up scheduling fields:
  follow_up_date: z.string().optional().nullable(),
  follow_up_time: z.string().optional().nullable(),
  follow_up_reason: z.string().optional().nullable(),
  follow_up_purpose: z.string().optional().nullable(),
  follow_up_type: followUpTypeEnum.optional().nullable(),
  // COLD outcome fields:
  cold_reason: z.string().optional().nullable(),
  // HOT outcome fields:
  next_action: z.string().optional().nullable(),
  expected_start_date: z.string().optional().nullable(),
  estimated_project_value: z.number().optional().nullable(),
});

export const followUpCreateSchema = z.object({
  customer_id: z.string().uuid(),
  lead_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  type: followUpTypeEnum.default('GENERAL_FOLLOW_UP'),
  purpose: z.string().optional().nullable(),
  scheduled_date: z.string().min(10, 'Valid date (YYYY-MM-DD) is required'),
  scheduled_time: z.string().min(2, 'Time is required'),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  expected_start_date: z.string().optional().nullable(),
  estimated_project_value: z.number().optional().nullable(),
  next_action: z.string().optional().nullable(),
});

export const followUpCompleteSchema = z.object({
  outcome: z.enum(['COLD', 'WARM', 'HOT']).optional().nullable(),
  stage: leadStageEnum.optional().nullable(),
  notes: z.string().optional().nullable(),
  next_action: z.string().optional().nullable(),
  // If scheduling next follow-up:
  next_follow_up_date: z.string().optional().nullable(),
  next_follow_up_time: z.string().optional().nullable(),
  next_follow_up_reason: z.string().optional().nullable(),
  next_follow_up_type: followUpTypeEnum.optional().nullable(),
});

export const enquiryCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Valid email address is required'),
  company: z.string().optional().nullable(),
  service_id: z.string().optional().nullable(),
  project_type: z.string().min(2, 'Project type is required'),
  project_location: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  description: z.string().min(5, 'Please provide a project description'),
});

export const bookingCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Valid email address is required'),
  service_id: z.string().optional().nullable(),
  service_name: z.string().optional().nullable(),
  booking_date: z.string().min(10, 'Booking date is required'),
  amount: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const projectCreateSchema = z.object({
  customer_id: z.string().uuid(),
  service_id: z.string().uuid().optional().nullable(),
  project_name: z.string().min(2, 'Project name is required'),
  status: z.enum(['PLANNING', 'CAPTURE', 'PROCESSING', 'IN_REVIEW', 'DELIVERED', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).default('PLANNING'),
  start_date: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  amount: z.number().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const quotationStatusEnum = z.enum([
  'DRAFT',
  'SENT',
  'VIEWED',
  'NEGOTIATION',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
]);

export const quotationItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be greater than 0').default(1),
  unit_price: z.number().nonnegative('Unit price must be non-negative'),
  total: z.number().nonnegative().optional(),
});

export const quotationCreateSchema = z.object({
  customer_id: z.string().uuid('Valid customer ID is required'),
  lead_id: z.string().uuid().optional().nullable(),
  service_id: z.string().uuid().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, 'At least one line item is required'),
  subtotal: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total_amount: z.number().positive('Total amount must be greater than 0').optional(),
  validity_days: z.number().int().positive().default(30),
  valid_until: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  status: quotationStatusEnum.default('DRAFT'),
});

export const quotationUpdateSchema = quotationCreateSchema.partial();

