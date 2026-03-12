import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    TrendingUp,
    MapPin,
    ArrowRight,
    Loader2,
    PieChart,
    Users,
    AlertTriangle
} from 'lucide-react';
import adminApi from '../../services/admin/adminApi';
import UrgencyBadge from '../../components/admin/UrgencyBadge';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';

const EngagementMonitoring = () => {
    const navigate = useNavigate();
    const [highRisk, setHighRisk] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getEngagementSummary();
            setHighRisk(response.data);
        } catch (error) {
            console.error('Failed to fetch engagement summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    const totalConfirms = highRisk.reduce((acc, curr) => acc + (curr.risk_confirmations || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-poppins">Engagement Monitoring</h1>
                    <p className="text-slate-500">Tracking high-risk clusters based on crowd-sourced confirmations.</p>
                </div>
                <div className="bg-white p-1 rounded-xl border border-slate-100 flex items-center shadow-sm">
                    <button className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg">High Risk</button>
                    <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">Risk Analytics</button>
                </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Risk Confirmations"
                    value={totalConfirms}
                    icon={ShieldAlert}
                    color="orange"
                />
                <StatCard
                    title="Targeted Clusters"
                    value={highRisk.length}
                    icon={MapPin}
                    color="primary"
                />
                <StatCard
                    title="Verified Residents"
                    value={totalConfirms * 3} // Multiplier for demo
                    icon={Users}
                    color="accent"
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center">
                        <TrendingUp className="mr-2 text-primary" size={22} />
                        Priority Risk Map (by Engagement)
                    </h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {highRisk.length === 0 ? (
                        <div className="p-20 text-center">
                            <ShieldAlert className="mx-auto text-slate-200 mb-4" size={60} />
                            <p className="text-slate-400">No high-risk engagements detected at this time.</p>
                        </div>
                    ) : (
                        highRisk.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/admin/complaints/${item.id}`)}
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-all group cursor-pointer"
                            >
                                <div className="flex items-start space-x-6 mb-4 md:mb-0">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-500">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</h4>
                                            <UrgencyBadge urgency={item.urgency} />
                                        </div>
                                        <div className="flex items-center text-xs text-slate-400 font-medium space-x-4">
                                            <span className="flex items-center"><MapPin size={12} className="mr-1" /> {item.location}</span>
                                            <span className="flex items-center uppercase tracking-wider">{item.category}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end md:space-x-12">
                                    <div className="text-right">
                                        <div className="flex items-center justify-end text-orange-600 font-bold mb-0.5">
                                            <AlertTriangle size={14} className="mr-1" />
                                            {item.risk_confirmations} Responders
                                        </div>
                                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-500"
                                                style={{ width: `${Math.min((item.risk_confirmations / 20) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Link
                                        to={`/admin/complaints/${item.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                    >
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EngagementMonitoring;
