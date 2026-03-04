'use client';

import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Compass, FileText, Brain, TrendingUp, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);

    if (!user) return null;

    const isCandidate = user.role === 'CANDIDATE';

    const stats = isCandidate
        ? [
            { label: 'Jobs Discovered', value: '—', icon: Compass, color: 'from-brand-500 to-brand-700' },
            { label: 'Applications', value: '—', icon: FileText, color: 'from-purple-500 to-purple-700' },
            { label: 'Interviews', value: '—', icon: Brain, color: 'from-accent-teal to-emerald-700' },
            { label: 'Match Score', value: '—', icon: TrendingUp, color: 'from-accent-orange to-orange-700' },
        ]
        : [
            { label: 'Active Jobs', value: '—', icon: Briefcase, color: 'from-brand-500 to-brand-700' },
            { label: 'Candidates', value: '—', icon: Users, color: 'from-purple-500 to-purple-700' },
            { label: 'Shortlisted', value: '—', icon: FileText, color: 'from-accent-teal to-emerald-700' },
            { label: 'Interviews', value: '—', icon: Brain, color: 'from-accent-orange to-orange-700' },
        ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Welcome back, <span className="gradient-text">{user.name}</span>
                </h1>
                <p className="text-gray-400 mt-1">
                    {isCandidate ? 'Discover jobs and track your applications' : 'Manage jobs and find the best candidates'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                    >
                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isCandidate ? (
                        <>
                            <Link href="/dashboard/discover" className="card flex items-center gap-4 hover:border-brand-500/30">
                                <Compass className="w-8 h-8 text-brand-400" />
                                <div>
                                    <p className="font-medium text-white">Discover Jobs</p>
                                    <p className="text-sm text-gray-400">Swipe through new opportunities</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/profile" className="card flex items-center gap-4 hover:border-brand-500/30">
                                <FileText className="w-8 h-8 text-purple-400" />
                                <div>
                                    <p className="font-medium text-white">Update Profile</p>
                                    <p className="text-sm text-gray-400">Upload resume and skills</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/interviews" className="card flex items-center gap-4 hover:border-brand-500/30">
                                <Brain className="w-8 h-8 text-accent-teal" />
                                <div>
                                    <p className="font-medium text-white">AI Interview Prep</p>
                                    <p className="text-sm text-gray-400">Practice with AI interviewer</p>
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard/jobs" className="card flex items-center gap-4 hover:border-brand-500/30">
                                <Briefcase className="w-8 h-8 text-brand-400" />
                                <div>
                                    <p className="font-medium text-white">Post a Job</p>
                                    <p className="text-sm text-gray-400">Create a new job listing</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/candidates" className="card flex items-center gap-4 hover:border-brand-500/30">
                                <Users className="w-8 h-8 text-purple-400" />
                                <div>
                                    <p className="font-medium text-white">Browse Candidates</p>
                                    <p className="text-sm text-gray-400">Swipe through applicants</p>
                                </div>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
