import React, { useState, useEffect, useRef } from 'react';
import {
    User, Mail, Phone, MapPin, Building, Globe,
    ShieldCheck, Loader2, Camera, Save, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { refreshUser } = useAuth();

    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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

    const [avatarFile, setAvatarFile] = useState(null);   // pending upload
    const [previewUrl, setPreviewUrl] = useState(null);   // image preview src
    const fileInputRef = useRef(null);

    // ── Fetch fresh profile from the database on mount ──────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me/');
                const u = res.data;
                setFormData({
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    email: u.email || '',
                    phone: u.profile?.phone || '',
                    address: u.profile?.address || '',
                    city: u.profile?.city || '',
                    state: u.profile?.state || '',
                    pincode: u.profile?.pincode || '',
                });
                // Build absolute avatar URL if present
                if (u.profile?.avatar) {
                    setPreviewUrl(
                        u.profile.avatar.startsWith('http')
                            ? u.profile.avatar
                            : `http://127.0.0.1:8000${u.profile.avatar}`
                    );
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                toast.error('Could not load profile data. Please try again.');
            } finally {
                setPageLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ── Form field change handler ────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    // ── Avatar file picker ───────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5 MB.');
            return;
        }
        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setSaved(false);
    };

    // ── Submit handler ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!formData.first_name.trim()) {
            toast.error('First name cannot be empty.');
            return;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setSaving(true);
        setSaved(false);

        // Use FormData so avatar file is sent as multipart/form-data
        const payload = new FormData();
        Object.entries(formData).forEach(([key, val]) => payload.append(key, val));
        if (avatarFile) payload.append('avatar', avatarFile);

        try {
            const res = await api.patch('/auth/me/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Sync the global AuthContext user state so Navbar / other
            // components reflect the new name / avatar immediately.
            await refreshUser();

            // Update avatar preview from server response (absolute URL)
            const serverProfile = res.data?.user?.profile;
            if (serverProfile?.avatar) {
                setPreviewUrl(
                    serverProfile.avatar.startsWith('http')
                        ? serverProfile.avatar
                        : `http://127.0.0.1:8000${serverProfile.avatar}`
                );
            }
            setAvatarFile(null);  // clear pending file
            setSaved(true);
            toast.success(res.data?.message || 'Profile updated successfully!');
        } catch (err) {
            console.error('Profile update error:', err);
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                // Show first field-level error from backend
                const firstError = Object.values(data)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                toast.error('Failed to save profile. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    // ── Loading state ────────────────────────────────────────────────────────
    if (pageLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-slate-500 text-sm font-medium">Loading your profile…</p>
            </div>
        );
    }

    // ── Shared input class ───────────────────────────────────────────────────
    const inputCls =
        'w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl ' +
        'outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary ' +
        'transition-all text-slate-800 font-medium text-sm placeholder:text-slate-400';

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">

            {/* ── Page heading ────────────────────────────────────────────── */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Edit your personal information. All changes are saved to the database.
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <form onSubmit={handleSubmit} noValidate className="divide-y divide-slate-100">

                    {/* ── Avatar section ──────────────────────────────────── */}
                    <div className="p-8 bg-slate-50/50 flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Profile photo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <User size={60} />
                                    </div>
                                )}
                            </div>
                            {/* Camera button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-primary hover:bg-slate-800 text-white p-2.5 rounded-2xl shadow-lg transition-all cursor-pointer"
                                title="Change profile photo"
                            >
                                <Camera size={18} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {formData.first_name || formData.last_name
                                    ? `${formData.first_name} ${formData.last_name}`.trim()
                                    : 'Your Name'}
                            </h2>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mt-1 border border-indigo-100 uppercase tracking-tighter">
                                <ShieldCheck size={12} />
                                Verified Citizen
                            </span>
                        </div>
                        {avatarFile && (
                            <p className="text-xs text-indigo-500 font-semibold">
                                📷 New photo ready — click "Save Changes" to upload
                            </p>
                        )}
                    </div>

                    {/* ── Personal Information ────────────────────────────── */}
                    <div className="p-8 space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    First Name <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <User size={17} />
                                    </span>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Rahul"
                                        required
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <User size={17} />
                                    </span>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Sharma"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    Email Address <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <Mail size={17} />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <Phone size={17} />
                                    </span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Residential Details ─────────────────────────────── */}
                    <div className="p-8 space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Residential Details
                        </h3>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Street Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                    <MapPin size={17} />
                                </span>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. 12, MG Road, Near Bus Stand"
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* City */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">City</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <Building size={17} />
                                    </span>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Surat"
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* State */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">State</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <Globe size={17} />
                                    </span>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="e.g. Gujarat"
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Pincode */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="e.g. 395001"
                                    maxLength={10}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium text-sm placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Save button ─────────────────────────────────────── */}
                    <div className="p-8 bg-slate-50/30 flex items-center justify-between">
                        {/* Success indicator */}
                        {saved && (
                            <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                                <CheckCircle2 size={16} />
                                Saved to database!
                            </span>
                        )}
                        {!saved && <span />}

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-slate-800 disabled:opacity-60 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        >
                            {saving
                                ? <><Loader2 className="animate-spin" size={20} /> Saving…</>
                                : <><Save size={20} /> Save Changes</>
                            }
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Profile;
