export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SALES' | 'STAFF' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type LeadStatus = 'COLD' | 'WARM' | 'HOT';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'CONVERTED' | 'LOST';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type ProjectStatus = 'PLANNING' | 'CAPTURE' | 'PROCESSING' | 'IN_REVIEW' | 'DELIVERED' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  created_at: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  company?: string | null;
  city?: string | null;
  address?: string | null;
  source?: string | null;
  assigned_to?: string | null;
  assigned_user?: UserSummary | null;
  created_at: string;
  updated_at: string;
  leads_count?: number;
  latest_lead?: LeadSummary | null;
  last_contact_at?: string | null;
}

export interface LeadSummary {
  id: string;
  customer_id: string;
  service_id?: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  source?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: CustomerSummary;
  service?: ServiceSummary;
}

export interface CallLogSummary {
  id: string;
  customer_id: string;
  lead_id?: string | null;
  admin_id: string;
  call_started_at: string;
  duration: number; // in seconds
  outcome: LeadStatus;
  notes?: string | null;
  created_at: string;
  customer?: CustomerSummary;
  admin?: UserSummary;
}

export interface FollowUpSummary {
  id: string;
  customer_id: string;
  lead_id?: string | null;
  assigned_to?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // e.g. "11:30 AM"
  reason?: string | null;
  status: FollowUpStatus;
  notes?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  customer?: CustomerSummary;
  assigned_user?: UserSummary;
}

export interface ServiceSummary {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price?: number | null;
  duration?: string | null;
  status: ServiceStatus;
  created_at: string;
}

export interface EnquirySummary {
  id: string;
  customer_id: string;
  project_type: string;
  project_location?: string | null;
  budget?: string | null;
  description?: string | null;
  status: EnquiryStatus;
  created_at: string;
  customer?: CustomerSummary;
}

export interface BookingSummary {
  id: string;
  customer_id: string;
  service_id?: string | null;
  booking_date: string;
  status: BookingStatus;
  amount?: number | null;
  notes?: string | null;
  created_at: string;
  customer?: CustomerSummary;
  service?: ServiceSummary;
}

export interface ProjectSummary {
  id: string;
  customer_id: string;
  service_id?: string | null;
  project_name: string;
  status: ProjectStatus;
  start_date?: string | null;
  deadline?: string | null;
  amount?: number | null;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
  customer?: CustomerSummary;
  service?: ServiceSummary;
  manager?: UserSummary;
}

export interface ImportBatchSummary {
  id: string;
  filename: string;
  uploaded_by?: string | null;
  total_records: number;
  successful_records: number;
  duplicate_records: number;
  failed_records: number;
  created_at: string;
  uploader?: UserSummary;
}

export interface ImportErrorSummary {
  id: string;
  batch_id: string;
  row_number: number;
  raw_data?: string | null;
  error_message: string;
  created_at: string;
}

export interface AuditLogSummary {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: string | null;
  created_at: string;
  user?: UserSummary;
}

export interface AdminDashboardStats {
  totalCustomers: number;
  totalLeads: number;
  coldLeads: number;
  warmLeads: number;
  hotLeads: number;
  todayFollowUps: number;
  overdueFollowUps: number;
  newEnquiries: number;
  activeProjects: number;
}

export interface AdminReportsData {
  statusDistribution: { status: LeadStatus; count: number }[];
  leadsByService: { serviceName: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  monthlyEnquiries: { month: string; count: number }[];
  callsPerDay: { date: string; count: number }[];
  followUpCompletionRate: { completed: number; pending: number; overdue: number };
  conversionRates: { totalLeads: number; hotLeads: number; totalProjects: number; conversionPercentage: number };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}
