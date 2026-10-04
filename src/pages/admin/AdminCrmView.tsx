import React, { useState, useEffect } from 'react';
import { customerApi, serviceApi } from '../../lib/api';
import {
  CLASSIFICATIONS,
  SALES_STAGES,
  ORDERED_STAGES,
  LeadClassification,
  LeadStage,
  formatCurrencyINR,
  formatDateDisplay,
} from '../../data/crmConstants';
import {
  Search,
  Filter,
  Plus,
  Phone,
  Calendar,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Clock,
  Sparkles,
  Kanban,
  Table as TableIcon,
  TrendingUp,
  Tag,
  DollarSign,
  User,
} from 'lucide-react';
import { CallCustomerModal } from './CallCustomerModal';
import { StageTransitionModal } from './StageTransitionModal';
import { AdminKanbanView } from './AdminKanbanView';

interface AdminCrmViewProps {
  onSelectCustomer: (customerId: string) => void;
}

export const AdminCrmView: React.FC<AdminCrmViewProps> = ({ onSelectCustomer }) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals State
  const [activeCallCustomer, setActiveCallCustomer] = useState<any | null>(null);
  const [stageModalLead, setStageModalLead] = useState<any | null>(null);

  // Create Customer Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    website: '',
    city: '',
    initial_classification: 'WARM' as LeadClassification,
    initial_stage: 'LEAD_CAPTURED' as LeadStage,
    service_id: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customerApi.list({
        page,
        limit: 12,
        search: search || undefined,
        classification: classificationFilter === 'ALL' ? undefined : classificationFilter,
        stage: stageFilter === 'ALL' ? undefined : stageFilter,
        service_id: serviceFilter || undefined,
        source: sourceFilter || undefined,
      });

      if (res.success && res.data) {
        setCustomers(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || 0);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, classificationFilter, stageFilter, serviceFilter, sourceFilter]);

  // Load services for filter dropdown
  useEffect(() => {
    serviceApi.listPublic().then((res) => {
      if (res.success && res.data) setServices(res.data);
    }).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerApi.create(createData);
      setIsCreateOpen(false);
      setCreateData({
        name: '',
        phone: '',
        email: '',
        company: '',
        website: '',
        city: '',
        initial_classification: 'WARM',
        initial_stage: 'LEAD_CAPTURED',
        service_id: '',
        notes: '',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-2xl text-white tracking-tight">
              Enterprise Lead Management & CRM
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 font-bold">
              {totalCount} Total Records
            </span>
          </div>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Level 1: <strong className="text-white">COLD / WARM / HOT</strong> Classification • Level 2:{' '}
            <strong className="text-[#00F2FE]">Sales Sub-Stages</strong> Pipeline • Live MySQL Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Kanban View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#07090C] border border-white/10">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#00F2FE] text-[#07090C] font-bold shadow-md shadow-[#00F2FE]/20' : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[#00F2FE] text-[#07090C] font-bold shadow-md shadow-[#00F2FE]/20' : 'text-[#9BA3AE] hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-tech font-bold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <AdminKanbanView
          onSelectCustomer={onSelectCustomer}
          onCallCustomer={(cust) => setActiveCallCustomer(cust)}
        />
      ) : (
        <>
          {/* Level 1 Primary Classification Bar */}
          <div className="bg-[#101419] p-4 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[11px] font-mono text-[#9BA3AE] uppercase tracking-wider mr-1">
                Classification:
              </span>
              {[
                { id: 'ALL', label: 'All Leads' },
                { id: 'HOT', label: '🔥 HOT Leads', desc: 'High Intent' },
                { id: 'WARM', label: '⚡ WARM Leads', desc: 'Active Nurturing' },
                { id: 'COLD', label: '❄ COLD Leads', desc: 'Low Intent' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => {
                    setClassificationFilter(btn.id);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap border ${
                    classificationFilter === btn.id
                      ? btn.id === 'HOT'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-500 font-bold shadow-lg shadow-rose-500/10'
                        : btn.id === 'WARM'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500 font-bold shadow-lg shadow-amber-500/10'
                        : btn.id === 'COLD'
                        ? 'bg-slate-900 text-slate-200 border-slate-500 font-bold'
                        : 'bg-[#00F2FE]/15 text-[#00F2FE] border-[#00F2FE] font-bold'
                      : 'bg-[#07090C] text-[#9BA3AE] hover:text-white border-white/5'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Level 2 Sub-Stage Dropdown Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-[#9BA3AE] uppercase tracking-wider">
                Sales Stage:
              </span>
              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#07090C] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F2FE] font-mono"
              >
                <option value="ALL">All Stages (01–08)</option>
                {ORDERED_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {SALES_STAGES[stg].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search & Service Filter */}
          <div className="p-4 rounded-xl bg-[#101419] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, phone, email, company, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#07090C] border border-white/10 rounded-xl text-xs text-white placeholder-[#9BA3AE] focus:outline-none focus:border-[#00F2FE]"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#07090C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#07090C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Website Enquiry Form">Website Enquiry Form</option>
                <option value="Direct Entry">Direct Entry</option>
                <option value="Referral">Referral</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
          </div>

          {/* CRM Data Table */}
          <div className="rounded-2xl bg-[#101419] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0A0E14] text-[#9BA3AE] font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Sales Stage</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Deal Value</th>
                    <th className="py-3 px-4">Sales Exec</th>
                    <th className="py-3 px-4">Next Follow-Up</th>
                    <th className="py-3 px-4">Expected Closing</th>
                    <th className="py-3 px-4">Last Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {isLoading ? (
                    <tr>
                      <td colSpan={12} className="py-16 text-center text-[#9BA3AE]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin" />
                          <span>Loading CRM records from MySQL...</span>
                        </div>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-16 text-center text-[#9BA3AE]">
                        No leads match the specified filter criteria.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => {
                      const lead = c.latest_lead;
                      const leadClass: LeadClassification =
                        lead?.classification || lead?.status || 'WARM';
                      const leadStage: LeadStage =
                        lead?.stage || 'LEAD_CAPTURED';

                      const classMeta = CLASSIFICATIONS[leadClass] || CLASSIFICATIONS.WARM;
                      const stageMeta = SALES_STAGES[leadStage] || SALES_STAGES.LEAD_CAPTURED;

                      const priority = lead?.priority || 'MEDIUM';
                      const priorityStyle =
                        priority === 'URGENT'
                          ? 'text-red-400 bg-red-950/40 border-red-500/40'
                          : priority === 'HIGH'
                          ? 'text-amber-400 bg-amber-950/40 border-amber-500/40'
                          : 'text-[#9BA3AE] bg-white/5 border-white/10';

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                          onClick={() => onSelectCustomer(c.id)}
                        >
                          {/* 1. Customer */}
                          <td className="py-3 px-4 font-sans">
                            <div className="font-semibold text-white group-hover:text-[#00F2FE] transition-colors">
                              {c.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#9BA3AE]">{c.phone}</div>
                          </td>

                          {/* 2. Company */}
                          <td className="py-3 px-4 text-[#CBD5E1] font-sans">
                            {c.company || '—'}
                          </td>

                          {/* 3. Service */}
                          <td className="py-3 px-4 text-[#CBD5E1]">
                            {lead?.service?.name || 'Spatial Architecture'}
                          </td>

                          {/* 4. Classification Badge (Level 1) */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${classMeta.badgeStyle}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${classMeta.dotColor}`} />
                              {classMeta.shortLabel}
                            </span>
                          </td>

                          {/* 5. Stage Badge (Level 2) */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${stageMeta.badgeStyle}`}>
                              {stageMeta.shortLabel}
                            </span>
                          </td>

                          {/* 6. Priority */}
                          <td className="py-3 px-4">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${priorityStyle}`}>
                              {priority}
                            </span>
                          </td>

                          {/* 7. Deal Value */}
                          <td className="py-3 px-4 text-emerald-400 font-bold">
                            {formatCurrencyINR(lead?.estimated_deal_value)}
                          </td>

                          {/* 8. Sales Executive */}
                          <td className="py-3 px-4 text-[#9BA3AE] font-sans">
                            {c.assigned_user?.name?.split(' ')[0] || 'Unassigned'}
                          </td>

                          {/* 9. Next Follow-Up */}
                          <td className="py-3 px-4">
                            {c.next_follow_up ? (
                              <div className="text-[11px] text-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{formatDateDisplay(c.next_follow_up.scheduled_date)}</span>
                              </div>
                            ) : (
                              <span className="text-[#64748B] text-[10px]">—</span>
                            )}
                          </td>

                          {/* 10. Expected Closing */}
                          <td className="py-3 px-4 text-[#CBD5E1] text-[11px]">
                            {formatDateDisplay(lead?.expected_closing_date)}
                          </td>

                          {/* 11. Last Contact */}
                          <td className="py-3 px-4 text-[#9BA3AE] text-[11px]">
                            {formatDateDisplay(lead?.last_contact_at || c.created_at)}
                          </td>

                          {/* 12. Actions */}
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Call Action */}
                              <button
                                onClick={() => setActiveCallCustomer({
                                  id: c.id,
                                  name: c.name,
                                  phone: c.phone,
                                  company: c.company,
                                  serviceName: lead?.service?.name,
                                  currentStatus: leadClass,
                                  currentStage: leadStage,
                                  leadId: lead?.id,
                                })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#00F2FE]/10 hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#07090C] border border-[#00F2FE]/30 transition-colors cursor-pointer text-[10px] font-bold"
                                title="Call customer"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call</span>
                              </button>

                              {/* Stage Transition Action */}
                              {lead && (
                                <button
                                  onClick={() => setStageModalLead({
                                    id: lead.id,
                                    classification: leadClass,
                                    stage: leadStage,
                                    customer: { id: c.id, name: c.name, company: c.company },
                                    service: lead.service,
                                    estimated_deal_value: lead.estimated_deal_value,
                                    expected_closing_date: lead.expected_closing_date,
                                    closing_probability: lead.closing_probability,
                                  })}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer text-[10px]"
                                  title="Change Sales Stage"
                                >
                                  <TrendingUp className="w-3 h-3 text-[#00F2FE]" />
                                  <span>Stage</span>
                                </button>
                              )}

                              {/* View 360 Profile */}
                              <button
                                onClick={() => onSelectCustomer(c.id)}
                                className="p-1 rounded text-[#9BA3AE] hover:text-white hover:bg-white/10"
                                title="View Customer 360"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="py-3.5 px-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-[#9BA3AE] bg-[#0A0E14]">
              <div>
                Page {page} of {totalPages} ({totalCount} total customers)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border border-white/10 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Prev</span>
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-white/10 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Call Customer Modal */}
      {activeCallCustomer && (
        <CallCustomerModal
          isOpen={!!activeCallCustomer}
          onClose={() => setActiveCallCustomer(null)}
          customer={activeCallCustomer}
          onCallLogged={() => {
            setActiveCallCustomer(null);
            fetchCustomers();
          }}
        />
      )}

      {/* Stage Transition Modal */}
      {stageModalLead && (
        <StageTransitionModal
          isOpen={!!stageModalLead}
          onClose={() => setStageModalLead(null)}
          lead={stageModalLead}
          onStageUpdated={() => {
            setStageModalLead(null);
            fetchCustomers();
          }}
        />
      )}

      {/* Create Customer Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101419] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Create New Customer Lead</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={createData.phone}
                    onChange={(e) => setCreateData({ ...createData, phone: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Email</label>
                  <input
                    type="email"
                    value={createData.email}
                    onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Company</label>
                  <input
                    type="text"
                    value={createData.company}
                    onChange={(e) => setCreateData({ ...createData, company: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Company Website</label>
                  <input
                    type="text"
                    placeholder="e.g. www.abchotels.com"
                    value={createData.website}
                    onChange={(e) => setCreateData({ ...createData, website: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none placeholder:text-[#64748B]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">City</label>
                  <input
                    type="text"
                    value={createData.city}
                    onChange={(e) => setCreateData({ ...createData, city: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Interested Service</label>
                  <select
                    value={createData.service_id}
                    onChange={(e) => setCreateData({ ...createData, service_id: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  >
                    <option value="">Select Service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Initial Classification</label>
                  <select
                    value={createData.initial_classification}
                    onChange={(e) => setCreateData({ ...createData, initial_classification: e.target.value as LeadClassification })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  >
                    <option value="HOT">HOT — High Intent</option>
                    <option value="WARM">WARM — Continued Nurturing</option>
                    <option value="COLD">COLD — Low Intent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Initial Sales Stage</label>
                  <select
                    value={createData.initial_stage}
                    onChange={(e) => setCreateData({ ...createData, initial_stage: e.target.value as LeadStage })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  >
                    {ORDERED_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {SALES_STAGES[stg].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={createData.notes}
                  onChange={(e) => setCreateData({ ...createData, notes: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black font-semibold text-xs"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
