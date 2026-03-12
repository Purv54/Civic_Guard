import React from 'react';

const StatusBadge = ({ status }) => {
    const configs = {
        pending: {
            label: 'Pending',
            className: 'bg-slate-100 text-slate-600 border-slate-200'
        },
        in_review: {
            label: 'In Review',
            className: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        },
        in_progress: {
            label: 'In Progress',
            className: 'bg-blue-100 text-blue-700 border-blue-200'
        },
        resolved: {
            label: 'Resolved',
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        },
        rejected: {
            label: 'Rejected',
            className: 'bg-red-100 text-red-700 border-red-200'
        },
        closed: {
            label: 'Closed',
            className: 'bg-slate-200 text-slate-700 border-slate-300'
        }
    };

    const config = configs[status?.toLowerCase()] || configs.pending;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
