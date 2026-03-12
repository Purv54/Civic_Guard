import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const response = await api.get('/auth/me/');
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Failed to fetch user status:', error);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            console.log(`Attempting login for: ${username}`);
            const response = await api.post('/auth/login/', { username, password });

            const userData = response.data.user;
            const token = response.data.token || response.data.access; // Support both Session and JWT

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (token) localStorage.setItem('token', token);

            toast.success(response.data.message || 'Logged in successfully!');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.error ||
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                'Invalid credentials';
            toast.error(message);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            console.log('Attempting registration...');
            const response = await api.post('/auth/register/', userData);

            const newUser = response.data.user;
            const token = response.data.token || response.data.access;

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            if (token) localStorage.setItem('token', token);

            toast.success(response.data.message || 'Registration successful!');
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.email?.[0] ||
                error.response?.data?.username?.[0] ||
                'Registration failed. Please check your details.';
            toast.error(message);
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.warn('Logout request failed, clearing local state anyway.');
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            toast.success('Logged out successfully');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkUserStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

