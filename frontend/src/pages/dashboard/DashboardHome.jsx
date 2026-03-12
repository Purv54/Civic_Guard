import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    PlusCircle,
    ChevronRight,
    Clock,
    MapPin,
    AlertCircle,
    FileText,
    TrendingUp,
    Layout,
    Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/');
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Namaste, <span className="text-primary">{user?.first_name || user?.username}!</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">You have {stats?.recent_complaints?.length || 0} active grievances under process.</p>
                </div>
                <div className="flex items-center space-x-4">
                    {(user?.is_staff || user?.profile?.role === 'admin') && (
                        <Link
                            to="/admin/dashboard"
                            className="inline-flex items-center space-x-3 bg-primary text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-slate-800 transition-all text-lg active:scale-95"
                        >
                            <Shield size={24} className="text-accent" />
                            <span>Admin Panel</span>
                        </Link>
                    )}
                    <Link
                        to="/dashboard/submit"
                        className="inline-flex items-center space-x-3 bg-accent text-white px-8 py-5 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(46,204,113,0.3)] hover:scale-105 transition-all text-lg active:scale-95"
                    >
                        <PlusCircle size={24} />
                        <span>Lodge Complaint</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/40 border border-slate-100">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                    <Layout size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Activity</h2>
                            </div>
                            <Link to="/dashboard/complaints" className="text-sm font-black text-primary hover:text-accent transition-colors">VIEW ALL</Link>
                        </div>

                        <div className="space-y-6">
                            {!stats?.recent_complaints || stats.recent_complaints.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                                    <div className="text-slate-300 mb-4"><FileText size={48} className="mx-auto" /></div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No records to show yet</p>
                                </div>
                            ) : (
                                stats.recent_complaints.map((c) => (
                                    <Link
                                        key={c.id}
                                        to={`/dashboard/complaints/${c.id}`}
                                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all"
                                    >
                                        <div className="flex items-center space-x-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm
                             ${c.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}
                          `}>
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{c.title}</h4>
                                                <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                    <span>{c.tracking_id}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center space-x-1"><MapPin size={10} /> <span>{c.city}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0 border-slate-100">
                                            <div className="text-right">
                                                <div className={`text-xs font-black uppercase tracking-widest ${c.status === 'resolved' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                                    {c.status_display}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{new Date(c.created_at).toLocaleDateString()}</div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-10">
                    {/* Governance Support Widget */}
                    <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>

                        <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-8">
                            <AlertCircle size={32} className="text-accent" />
                        </div>

                        <h3 className="text-2xl font-black mb-4">Empowering<br />Transparency</h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-8">
                            Your feedback helps us build a smarter city. We aim to resolve all grievances within 48 to 72 hours.
                        </p>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center space-x-4">
                            <div className="h-12 w-1.5 bg-accent rounded-full"></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Resolution Rate</div>
                                <div className="text-lg font-black text-white">96.4% Efficiency</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 text-center space-y-2">
                            <div className="text-3xl font-black text-slate-900">{stats?.total_complaints || 0}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Total Filed</div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 text-center space-y-2">
                            <div className="text-3xl font-black text-emerald-500">{stats?.resolved || 0}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Resolved</div>
                        </div>
                    </div>

                    <div className="bg-emerald-500 p-1 rounded-[2.5rem] shadow-lg shadow-emerald-200/50">
                        <div className="bg-white rounded-[2.4rem] p-8 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Satisfaction</div>
                                <div className="text-xl font-black text-slate-800 tracking-tight">4.9/5 Rating</div>
                            </div>
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;
