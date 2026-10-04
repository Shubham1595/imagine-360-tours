import React, { useState, useEffect } from 'react';
import { callApi } from '../../lib/api';
import {
  PhoneCall,
  Clock,
  User,
  Calendar,
  Search,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

interface AdminCallsViewProps {
  onSelectCustomer?: (customerId: string) => void;
  onInitiateCall?: (customer: any) => void;
}

export const AdminCallsView: React.FC<AdminCallsViewProps> = ({
  onSelectCustomer,
  onInitiateCall,
}) => {
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCalls = async () => {
    setIsLoading(true);
    try {
      const res = await callApi.list({ limit: 50 });
      if (res.success && res.data) {
        setCalls(res.data);
      }
    } catch (err) {
      console.error('Failed to load call logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  const filteredCalls = calls.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.customer?.name?.toLowerCase().includes(q) ||
      c.customer?.phone?.toLowerCase().includes(q) ||
      c.admin?.name?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Call Tracking & Log History</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F2FE] border border-[#00F2FE]/20">
              {calls.length} Total Calls
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Complete audit trail of sales calls, lead qualification discussions, and client conversations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCalls}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#101419] p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, phone, staff, notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#9BA3AE]/60 focus:border-[#00F2FE] focus:outline-none"
          />
        </div>
      </div>

      {/* Calls Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Call Logs from MySQL...</div>
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="p-12 text-center bg-[#101419] rounded-2xl border border-white/10">
          <PhoneCall className="w-8 h-8 text-[#9BA3AE] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-white">No Call Logs Recorded</h3>
          <p className="text-xs text-[#9BA3AE] mt-1">
            When sales staff or admins log calls with clients, they will appear in this timeline.
          </p>
        </div>
      ) : (
        <div className="bg-[#101419] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090C] text-[#9BA3AE] border-b border-white/10 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Outcome</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCalls.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{c.customer?.name}</div>
                      <div className="text-[11px] text-[#9BA3AE] font-mono">{c.customer?.phone}</div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          c.outcome === 'HOT'
                            ? 'hot'
                            : c.outcome === 'WARM'
                            ? 'warm'
                            : 'cold'
                        }
                      >
                        {c.outcome}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-white">
                      {formatDuration(c.duration || 0)}
                    </td>
                    <td className="p-4 text-[#9BA3AE]">
                      {c.admin?.name || 'System / Admin'}
                    </td>
                    <td className="p-4 max-w-xs truncate text-[#9BA3AE]">
                      {c.notes || '—'}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#9BA3AE]">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {onSelectCustomer && c.customer?.id && (
                        <button
                          onClick={() => onSelectCustomer(c.customer.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] hover:bg-[#00F2FE]/20 transition-colors text-xs inline-flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
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
