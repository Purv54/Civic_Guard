import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, Clock, Users } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -10 }}
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 group"
        >
            <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
            <p className="text-slate-600 leading-relaxed">
                {description}
            </p>
            <div className="mt-6 w-10 h-1 bg-accent/20 rounded-full group-hover:w-full group-hover:bg-accent transition-all duration-500"></div>
        </motion.div>
    );
};

const Features = () => {
    const features = [
        {
            icon: Cpu,
            title: 'AI-Based Categorization',
            description: 'Our advanced NLP models automatically categorize complaints into 50+ departments with 98% accuracy, ensuring they reach the right desk instantly.',
            delay: 0.1
        },
        {
            icon: Activity,
            title: 'Smart Priority Detection',
            description: 'The system detects urgency levels and high-impact issues in real-time, allowing administrators to focus on critical public safety matters first.',
            delay: 0.3
        },
        {
            icon: Clock,
            title: 'Real-Time Tracking',
            description: 'Citizens receive instant updates via SMS/Email at every stage—from AI analysis to department assignment and final resolution.',
            delay: 0.5
        },
        {
            icon: Users,
            title: 'Transparent Governance',
            description: 'Every action is logged and visible. We provide a bridge of trust between citizens and authorities through open data and accountability.',
            delay: 0.7
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-accent uppercase tracking-widest font-bold text-sm mb-4">Core Capabilities</h2>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Revolutionizing Public Service with Intelligence</h2>
                    <p className="text-lg text-slate-500">
                        We use cutting-edge technology to solve age-old governance challenges, making the portal smarter, faster, and more citizen-centric.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
