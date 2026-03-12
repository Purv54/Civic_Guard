import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Globe, ShieldCheck, Loader2, Camera, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.profile?.phone || '',
                address: user.profile?.address || '',
                city: user.profile?.city || '',
                state: user.profile?.state || '',
                pincode: user.profile?.pincode || '',
            });
            setPreview(user.profile?.avatar);
            setLoading(false);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        if (avatar) {
            data.append('avatar', avatar);
        }

        try {
            const response = await api.patch('/auth/me/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update local user context if possible
            // For now, toast and reload or assume auth context might need a refresh
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Profile update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-slate-900 font-poppins">Citizen Identity</h1>
                <p className="text-slate-500">Manage your profile and governance credentials.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
                    {/* Header: Avatar */}
                    <div className="p-8 bg-slate-50/50 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-slate-200">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User size={60} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-2xl shadow-lg cursor-pointer hover:bg-slate-800 transition-all">
                                <Camera size={18} />
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                        <div className="mt-4 text-center">
                            <h2 className="text-xl font-bold text-slate-800">{formData.first_name} {formData.last_name}</h2>
                            <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mt-1 border border-indigo-100 uppercase tracking-tighter">
                                <ShieldCheck size={12} className="mr-1" />
                                Verified Citizen
                            </span>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="p-8 space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">First Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                        <Phone size={18} />
                                    </span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="p-8 space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Residential Details</h3>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Street Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                    <MapPin size={18} />
                                </span>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">City</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                        <Building size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">State</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                        <Globe size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer: Actions */}
                    <div className="p-8 bg-slate-50/30 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-slate-800 transition-all flex items-center space-x-2 disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>Save Identity Updates</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
