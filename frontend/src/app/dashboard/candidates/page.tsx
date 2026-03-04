'use client';

import { useState, useEffect } from 'react';
import SwipeStack from '@/components/SwipeStack';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, Loader2 } from 'lucide-react';

const demoCandidates = [
    {
        id: 'c1', title: 'Sarah Chen', company: { name: '5 years exp' },
        skills: ['React', 'TypeScript', 'Python', 'AWS'], location: 'San Francisco',
        workType: 'REMOTE', matchScore: 95, salaryMin: 130000, salaryMax: 160000,
        experienceMin: 5, experienceMax: 5,
    },
    {
        id: 'c2', title: 'Alex Johnson', company: { name: '3 years exp' },
        skills: ['Node.js', 'Go', 'Docker', 'Kubernetes'], location: 'Remote',
        workType: 'REMOTE', matchScore: 88, salaryMin: 110000, salaryMax: 140000,
        experienceMin: 3, experienceMax: 3,
    },
    {
        id: 'c3', title: 'Maria Garcia', company: { name: '7 years exp' },
        skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis'],
        location: 'New York', workType: 'HYBRID', matchScore: 82,
        salaryMin: 150000, salaryMax: 190000, experienceMin: 7, experienceMax: 7,
    },
];

export default function RecruiterCandidatesPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCandidates();
    }, []);

    const loadCandidates = async () => {
        try {
            // In production, load from feed endpoint
            setCandidates(demoCandidates);
        } catch {
            setCandidates(demoCandidates);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (candidateId: string, direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
        try {
            await api.post('/swipes', {
                targetId: candidateId,
                targetType: 'CANDIDATE',
                direction,
            });

            if (direction === 'RIGHT' || direction === 'SUPER') {
                toast.success(direction === 'SUPER' ? '⭐ Super interested!' : '✅ Shortlisted!', { duration: 1500 });
            }
        } catch {
            // Demo mode
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Browse Candidates</h1>
                <p className="text-gray-400 text-sm mt-1">Swipe right to shortlist, left to pass</p>
            </div>

            <SwipeStack
                jobs={candidates}
                onSwipe={handleSwipe}
                onEmpty={loadCandidates}
            />
        </div>
    );
}
