'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Bell, Check, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.data?.items || []);
        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((n) => n.map((notif) => notif.id === id ? { ...notif, read: true } : notif));
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications((n) => n.map((notif) => ({ ...notif, read: true })));
        } catch { }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                {notifications.some((n) => !n.read) && (
                    <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {notifications.map((notif, i) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => !notif.read && markRead(notif.id)}
                        className={`card cursor-pointer flex items-start gap-4 ${!notif.read ? 'border-brand-500/20' : 'opacity-60'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-brand-500/20' : 'bg-white/5'
                            }`}>
                            <Bell className={`w-5 h-5 ${!notif.read ? 'text-brand-400' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-gray-400'}`}>{notif.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{notif.content}</p>
                            <p className="text-xs text-gray-600 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-2" />}
                    </motion.div>
                ))}
            </div>

            {notifications.length === 0 && (
                <div className="text-center py-16">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No notifications</p>
                </div>
            )}
        </div>
    );
}
