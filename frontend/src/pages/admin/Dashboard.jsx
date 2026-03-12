import React, { useState, useEffect } from 'react';
import {
    Users,
    MessageSquare,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    ShieldAlert,
    Loader2,
    TrendingUp,
    Globe
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import adminApi from '../../services/admin/adminApi';
import UrgencyBadge from '../../components/admin/UrgencyBadge';
import StatusBadge from '../../components/admin/StatusBadge';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchTrends();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminApi.getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        }
    };

    const fetchTrends = async () => {
        try {
            const response = await axios.get('/api/admin/trends/');
            setTrends(response.data);
        } catch (error) {
            console.error('Failed to fetch trends:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 font-poppins">Civic Intelligence Overview</h1>
                <p className="text-slate-500">Real-time status of governence complaints and public engagement.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Complaints"
                    value={stats?.total_complaints || 0}
                    icon={MessageSquare}
                    color="primary"
                    trend={{ value: '+12%', isPositive: true }}
                />
                <StatCard
                    title="Critical & High"
                    value={stats?.high_urgency_count || 0}
                    icon={AlertCircle}
                    color="red"
                    trend={{ value: '+5%', isPositive: false }}
                />
                <StatCard
                    title="Pending Action"
                    value={stats?.pending_count || 0}
                    icon={TrendingUp}
                    color="orange"
                />
                <StatCard
                    title="Resolved Cases"
                    value={stats?.resolved_count || 0}
                    icon={CheckCircle}
                    color="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* High Risk Complaints */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">High Risk (Engagement Driven)</h3>
                            <p className="text-sm text-slate-500">Complaints with high community verification.</p>
                        </div>
                        <Link to="/admin/engagement" className="text-primary hover:text-accent font-semibold text-sm flex items-center">
                            View All <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Complaint</th>
                                    <th className="px-6 py-4">Urgency</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Engagements</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats?.top_high_risk_complaints?.map((comp) => (
                                    <tr
                                        key={comp.id}
                                        onClick={() => navigate(`/admin/complaints/${comp.id}`)}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{comp.title}</p>
                                            <p className="text-xs text-slate-500">{comp.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <UrgencyBadge urgency={comp.urgency} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={comp.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">
                                                    {comp.engagement_count} verifies
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-6">Status Breakdown</h3>
                        <div className="space-y-4">
                            {Object.entries(stats?.status_distribution || {}).map(([key, value]) => {
                                const total = stats.total_complaints || 1;
                                const percentage = Math.round((value / total) * 100);
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize text-slate-600 font-medium">{key.replace('_', ' ')}</span>
                                            <span className="font-bold text-slate-900">{value} ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full ${key === 'resolved' ? 'bg-emerald-500' :
                                                    key === 'pending' ? 'bg-slate-400' :
                                                        'bg-blue-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 text-white relative overflow-hidden">
                        <Globe className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
                        <h3 className="font-bold text-lg mb-2 relative z-10">Public Visibility</h3>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <h1 className="text-4xl font-bold font-poppins">{stats?.total_public_count || 0}</h1>
                                <p className="text-white/70 text-sm">Complaints live on feed</p>
                            </div>
                            <CheckCircle className="text-accent h-10 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trends Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Predictive Governance Insights</h3>
                        <p className="text-sm text-slate-500">Projected trends based on weekly case volume shifts.</p>
                    </div>
                    <TrendingUp className="text-primary" size={28} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trends.slice(0, 4).map((trend) => (
                        <div key={trend.category} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className={`absolute top-0 right-0 p-2 text-xs font-black uppercase italic ${trend.increase_percent > 0 ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'}`}>
                                {trend.increase_percent > 0 ? 'Rising ↑' : 'Falling ↓'}
                            </div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{trend.category_display}</h4>
                            <div className="flex items-end space-x-2">
                                <span className="text-3xl font-black text-slate-900 font-poppins">{trend.increase_percent}%</span>
                                <span className="text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-tighter">vs Last Week</span>
                            </div>
                            <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(Math.abs(trend.increase_percent), 100)}%` }}
                                    className={`h-full ${trend.increase_percent > 30 ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-primary'}`}
                                />
                            </div>
                            <p className="mt-3 text-[10px] font-bold text-slate-400">
                                {trend.current_count} new cases reported this period.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
