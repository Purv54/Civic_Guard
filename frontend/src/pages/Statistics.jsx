import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, AlertTriangle, Users, BarChart3, PieChart, Activity } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
    >
        <div className={`p-4 rounded-3xl ${color} mb-6`}>
            <Icon size={32} className="text-white" />
        </div>
        <div className="text-4xl font-black text-slate-900 mb-2">{value}</div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </motion.div>
);

const Statistics = () => {
    // ... rest of the component
    const impactStats = [
        { icon: CheckCircle2, label: "Resolved", value: "8,421", color: "bg-emerald-500", delay: 0.1 },
        { icon: Activity, label: "In Progress", value: "1,245", color: "bg-blue-500", delay: 0.2 },
        { icon: AlertTriangle, label: "High Urgency", value: "342", color: "bg-orange-500", delay: 0.3 },
        { icon: Users, label: "Active Users", value: "24.5k", color: "bg-primary", delay: 0.4 },
    ];

    const categoryStats = [
        { name: "Road Infrastructure", percentage: 45, color: "bg-primary" },
        { name: "Water Supply", percentage: 22, color: "bg-blue-500" },
        { name: "Public Safety", percentage: 18, color: "bg-orange-500" },
        { name: "Sanitation", percentage: 15, color: "bg-emerald-500" },
    ];

    return (
        <div className="bg-slate-50">
            <main className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Real-time <span className="text-primary">Impact</span> Metrics
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                        Live data showing how our community and government are working together to improve urban infrastructure.
                    </p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {impactStats.map((stat, i) => (
                        <StatCard key={i} {...stat} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Distribution by Category */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        <div className="flex items-center space-x-3 mb-10">
                            <PieChart className="text-primary" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Distribution by Sector</h3>
                        </div>
                        <div className="space-y-8">
                            {categoryStats.map((cat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                                        <span className="text-xs font-black text-primary">{cat.percentage}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.percentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            className={`h-full ${cat.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Growth */}
                    <div className="bg-primary rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full translate-x-32 -translate-y-32 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 mb-6">
                                <TrendingUp className="text-accent" />
                                <h3 className="text-xl font-bold uppercase tracking-widest">Growth Analytics</h3>
                            </div>
                            <h4 className="text-4xl font-black mb-6 leading-tight">
                                +124% Increase in Resolution Speed
                            </h4>
                            <p className="text-white/70 mb-10 leading-relaxed font-medium">
                                Since the implementation of AI-routing, we have seen a dramatic decrease in manual processing time, allowing officials to reach sites faster.
                            </p>
                            <div className="flex items-center space-x-8">
                                <div>
                                    <div className="text-3xl font-black text-accent">2.4 Days</div>
                                    <div className="text-[10px] font-bold uppercase tracking-tighter text-white/50">Avg Resolution Time</div>
                                </div>
                                <div className="w-px h-12 bg-white/10"></div>
                                <div>
                                    <div className="text-3xl font-black text-accent">92%</div>
                                    <div className="text-[10px] font-bold uppercase tracking-tighter text-white/50">Accuracy Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
                        Data verified as of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Statistics;
