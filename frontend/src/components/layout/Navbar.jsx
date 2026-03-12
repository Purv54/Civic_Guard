import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, PlusCircle, LayoutDashboard, UserCircle } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import EmergencyBanner from '../EmergencyBanner';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Civic Feed', href: '/feed' },
        { name: 'Impact Map', href: '/heatmap' },
        { name: 'Route Safety', href: '/route-risk' },
    ];

    return (
        <header className="sticky top-0 w-full z-50 bg-slate-50 border-b border-slate-200 shadow-sm transition-all duration-300">
            <EmergencyBanner />
            <nav
                className={`w-full transition-all duration-300 bg-white/90 backdrop-blur-md ${isScrolled || location.pathname !== '/'
                    ? 'py-3'
                    : 'py-4'
                    }`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 cursor-pointer">
                        <div className="bg-primary p-2 rounded-lg">
                            <Shield className="text-accent h-6 w-6" />
                        </div>
                        <span className="text-2xl font-poppins font-bold text-primary">
                            Civic<span className="text-accent">Guard</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`font-medium transition-colors relative group ${location.pathname === link.href ? 'text-accent' : 'text-primary hover:text-accent'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300 ${location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}></span>
                            </Link>
                        ))}

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <NotificationBell />
                                {(user.is_staff || user.profile?.role === 'admin') && (
                                    <Button
                                        variant="accent"
                                        className="flex items-center space-x-2 border-2 border-accent hover:bg-accent hover:text-primary transition-all"
                                        onClick={() => navigate('/admin/dashboard')}
                                    >
                                        <Shield size={18} />
                                        <span>Admin Panel</span>
                                    </Button>
                                )}
                                <Button
                                    variant="primary"
                                    className="flex items-center space-x-2"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Button>
                                {/* Profile avatar button */}
                                <button
                                    onClick={() => navigate('/profile')}
                                    title="My Profile"
                                    className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 hover:border-accent hover:bg-accent/10 flex items-center justify-center text-primary font-bold text-sm transition-all"
                                >
                                    {user.first_name
                                        ? user.first_name.charAt(0).toUpperCase()
                                        : user.username?.charAt(0).toUpperCase()}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-primary font-bold hover:text-accent transition-colors">
                                    Sign In
                                </Link>
                                <Button
                                    variant="accent"
                                    className="flex items-center space-x-2"
                                    onClick={() => navigate('/register')}
                                >
                                    <PlusCircle size={18} />
                                    <span>Get Started</span>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-primary focus:outline-none"
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
                        >
                            <div className="flex flex-col p-6 space-y-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`text-lg font-medium transition-colors ${location.pathname === link.href ? 'text-accent' : 'text-primary hover:text-accent'
                                            }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {user ? (
                                    <div className="space-y-3">
                                        {(user.is_staff || user.profile?.role === 'admin') && (
                                            <Button
                                                variant="accent"
                                                className="w-full justify-center"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    navigate('/admin/dashboard');
                                                }}
                                            >
                                                <Shield size={18} className="mr-2" />
                                                Admin Panel
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            className="w-full justify-center"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                navigate('/dashboard');
                                            }}
                                        >
                                            Go to Dashboard
                                        </Button>
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                navigate('/profile');
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-primary font-bold rounded-xl border border-slate-200 hover:bg-primary/5 transition-all"
                                        >
                                            <UserCircle size={18} />
                                            My Profile
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="w-full py-4 bg-slate-50 text-center rounded-xl font-bold text-primary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Button
                                            variant="accent"
                                            className="w-full justify-center"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                navigate('/register');
                                            }}
                                        >
                                            Register Complaint
                                        </Button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Navbar;
