import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn } from 'lucide-react';
import Button from '../common/Button';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="bg-gradient-to-r from-primary via-primary-dark to-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full -ml-24 -mb-24 blur-xl"></div>
                    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                            Empowering Citizens Through <span className="text-accent underline decoration-accent/30 underline-offset-8">Intelligent Governance</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10">
                            Join thousands of citizens who are shaping the future of their cities. Fast analysis, transparent tracking, and guaranteed accountability.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <Button
                                variant="accent"
                                className="flex items-center justify-center space-x-2 px-10 py-5 text-xl font-bold rounded-2xl group shadow-[0_20px_50px_rgba(46,204,113,0.3)]"
                                onClick={() => navigate('/register')}
                            >
                                <span>Register Now</span>
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Button>
                            <button className="flex items-center justify-center space-x-2 px-10 py-5 text-xl font-bold text-white border-2 border-white/20 rounded-2xl hover:bg-white/10 transition-colors">
                                <LogIn size={22} />
                                <span>Officer Portal</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
