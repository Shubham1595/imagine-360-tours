import React, { useState, useEffect } from 'react';
import { serviceApi } from '../../lib/api';
import {
  Layers,
  Search,
  Plus,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Star,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

interface ServiceItem {
  id: string;
  name: string;
  slug?: string;
  category: string;
  short_description?: string;
  description?: string;
  price?: number | string | null;
  duration?: string | null;
  image?: string | null;
  is_active: boolean;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const AdminServicesView: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'VISIBLE' | 'HIDDEN' | 'AVAILABLE' | 'UNAVAILABLE' | 'FEATURED'>('ALL');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'AVAILABILITY' | 'VISIBILITY' | 'DELETE';
    service: ServiceItem | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'AVAILABILITY',
    service: null,
  });

  // Create / Edit modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    serviceId: string | null;
    formData: {
      name: string;
      slug: string;
      category: string;
      short_description: string;
      description: string;
      price: string;
      duration: string;
      image: string;
      is_active: boolean;
      is_visible: boolean;
      is_featured: boolean;
      display_order: number;
    };
  }>({
    isOpen: false,
    isEditing: false,
    serviceId: null,
    formData: {
      name: '',
      slug: '',
      category: 'Spatial Capture',
      short_description: '',
      description: '',
      price: '',
      duration: '4-7 business days',
      image: '',
      is_active: true,
      is_visible: true,
      is_featured: false,
      display_order: 1,
    },
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await serviceApi.listAdmin();
      if (res.success && res.data) {
        setServices(res.data);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to load services from backend database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter & Search
  const filteredServices = services.filter(s => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.slug && s.slug.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Tab filter
    if (filterType === 'VISIBLE') return s.is_visible;
    if (filterType === 'HIDDEN') return !s.is_visible;
    if (filterType === 'AVAILABLE') return s.is_active;
    if (filterType === 'UNAVAILABLE') return !s.is_active;
    if (filterType === 'FEATURED') return s.is_featured;

    return true;
  });

  // Toggle Availability
  const handleToggleAvailabilityClick = (service: ServiceItem) => {
    if (service.is_active) {
      // Confirm deactivation
      setConfirmModal({
        isOpen: true,
        title: 'Deactivate Service',
        message: `Mark "${service.name}" as unavailable? Customers will no longer be able to select this service for bookings or quotes.`,
        actionType: 'AVAILABILITY',
        service,
      });
    } else {
      executeToggleAvailability(service, true);
    }
  };

  const executeToggleAvailability = async (service: ServiceItem, newStatus: boolean) => {
    try {
      const res = await serviceApi.toggleAvailability(service.id, newStatus);
      if (res.success) {
        setServices(prev =>
          prev.map(s => (s.id === service.id ? { ...s, is_active: newStatus } : s))
        );
        showNotification(`Service availability updated: "${service.name}" is now ${newStatus ? 'Available' : 'Unavailable'}.`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update availability.', 'error');
    }
  };

  // Toggle Visibility
  const handleToggleVisibilityClick = (service: ServiceItem) => {
    if (service.is_visible) {
      // Confirm hiding
      setConfirmModal({
        isOpen: true,
        title: 'Hide from Website',
        message: `Hide "${service.name}" from public website? This service will disappear from the public website completely.`,
        actionType: 'VISIBILITY',
        service,
      });
    } else {
      executeToggleVisibility(service, true);
    }
  };

  const executeToggleVisibility = async (service: ServiceItem, newVisibility: boolean) => {
    try {
      const res = await serviceApi.toggleVisibility(service.id, newVisibility);
      if (res.success) {
        setServices(prev =>
          prev.map(s => (s.id === service.id ? { ...s, is_visible: newVisibility } : s))
        );
        showNotification(`Service visibility updated: "${service.name}" is now ${newVisibility ? 'Visible' : 'Hidden'}.`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update visibility.', 'error');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (service: ServiceItem) => {
    const nextFeatured = !service.is_featured;
    try {
      const res = await serviceApi.toggleFeatured(service.id, nextFeatured);
      if (res.success) {
        setServices(prev =>
          prev.map(s => (s.id === service.id ? { ...s, is_featured: nextFeatured } : s))
        );
        showNotification(`"${service.name}" ${nextFeatured ? 'marked as Featured' : 'removed from Featured'}.`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update featured status.', 'error');
    }
  };

  // Reordering
  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredServices.length) return;

    const currentItem = filteredServices[index];
    const targetItem = filteredServices[targetIndex];

    const newOrders = [
      { id: currentItem.id, display_order: targetItem.display_order },
      { id: targetItem.id, display_order: currentItem.display_order },
    ];

    try {
      await serviceApi.reorder(newOrders);
      await fetchServices();
      showNotification('Service display order updated.');
    } catch (err: any) {
      showNotification(err.message || 'Failed to reorder services.', 'error');
    }
  };

  // Delete / Archive
  const handleDeleteClick = (service: ServiceItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove or Archive Service',
      message: `Are you sure you want to remove "${service.name}"? If referenced by existing leads or quotations, it will be safely archived to preserve CRM integrity.`,
      actionType: 'DELETE',
      service,
    });
  };

  const executeDelete = async (service: ServiceItem) => {
    try {
      const res = await serviceApi.delete(service.id);
      if (res.success) {
        showNotification(res.message || 'Service updated successfully.');
        await fetchServices();
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete service.', 'error');
    }
  };

  // Confirm Modal Execution
  const handleConfirmAction = async () => {
    const { actionType, service } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    if (!service) return;

    if (actionType === 'AVAILABILITY') {
      await executeToggleAvailability(service, !service.is_active);
    } else if (actionType === 'VISIBILITY') {
      await executeToggleVisibility(service, !service.is_visible);
    } else if (actionType === 'DELETE') {
      await executeDelete(service);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditModal({
      isOpen: true,
      isEditing: false,
      serviceId: null,
      formData: {
        name: '',
        slug: '',
        category: 'Spatial Capture',
        short_description: '',
        description: '',
        price: '',
        duration: '4-7 business days',
        image: '',
        is_active: true,
        is_visible: true,
        is_featured: false,
        display_order: services.length + 1,
      },
    });
  };

  // Open Edit Modal
  const handleOpenEditModal = (service: ServiceItem) => {
    setEditModal({
      isOpen: true,
      isEditing: true,
      serviceId: service.id,
      formData: {
        name: service.name,
        slug: service.slug || '',
        category: service.category,
        short_description: service.short_description || '',
        description: service.description || '',
        price: service.price ? String(service.price) : '',
        duration: service.duration || '',
        image: service.image || '',
        is_active: service.is_active,
        is_visible: service.is_visible,
        is_featured: service.is_featured,
        display_order: service.display_order,
      },
    });
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEditing, serviceId, formData } = editModal;

    if (!formData.name.trim()) {
      showNotification('Service name is required.', 'error');
      return;
    }

    try {
      if (isEditing && serviceId) {
        const res = await serviceApi.update(serviceId, formData);
        if (res.success) {
          showNotification(`Service "${formData.name}" updated successfully.`);
          setEditModal(prev => ({ ...prev, isOpen: false }));
          await fetchServices();
        }
      } else {
        const res = await serviceApi.create(formData);
        if (res.success) {
          showNotification(`New service "${formData.name}" added to catalog.`);
          setEditModal(prev => ({ ...prev, isOpen: false }));
          await fetchServices();
        }
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to save service.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-xl transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-3 text-xs font-mono">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/60 hover:text-white text-xs font-mono"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#00F2FE] tracking-widest uppercase">
              WEBSITE / CMS CONTROL CENTER
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Spatial Service Catalog Master</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F2FE] border border-[#00F2FE]/20">
              {services.length} Services
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Authoritative source of truth for public website visibility, operational availability, order, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] text-xs font-tech font-bold hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#101419] p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service name, slug, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#9BA3AE]/60 focus:border-[#00F2FE] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Services' },
            { id: 'VISIBLE', label: 'Visible' },
            { id: 'HIDDEN', label: 'Hidden' },
            { id: 'AVAILABLE', label: 'Available' },
            { id: 'UNAVAILABLE', label: 'Unavailable' },
            { id: 'FEATURED', label: 'Featured' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#00F2FE]/15 border border-[#00F2FE] text-[#00F2FE] font-bold'
                  : 'bg-[#07090C] border border-white/5 text-[#9BA3AE] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      {isLoading ? (
        <div className="py-24 text-center bg-[#101419] rounded-2xl border border-white/10">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Authoritative Service Catalog from MySQL...</div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-20 text-center bg-[#101419] rounded-2xl border border-white/10">
          <Layers className="w-10 h-10 text-[#9BA3AE] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-white">No Services Found</h3>
          <p className="text-xs text-[#9BA3AE] mt-1">Try adjusting your search criteria or create a new service.</p>
        </div>
      ) : (
        <div className="bg-[#101419] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#07090C]/60 text-[#9BA3AE] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Order</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Price (INR)</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredServices.map((svc, index) => (
                  <tr key={svc.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Order Controls */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button
                          onClick={() => handleMoveOrder(index, 'UP')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-white/10 text-[#9BA3AE] hover:text-white disabled:opacity-20 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-[11px] text-[#00F2FE] font-bold">
                          {svc.display_order}
                        </span>
                        <button
                          onClick={() => handleMoveOrder(index, 'DOWN')}
                          disabled={index === filteredServices.length - 1}
                          className="p-1 rounded hover:bg-white/10 text-[#9BA3AE] hover:text-white disabled:opacity-20 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Service Name & Slug */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {svc.image ? (
                          <img
                            src={svc.image}
                            alt={svc.name}
                            className="w-10 h-10 rounded-lg object-cover bg-black border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#07090C] border border-white/10 flex items-center justify-center shrink-0 text-[#00F2FE]">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm hover:text-[#00F2FE] transition-colors">
                            {svc.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#9BA3AE]">
                            slug: {svc.slug || 'auto'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <Badge variant="cyan">{svc.category}</Badge>
                    </td>

                    {/* Visibility Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleVisibilityClick(svc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all ${
                          svc.is_visible
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                        }`}
                        title="Click to toggle public website visibility"
                      >
                        {svc.is_visible ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Availability Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailabilityClick(svc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all ${
                          svc.is_active
                            ? 'bg-cyan-500/10 text-[#00F2FE] border border-[#00F2FE]/30 hover:bg-cyan-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title="Click to toggle operational availability"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            svc.is_active ? 'bg-[#00F2FE] animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        <span>{svc.is_active ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(svc)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          svc.is_featured
                            ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                            : 'text-[#9BA3AE] hover:text-white bg-white/5 border border-white/10'
                        }`}
                        title="Toggle featured status on homepage"
                      >
                        <Star className={`w-3 h-3 ${svc.is_featured ? 'fill-current' : ''}`} />
                        <span>{svc.is_featured ? 'Yes' : 'No'}</span>
                      </button>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      {svc.price ? `₹${Number(svc.price).toLocaleString('en-IN')}` : 'Custom'}
                    </td>

                    {/* Updated */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[#9BA3AE]">
                      {svc.updated_at ? new Date(svc.updated_at).toLocaleDateString() : 'Recent'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(svc)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(svc)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20 transition-colors"
                          title="Delete / Archive Service"
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
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          title={confirmModal.title}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed">
                {confirmModal.message}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-5 py-2 rounded-xl text-xs font-tech font-bold bg-amber-500 hover:bg-amber-400 text-[#07090C] transition-all shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {editModal.isOpen && (
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
          title={editModal.isEditing ? `Edit Service: ${editModal.formData.name}` : 'Add New Spatial Service'}
          subtitle="Admin Master CMS — Changes immediately reflect on the database and public website."
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveService} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={editModal.formData.name}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, name: e.target.value },
                    }))
                  }
                  placeholder="e.g. 360° Virtual Tour"
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={editModal.formData.slug}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, slug: e.target.value },
                    }))
                  }
                  placeholder="e.g. 360-virtual-tours"
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={editModal.formData.category}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, category: e.target.value },
                    }))
                  }
                  placeholder="Spatial Capture / Aerial"
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                  Base Price (INR)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editModal.formData.price}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, price: e.target.value },
                    }))
                  }
                  placeholder="e.g. 38000"
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                  Duration / Delivery
                </label>
                <input
                  type="text"
                  value={editModal.formData.duration}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, duration: e.target.value },
                    }))
                  }
                  placeholder="e.g. 4-7 business days"
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                Image URL (Supported web format)
              </label>
              <input
                type="text"
                value={editModal.formData.image}
                onChange={e =>
                  setEditModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, image: e.target.value },
                  }))
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                Short Description (Cards & Previews)
              </label>
              <input
                type="text"
                value={editModal.formData.short_description}
                onChange={e =>
                  setEditModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, short_description: e.target.value },
                  }))
                }
                placeholder="Brief summary for service card..."
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                Full Description (Detailed Modal & Web Overview)
              </label>
              <textarea
                rows={3}
                value={editModal.formData.description}
                onChange={e =>
                  setEditModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, description: e.target.value },
                  }))
                }
                placeholder="Comprehensive technical description of the service and capabilities..."
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            {/* Status & Visibility Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#07090C] border border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editModal.formData.is_visible}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, is_visible: e.target.checked },
                    }))
                  }
                  className="rounded bg-black border-white/20 text-[#00F2FE] focus:ring-0"
                />
                <span className="text-xs text-white font-mono">Visible on Web</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editModal.formData.is_active}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, is_active: e.target.checked },
                    }))
                  }
                  className="rounded bg-black border-white/20 text-[#00F2FE] focus:ring-0"
                />
                <span className="text-xs text-white font-mono">Available</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editModal.formData.is_featured}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, is_featured: e.target.checked },
                    }))
                  }
                  className="rounded bg-black border-white/20 text-[#00F2FE] focus:ring-0"
                />
                <span className="text-xs text-white font-mono">Featured</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9BA3AE] font-mono">Order:</span>
                <input
                  type="number"
                  value={editModal.formData.display_order}
                  onChange={e =>
                    setEditModal(prev => ({
                      ...prev,
                      formData: { ...prev.formData, display_order: parseInt(e.target.value, 10) || 0 },
                    }))
                  }
                  className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-xs text-white text-center font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-tech font-bold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
              >
                {editModal.isEditing ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
