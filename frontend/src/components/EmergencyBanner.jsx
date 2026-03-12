import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import civicApi from '../services/civicApi';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyBanner = () => {
    const [emergency, setEmergency] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const checkEmergency = async () => {
            try {
                const response = await civicApi.getEmergencyStatus();
                if (response.data.emergency_mode) {
                    setEmergency(response.data);
                }
            } catch (error) {
                console.error('Failed to check emergency status');
            }
        };
        checkEmergency();
        // Poll every 5 minutes
        const interval = setInterval(checkEmergency, 300000);
        return () => clearInterval(interval);
    }, []);

    if (!emergency || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-600 text-white relative z-[60]"
            >
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="animate-pulse bg-white/20 p-1.5 rounded-lg">
                            <ShieldAlert size={20} />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                            <span className="font-black uppercase tracking-tighter text-sm italic">Emergency Alert:</span>
                            <span className="text-sm font-medium opacity-90">{emergency.emergency_message || "A system-wide emergency has been declared. Please check the heatmap for high-risk zones."}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="hover:bg-white/20 p-1 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmergencyBanner;
