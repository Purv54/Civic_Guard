import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
    Search,
    Clock,
    MapPin,
    AlertTriangle,
    ChevronRight,
    Loader2,
    RefreshCcw,
    TrendingUp,
    Shield,
    Flame,
    Construction,
    CheckCircle2,
    Eye,
    MessageSquare,
    Share2,
    LogIn
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const UrgencyBadge = ({ urgency }) => {
    const styles = {
        low: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        medium: 'bg-orange-50 text-orange-600 border-orange-100',
        high: 'bg-red-50 text-red-600 border-red-100 font-bold',
        critical: 'bg-slate-900 text-white border-slate-900 animate-pulse font-black',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest border shadow-sm ${styles[urgency] || styles.medium}`}>
            {urgency} Priority
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        in_review: 'bg-blue-50 text-blue-600 border-blue-100',
        in_progress: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    const labels = {
        pending: 'Pending',
        in_review: 'In Review',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        rejected: 'Rejected',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest border shadow-sm ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
};

const EngagementButton = ({ type, count, isActive, onClick, disabled }) => {
    const configs = {
        risk: {
            icon: Flame,
            label: 'Risk Confirmed',
            activeClass: 'bg-red-50 text-red-600 border-red-100 shadow-inner',
            hoverClass: 'hover:bg-red-50 hover:text-red-500 hover:border-red-100',
            iconColor: 'group-hover:text-red-500'
        },
        active: {
            icon: Construction,
            label: 'Still Active',
            activeClass: 'bg-orange-50 text-orange-600 border-orange-100 shadow-inner',
            hoverClass: 'hover:bg-orange-50 hover:text-orange-500 hover:border-orange-100',
            iconColor: 'group-hover:text-orange-500'
        },
        resolved_locally: {
            icon: CheckCircle2,
            label: 'Resolved Locally',
            activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-inner',
            hoverClass: 'hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100',
            iconColor: 'group-hover:text-emerald-500'
        },
        observed: {
            icon: Eye,
            label: 'Observed This',
            activeClass: 'bg-blue-50 text-blue-600 border-blue-100 shadow-inner',
            hoverClass: 'hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100',
            iconColor: 'group-hover:text-blue-500'
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            disabled={disabled}
            className={`
                group flex flex-col items-center justify-center space-y-1.5 p-2 rounded-2xl border border-transparent transition-all duration-300
                ${isActive ? config.activeClass : `bg-slate-50/50 text-slate-400 ${config.hoverClass}`}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <Icon size={18} className={`${isActive ? '' : config.iconColor} transition-colors`} />
            <div className="flex flex-col items-center">
                <span className={`text-[10px] font-black leading-none ${isActive ? 'text-inherit' : 'text-slate-900'}`}>{count}</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter opacity-70 hidden md:block">{config.label}</span>
            </div>
        </button>
    );
};

const PublicFeed = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [filters, setFilters] = useState({
        urgency: '',
        category: '',
        search: ''
    });

    useEffect(() => {
        setComplaints([]);
        fetchPublicComplaints(true);
    }, [filters.urgency, filters.category]);

    const fetchPublicComplaints = async (reset = false) => {
        if (reset) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = new URLSearchParams();
            if (filters.urgency) params.append('urgency', filters.urgency);
            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);

            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const url = reset
                ? `public-complaints/?${params.toString()}`
                : nextPage.split('/api/')[1];

            const response = await api.get(url);

            if (reset) {
                setComplaints(response.data.results || response.data);
            } else {
                setComplaints(prev => [...prev, ...(response.data.results || [])]);
            }

            setNextPage(response.data.next || null);
        } catch (error) {
            console.error("Feed fetch error:", error);
            toast.error("Failed to sync with civic feed");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleEngage = async (complaintId, type) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            // Optimistic UI update
            setComplaints(prev => prev.map(c => {
                if (c.id === complaintId) {
                    const isClosing = c.user_engagements.includes(type);
                    const newSummary = { ...c.engagement_summary };
                    newSummary[type] = isClosing ? Math.max(0, newSummary[type] - 1) : newSummary[type] + 1;
                    const newUserEngagements = isClosing
                        ? c.user_engagements.filter(t => t !== type)
                        : [...c.user_engagements, type];

                    return { ...c, engagement_summary: newSummary, user_engagements: newUserEngagements };
                }
                return c;
            }));

            const response = await api.post(`complaints/${complaintId}/engage/`, { type });

            // Re-sync with actual server state
            setComplaints(prev => prev.map(c => {
                if (c.id === complaintId) {
                    return {
                        ...c,
                        engagement_summary: response.data.engagement_summary,
                        user_engagements: response.data.user_engagements
                    };
                }
                return c;
            }));

            if (response.data.action === 'added') {
                toast.success("Risk reported", { icon: '🚨', id: `engage-${complaintId}` });
            }
        } catch (error) {
            toast.error("Cloud sync failed");
            // Revert on error? (In a real app, you would fetch the item again)
            fetchPublicComplaints(true);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPublicComplaints(true);
    };

    return (
        <div className="bg-slate-50 font-inter">
            {/* Premium Header */}
            <div className="bg-white border-b border-slate-100 pt-32 pb-12 overflow-hidden relative">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Local Intel</span>
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                                The Civic <span className="text-primary">Intelligence</span> Network
                            </h1>
                            <p className="text-lg text-slate-500 font-medium max-w-xl">
                                Navigate your city safely by monitoring community-verified risks, infrastructure blocks, and public alerts.
                            </p>
                        </div>

                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl">
                                <div className="text-xs font-black uppercase tracking-widest text-accent mb-2">Verified Risks</div>
                                <div className="text-4xl font-black tracking-tighter">14.2k</div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] text-slate-900 shadow-xl border border-slate-100">
                                <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">Active Users</div>
                                <div className="text-4xl font-black tracking-tighter text-primary">2.4k</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filter Bar */}
            <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search areas or issues..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-sm font-medium"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                className="px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-600 text-xs outline-none cursor-pointer hover:bg-white transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWE5YTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTQgNmw0IDQgNC00Ii8+PC9zdmc+')] bg-[length:16px] bg-no-repeat bg-[right_8px_center]"
                                value={filters.urgency}
                                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                            >
                                <option value="">All Priorities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>

                            <select
                                className="px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-600 text-xs outline-none cursor-pointer hover:bg-white transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWE5YTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTQgNmw0IDQgNC00Ii8+PC9zdmc+')] bg-[length:16px] bg-no-repeat bg-[right_8px_center]"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Sectors</option>
                                <option value="roads">Road Systems</option>
                                <option value="water_supply">Water Supply</option>
                                <option value="electricity">Power Grid</option>
                                <option value="sanitation">Waste Mgmt</option>
                                <option value="public_safety">Safety Alerts</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => fetchPublicComplaints(true)}
                                className="p-2.5 bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-primary hover:border-primary/30 transition-all active:scale-95"
                            >
                                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Grid-based Feed */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-[2rem] h-[500px] animate-pulse border border-slate-100 p-8 space-y-6">
                                <div className="h-6 bg-slate-100 rounded-lg w-1/2"></div>
                                <div className="h-40 bg-slate-50 rounded-2xl w-full"></div>
                                <div className="h-10 bg-slate-100 rounded-xl w-3/4"></div>
                                <div className="h-20 bg-slate-50 rounded-xl w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Shield size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Neighborhood is Clear</h3>
                        <p className="text-slate-500 text-sm mb-8">No reports found matching your active filters.</p>
                        <button
                            onClick={() => setFilters({ urgency: '', category: '', search: '' })}
                            className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5 px-6 py-3 rounded-xl border border-primary/10 hover:bg-primary hover:text-white transition-all"
                        >
                            Reset Network Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {complaints.map((c, idx) => (
                            <motion.div
                                key={c.id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/complaints/${c.id}`)}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full cursor-pointer"
                            >
                                {/* Card Header */}
                                <div className="p-6 flex items-start justify-between">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-2 text-slate-400">
                                            <MapPin size={12} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{c.location || c.city}</span>
                                        </div>
                                        <StatusBadge status={c.status} />
                                    </div>
                                    <UrgencyBadge urgency={c.effective_urgency || c.urgency} />
                                </div>

                                {/* Card Body */}
                                <div className="p-6 pt-0 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors">
                                        {c.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-3">
                                        {c.description}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                            <Clock size={12} className="text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Engagement Section */}
                                <div className="px-6 pb-8">
                                    <div className="grid grid-cols-4 gap-2">
                                        <EngagementButton
                                            type="risk"
                                            count={c.engagement_summary.risk}
                                            isActive={c.user_engagements.includes('risk')}
                                            onClick={() => handleEngage(c.id, 'risk')}
                                        />
                                        <EngagementButton
                                            type="active"
                                            count={c.engagement_summary.active}
                                            isActive={c.user_engagements.includes('active')}
                                            onClick={() => handleEngage(c.id, 'active')}
                                        />
                                        <EngagementButton
                                            type="resolved_locally"
                                            count={c.engagement_summary.resolved_locally}
                                            isActive={c.user_engagements.includes('resolved_locally')}
                                            onClick={() => handleEngage(c.id, 'resolved_locally')}
                                        />
                                        <EngagementButton
                                            type="observed"
                                            count={c.engagement_summary.observed}
                                            isActive={c.user_engagements.includes('observed')}
                                            onClick={() => handleEngage(c.id, 'observed')}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Load More */}
                {nextPage && (
                    <div className="flex justify-center pt-16">
                        <button
                            onClick={() => fetchPublicComplaints(false)}
                            disabled={loadingMore}
                            className="inline-flex items-center space-x-3 px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black rounded-[2rem] hover:border-primary hover:text-primary transition-all shadow-xl shadow-slate-200/50 active:scale-95 disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 size={18} className="animate-spin text-primary" />
                                    <span>Syncing Live Reports...</span>
                                </>
                            ) : (
                                <>
                                    <span>Load More Civic Data</span>
                                    <RefreshCcw size={18} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>

            {/* Premium Login Modal Overlay */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLoginModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] p-10 md:p-14 max-w-lg w-full relative z-[110] shadow-2xl overflow-hidden"
                        >
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-10 -translate-y-10"></div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
                                    <Shield size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Identity Required</h2>
                                <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                                    To engage with civic risks and help your community, you need to be a verified member of CivicGuard.
                                </p>

                                <div className="flex flex-col space-y-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <LogIn size={20} />
                                        <span>Sign In Now</span>
                                    </button>
                                    <button
                                        onClick={() => setShowLoginModal(false)}
                                        className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublicFeed;
