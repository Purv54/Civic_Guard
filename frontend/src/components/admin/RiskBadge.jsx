import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

const RiskBadge = ({ score }) => {
    let config = {
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        label: 'Low Risk',
        icon: <ShieldCheck size={12} className="mr-1" />
    };

    if (score > 70) {
        config = {
            color: 'text-red-600 bg-red-50 border-red-100',
            label: 'High Risk',
            icon: <ShieldAlert size={12} className="mr-1" />
        };
    } else if (score > 40) {
        config = {
            color: 'text-amber-600 bg-amber-50 border-amber-100',
            label: 'Medium Risk',
            icon: <AlertTriangle size={12} className="mr-1" />
        };
    }

    return (
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.color} uppercase tracking-tight`}>
            {config.icon}
            {config.label} ({score})
        </div>
    );
};

export default RiskBadge;
