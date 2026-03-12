import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, suffix = '', duration = 2 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Use springs for smooth number animation
    const springValue = useSpring(0, {
        stiffness: 40,
        damping: 20,
        restDelta: 0.001
    });

    const displayValue = useTransform(springValue, (latest) =>
        Math.floor(latest).toLocaleString()
    );

    useEffect(() => {
        if (isInView) {
            springValue.set(value);
        }
    }, [isInView, value, springValue]);

    return (
        <span ref={ref}>
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    );
};

const StatsSection = () => {
    const stats = [
        { label: 'Complaints Resolved', value: 10000, suffix: '+' },
        { label: 'Satisfaction Rate', value: 98, suffix: '%' },
        { label: 'Avg Response Time', value: 24, suffix: 'hr' },
        { label: 'Departments Integrated', value: 50, suffix: '+' },
    ];

    return (
        <section className="py-20 bg-primary relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-4 gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center group">
                            <div className="text-5xl md:text-6xl font-bold text-white mb-4 flex justify-center items-baseline group-hover:scale-110 transition-transform duration-500">
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-accent-light uppercase tracking-widest font-semibold text-sm">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
