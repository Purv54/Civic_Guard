import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    BarChart3,
    ShieldCheck,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User,
    ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Manage Complaints', path: '/admin/complaints', icon: MessageSquare },
        { name: 'Engagement Monitoring', path: '/admin/engagement', icon: ShieldAlert },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-primary text-white flex flex-col transition-all duration-300 fixed h-full z-50`}
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <Link to="/admin/dashboard" className="flex items-center space-x-2">
                            <div className="bg-accent p-1.5 rounded-lg">
                                <ShieldCheck className="text-primary h-5 w-5" />
                            </div>
                            <span className="font-poppins font-bold text-xl">Admin Panel</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-accent text-primary font-semibold shadow-lg shadow-accent/20'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} className={isSidebarOpen ? 'mr-3' : ''} />
                            {isSidebarOpen && <span>{item.name}</span>}
                            {!isSidebarOpen && (
                                <div className="absolute left-20 bg-primary text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
                    >
                        <LogOut size={20} className={isSidebarOpen ? 'mr-3' : ''} />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center space-x-4 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search anything..."
                                onKeyDown={(e) => e.key === 'Enter' && toast('Search feature indexing in progress...')}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => toast.success('No new administrative alerts.')}
                            className="relative p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">{user?.first_name || user?.username}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.profile?.role || 'Administrator'}</p>
                            </div>
                            <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
