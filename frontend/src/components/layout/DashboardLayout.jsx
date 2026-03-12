import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Shield,
    LayoutDashboard,
    PlusCircle,
    ListTodo,
    LogOut,
    User as UserIcon,
    Bell
} from 'lucide-react';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'My Complaints', icon: ListTodo, href: '/dashboard/complaints' },
        { name: 'New Complaint', icon: PlusCircle, href: '/dashboard/submit' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden pt-20">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-primary text-white">
                <div className="p-8">
                    <NavLink to="/" className="flex items-center space-x-2">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Shield className="text-accent h-6 w-6" />
                        </div>
                        <span className="text-2xl font-poppins font-bold text-white">
                            Civic<span className="text-accent">Guard</span>
                        </span>
                    </NavLink>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-8">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            end={item.href === '/dashboard'}
                            className={({ isActive }) => `
                flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300
                ${isActive ? 'bg-accent text-primary font-bold shadow-lg shadow-accent/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}
              `}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors w-full px-6 py-4"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">
                        {/* Dynamic title based on route could be added here */}
                        Grievance Portal
                    </h2>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center space-x-4 pl-6 border-l border-slate-100">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-slate-800">{user?.first_name} {user?.last_name}</div>
                                <div className="text-xs text-slate-500 capitalize">{user?.profile?.role || 'Citizen'}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
