import React from 'react';
import { motion } from 'framer-motion';
import { FileEdit, Cpu, UserCheck, CheckCircle2 } from 'lucide-react';

const Step = ({ icon: Icon, title, description, isLast, delay }) => {
    return (
        <div className="relative flex-1 group">
            {/* Connecting Line */}
            {!isLast && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-slate-200 -z-10 bg-gradient-to-r from-accent/50 to-slate-200">
                    <div className="h-full bg-accent w-0 group-hover:w-full transition-all duration-1000 ease-in-out"></div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
                className="flex flex-col items-center text-center p-4"
            >
                <div className="w-20 h-20 bg-white border-4 border-slate-50 flex items-center justify-center rounded-full text-primary shadow-lg mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 z-10 relative">
                    <Icon size={32} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {delay * 5 + 1}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
                <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">
                    {description}
                </p>
            </motion.div>
        </div>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            icon: FileEdit,
            title: 'Submit Complaint',
            description: 'Easily file your grievance with images and location data via our secure portal.',
            delay: 0
        },
        {
            icon: Cpu,
            title: 'AI Analysis',
            description: 'Our AI engine instantly analyzes, categorizes, and determines the urgency of the issue.',
            delay: 0.2
        },
        {
            icon: UserCheck,
            title: 'Department Assigned',
            description: 'The complaint is intelligently routed to the relevant government official for action.',
            delay: 0.4
        },
        {
            icon: CheckCircle2,
            title: 'Resolved & Tracked',
            description: 'Monitor progress in real-time until the issue is fully resolved and closed.',
            delay: 0.6
        }
    ];

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-1/2 left-0 w-full h-64 bg-primary/5 -skew-y-3 -z-10 translate-y-[-50%]"></div>

            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-20 whitespace-normal">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Seamless Process Flow</h2>
                    <p className="text-lg text-slate-500">
                        From submission to resolution, every step is optimized for efficiency and speed.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-start justify-between space-y-12 lg:space-y-0">
                    {steps.map((step, index) => (
                        <Step
                            key={index}
                            {...step}
                            isLast={index === steps.length - 1}
                            delay={index * 0.2}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
