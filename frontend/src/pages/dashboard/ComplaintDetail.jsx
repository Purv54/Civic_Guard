import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    ArrowLeft,
    Clock,
    MapPin,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    MessageSquare,
    History,
    TrendingUp,
    Cpu,
    Loader2,
    RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StatusTimeline = ({ updates = [], currentStatus }) => {
    // Define full path
    const stages = [
        { key: 'pending', label: 'Submitted', desc: 'Received by CivicGuard' },
        { key: 'in_review', label: 'AI Analysis', desc: 'Categorized & Priority Set' },
        { key: 'in_progress', label: 'Assigned', desc: 'Official working on issue' },
        { key: 'resolved', label: 'Resolved', desc: 'Solution verified' },
    ];

    // Logic to determine if a stage is complete
    const getStatusOrder = (status) => {
        const orders = { 'pending': 0, 'in_review': 1, 'in_progress': 2, 'resolved': 3, 'rejected': 4, 'closed': 4 };
        return orders[status] || 0;
    };

    const currentOrder = getStatusOrder(currentStatus);

    return (
        <div className="space-y-10">
            <div className="flex items-center space-x-3 text-primary mb-8 px-1">
                <History size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Status Timeline</h3>
            </div>

            <div className="relative pl-10 space-y-12 before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-slate-100 before:z-0">
                {stages.map((stage, idx) => {
                    const isComplete = currentOrder >= idx;
                    const isCurrent = currentStatus === stage.key || (idx === stages.length - 1 && currentStatus === 'resolved');

                    return (
                        <div key={stage.key} className="relative z-10">
                            {/* Dot */}
                            <div className={`
                absolute -left-10 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-500
                ${isComplete ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}
                ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}
              `}>
                                {isComplete ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                            </div>

                            {/* Content */}
                            <div>
                                <h4 className={`text-sm font-bold ${isComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {stage.label}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">{stage.desc}</p>

                                {isCurrent && (
                                    <div className="mt-3 inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Current Status
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {updates.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Activity Log</h5>
                    <div className="space-y-6">
                        {updates.map((update, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800">
                                        Status changed to <span className="capitalize">{update.new_status.replace('_', ' ')}</span>
                                    </div>
                                    {update.note && <div className="text-[11px] text-slate-500 mt-1 bg-white p-3 rounded-xl border border-slate-100 italic">"{update.note}"</div>}
                                    <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                                        {new Date(update.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ComplaintDetail = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDetail();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchDetail, 30000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchDetail = async () => {
        try {
            console.log(`[ComplaintDetail] Fetching status for ID: ${id}...`);
            const response = await api.get(`/public-complaints/${id}/`);
            console.log("[ComplaintDetail] Data received:", response.data);
            setComplaint(response.data);
        } catch (error) {
            console.error("[ComplaintDetail] Fetch failed:", error);
            toast.error('Complaint not found');
            navigate('/feed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading grievance data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Top Nav */}
                <div className="flex items-center justify-between">
                    <Link to="/feed" className="inline-flex items-center space-x-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Feed</span>
                    </Link>
                    <button
                        onClick={fetchDetail}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 hover:bg-white hover:text-primary hover:border-primary transition-all shadow-sm"
                    >
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                        <span>Check for Updates</span>
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Complaint Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">

                            {/* Detail Header */}
                            <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase rounded-lg border border-primary/10">
                                                ID: {complaint.tracking_id}
                                            </span>
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border flex items-center space-x-1.5
                                            ${complaint.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    complaint.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        complaint.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            complaint.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                'bg-slate-50 text-slate-600 border-slate-100'}
                                         `}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${complaint.status === 'resolved' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></div>
                                                <span>{complaint.status_display}</span>
                                            </span>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                                            {complaint.title}
                                        </h1>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Impact Level</div>
                                        <div className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm
                         ${complaint.urgency === 'critical' ? 'bg-red-600 text-white shadow-red-200' :
                                                complaint.urgency === 'high' ? 'bg-orange-500 text-white shadow-orange-200' :
                                                    'bg-slate-800 text-white'}
                      `}>
                                            {complaint.urgency_display}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Location</div>
                                            <div className="text-xs font-bold text-slate-800 truncate">{complaint.city || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Department</div>
                                            <div className="text-xs font-bold text-slate-800 truncate">{complaint.department?.name || 'Awaiting Assignment'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Submitted</div>
                                            <div className="text-xs font-bold text-slate-800 truncate">{new Date(complaint.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description & Photo */}
                            <div className="p-8 md:p-12 space-y-12">
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 text-primary mb-4">
                                        <MessageSquare size={18} />
                                        <h3 className="font-bold uppercase tracking-widest text-sm">Full Description</h3>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                        {complaint.description}
                                    </p>
                                </div>

                                {complaint.attachment && (
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 text-primary mb-4">
                                            <ImageIcon size={18} />
                                            <h3 className="font-bold uppercase tracking-widest text-sm">Evidence Attached</h3>
                                        </div>
                                        <div className="group relative rounded-[2rem] overflow-hidden border-8 border-slate-50 shadow-2xl inline-block max-w-full">
                                            <img
                                                src={complaint.attachment}
                                                alt="Grievance Evidence"
                                                className="max-h-[500px] object-contain hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Insights Card */}
                        {complaint.ai_predicted_category && (
                            <div className="bg-gradient-to-br from-primary to-indigo-900 p-1 rounded-[2.5rem] shadow-2xl shadow-primary/20">
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-10 text-white relative overflow-hidden">
                                    {/* Glow */}
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px]"></div>

                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-2xl border border-white/10">
                                            <Cpu size={20} className="text-accent" />
                                            <span className="text-xs font-bold uppercase tracking-widest">AI Analysis Intelligence</span>
                                        </div>
                                        <div className="text-xs font-bold text-white/50 uppercase tracking-tighter">Verified @ {new Date(complaint.ai_analyzed_at).toLocaleTimeString()}</div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-10 relative z-10">
                                        <div>
                                            <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">Predicted Category</h4>
                                            <div className="text-2xl font-black capitalize mb-2">{complaint.ai_predicted_category}</div>
                                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-accent rounded-full text-[10px] font-black tracking-widest">
                                                <ShieldCheck size={12} />
                                                <span>{(complaint.ai_confidence_score * 100).toFixed(1)}% CONFIDENCE</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">Issue Summary</h4>
                                            <p className="text-white/70 text-sm italic leading-relaxed">
                                                "{complaint.ai_summary || "Automated analysis completed. Priority routing based on environmental impact and public density."}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar Timeline */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
                            <StatusTimeline updates={complaint.updates} currentStatus={complaint.status} />
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-4 border-white shadow-lg">
                                <TrendingUp size={32} />
                            </div>
                            <h4 className="text-xl font-black text-slate-800">Resolution Progress</h4>
                            <p className="text-sm text-slate-500 leading-relaxed px-4">
                                Our authorities are working as per the priority standards. Estimated resolution in <span className="text-primary font-bold">2-3 working days</span>.
                            </p>
                            <button className="w-full py-4 bg-slate-50 text-slate-900 font-bold rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all flex items-center justify-center space-x-3">
                                <AlertCircle size={20} className="text-orange-500" />
                                <span>Fast-Track Request</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ComplaintDetail;
