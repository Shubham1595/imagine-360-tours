// Configurable API base URL: reads VITE_API_URL (e.g. https://api.imagine360tours.in/api) or defaults to /api for dev proxy
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export function getAuthToken(): string | null {
  return localStorage.getItem('imagine360_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('imagine360_token', token);
  } else {
    localStorage.removeItem('imagine360_token');
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string; meta?: any }> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// 1. Auth APIs
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (payload: { name: string; email: string; phone?: string; password: string }) =>
    apiRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => apiRequest<any>('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

// 2. Customers & CRM APIs
export const customerApi = {
  list: (params: { page?: number; limit?: number; search?: string; status?: string; classification?: string; stage?: string; priority?: string; service_id?: string; source?: string; assigned_to?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.classification) q.set('classification', params.classification);
    if (params.stage) q.set('stage', params.stage);
    if (params.priority) q.set('priority', params.priority);
    if (params.service_id) q.set('service_id', params.service_id);
    if (params.source) q.set('source', params.source);
    if (params.assigned_to) q.set('assigned_to', params.assigned_to);
    return apiRequest<any[]>(`/customers?${q.toString()}`);
  },
  getById: (id: string) => apiRequest<any>(`/customers/${id}`),
  create: (data: any) =>
    apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// 3. Leads APIs
export const leadApi = {
  list: (params?: { status?: string; classification?: string; stage?: string; priority?: string; service_id?: string; search?: string }) => {
    const q = new URLSearchParams(params as any);
    return apiRequest<any[]>(`/leads?${q.toString()}`);
  },
  kanban: (classification?: string) =>
    apiRequest<any>(`/leads/kanban${classification ? `?classification=${classification}` : ''}`),
  updateStatus: (id: string, data: { status?: 'COLD' | 'WARM' | 'HOT'; classification?: 'COLD' | 'WARM' | 'HOT'; stage?: string; reason?: string; notes?: string; follow_up_date?: string; follow_up_time?: string; follow_up_purpose?: string; next_action?: string; estimated_deal_value?: number; expected_closing_date?: string; closing_probability?: number }) =>
    apiRequest(`/leads/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateStage: (id: string, data: { stage: string; notes?: string; reason?: string; expected_closing_date?: string; estimated_deal_value?: number; closing_probability?: number; lost_reason?: string; closed_date?: string; create_project?: boolean; service_id?: string }) =>
    apiRequest(`/leads/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  scheduleProjectFollowUp: (id: string, data: { scheduled_date: string; scheduled_time: string; purpose?: string; type?: string; notes?: string; assigned_to?: string; next_action?: string; expected_start_date?: string; estimated_project_value?: number }) =>
    apiRequest(`/leads/${id}/project-follow-up`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createProject: (id: string) =>
    apiRequest<any>(`/leads/${id}/create-project`, {
      method: 'POST',
    }),
};

// 4. Calls APIs
export const callApi = {
  logCall: (data: { customer_id: string; lead_id?: string; duration: number; outcome: 'COLD' | 'WARM' | 'HOT'; stage?: string; notes?: string; follow_up_date?: string; follow_up_time?: string; follow_up_reason?: string; follow_up_purpose?: string; follow_up_type?: string; cold_reason?: string; next_action?: string; expected_start_date?: string; estimated_project_value?: number }) =>
    apiRequest('/calls', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getByCustomer: (customerId: string) => apiRequest<any[]>(`/calls/customer/${customerId}`),
  list: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams(params as any);
    return apiRequest<any[]>(`/calls?${q.toString()}`);
  },
};

// 5. Follow-ups APIs
export const followUpApi = {
  list: (view: 'all' | 'today' | 'overdue' | 'upcoming' | 'completed' = 'all', type?: string) =>
    apiRequest<any[]>(`/follow-ups?view=${view}${type ? `&type=${type}` : ''}`),
  create: (data: any) =>
    apiRequest('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  complete: (id: string, data: { outcome?: 'COLD' | 'WARM' | 'HOT'; stage?: string; notes?: string; next_action?: string; next_follow_up_date?: string; next_follow_up_time?: string; next_follow_up_reason?: string; next_follow_up_type?: string }) =>
    apiRequest(`/follow-ups/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/follow-ups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 6. Enquiries APIs
export const enquiryApi = {
  submit: (data: { name: string; phone: string; email: string; company?: string; project_type: string; project_location?: string; budget?: string; description: string }) =>
    apiRequest('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  list: (params?: { page?: number; status?: string }) => {
    const q = new URLSearchParams(params as any);
    return apiRequest<any[]>(`/enquiries?${q.toString()}`);
  },
  updateStatus: (id: string, status: string) =>
    apiRequest(`/enquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// 7. Bookings APIs
export const bookingApi = {
  submit: (data: { name: string; phone: string; email: string; service_id?: string; service_name?: string; booking_date: string; amount?: number; notes?: string }) =>
    apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  list: (params?: { page?: number; status?: string }) => {
    const q = new URLSearchParams(params as any);
    return apiRequest<any[]>(`/bookings?${q.toString()}`);
  },
  updateStatus: (id: string, status: string) =>
    apiRequest(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// 7.5 Quotations APIs
export const quotationApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: string; customer_id?: string; lead_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.customer_id) q.set('customer_id', params.customer_id);
    if (params?.lead_id) q.set('lead_id', params.lead_id);
    return apiRequest<any[]>(`/quotations?${q.toString()}`);
  },
  getById: (id: string) => apiRequest<any>(`/quotations/${id}`),
  create: (data: any) =>
    apiRequest('/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string) =>
    apiRequest(`/quotations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    apiRequest(`/quotations/${id}`, {
      method: 'DELETE',
    }),
};

// 8. Projects APIs
export const projectApi = {
  list: (status?: string) => apiRequest<any[]>(`/projects${status ? `?status=${status}` : ''}`),
  create: (data: any) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  togglePublicVisibility: (id: string, payload: { is_public?: boolean; is_featured?: boolean; display_order?: number; public_description?: string; cover_image?: string }) =>
    apiRequest(`/projects/${id}/public-visibility`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// 9. Services APIs
export const serviceApi = {
  listPublic: () => apiRequest<any[]>('/public/services'),
  listAdmin: () => apiRequest<any[]>('/services/all'),
  getById: (id: string) => apiRequest<any>(`/services/${id}`),
  create: (data: any) =>
    apiRequest('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleAvailability: (id: string, is_active?: boolean) =>
    apiRequest(`/services/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    }),
  toggleVisibility: (id: string, is_visible?: boolean) =>
    apiRequest(`/services/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ is_visible }),
    }),
  toggleFeatured: (id: string, is_featured?: boolean) =>
    apiRequest(`/services/${id}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ is_featured }),
    }),
  reorder: (orders: { id: string; display_order: number }[]) =>
    apiRequest('/services/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orders }),
    }),
  delete: (id: string) =>
    apiRequest(`/services/${id}`, {
      method: 'DELETE',
    }),
};

// 9.5 Public Website APIs (Unauthenticated, database-driven)
export const publicApi = {
  getServices: () => apiRequest<any[]>('/public/services'),
  getProjects: () => apiRequest<any[]>('/public/projects'),
  getSettings: () => apiRequest<Record<string, string>>('/public/settings'),
};

// 10. Import APIs
export const importApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<any>('/import/upload', {
      method: 'POST',
      body: formData,
    });
  },
  validateRows: (rows: any[], mapping: Record<string, string>) =>
    apiRequest<any>('/import/validate', {
      method: 'POST',
      body: JSON.stringify({ rows, mapping }),
    }),
  confirmImport: (payload: { filename: string; validRecords: any[]; duplicates: any[]; invalidRecords: any[] }) =>
    apiRequest<any>('/import/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getBatches: () => apiRequest<any[]>('/import/batches'),
  getBatchErrors: (id: string) => apiRequest<any>(`/import/batches/${id}/errors`),
};

// 11. Admin Dashboard & Reports APIs
export const adminApi = {
  getDashboardStats: () => apiRequest<any>('/admin/dashboard'),
  getReports: () => apiRequest<any>('/admin/reports'),
  getUsers: () => apiRequest<any[]>('/admin/users'),
  createUser: (data: any) =>
    apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUserRole: (id: string, data: { role?: string; status?: string }) =>
    apiRequest(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAuditLogs: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams(params as any);
    return apiRequest<any[]>(`/admin/audit-logs?${q.toString()}`);
  },
  getSettings: () => apiRequest<Record<string, string>>('/admin/settings'),
  updateSettings: (settings: Record<string, string> | any[]) =>
    apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
};
