import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const UrgencyBadge = ({ urgency }) => {
    const configs = {
        critical: {
            label: 'Critical',
            className: 'bg-red-100 text-red-700 border-red-200',
            icon: <ShieldAlert size={14} className="mr-1" />
        },
        high: {
            label: 'High',
            className: 'bg-orange-100 text-orange-700 border-orange-200',
            icon: <AlertCircle size={14} className="mr-1" />
        },
        medium: {
            label: 'Medium',
            className: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: <AlertTriangle size={14} className="mr-1" />
        },
        low: {
            label: 'Low',
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            icon: <Info size={14} className="mr-1" />
        }
    };

    const config = configs[urgency?.toLowerCase()] || configs.low;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

export default UrgencyBadge;
