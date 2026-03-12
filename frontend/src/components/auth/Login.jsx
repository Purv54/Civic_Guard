import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import Button from '../common/Button';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            const isAdmin = user.is_staff || user.profile?.role === 'admin';
            if (isAdmin) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/feed', { replace: true });
            }
        }
    }, [user, navigate]);

    const from = location.state?.from?.pathname || '/feed';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(username, password);
        setLoading(false);
        if (success) {
            // Re-fetch user from localStorage to get the latest role info
            const userData = JSON.parse(localStorage.getItem('user'));
            const isAdmin = userData?.is_staff || userData?.profile?.role === 'admin';

            if (isAdmin) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="max-w-md w-full">
                {/* Brand */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="bg-primary p-2 rounded-lg">
                            <Shield className="text-accent h-6 w-6" />
                        </div>
                        <span className="text-2xl font-poppins font-bold text-primary">
                            Civic<span className="text-accent">Guard</span>
                        </span>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-slate-900">Welcome Back</h2>
                    <p className="text-slate-500 mt-2">Sign in to manage your complaints</p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm font-semibold text-primary hover:text-accent">
                                Forgot password?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-4 text-lg font-bold rounded-xl flex items-center justify-center space-x-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-primary hover:text-accent">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
