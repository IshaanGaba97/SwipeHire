'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { FileText, Loader2, Building, MapPin } from 'lucide-react';

const statusConfig: Record<string, { label: string; class: string }> = {
    APPLIED: { label: 'Applied', class: 'status-applied' },
    VIEWED: { label: 'Viewed', class: 'status-viewed' },
    SHORTLISTED: { label: 'Shortlisted', class: 'status-shortlisted' },
    INTERVIEW_SCHEDULED: { label: 'Interview', class: 'status-interview_scheduled' },
    REJECTED: { label: 'Rejected', class: 'status-rejected' },
    OFFER_RECEIVED: { label: 'Offer!', class: 'status-offer_received' },
};

const demoApplications = [
    { id: '1', status: 'APPLIED', appliedAt: new Date().toISOString(), job: { title: 'Senior React Developer', location: 'Remote', company: { name: 'TechCorp' } } },
    { id: '2', status: 'SHORTLISTED', appliedAt: new Date().toISOString(), job: { title: 'Full Stack Engineer', location: 'New York', company: { name: 'StartupX' } } },
    { id: '3', status: 'INTERVIEW_SCHEDULED', appliedAt: new Date().toISOString(), job: { title: 'AI/ML Engineer', location: 'San Francisco', company: { name: 'DeepAI Labs' } } },
];

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const { data } = await api.get('/applications');
            setApplications(data.data?.items?.length ? data.data.items : demoApplications);
        } catch {
            setApplications(demoApplications);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'ALL' ? applications : applications.filter((a) => a.status === filter);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Applications</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['ALL', 'APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'OFFER_RECEIVED'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {s === 'ALL' ? 'All' : statusConfig[s]?.label || s}
                    </button>
                ))}
            </div>

            {/* Application list */}
            <div className="space-y-3">
                {filtered.map((app, i) => (
                    <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold">
                                {app.job?.company?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{app.job?.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="flex items-center gap-1"><Building className="w-3 h-3" />{app.job?.company?.name}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job?.location}</span>
                                </div>
                            </div>
                        </div>
                        <span className={statusConfig[app.status]?.class || 'badge-gray'}>
                            {statusConfig[app.status]?.label || app.status}
                        </span>
                    </motion.div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No applications found</p>
                </div>
            )}
        </div>
    );
}
