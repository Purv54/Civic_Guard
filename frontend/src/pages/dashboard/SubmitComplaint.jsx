import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    Upload,
    X,
    Image as ImageIcon,
    Send,
    Loader2,
    FileText,
    MapPin,
    Tag,
    AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';

const SubmitComplaint = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'other',
        urgency: 'medium',
        location: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        // Step 1: Prevent default
        e.preventDefault();

        console.log("--- SUBMISSION STARTED ---");
        console.log("Form Data State:", formData);
        console.log("Attached image:", image ? image.name : "None");

        const token = localStorage.getItem('token');
        console.log("Current Token:", token ? "Exists (starts with " + token.substring(0, 10) + "...)" : "MISSING");

        if (!formData.title || !formData.description) {
            toast.error("Title and Description are required");
            return;
        }

        setLoading(true);

        // Step 2: Construct FormData
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        if (image) {
            data.append('attachment', image);
        }

        try {
            console.log("Calling API POST /complaints/ ...");
            // Step 3: Axios POST - Remove manual Content-Type to let browser set boundary
            const response = await api.post('/complaints/', data, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                        console.log(`Upload Progress: ${percentCompleted}%`);
                    }
                }
            });

            console.log("Submission successful! Response:", response.data);
            toast.success('Grievance filed successfully!');
            navigate('/dashboard/complaints');
        } catch (error) {
            console.error("SUBMISSION FAILED");
            console.log("Error object:", error);

            if (error.response) {
                console.log("Status Code:", error.response.status);
                console.log("Response Data:", error.response.data);
                console.log("Headers:", error.response.headers);

                const serverMsg = error.response.data.error ||
                    error.response.data.detail ||
                    JSON.stringify(error.response.data);
                toast.error(`Server Error: ${serverMsg}`);
            } else if (error.request) {
                console.log("Request made but no response received:", error.request);
                toast.error("No response from server. Check your connection.");
            } else {
                console.log("Error Message:", error.message);
                toast.error(`Request Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-10 text-center lg:text-left">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lodge New Grievance</h1>
                <p className="text-slate-500 mt-2 text-lg">Provide details below to help us resolve the issue faster.</p>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all hover:shadow-primary/5">
                <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-12">

                    {/* Section 1: Core Details */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4 text-primary">
                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <h3 className="font-black uppercase tracking-[0.2em] text-xs">Essential Information</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">What's the issue? (Title)</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-lg font-medium"
                                    placeholder="e.g. Broken streetlight near Main Park"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Detailed Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="6"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all resize-none text-lg leading-relaxed"
                                    placeholder="Explain the problem in detail, including how long it's been occurring..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Section 2: Classification */}
                        <div className="space-y-8">
                            <div className="flex items-center space-x-4 text-primary">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                                    <Tag size={18} />
                                </div>
                                <h3 className="font-black uppercase tracking-[0.2em] text-xs">Categorisation</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-700 ml-1">Sector</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="infrastructure">Infrastructure</option>
                                        <option value="water_supply">Water Supply</option>
                                        <option value="electricity">Electricity</option>
                                        <option value="sanitation">Sanitation</option>
                                        <option value="roads">Roads & Transport</option>
                                        <option value="public_safety">Public Safety</option>
                                        <option value="environment">Environment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-700 ml-1">Priority</label>
                                    <select
                                        name="urgency"
                                        value={formData.urgency}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="low">Low - Standard</option>
                                        <option value="medium">Medium - Normal</option>
                                        <option value="high">High - Important</option>
                                        <option value="critical">Critical - Immediate</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section 3: Location */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center space-x-4 text-primary">
                                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                                        <MapPin size={18} />
                                    </div>
                                    <h3 className="font-black uppercase tracking-[0.2em] text-xs">Incident Location</h3>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                                        placeholder="Street / Landmark"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                                            placeholder="City"
                                        />
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                                            placeholder="Pincode"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Photo attachment */}
                        <div className="space-y-8">
                            <div className="flex items-center space-x-4 text-primary">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                                    <ImageIcon size={18} />
                                </div>
                                <h3 className="font-black uppercase tracking-[0.2em] text-xs">Visual Evidence</h3>
                            </div>

                            <div className="relative group">
                                {preview ? (
                                    <div className="relative rounded-[2rem] overflow-hidden border-8 border-slate-50 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                                        <img src={preview} alt="Evidence Preview" className="w-full h-80 object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-xl hover:rotate-90"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-80 border-4 border-dashed border-slate-100 rounded-[2rem] bg-slate-50 hover:bg-white hover:border-primary hover:shadow-2xl hover:shadow-primary/5 cursor-pointer transition-all duration-500 group">
                                        <div className="flex flex-col items-center justify-center p-10 text-center">
                                            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-6 shadow-sm">
                                                <Upload size={32} />
                                            </div>
                                            <p className="mb-2 text-xl text-slate-800 font-black tracking-tight">
                                                Upload Evidence
                                            </p>
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                                                JPG, PNG / Max 5MB
                                            </p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>

                            <div className="flex items-start space-x-4 p-6 bg-accent/5 rounded-3xl border border-accent/10">
                                <AlertCircle size={20} className="text-accent shrink-0 mt-0.5" />
                                <p className="text-xs text-accent font-bold leading-relaxed">
                                    AI ANALYSIS ACTIVE: Our system will automatically process your description and image to ensure the highest resolution priority.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Submission */}
                    <div className="pt-12 border-t border-slate-100 flex flex-col items-center space-y-8">
                        {loading && (
                            <div className="w-full max-lg space-y-3">
                                <div className="flex justify-between text-xs font-black text-primary uppercase tracking-[0.2em]">
                                    <span>Transmitting Secure Data...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 relative"
                                        style={{ width: `${uploadProgress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className={`
                                w-full md:w-auto px-16 py-6 text-2xl font-black rounded-3xl flex items-center justify-center space-x-6 
                                transition-all duration-500 transform active:scale-95
                                ${loading ? 'bg-slate-400 opacity-70' : 'bg-primary text-white hover:shadow-2xl hover:shadow-primary/20'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={28} />
                                    <span>Dispatching...</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit Request</span>
                                    <Send size={28} className="transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
                                </>
                            )}
                        </Button>

                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            Official Digital Signature Applied Automatically
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default SubmitComplaint;
