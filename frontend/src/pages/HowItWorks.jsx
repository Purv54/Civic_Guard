import React from 'react';
import HowItWorksSection from '../components/home/HowItWorks';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Server, Users, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
    return (
        <div className="bg-white">
            {/* Header */}
            <div className="pt-32 pb-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                            Empowering Citizens Through <span className="text-primary">Transparency</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            CivicGuard uses advanced AI and real-time data to bridge the gap between citizens and government. Here's exactly how we transform your grievances into solutions.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Steps Section */}
            <HowItWorksSection />

            {/* Detailed Breakdown */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Shield size={14} />
                            <span>Military Grade Security</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">
                            Smart Analysis & <br />Intelligent Routing
                        </h2>
                        <div className="space-y-8">
                            {[
                                {
                                    icon: Smartphone,
                                    title: "Mobile-First Reporting",
                                    desc: "Snap a photo, tag the location, and describe the issue in seconds. Our system works on any device."
                                },
                                {
                                    icon: Server,
                                    title: "AI Classification",
                                    desc: "Our neural network identifies the category and assesses urgency (Low to Critical) in less than 2 seconds."
                                },
                                {
                                    icon: Users,
                                    title: "Collaborative Verification",
                                    desc: "Other citizens can verify the 'Risk' or 'Still Active' status, giving officials real-world weight for every report."
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start space-x-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl text-primary">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-primary rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                            <div className="text-center text-white p-12">
                                <h3 className="text-3xl font-black mb-6 italic">"Our goal is a 48-hour resolution average for all critical infrastructure issues."</h3>
                                <div className="text-accent font-bold uppercase tracking-widest text-xs">- CivicGuard Engineering Team</div>
                            </div>
                            {/* Decorative floaters */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;
