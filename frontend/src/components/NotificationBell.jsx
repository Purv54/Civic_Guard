import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationApi from '../services/notificationApi';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationApi.getNotifications();
            // Handle both paginated and non-paginated responses
            const data = Array.isArray(response.data) ? response.data : response.data.results;
            setNotifications(data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;

    const handleMarkAsRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'escalation': return <ShieldAlert className="text-red-500" size={16} />;
            case 'status_update': return <Check className="text-emerald-500" size={16} />;
            case 'trend_alert': return <AlertTriangle className="text-orange-500" size={16} />;
            default: return <MessageSquare className="text-blue-500" size={16} />;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.related_complaint_id) {
            // Check if admin or user
            const currentPath = window.location.pathname;
            const targetPath = currentPath.startsWith('/admin')
                ? `/admin/complaints/${notification.related_complaint_id}`
                : `/complaints/${notification.related_complaint_id}`;
            navigate(targetPath);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                        >
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm italic">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                                {(!notifications || notifications.length === 0) ? (
                                    <div className="p-10 text-center">
                                        <Bell className="mx-auto text-slate-200 mb-2" size={32} />
                                        <p className="text-xs text-slate-400">All caught up!</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.is_read ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex space-x-3">
                                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!n.is_read ? 'bg-white shadow-sm' : 'bg-slate-100'
                                                    }`}>
                                                    {getTypeIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!n.is_read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                        {n.message}
                                                    </p>
                                                    <div className="flex items-center mt-2 text-[10px] text-slate-400">
                                                        <Clock size={10} className="mr-1" />
                                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                {!n.is_read && (
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 bg-slate-50/50 text-center border-t border-slate-50">
                                    <button className="text-[10px] font-bold text-primary hover:text-accent uppercase tracking-widest">
                                        View All Alerts
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
