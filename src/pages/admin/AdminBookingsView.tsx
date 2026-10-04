import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../lib/api';
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  DollarSign,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

interface AdminBookingsViewProps {
  onSelectCustomer?: (customerId: string) => void;
  onInitiateCall?: (customer: any) => void;
}

export const AdminBookingsView: React.FC<AdminBookingsViewProps> = ({
  onSelectCustomer,
  onInitiateCall,
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingApi.list({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      });
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await bookingApi.updateStatus(id, newStatus);
      setBookings(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.customer?.name?.toLowerCase().includes(q) ||
      b.customer?.email?.toLowerCase().includes(q) ||
      b.customer?.phone?.toLowerCase().includes(q) ||
      b.service?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Client Bookings & Shoots</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F2FE] border border-[#00F2FE]/20">
              {bookings.length} Total
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Confirmed and requested 360° virtual tour captures, drone flights, and spatial mapping sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#101419] p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, service, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#9BA3AE]/60 focus:border-[#00F2FE] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
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

      {/* Bookings Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Bookings from MySQL...</div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-[#101419] rounded-2xl border border-white/10">
          <Calendar className="w-8 h-8 text-[#9BA3AE] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-white">No Bookings Found</h3>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Shoot and consultation bookings will appear here once scheduled.
          </p>
        </div>
      ) : (
        <div className="bg-[#101419] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090C] text-[#9BA3AE] border-b border-white/10 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{b.customer?.name}</div>
                      <div className="text-[11px] text-[#9BA3AE]">{b.customer?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{b.service?.name || 'Custom Package'}</div>
                      <div className="text-[10px] text-[#00F2FE] font-mono">{b.service?.category || 'SPATIAL'}</div>
                    </td>
                    <td className="p-4 font-mono text-white">
                      {new Date(b.booking_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <select
                        value={b.status}
                        onChange={e => handleStatusUpdate(b.id, e.target.value)}
                        className={`bg-[#07090C] border rounded px-2.5 py-1 text-xs font-semibold focus:outline-none ${
                          b.status === 'CONFIRMED'
                            ? 'text-emerald-400 border-emerald-500/30'
                            : b.status === 'PENDING'
                            ? 'text-amber-400 border-amber-500/30'
                            : b.status === 'COMPLETED'
                            ? 'text-cyan-400 border-cyan-500/30'
                            : 'text-red-400 border-red-500/30'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {b.amount ? `₹${Number(b.amount).toLocaleString('en-IN')}` : 'TBD'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onInitiateCall && b.customer && (
                          <button
                            onClick={() => onInitiateCall(b.customer)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-[#9BA3AE] hover:text-emerald-400 transition-colors"
                            title="Call customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onSelectCustomer && b.customer?.id && (
                          <button
                            onClick={() => onSelectCustomer(b.customer.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] hover:bg-[#00F2FE]/20 transition-colors text-xs flex items-center gap-1"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
