import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    ShieldCheck,
    Clock,
    Save,
    Loader2,
    ExternalLink,
    MessageSquare,
    Activity,
    Trash2,
    CheckCircle,
    Eye,
    EyeOff,
    ShieldAlert
} from 'lucide-react';
import adminApi from '../../services/admin/adminApi';
import UrgencyBadge from '../../components/admin/UrgencyBadge';
import StatusBadge from '../../components/admin/StatusBadge';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    console.log("Admin Complaint Detail - Fetching ID:", id);
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        status: '',
        urgency: '',
        is_public: false,
        is_verified: false,
        admin_notes: '',
        note: '' // timeline note
    });

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getComplaintDetail(id);
            setComplaint(response.data);
            setFormData({
                status: response.data.status,
                urgency: response.data.urgency,
                is_public: response.data.is_public,
                is_verified: response.data.is_verified,
                admin_notes: response.data.admin_notes || '',
                note: ''
            });
        } catch (error) {
            console.error('Failed to fetch detail:', error);
            toast.error('Complaint not found');
            navigate('/admin/complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminApi.updateComplaint(id, formData);
            toast.success('Complaint updated successfully');
            fetchDetail(); // Refresh to show timeline
        } catch (error) {
            toast.error('Failed to update complaint');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this complaint permanently?')) return;
        try {
            await adminApi.deleteComplaint(id);
            toast.success('Deleted');
            navigate('/admin/complaints');
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!complaint) return (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <p className="text-slate-500 font-bold">Complaint not found or inaccessible.</p>
            <button
                onClick={() => navigate('/admin/complaints')}
                className="bg-primary text-white px-6 py-2 rounded-xl"
            >
                Back to List
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/admin/complaints')}
                    className="flex items-center text-slate-500 hover:text-primary transition-colors font-medium"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Management
                </button>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                    >
                        <Trash2 size={18} className="inline mr-2" />
                        Delete Complaint
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Content Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-sm font-mono text-slate-400 block mb-1">{complaint.tracking_id}</span>
                                <h1 className="text-3xl font-bold text-slate-900 font-poppins">{complaint.title}</h1>
                            </div>
                            <div className="flex flex-col items-end">
                                <StatusBadge status={complaint.status} />
                                <span className="text-xs text-slate-400 mt-2 flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(complaint.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none text-slate-600 mb-8 leading-relaxed">
                            {complaint.description}
                        </div>

                        {complaint.attachment && (
                            <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Evidence Attachment</p>
                                <a
                                    href={complaint.attachment}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative block overflow-hidden rounded-xl bg-slate-200"
                                >
                                    <img
                                        src={complaint.attachment}
                                        alt="Complaint evidence"
                                        className="w-full h-auto max-h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="bg-white text-primary px-4 py-2 rounded-xl font-bold shadow-xl flex items-center">
                                            <ExternalLink size={18} className="mr-2" />
                                            View Full Image
                                        </button>
                                    </div>
                                </a>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-bold text-slate-700">{complaint.location}, {complaint.city}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reporter</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {complaint.is_anonymous ? 'Anonymous' : complaint.citizen?.full_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified</p>
                                    <p className={`text-sm font-bold ${complaint.is_verified ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {complaint.is_verified ? 'Official Record' : 'Pending Verification'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            <Activity size={20} className="mr-2 text-primary" />
                            Action Timeline
                        </h3>
                        <div className="space-y-6">
                            {complaint.updates?.length === 0 ? (
                                <p className="text-slate-400 text-center py-4">No actions recorded yet.</p>
                            ) : (
                                complaint.updates.map((update, idx) => (
                                    <div key={idx} className="flex space-x-4 relative">
                                        {idx !== complaint.updates.length - 1 && (
                                            <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-100" />
                                        )}
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                            <Clock size={16} className="text-slate-400" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-bold text-slate-800">
                                                Status changed to <span className="text-primary italic capitalize">{update.new_status.replace('_', ' ')}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                By {update.updated_by?.full_name} — {new Date(update.created_at).toLocaleString()}
                                            </p>
                                            {update.note && (
                                                <div className="mt-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 text-sm text-slate-600">
                                                    {update.note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-28">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 font-poppins">Moderator Control</h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Complaint Status</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_review">In Review</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Urgency */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Assign Urgency</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
                                    value={formData.urgency}
                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            {/* Verification & Visibility */}
                            <div className="space-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${formData.is_public ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                                        }`}
                                >
                                    <span className="text-sm font-bold flex items-center">
                                        {formData.is_public ? <Eye size={18} className="mr-2" /> : <EyeOff size={18} className="mr-2" />}
                                        Show in Public Feed
                                    </span>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.is_public ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_public ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_verified: !formData.is_verified })}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${formData.is_verified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                                        }`}
                                >
                                    <span className="text-sm font-bold flex items-center">
                                        <ShieldCheck size={18} className="mr-2" />
                                        Official Verification
                                    </span>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.is_verified ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_verified ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </button>
                            </div>

                            {/* Action Note */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                                    <MessageSquare size={14} className="mr-1" />
                                    Internal Action Note
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Explain why this status was changed..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                <span>Commit Changes</span>
                            </button>
                        </form>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
                        <h4 className="font-bold text-orange-800 mb-2 flex items-center">
                            <ShieldAlert size={18} className="mr-2" />
                            Engagement Alert
                        </h4>
                        <p className="text-sm text-orange-700/80 mb-4">
                            This complaint has been verified by <strong>{complaint.engagement_summary?.risk || 0} residents</strong> as a genuine risk.
                        </p>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-orange-200 flex items-center justify-center">
                                    <User size={14} className="text-orange-600" />
                                </div>
                            ))}
                            <div className="h-8 px-2 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                                +{complaint.engagement_summary?.risk || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetail;
