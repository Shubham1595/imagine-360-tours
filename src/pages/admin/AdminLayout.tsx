import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  Kanban,
  PhoneCall,
  CalendarCheck,
  MessageSquare,
  Calendar,
  FolderKanban,
  Layers,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Activity,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Phone,
  FileText,
  Globe,
} from 'lucide-react';

import { AdminDashboardView } from './AdminDashboardView';
import { AdminCrmView } from './AdminCrmView';
import { AdminCustomerDetailView } from './AdminCustomerDetailView';
import { AdminKanbanView } from './AdminKanbanView';
import { AdminCallsView } from './AdminCallsView';
import { AdminFollowUpsView } from './AdminFollowUpsView';
import { AdminQuotationsView } from './AdminQuotationsView';
import { AdminEnquiriesView } from './AdminEnquiriesView';
import { AdminBookingsView } from './AdminBookingsView';
import { AdminProjectsView } from './AdminProjectsView';
import { AdminServicesView } from './AdminServicesView';
import { AdminWebsiteSettingsView } from './AdminWebsiteSettingsView';
import { AdminImportView } from './AdminImportView';
import { AdminReportsView } from './AdminReportsView';
import { AdminUsersView } from './AdminUsersView';
import { AdminAuditLogsView } from './AdminAuditLogsView';
import { CallCustomerModal } from './CallCustomerModal';

interface AdminLayoutProps {
  onNavigateHome: () => void;
  initialTab?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onNavigateHome,
  initialTab = 'dashboard',
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Call Modal
  const [activeCallCustomer, setActiveCallCustomer] = useState<any | null>(null);

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleBackToCrm = () => {
    setSelectedCustomerId(null);
  };

  const handleInitiateCall = (customer: any) => {
    setActiveCallCustomer(customer);
  };

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'SALES & PIPELINE',
      items: [
        { id: 'crm', label: 'CRM & Customers', icon: Users },
        { id: 'kanban', label: 'Leads Pipeline', icon: Kanban },
        { id: 'calls', label: 'Call Tracking', icon: PhoneCall },
        { id: 'followups', label: 'Follow-ups', icon: CalendarCheck },
        { id: 'quotations', label: 'Quotations', icon: FileText },
      ],
    },
    {
      label: 'INBOUND & OPERATIONS',
      items: [
        { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
        { id: 'bookings', label: 'Shoots & Bookings', icon: Calendar },
        { id: 'projects', label: 'Projects & Showcase', icon: FolderKanban },
        { id: 'import', label: 'Lead Import (CSV/XLS)', icon: FileSpreadsheet },
      ],
    },
    {
      label: 'WEBSITE / CMS',
      items: [
        { id: 'services', label: 'Services CMS', icon: Layers },
        { id: 'website-settings', label: 'Website Settings', icon: Globe },
      ],
    },
    {
      label: 'GOVERNANCE',
      items: [
        { id: 'users', label: 'Users & Roles', icon: ShieldCheck },
        { id: 'audit-logs', label: 'Audit Logs', icon: Activity },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  const userRole = user?.role || 'ADMIN';

  // Role permissions per item according to Section 4
  const allowedItemIds = React.useMemo(() => {
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return [
        'dashboard',
        'reports',
        'crm',
        'kanban',
        'calls',
        'followups',
        'quotations',
        'enquiries',
        'bookings',
        'projects',
        'services',
        'website-settings',
        'import',
        'users',
        'audit-logs',
        'settings',
      ];
    }
    if (userRole === 'SALES') {
      return [
        'dashboard',
        'crm',
        'kanban',
        'calls',
        'followups',
        'quotations',
        'enquiries',
        'projects',
        'reports',
      ];
    }
    if (userRole === 'STAFF') {
      return ['dashboard', 'followups', 'bookings', 'projects'];
    }
    return ['dashboard'];
  }, [userRole]);

  const filteredNavGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => allowedItemIds.includes(item.id)),
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-[#07090C] text-white flex flex-col md:flex-row antialiased selection:bg-[#00F2FE]/20 selection:text-[#00F2FE]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#101419] border-b border-white/10 p-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#07090C] border border-[#00F2FE]/40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full border border-[#00F2FE] border-dashed" />
          </div>
          <span className="font-heading font-bold text-sm text-white">
            IMAGINE <span className="text-[#00F2FE]">360</span> <span className="text-[10px] text-[#9BA3AE] font-mono">ADMIN</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#101419] border-r border-white/10 flex flex-col justify-between z-40 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#07090C] border border-[#00F2FE]/40 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full border border-[#00F2FE] border-dashed group-hover:rotate-180 transition-transform duration-500" />
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-white tracking-tight">
                  IMAGINE <span className="text-[#00F2FE]">360</span>
                </span>
                <span className="block font-mono text-[9px] text-[#00F2FE] uppercase tracking-wider">
                  Enterprise CRM
                </span>
              </div>
            </button>
          </div>

          {/* User profile card */}
          <div className="p-3 mx-3 my-3 rounded-xl bg-[#07090C] border border-white/5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] font-mono text-[#9BA3AE] truncate">{user?.email}</div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 shrink-0 font-bold">
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-xs scrollbar-thin">
            {filteredNavGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[9px] font-mono uppercase tracking-wider text-[#9BA3AE]/60 mb-1.5">
                  {group.label}
                </div>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id && !selectedCustomerId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSelectedCustomerId(null);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all text-left ${
                        isActive
                          ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20'
                          : 'text-[#9BA3AE] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00F2FE]' : ''}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
            <button
              onClick={onNavigateHome}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#9BA3AE] hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#00F2FE]" />
                View Website
              </span>
              <ChevronRight className="w-3 h-3 text-[#9BA3AE]/40" />
            </button>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {selectedCustomerId ? (
          <AdminCustomerDetailView
            customerId={selectedCustomerId}
            onBack={handleBackToCrm}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboardView onNavigateTab={tab => setActiveTab(tab)} />
            )}

            {activeTab === 'crm' && (
              <AdminCrmView onSelectCustomer={handleSelectCustomer} />
            )}

            {activeTab === 'kanban' && (
              <AdminKanbanView
                onSelectCustomer={handleSelectCustomer}
                onCallCustomer={handleInitiateCall}
              />
            )}

            {activeTab === 'calls' && (
              <AdminCallsView
                onSelectCustomer={handleSelectCustomer}
                onInitiateCall={handleInitiateCall}
              />
            )}

            {activeTab === 'followups' && (
              <AdminFollowUpsView onSelectCustomer={handleSelectCustomer} />
            )}

            {activeTab === 'quotations' && (
              <AdminQuotationsView onSelectCustomer={handleSelectCustomer} />
            )}

            {activeTab === 'enquiries' && (
              <AdminEnquiriesView
                onSelectCustomer={handleSelectCustomer}
                onInitiateCall={handleInitiateCall}
              />
            )}

            {activeTab === 'bookings' && (
              <AdminBookingsView
                onSelectCustomer={handleSelectCustomer}
                onInitiateCall={handleInitiateCall}
              />
            )}

            {activeTab === 'projects' && <AdminProjectsView />}

            {activeTab === 'services' && <AdminServicesView />}

            {activeTab === 'website-settings' && <AdminWebsiteSettingsView />}

            {activeTab === 'import' && <AdminImportView />}

            {activeTab === 'reports' && <AdminReportsView />}

            {activeTab === 'users' && <AdminUsersView />}

            {activeTab === 'audit-logs' && <AdminAuditLogsView />}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-[#101419] p-6 rounded-2xl border border-white/10">
                  <h2 className="font-heading font-bold text-xl text-white">System Architecture & Health</h2>
                  <p className="text-xs text-[#9BA3AE] mt-1">
                    Environment configuration and connected operational subsystems.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-[#07090C] border border-white/5 space-y-2">
                      <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Database Engine
                      </div>
                      <div className="text-xs text-[#9BA3AE]">
                        MySQL 8.0 / Prisma ORM
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono text-emerald-400">Database `imagine360tours` Connected</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#07090C] border border-white/5 space-y-2">
                      <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Security & Authentication
                      </div>
                      <div className="text-xs text-[#9BA3AE]">
                        Bcrypt Hashed Passwords + Bearer JWT + Strict RBAC
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00F2FE]" />
                        <span className="text-xs font-mono text-[#00F2FE]">Token Expiry: 7 Days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Top-Level Call Customer Modal */}
      {activeCallCustomer && (
        <CallCustomerModal
          isOpen={!!activeCallCustomer}
          onClose={() => setActiveCallCustomer(null)}
          customer={activeCallCustomer}
          onCallLogged={() => setActiveCallCustomer(null)}
        />
      )}
    </div>
  );
};
