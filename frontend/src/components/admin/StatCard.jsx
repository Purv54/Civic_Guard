import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const colorMap = {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        emerald: 'bg-emerald-100 text-emerald-600',
        red: 'bg-red-100 text-red-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between"
        >
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900 font-poppins">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-2 font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {trend.value} <span className="text-slate-400 font-normal">than last month</span>
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.primary}`}>
                <Icon size={24} />
            </div>
        </motion.div>
    );
};

export default StatCard;
