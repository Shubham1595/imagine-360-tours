import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  AlertCircle,
  X,
  Printer,
  Building2,
} from 'lucide-react';
import { quotationApi, customerApi } from '../../lib/api';

interface QuotationItem {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

export const AdminQuotationsView: React.FC<{
  onSelectCustomer?: (customerId: string) => void;
}> = ({ onSelectCustomer }) => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Create form state
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. 50% advance upon project sign-off; 50% upon successful delivery.\n2. Quotation valid for 30 days.\n3. Turnaround time: 3-5 business days post capture.'
  );
  const [taxPercent, setTaxPercent] = useState(18); // standard 18% GST for digital services
  const [discountAmount, setDiscountAmount] = useState(0);
  const [items, setItems] = useState<QuotationItem[]>([
    { description: '360° Immersive Virtual Tour (Up to 5,000 sq ft)', quantity: 1, unit_price: 35000 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await quotationApi.list({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success && res.data) {
        setQuotations(res.data);
        setMeta(res.meta);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchQuotations();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load customers for create modal
  const loadCustomers = async () => {
    try {
      const res = await customerApi.list({ limit: 100 });
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (e) {
      console.error('Failed to load customers for quotation', e);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    setFormError(null);
    loadCustomers();
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
  const taxAmount = ((subtotal - Number(discountAmount || 0)) * (Number(taxPercent) || 0)) / 100;
  const grandTotal = Math.max(0, subtotal - Number(discountAmount || 0) + (taxAmount > 0 ? taxAmount : 0));

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError('Please select a customer.');
      return;
    }

    if (items.length === 0 || !items.some(i => i.description.trim() && i.unit_price > 0)) {
      setFormError('Please add at least one line item with a description and unit price.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customer_id: selectedCustomerId,
        items: items.map(i => ({
          description: i.description.trim(),
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          total: (Number(i.quantity) || 1) * (Number(i.unit_price) || 0),
        })),
        subtotal,
        discount: Number(discountAmount) || 0,
        tax: Number(taxAmount) || 0,
        total_amount: grandTotal,
        validity_days: Number(validityDays) || 30,
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
        status: 'DRAFT',
      };

      const res = await quotationApi.create(payload);
      if (res.success) {
        setCreateModalOpen(false);
        // Reset form
        setSelectedCustomerId('');
        setItems([{ description: '360° Immersive Virtual Tour (Up to 5,000 sq ft)', quantity: 1, unit_price: 35000 }]);
        setDiscountAmount(0);
        fetchQuotations();
      }
    } catch (err: any) {
      setFormError(err.message || 'Unable to create quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setStatusUpdatingId(id);
      await quotationApi.updateStatus(id, newStatus);
      setQuotations(prev =>
        prev.map(q => (q.id === id ? { ...q, status: newStatus } : q))
      );
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote({ ...selectedQuote, status: newStatus });
      }
    } catch (err: any) {
      alert(`Error updating quotation status: ${err.message}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteQuotation = async (id: string, quoteNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quoteNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await quotationApi.delete(id);
      setQuotations(prev => prev.filter(q => q.id !== id));
      if (selectedQuote?.id === id) {
        setPreviewModalOpen(false);
      }
    } catch (err: any) {
      alert(`Error deleting quotation: ${err.message}`);
    }
  };

  // Metrics
  const totalValue = quotations.reduce((acc, q) => acc + (Number(q.total_amount) || 0), 0);
  const acceptedQuotes = quotations.filter(q => q.status === 'ACCEPTED');
  const sentQuotes = quotations.filter(q => q.status === 'SENT');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/80 border border-white/10">DRAFT</span>;
      case 'SENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">SENT</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACCEPTED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">REJECTED</span>;
      case 'NEGOTIATION':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">NEGOTIATION</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">EXPIRED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-white/60">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#00F2FE]" />
            Quotations & Proposals
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1 font-mono">
            Commercial proposals, formal estimates, and deal documentation.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-black font-semibold text-xs shadow-lg shadow-[#00F2FE]/10 hover:opacity-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Quotation
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#101419] border border-white/10">
          <div className="text-[11px] font-mono uppercase text-[#9BA3AE]">Total Quotations</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{meta?.total || quotations.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#101419] border border-white/10">
          <div className="text-[11px] font-mono uppercase text-[#9BA3AE]">Accepted Deals</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{acceptedQuotes.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#101419] border border-white/10">
          <div className="text-[11px] font-mono uppercase text-[#9BA3AE]">Sent & In Review</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">{sentQuotes.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#101419] border border-white/10">
          <div className="text-[11px] font-mono uppercase text-[#9BA3AE]">Pipeline Value</div>
          <div className="text-xl font-bold font-mono text-[#00F2FE] mt-1">₹{totalValue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#101419] p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'NEGOTIATION', 'REJECTED', 'EXPIRED'].map(st => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30'
                    : 'text-[#9BA3AE] hover:text-white hover:bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quote # or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#07090C] border border-white/10 rounded-xl text-xs text-white placeholder-[#9BA3AE]/50 focus:outline-none focus:border-[#00F2FE]/50"
            />
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="py-16 text-center text-[#9BA3AE] text-xs font-mono flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin" />
            Loading quotation records...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 text-xs font-mono space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto opacity-70" />
            <p>{error}</p>
            <button
              onClick={fetchQuotations}
              className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs"
            >
              Retry
            </button>
          </div>
        ) : quotations.length === 0 ? (
          <div className="py-16 text-center text-white/50 text-xs font-mono space-y-3">
            <FileText className="w-10 h-10 mx-auto opacity-20 text-white" />
            <p>No quotations found matching your current filter.</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] hover:bg-[#00F2FE]/20 text-xs font-semibold cursor-pointer"
            >
              + Create First Quotation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090C] text-[#9BA3AE] uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Date / Validity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#9BA3AE]">
                {quotations.map(q => (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {q.quotation_number}
                    </td>
                    <td className="py-3.5 px-4">
                      {q.customer ? (
                        <div>
                          <button
                            onClick={() => onSelectCustomer && onSelectCustomer(q.customer.id)}
                            className="font-semibold text-white hover:text-[#00F2FE] text-left transition-colors cursor-pointer"
                          >
                            {q.customer.name}
                          </button>
                          {q.customer.company && (
                            <div className="text-[10px] text-[#9BA3AE]/70 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-2.5 h-2.5" />
                              {q.customer.company}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px]">
                      {Array.isArray(q.items) && q.items.length > 0 ? (
                        <span>
                          {q.items[0].description}
                          {q.items.length > 1 && (
                            <span className="ml-1 text-[10px] text-[#00F2FE] font-mono">
                              +{q.items.length - 1} more
                            </span>
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      ₹{Number(q.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] font-mono">
                      <div>{new Date(q.created_at).toLocaleDateString()}</div>
                      {q.valid_until && (
                        <div className="text-[10px] text-[#9BA3AE]/60">
                          Valid till {new Date(q.valid_until).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(q.status)}
                        {/* Quick status selector */}
                        <select
                          value={q.status}
                          disabled={statusUpdatingId === q.id}
                          onChange={e => handleStatusChange(q.id, e.target.value)}
                          className="bg-[#07090C] border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-[#9BA3AE] focus:outline-none focus:border-[#00F2FE]/40 cursor-pointer"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="SENT">SENT</option>
                          <option value="NEGOTIATION">NEGOTIATION</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="EXPIRED">EXPIRED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedQuote(q);
                            setPreviewModalOpen(true);
                          }}
                          title="Preview & Print Proposal"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(q.id, q.quotation_number)}
                          title="Delete Quotation"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE QUOTATION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101419] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#00F2FE]" />
                <h3 className="font-heading font-bold text-white text-base">Create Formal Commercial Quotation</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#9BA3AE] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Customer selection & validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#9BA3AE] uppercase mb-1">
                    Select Customer <span className="text-[#00F2FE]">*</span>
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#07090C] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F2FE]/50"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''} - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#9BA3AE] uppercase mb-1">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={validityDays}
                    onChange={e => setValidityDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#07090C] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F2FE]/50 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#9BA3AE] uppercase">
                    Service Scope & Line Items <span className="text-[#00F2FE]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-[11px] text-[#00F2FE] hover:underline font-mono cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-[#07090C] border border-white/5 rounded-xl">
                      <input
                        type="text"
                        placeholder="Service description (e.g. 360 Scan / Matterport digital twin)"
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        required
                        className="flex-1 w-full px-3 py-1.5 bg-[#101419] border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00F2FE]/40"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            required
                            className="w-full px-2 py-1.5 bg-[#101419] border border-white/10 rounded-lg text-xs text-white text-center font-mono focus:outline-none"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            min="0"
                            placeholder="Rate (₹)"
                            value={item.unit_price}
                            onChange={e => handleItemChange(idx, 'unit_price', Number(e.target.value))}
                            required
                            className="w-full px-2 py-1.5 bg-[#101419] border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div className="w-24 text-right font-mono text-xs text-white font-bold whitespace-nowrap">
                          ₹{((Number(item.quantity) || 1) * (Number(item.unit_price) || 0)).toLocaleString('en-IN')}
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations Summary */}
              <div className="bg-[#07090C] p-4 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#9BA3AE]">
                  <span>Subtotal:</span>
                  <span className="text-white font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[#9BA3AE]">
                  <span>Discount (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(Number(e.target.value))}
                    className="w-28 px-2 py-1 bg-[#101419] border border-white/10 rounded text-right text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[#9BA3AE]">
                  <span>GST / Tax (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent}
                    onChange={e => setTaxPercent(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-[#101419] border border-white/10 rounded text-right text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total Amount:</span>
                  <span className="text-[#00F2FE]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#9BA3AE] uppercase mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={terms}
                    onChange={e => setTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-[#07090C] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F2FE]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#9BA3AE] uppercase mb-1">
                    Internal / Proposal Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    placeholder="Optional notes or deliverables breakdown..."
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#07090C] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F2FE]/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9BA3AE] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-black font-semibold text-xs shadow-lg shadow-[#00F2FE]/10 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Generating Proposal...' : 'Create Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW & PRINT MODAL */}
      {previewModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101419] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
            {/* Header toolbar */}
            <div className="p-4 bg-[#07090C] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-white text-sm">
                  {selectedQuote.quotation_number}
                </span>
                {getStatusBadge(selectedQuote.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#00F2FE]" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1 rounded-lg text-[#9BA3AE] hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document sheet view */}
            <div className="p-8 overflow-y-auto bg-[#0B0E14] text-white space-y-8 font-sans">
              {/* Brand & Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#07090C] border border-[#00F2FE]/40 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full border border-[#00F2FE] border-dashed" />
                    </div>
                    <span className="font-heading font-black text-lg tracking-wider text-white">
                      IMAGINE <span className="text-[#00F2FE]">360</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9BA3AE] font-mono mt-2 space-y-0.5">
                    <div>Imagine 360 Tours & Digital Reality</div>
                    <div>contact@imagine360tours.in | +91 99999 99999</div>
                    <div>www.imagine360tours.in</div>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <h2 className="text-xl font-heading font-bold text-[#00F2FE] tracking-tight">
                    COMMERCIAL QUOTATION
                  </h2>
                  <div className="text-xs font-mono text-white">
                    Quote Reference: <span className="text-[#00F2FE]">{selectedQuote.quotation_number}</span>
                  </div>
                  <div className="text-xs font-mono text-[#9BA3AE]">
                    Date: {new Date(selectedQuote.created_at).toLocaleDateString()}
                  </div>
                  {selectedQuote.valid_until && (
                    <div className="text-xs font-mono text-amber-400">
                      Valid Until: {new Date(selectedQuote.valid_until).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Bil-To details */}
              <div className="bg-[#101419] p-5 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#00F2FE] font-bold block mb-1">
                    Client Details
                  </span>
                  <div className="font-bold text-white text-sm">{selectedQuote.customer?.name}</div>
                  {selectedQuote.customer?.company && (
                    <div className="text-[#9BA3AE] font-medium">{selectedQuote.customer?.company}</div>
                  )}
                  {selectedQuote.customer?.phone && (
                    <div className="text-[#9BA3AE] mt-0.5">{selectedQuote.customer?.phone}</div>
                  )}
                  {selectedQuote.customer?.email && (
                    <div className="text-[#9BA3AE]">{selectedQuote.customer?.email}</div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#00F2FE] font-bold block mb-1">
                    Site / Location
                  </span>
                  <div className="text-[#9BA3AE]">
                    {selectedQuote.customer?.address || 'On-site Project Scope'}
                  </div>
                  <div className="text-[#9BA3AE]">
                    {[selectedQuote.customer?.city, selectedQuote.customer?.state, selectedQuote.customer?.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101419] text-[#9BA3AE] font-mono text-[10px] uppercase border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Item & Description</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Unit Price</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {Array.isArray(selectedQuote.items) &&
                      selectedQuote.items.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-white/[0.01]">
                          <td className="py-3 px-4 font-medium text-white">{item.description}</td>
                          <td className="py-3 px-4 text-center font-mono text-[#9BA3AE]">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono text-[#9BA3AE]">
                            ₹{Number(item.unit_price || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            ₹{(Number(item.quantity || 1) * Number(item.unit_price || 0)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & GST breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-3">
                  {selectedQuote.terms && (
                    <div className="bg-[#101419] p-4 rounded-xl border border-white/5 text-[11px] space-y-1">
                      <div className="font-mono text-[10px] uppercase text-[#00F2FE] font-bold">
                        Commercial Terms & Conditions
                      </div>
                      <div className="text-[#9BA3AE] whitespace-pre-line leading-relaxed font-mono">
                        {selectedQuote.terms}
                      </div>
                    </div>
                  )}

                  {selectedQuote.notes && (
                    <div className="text-[11px] text-[#9BA3AE] font-mono">
                      <span className="text-white font-bold">Notes:</span> {selectedQuote.notes}
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-72 bg-[#101419] p-4 rounded-xl border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#9BA3AE]">
                    <span>Subtotal:</span>
                    <span className="text-white font-bold">
                      ₹{Number(selectedQuote.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {Number(selectedQuote.discount) > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount:</span>
                      <span>-₹{Number(selectedQuote.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {Number(selectedQuote.tax) > 0 && (
                    <div className="flex justify-between text-[#9BA3AE]">
                      <span>Tax / GST:</span>
                      <span>₹{Number(selectedQuote.tax).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between text-base font-bold text-white">
                    <span>Grand Total:</span>
                    <span className="text-[#00F2FE]">
                      ₹{Number(selectedQuote.total_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Acceptance Footer */}
              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#9BA3AE] font-mono gap-4">
                <div>Authorized Signatory — Imagine 360 Tours</div>
                <div>Client Confirmation & Acceptance Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
