import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Download,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import adminApi from '../../services/admin/adminApi';
import UrgencyBadge from '../../components/admin/UrgencyBadge';
import StatusBadge from '../../components/admin/StatusBadge';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import RiskBadge from '../../components/admin/RiskBadge';

const ComplaintsList = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        urgency: '',
        category: ''
    });

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                search: search || undefined,
                status: filters.status || undefined,
                urgency: filters.urgency || undefined,
                category: filters.category || undefined,
            };
            const response = await adminApi.getComplaints(params);
            setComplaints(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 20)); // Assuming 20 per page
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    }, [page, search, filters]);

    useEffect(() => {
        const timeout = setTimeout(fetchComplaints, 300);
        return () => clearTimeout(timeout);
    }, [fetchComplaints]);

    const handleTogglePublic = async (id, currentVal) => {
        try {
            await adminApi.updateComplaint(id, { is_public: !currentVal });
            toast.success('Visibility updated');
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    const handleVerify = async (id) => {
        try {
            await adminApi.updateComplaint(id, { is_verified: true });
            toast.success('Complaint marked as verified');
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to verify complaint');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this complaint? This cannot be undone.')) return;
        try {
            await adminApi.deleteComplaint(id);
            toast.success('Complaint deleted successfully');
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to delete complaint');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-poppins text-primary">Manage Complaints</h1>
                    <p className="text-slate-500 text-sm">Review, moderate, and update status of all citizen reports.</p>
                </div>
                <button
                    onClick={() => toast.promise(fetchComplaints(), {
                        loading: 'Preparing data export...',
                        success: 'Complaints list refreshed and ready for export (Backend pending)',
                        error: 'Export failed'
                    })}
                    className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm"
                >
                    <Download size={18} />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-1 md:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID or Title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    />
                </div>
                <select
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
                <select
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none"
                    value={filters.urgency}
                    onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                >
                    <option value="">All Urgency</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="">All Categories</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="water_supply">Water Supply</option>
                    <option value="roads">Roads</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Complaint Info</th>
                                <th className="px-6 py-4">Urgency</th>
                                <th className="px-6 py-4">Risk Assessment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Public</th>
                                <th className="px-6 py-4">Verified</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <Loader2 className="animate-spin text-primary inline-block" size={30} />
                                        <p className="mt-2 text-slate-500">Scanning neural patterns...</p>
                                    </td>
                                </tr>
                            ) : complaints.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <p className="text-slate-500">No complaints match your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                complaints.map((comp) => (
                                    <tr
                                        key={comp.id}
                                        onClick={() => navigate(`/admin/complaints/${comp.id}`)}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono text-slate-400 mb-0.5">{comp.tracking_id}</span>
                                                <Link
                                                    to={`/admin/complaints/${comp.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-sm font-bold text-slate-800 hover:text-primary transition-colors line-clamp-1"
                                                >
                                                    {comp.title}
                                                </Link>
                                                <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{comp.category_display}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <UrgencyBadge urgency={comp.urgency} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <RiskBadge score={comp.risk_score} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={comp.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePublic(comp.id, comp.is_public);
                                                }}
                                                className={`transition-colors flex items-center space-x-2 ${comp.is_public ? 'text-primary' : 'text-slate-300'}`}
                                            >
                                                {comp.is_public ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                                <span className="text-[10px] font-bold uppercase">{comp.is_public ? 'Active' : 'Hidden'}</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            {comp.is_verified ? (
                                                <ShieldCheck className="text-emerald-500" size={20} />
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleVerify(comp.id);
                                                    }}
                                                    className="text-slate-300 hover:text-emerald-500 transition-colors"
                                                >
                                                    <ShieldCheck size={20} />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/admin/complaints/${comp.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="View Detail"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleVerify(comp.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Verify"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(comp.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500 font-medium">
                        Showing results for page {page} of {totalPages}
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintsList;
