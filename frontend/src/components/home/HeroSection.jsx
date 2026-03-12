import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-50">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <div className="inline-flex items-center space-x-2 bg-accent/10 py-2 px-4 rounded-full text-accent font-semibold text-sm mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span>AI-Driven Governance System</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                        AI-Powered <span className="text-accent">Smart Complaint</span> Management
                    </h1>

                    <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                        Experience the future of citizen-government interaction. Transparent, efficient, and intelligent grievance redressal for a modern society.
                    </p>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <Button
                            variant="accent"
                            className="flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                            onClick={() => navigate('/register')}
                        >
                            <span>Register Complaint</span>
                            <ArrowRight size={20} />
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                            onClick={() => navigate('/dashboard/complaints')}
                        >
                            <Search size={20} />
                            <span>Track Complaint</span>
                        </Button>
                    </div>

                    <div className="mt-10 flex items-center space-x-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Joined by <span className="text-primary font-bold">10,000+</span> citizens this month
                        </p>
                    </div>
                </motion.div>

                {/* Right Content - Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="relative"
                >
                    <div className="animate-float">
                        <div className="glass-card p-1 relative z-10 overflow-hidden border-2 border-primary/10">
                            <div className="bg-primary pt-2 px-4 pb-0 flex items-center space-x-2 rounded-t-xl">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="ml-4 flex-1 bg-white/10 rounded-t-lg h-8 flex items-center px-4 text-[10px] text-white/50">
                                    civicguard.gov.in/portal/dashboard
                                </div>
                            </div>
                            <div className="bg-white p-4 h-full">
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="h-20 bg-primary/5 rounded-lg border border-primary/10 flex flex-col justify-center items-center">
                                        <div className="text-primary font-bold text-xl">124</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">Pending</div>
                                    </div>
                                    <div className="h-20 bg-accent/5 rounded-lg border border-accent/10 flex flex-col justify-center items-center">
                                        <div className="text-accent font-bold text-xl">3.2k</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">Resolved</div>
                                    </div>
                                    <div className="h-20 bg-urgency/5 rounded-lg border border-urgency/10 flex flex-col justify-center items-center">
                                        <div className="text-urgency font-bold text-xl">14</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">Urgent</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-50 rounded w-full"></div>
                                    <div className="h-32 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div className="text-xs font-semibold text-primary">AI Analysis in Progress...</div>
                                        <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent animate-[slideRight_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Element 1 */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-10 -right-10 glass-card p-4 shadow-2xl z-20 border border-primary/20"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800">Department Assigned</div>
                                <div className="text-[10px] text-slate-500">Public Health - 2m ago</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
