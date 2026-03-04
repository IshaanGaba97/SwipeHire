'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import { X, Heart, Star, RotateCcw } from 'lucide-react';

interface Job {
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

interface SwipeStackProps {
    jobs: Job[];
    onSwipe: (jobId: string, direction: 'LEFT' | 'RIGHT' | 'SUPER') => void;
    onEmpty?: () => void;
}

export default function SwipeStack({ jobs, onSwipe, onEmpty }: SwipeStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

    const activeJobs = jobs.filter((j) => !swipedIds.has(j.id));

    const handleSwipe = useCallback((direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
        const job = activeJobs[0];
        if (!job) return;

        setSwipedIds((prev) => new Set([...Array.from(prev), job.id]));
        setCurrentIndex((prev) => prev + 1);
        onSwipe(job.id, direction);

        if (activeJobs.length <= 1) {
            onEmpty?.();
        }
    }, [activeJobs, onSwipe, onEmpty]);

    const handleButtonSwipe = (direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
        handleSwipe(direction);
    };

    if (activeJobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No more cards</h3>
                <p className="text-gray-400">Check back later for new opportunities!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* Card stack */}
            <div className="relative w-full max-w-md h-[480px]">
                <AnimatePresence>
                    {activeJobs.slice(0, 3).map((job, index) => (
                        <SwipeCard
                            key={job.id}
                            job={job}
                            isTop={index === 0}
                            onSwipe={handleSwipe}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 mt-8">
                <button
                    onClick={() => handleButtonSwipe('LEFT')}
                    className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center
                     hover:bg-red-500/20 hover:scale-110 transition-all duration-200 active:scale-95"
                >
                    <X className="w-6 h-6 text-red-400" />
                </button>

                <button
                    onClick={() => handleButtonSwipe('SUPER')}
                    className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center
                     hover:bg-brand-500/20 hover:scale-110 transition-all duration-200 active:scale-95"
                >
                    <Star className="w-7 h-7 text-brand-400" />
                </button>

                <button
                    onClick={() => handleButtonSwipe('RIGHT')}
                    className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center
                     hover:bg-emerald-500/20 hover:scale-110 transition-all duration-200 active:scale-95"
                >
                    <Heart className="w-6 h-6 text-emerald-400" />
                </button>
            </div>
        </div>
    );
}
