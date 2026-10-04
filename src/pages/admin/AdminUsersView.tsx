import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import {
  Users,
  Shield,
  Search,
  Plus,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'SALES',
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, { role: newRole });
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminApi.updateUserRole(userId, { status: newStatus });
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createUser(newUser);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'SALES' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Staff & Role-Based Access Control</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {users.length} Accounts
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Manage permissions across SUPER_ADMIN, ADMIN, SALES, STAFF, and CLIENT roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black font-semibold text-xs transition-colors shadow-lg shadow-[#00F2FE]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Staff Member
          </button>
          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#101419] p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#9BA3AE]/60 focus:border-[#00F2FE] focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Staff from MySQL...</div>
        </div>
      ) : (
        <div className="bg-[#101419] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090C] text-[#9BA3AE] border-b border-white/10 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-[#9BA3AE]">{u.email}</div>
                    </td>
                    <td className="p-4 font-mono text-white text-[11px]">
                      {u.phone || 'No phone'}
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#07090C] border border-white/10 rounded px-2.5 py-1 text-xs font-mono font-semibold text-[#00F2FE] focus:outline-none"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SALES">SALES</option>
                        <option value="STAFF">STAFF</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.status}
                        onChange={e => handleStatusChange(u.id, e.target.value)}
                        className={`bg-[#07090C] border rounded px-2 py-0.5 text-xs font-semibold focus:outline-none ${
                          u.status === 'ACTIVE'
                            ? 'text-emerald-400 border-emerald-500/30'
                            : 'text-red-400 border-red-500/30'
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#9BA3AE]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101419] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Create Staff Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Assigned Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                >
                  <option value="SALES">SALES</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black font-semibold text-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
