import React, { useState, useEffect } from 'react';
import { projectApi } from '../../lib/api';
import {
  FolderKanban,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  User,
  Calendar,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Globe,
  Edit3,
} from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export const AdminProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editPublicModal, setEditPublicModal] = useState<{
    isOpen: boolean;
    project: any | null;
    is_public: boolean;
    is_featured: boolean;
    public_description: string;
    cover_image: string;
    display_order: number;
  }>({
    isOpen: false,
    project: null,
    is_public: false,
    is_featured: false,
    public_description: '',
    cover_image: '',
    display_order: 0,
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await projectApi.list(filterStatus === 'ALL' ? undefined : filterStatus);
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filterStatus]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await projectApi.update(id, { status: newStatus });
      setProjects(prev =>
        prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update project status');
    }
  };

  const handleTogglePublic = async (proj: any) => {
    const nextPublic = !proj.is_public;
    try {
      await projectApi.togglePublicVisibility(proj.id, { is_public: nextPublic });
      setProjects(prev =>
        prev.map(p => (p.id === proj.id ? { ...p, is_public: nextPublic } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update public visibility.');
    }
  };

  const handleOpenEditPublic = (proj: any) => {
    setEditPublicModal({
      isOpen: true,
      project: proj,
      is_public: Boolean(proj.is_public),
      is_featured: Boolean(proj.is_featured),
      public_description: proj.public_description || '',
      cover_image: proj.cover_image || '',
      display_order: proj.display_order || 0,
    });
  };

  const handleSavePublicSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPublicModal.project) return;

    try {
      await projectApi.togglePublicVisibility(editPublicModal.project.id, {
        is_public: editPublicModal.is_public,
        is_featured: editPublicModal.is_featured,
        public_description: editPublicModal.public_description,
        cover_image: editPublicModal.cover_image,
        display_order: editPublicModal.display_order,
      });

      setProjects(prev =>
        prev.map(p =>
          p.id === editPublicModal.project.id
            ? {
                ...p,
                is_public: editPublicModal.is_public,
                is_featured: editPublicModal.is_featured,
                public_description: editPublicModal.public_description,
                cover_image: editPublicModal.cover_image,
                display_order: editPublicModal.display_order,
              }
            : p
        )
      );

      setEditPublicModal(prev => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert(err.message || 'Failed to save public visibility settings.');
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.project_name?.toLowerCase().includes(q) ||
      p.customer?.name?.toLowerCase().includes(q) ||
      p.service?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101419] p-5 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#00F2FE] tracking-widest uppercase">
              OPERATIONS & WEBSITE SHOWCASE
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-3">
            <span>Project Management & Public Visibility</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {projects.length} Total Projects
            </span>
          </h1>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Track operational deliveries and control which completed client projects appear publicly in the portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#101419] p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BA3AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, clients..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090C] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-[#9BA3AE]/60 focus:border-[#00F2FE] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PLANNING', 'CAPTURE', 'PROCESSING', 'IN_REVIEW', 'COMPLETED', 'ON_HOLD'].map(status => (
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

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#9BA3AE]">Loading Projects from MySQL...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-[#101419] rounded-2xl border border-white/10">
          <FolderKanban className="w-8 h-8 text-[#9BA3AE] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-white">No Projects Found</h3>
          <p className="text-xs text-[#9BA3AE] mt-1">
            Projects converted from HOT leads or created for clients will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              className={`bg-[#101419] p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                proj.is_public ? 'border-[#00F2FE]/30' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {proj.project_name}
                  </h3>
                  <select
                    value={proj.status}
                    onChange={e => handleStatusChange(proj.id, e.target.value)}
                    className="bg-[#07090C] border border-white/10 rounded px-2 py-0.5 text-[11px] font-mono font-semibold text-[#00F2FE] focus:outline-none"
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="CAPTURE">CAPTURE</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                  </select>
                </div>

                <div className="mt-2 text-xs text-[#9BA3AE]">
                  Client:{' '}
                  <span className="text-white font-medium">
                    {proj.customer?.name} ({proj.customer?.company || 'Direct'})
                  </span>
                </div>

                <div className="mt-1 text-[11px] font-mono text-cyan-400">
                  {proj.service?.name || 'Spatial Architecture & Twin'}
                </div>

                {proj.notes && (
                  <p className="mt-3 text-xs text-[#9BA3AE] bg-[#07090C] p-2.5 rounded-lg border border-white/5 line-clamp-2">
                    {proj.notes}
                  </p>
                )}
              </div>

              {/* Website Visibility Control Section */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublic(proj)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all ${
                      proj.is_public
                        ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/40'
                        : 'bg-white/5 text-[#9BA3AE] border border-white/10 hover:text-white'
                    }`}
                    title="Toggle public visibility on website"
                  >
                    {proj.is_public ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Public on Web</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Private CRM</span>
                      </>
                    )}
                  </button>

                  {proj.is_featured && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Featured
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEditPublic(proj)}
                  className="p-1 rounded text-[#9BA3AE] hover:text-[#00F2FE] transition-colors"
                  title="Edit Website Showcase Details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#9BA3AE]">
                <div>
                  Amount:{' '}
                  <span className="text-emerald-400 font-bold">
                    {proj.amount ? `₹${Number(proj.amount).toLocaleString('en-IN')}` : 'TBD'}
                  </span>
                </div>
                <div>
                  Deadline:{' '}
                  <span className="text-white">
                    {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'Rolling'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Public Details Modal */}
      {editPublicModal.isOpen && (
        <Modal
          isOpen={editPublicModal.isOpen}
          onClose={() => setEditPublicModal(prev => ({ ...prev, isOpen: false }))}
          title={`Website Showcase: ${editPublicModal.project?.project_name}`}
          subtitle="Admin Master CMS — Configure presentation for public portfolio."
          maxWidth="lg"
        >
          <form onSubmit={handleSavePublicSettings} className="space-y-4">
            <div className="flex items-center gap-6 p-3.5 rounded-xl bg-[#07090C] border border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPublicModal.is_public}
                  onChange={e =>
                    setEditPublicModal(prev => ({ ...prev, is_public: e.target.checked }))
                  }
                  className="rounded bg-black border-white/20 text-[#00F2FE] focus:ring-0"
                />
                <span className="text-xs text-white font-mono">Show on Public Website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPublicModal.is_featured}
                  onChange={e =>
                    setEditPublicModal(prev => ({ ...prev, is_featured: e.target.checked }))
                  }
                  className="rounded bg-black border-white/20 text-[#00F2FE] focus:ring-0"
                />
                <span className="text-xs text-white font-mono">Featured in Showcase</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                Public Cover Image URL
              </label>
              <input
                type="text"
                value={editPublicModal.cover_image}
                onChange={e =>
                  setEditPublicModal(prev => ({ ...prev, cover_image: e.target.value }))
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#CBD5E1] uppercase mb-1">
                Public Description (Omit confidential client data)
              </label>
              <textarea
                rows={3}
                value={editPublicModal.public_description}
                onChange={e =>
                  setEditPublicModal(prev => ({ ...prev, public_description: e.target.value }))
                }
                placeholder="High-resolution photogrammetric survey and 3D architectural digital twin..."
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditPublicModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-tech font-bold bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] transition-all"
              >
                Save Visibility Settings
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
