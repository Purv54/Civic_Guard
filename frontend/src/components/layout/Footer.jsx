import { Shield, Twitter, Linkedin, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-20 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <div className="bg-accent p-2 rounded-lg">
                                <Shield className="text-white h-6 w-6" />
                            </div>
                            <span className="text-2xl font-poppins font-bold text-white">
                                Civic<span className="text-accent">Guard</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            AI-Powered grievance management portal. Enhancing public services through transparency and intelligent automation.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
                            <li><a href="#how-it-works" className="hover:text-accent transition-colors">How It Works</a></li>
                            <li><Link to="/dashboard/complaints" className="hover:text-accent transition-colors">Track Complaint</Link></li>
                            <li><Link to="/dashboard/submit" className="hover:text-accent transition-colors">Lodge Complaint</Link></li>
                            <li><Link to="/dashboard" className="hover:text-accent transition-colors">User Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Contact Support</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Accessibility</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center space-x-3">
                                <Mail size={16} className="text-accent" />
                                <span>support@civicguard.gov.in</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={16} className="text-accent" />
                                <span>1800-123-4567 (Toll Free)</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <MapPin size={16} className="text-accent" />
                                <span>Digital India Bhawan, New Delhi</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
                    <p>© 2026 CivicGuard. An Initiative for Smart Governance.</p>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-10 grayscale brightness-200" />
                            <span className="font-bold">GOVERNMENT OF INDIA</span>
                        </div>
                        <a href="#" className="hover:text-white">Security Documentation</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
