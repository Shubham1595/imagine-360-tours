import React, { useState, useEffect } from 'react';
import { enquiryApi } from '../../lib/api';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

interface AdminEnquiriesViewProps {
  onSelectCustomer?: (customerId: string) => void;
  onInitiateCall?: (customer: any) => void;
}

export const AdminEnquiriesView: React.FC<AdminEnquiriesViewProps> = ({
  onSelectCustomer,
  onInitiateCall,
}) => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await enquiryApi.list({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      });
      if (res.success && res.data) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [filterStatus]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await enquiryApi.updateStatus(id, newStatus);
      setEnquiries(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredEnquiries = enquiries.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.customer?.name?.toLowerCase().includes(q) ||
      item.customer?.email?.toLowerCase().includes(q) ||
      item.customer?.phone?.toLowerCase().includes(q) ||
      item.project_type?.toLowerCase().includes(q) ||
      item.project_location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Website Enquiries</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {enquiries.length} Inbound
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Real-time project inquiries submitted through the Imagine 360 Tours marketing website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEnquiries}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#101419] p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#9BA3AE]/60 focus:border-[#00F2FE] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-[#00F2FE]/10 border-[#00F2FE] text-[#00F2FE]'
                  : 'bg-[#07090C] border-white/5 text-[#9BA3AE] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Grid/Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Enquiries from MySQL...</div>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="p-12 text-center bg-[#101419] rounded-2xl border border-white/10">
          <MessageSquare className="w-8 h-8 text-[#9BA3AE] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-white">No Enquiries Found</h3>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Enquiries submitted via the website contact form will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEnquiries.map(enq => (
            <div
              key={enq.id}
              className="bg-[#101419] p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {enq.customer?.name || 'Anonymous Client'}
                      {enq.customer?.company && (
                        <span className="text-xs font-normal text-[#9BA3AE]">
                          • {enq.customer.company}
                        </span>
                      )}
                    </h3>
                    <div className="text-[11px] font-mono text-[#00F2FE] mt-0.5">
                      {enq.project_type || 'General Spatial Solution'}
                    </div>
                  </div>
                  <Badge
                    variant={
                      enq.status === 'NEW'
                        ? 'hot'
                        : enq.status === 'CONTACTED'
                        ? 'warm'
                        : enq.status === 'CONVERTED'
                        ? 'cyan'
                        : 'outline'
                    }
                  >
                    {enq.status}
                  </Badge>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-[#07090C] border border-white/5 text-xs text-[#E5E9F0] line-clamp-3">
                  "{enq.description || 'No description provided.'}"
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-[#9BA3AE]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                    <span>{enq.project_location || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{enq.budget || 'Flexible budget'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{enq.customer?.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{enq.customer?.email || 'No email'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#9BA3AE]">Status:</span>
                  <select
                    value={enq.status}
                    onChange={e => handleStatusUpdate(enq.id, e.target.value)}
                    className="bg-[#07090C] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {onInitiateCall && enq.customer && (
                    <button
                      onClick={() => onInitiateCall(enq.customer)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </button>
                  )}
                  {onSelectCustomer && enq.customer?.id && (
                    <button
                      onClick={() => onSelectCustomer(enq.customer.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 hover:bg-[#00F2FE]/20 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
