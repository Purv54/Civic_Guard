import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    const isAdmin = user && (user.is_staff || user.profile?.role === 'admin');

    if (!user || !isAdmin) {
        // Redirect them to the login page, but save the current location they were
        // trying to go to. This allows us to send them back after they login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute;
