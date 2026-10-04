import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  User,
  Activity,
  FileCode,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ limit: 100 });
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.entity_type?.toLowerCase().includes(q) ||
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>System Audit & Security Logs</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F2FE] border border-[#00F2FE]/20">
              {logs.length} Recorded Actions
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Immutable tracking of state mutations, lead transitions, customer updates, calls, and imports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
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
            placeholder="Search by action, entity, user..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#9BA3AE]/60 focus:border-[#00F2FE] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Security Logs from MySQL...</div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-[#101419] rounded-2xl border border-white/10">
          <Activity className="w-8 h-8 text-[#9BA3AE] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-white">No Audit Logs Recorded</h3>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Actions performed across the CRM and platform will be automatically recorded here.
          </p>
        </div>
      ) : (
        <div className="bg-[#101419] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090C] text-[#9BA3AE] border-b border-white/10 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                    <td className="p-4 text-[11px] text-[#9BA3AE] whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-sans whitespace-nowrap">
                      <div className="font-semibold text-white">{l.user?.name || 'System Actor'}</div>
                      <div className="text-[10px] text-[#9BA3AE] font-mono">{l.user?.role || 'SYSTEM'}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 border border-white/10 text-cyan-300 font-semibold">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 text-white uppercase text-[11px]">
                      {l.entity_type}
                    </td>
                    <td className="p-4 max-w-sm truncate text-[#9BA3AE] text-[11px]">
                      {l.metadata ? (
                        typeof l.metadata === 'object' ? (
                          JSON.stringify(l.metadata)
                        ) : (
                          l.metadata
                        )
                      ) : (
                        '—'
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
