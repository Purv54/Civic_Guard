import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Clock,
    ShieldCheck,
    ExternalLink,
    ChevronRight,
    TrendingUp,
    AlertTriangle,
    RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-orange-50 text-orange-600 border-orange-100',
        in_review: 'bg-blue-50 text-blue-600 border-blue-100',
        in_progress: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
        closed: 'bg-slate-50 text-slate-600 border-slate-100',
    };

    const label = status?.replace('_', ' ').toUpperCase();

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending}`}>
            {label}
        </span>
    );
};

const UrgencyBadge = ({ urgency }) => {
    const styles = {
        low: 'bg-slate-100 text-slate-500',
        medium: 'bg-blue-50 text-blue-500',
        high: 'bg-orange-50 text-orange-500',
        critical: 'bg-red-50 text-red-600 font-bold animate-pulse',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-tighter ${styles[urgency] || styles.medium}`}>
            {urgency}
        </span>
    );
};

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchComplaints();

        // Auto-refresh every 30 seconds to sync status with backend
        const interval = setInterval(fetchComplaints, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchComplaints = async () => {
        try {
            console.log("[MyComplaints] Syncing with backend...");
            const response = await api.get('/complaints/');
            console.log("[MyComplaints] Data received:", response.data);

            const data = response.data.results || response.data;
            setComplaints(data);
        } catch (error) {
            console.error("[MyComplaints] Sync failed:", error);
            toast.error('Failed to sync with server');
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = Array.isArray(complaints)
        ? complaints.filter(c =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tracking_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Grievances</h1>
                    <p className="text-slate-500 mt-2">View and track the status of your submitted complaints.</p>
                </div>
                <Link
                    to="/dashboard/submit"
                    className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-4 rounded-2xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/10 active:scale-95"
                >
                    <Plus size={20} />
                    <span>New Complaint</span>
                </Link>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{complaints.filter(c => c.status === 'pending').length}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pending</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{complaints.filter(c => ['in_review', 'in_progress'].includes(c.status)).length}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{complaints.filter(c => c.status === 'resolved').length}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Main Container */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Table Header / Filters */}
                <div className="p-6 md:p-8 bg-white border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by title or ID..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <button
                            onClick={fetchComplaints}
                            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-white text-primary rounded-xl font-bold border-2 border-primary/10 hover:border-primary hover:bg-primary/5 transition-all"
                        >
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                            <span>Sync Now</span>
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold border border-slate-100 hover:bg-slate-100 transition-all">
                            <Filter size={18} />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {/* List Content */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching your records...</p>
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                                <AlertTriangle size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No Complaints Found</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">
                                {searchTerm ? "We couldn't find anything matching your search." : "You haven't submitted any complaints yet. Your grievances will appear here."}
                            </p>
                            {!searchTerm && (
                                <Link to="/dashboard/submit" className="mt-8 text-primary font-bold flex items-center space-x-2 hover:text-accent transition-colors">
                                    <span>Fila your first one</span>
                                    <ChevronRight size={18} />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / TRACKING</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">GRIEVANCE TITLE</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">STATUS</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">AI ANALYSIS</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATE</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredComplaints.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-primary mb-0.5">{c.tracking_id}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">REF: CG-2026-{c.id}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-slate-800 line-clamp-1">{c.title}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-widest">{c.effective_category || c.category}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <UrgencyBadge urgency={c.effective_urgency || c.urgency} />
                                                {c.ai_predicted_category && (
                                                    <span className="text-[8px] mt-1 text-emerald-600 font-black">AI VERIFIED</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm text-slate-600">{new Date(c.created_at).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link
                                                to={`/dashboard/complaints/${c.id}`}
                                                className="inline-flex items-center space-x-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all group-hover:shadow-md"
                                            >
                                                <span>View Details</span>
                                                <ExternalLink size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyComplaints;
