'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, DollarSign, Clock, Zap } from 'lucide-react';

interface JobCardData {
    id: string;
    title: string;
    company?: { name: string; logo?: string };
    skills: string[];
    salaryMin?: number;
    salaryMax?: number;
    location: string;
    workType: string;
    experienceMin?: number;
    experienceMax?: number;
    matchScore?: number;
}

interface SwipeCardProps {
    job: JobCardData;
    onSwipe: (direction: 'LEFT' | 'RIGHT' | 'SUPER') => void;
    isTop: boolean;
}

export default function SwipeCard({ job, onSwipe, isTop }: SwipeCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
    const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0.5, 1, 1, 1, 0.5]);

    // Overlay gradients
    const rightOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
    const leftOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
    const upOpacity = useTransform(y, [-200, -100, 0], [1, 0.5, 0]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const { offset, velocity } = info;
        const swipeThreshold = 100;
        const velocityThreshold = 500;

        if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
            onSwipe('SUPER');
        } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
            onSwipe('RIGHT');
        } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
            onSwipe('LEFT');
        }
    };

    const formatSalary = (min?: number, max?: number) => {
        if (!min && !max) return 'Not specified';
        const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString();
        if (min && max) return `$${fmt(min)} - $${fmt(max)}`;
        if (min) return `From $${fmt(min)}`;
        return `Up to $${fmt(max!)}`;
    };

    const workTypeBadge: Record<string, string> = {
        REMOTE: 'badge-green',
        HYBRID: 'badge-orange',
        ONSITE: 'badge-blue',
    };

    return (
        <motion.div
            className="swipe-card"
            style={{ x, y, rotate, opacity, zIndex: isTop ? 10 : 1 }}
            drag={isTop}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
            animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
            exit={{
                x: x.get() > 0 ? 500 : x.get() < 0 ? -500 : 0,
                y: y.get() < -50 ? -500 : 0,
                opacity: 0,
                transition: { duration: 0.3 },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Swipe overlays */}
            {isTop && (
                <>
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-500/20 rounded-2xl flex items-center justify-end pr-8 pointer-events-none"
                        style={{ opacity: rightOpacity }}
                    >
                        <span className="text-4xl font-black text-emerald-400 rotate-12">APPLY</span>
                    </motion.div>
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-l from-transparent to-red-500/20 rounded-2xl flex items-center justify-start pl-8 pointer-events-none"
                        style={{ opacity: leftOpacity }}
                    >
                        <span className="text-4xl font-black text-red-400 -rotate-12">SKIP</span>
                    </motion.div>
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-brand-500/20 to-transparent rounded-2xl flex items-start justify-center pt-8 pointer-events-none"
                        style={{ opacity: upOpacity }}
                    >
                        <span className="text-3xl font-black text-brand-400">⭐ SUPER</span>
                    </motion.div>
                </>
            )}

            {/* Card Content */}
            <div className="relative z-10">
                {/* Company Header */}
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                        {job.company?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white truncate">{job.title}</h3>
                        <p className="text-gray-400">{job.company?.name || 'Company'}</p>
                    </div>
                    {job.matchScore !== undefined && (
                        <div className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold ${job.matchScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                job.matchScore >= 50 ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-gray-500/20 text-gray-400'
                            }`}>
                            {job.matchScore}% match
                        </div>
                    )}
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-4 h-4 text-accent-green" />
                        <span className="text-sm font-medium text-accent-green">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{job.experienceMin || 0}-{job.experienceMax || '10+'}y exp</span>
                    </div>
                    <div>
                        <span className={workTypeBadge[job.workType] || 'badge-gray'}>
                            {job.workType}
                        </span>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                    {job.skills?.slice(0, 6).map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                            {skill}
                        </span>
                    ))}
                    {(job.skills?.length || 0) > 6 && (
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-500">
                            +{job.skills!.length - 6} more
                        </span>
                    )}
                </div>

                {/* Swipe hint */}
                {isTop && (
                    <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-600">
                        <span>← Skip</span>
                        <span>↑ Super Like</span>
                        <span>Apply →</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
