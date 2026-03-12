import React, { useState } from 'react';
import { Search, MapPin, ShieldAlert, Activity, Navigation, Loader2, AlertCircle } from 'lucide-react';
import civicApi from '../services/civicApi';
import { motion, AnimatePresence } from 'framer-motion';

const RouteRisk = () => {
    const [locations, setLocations] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app, we'd geocode locations here. 
            // For demo purposes, we'll use random mock coordinates based on the search.
            const params = {
                start_lat: 18.5204 + (Math.random() * 0.1),
                start_lng: 73.8567 + (Math.random() * 0.1),
                end_lat: 18.5204 + (Math.random() * 0.1),
                end_lng: 73.8567 + (Math.random() * 0.1)
            };
            const response = await civicApi.getRouteRisk(params);
            setResult(response.data);
        } catch (error) {
            console.error('Route risk check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskStyles = (level) => {
        switch (level) {
            case 'High': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <ShieldAlert className="text-red-500" /> };
            case 'Medium': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <AlertCircle className="text-amber-500" /> };
            default: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <Activity className="text-emerald-500" /> };
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-16 px-4">
            <div className="text-center mb-12">
                <div className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary mb-4">
                    <Navigation size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 font-poppins">Journey Risk Analyzer</h1>
                <p className="text-slate-500 mt-2">Scan your route for active community hazards and risk zones.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
                <form onSubmit={handleCheck} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                <MapPin size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="Starting Point (e.g. Home)"
                                value={locations.start}
                                onChange={(e) => setLocations({ ...locations, start: e.target.value })}
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                <MapPin size={18} className="text-primary" />
                            </span>
                            <input
                                type="text"
                                placeholder="Destination (e.g. Office)"
                                value={locations.end}
                                onChange={(e) => setLocations({ ...locations, end: e.target.value })}
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-primary transition-all flex items-center justify-center space-x-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                        <span>Analyze Route Safety</span>
                    </button>
                </form>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 rounded-3xl border ${getRiskStyles(result.risk_level).bg} ${getRiskStyles(result.risk_level).border}`}
                    >
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                {getRiskStyles(result.risk_level).icon}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-xl font-bold ${getRiskStyles(result.risk_level).text}`}>
                                    {result.risk_level} Risk Detected
                                </h3>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="bg-white/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Hazards</p>
                                        <p className="text-2xl font-bold text-slate-800">{result.active_complaints}</p>
                                    </div>
                                    <div className="bg-white/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Risk Score</p>
                                        <p className="text-2xl font-bold text-slate-800">{result.avg_risk_score}</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                                    {result.risk_level === 'High'
                                        ? "Warning: Multiple critical reports detected on this path. We recommend extreme caution or an alternative route."
                                        : "Standard precautions advised. Some minor community reports exist nearby."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RouteRisk;
