'use client';

import { useState, useEffect } from 'react';
import SwipeStack from '@/components/SwipeStack';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Filter } from 'lucide-react';

// Demo jobs for when API is not connected
const demoJobs = [
    {
        id: '1', title: 'Senior React Developer', company: { name: 'TechCorp', logo: '' },
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
        salaryMin: 120000, salaryMax: 180000, location: 'San Francisco, CA', workType: 'REMOTE',
        experienceMin: 3, experienceMax: 7, matchScore: 92,
    },
    {
        id: '2', title: 'Full Stack Engineer', company: { name: 'StartupX', logo: '' },
        skills: ['Next.js', 'Python', 'PostgreSQL', 'Docker', 'Redis'],
        salaryMin: 100000, salaryMax: 150000, location: 'New York, NY', workType: 'HYBRID',
        experienceMin: 2, experienceMax: 5, matchScore: 87,
    },
    {
        id: '3', title: 'AI/ML Engineer', company: { name: 'DeepAI Labs', logo: '' },
        skills: ['Python', 'PyTorch', 'LLMs', 'MLOps', 'Kubernetes'],
        salaryMin: 150000, salaryMax: 220000, location: 'Remote', workType: 'REMOTE',
        experienceMin: 3, experienceMax: 8, matchScore: 78,
    },
    {
        id: '4', title: 'Product Designer', company: { name: 'DesignCo', logo: '' },
        skills: ['Figma', 'UI/UX', 'Prototyping', 'Design Systems', 'User Research'],
        salaryMin: 90000, salaryMax: 140000, location: 'Austin, TX', workType: 'ONSITE',
        experienceMin: 2, experienceMax: 6, matchScore: 65,
    },
    {
        id: '5', title: 'DevOps Engineer', company: { name: 'CloudScale', logo: '' },
        skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Python'],
        salaryMin: 130000, salaryMax: 190000, location: 'Seattle, WA', workType: 'REMOTE',
        experienceMin: 4, experienceMax: 8, matchScore: 71,
    },
];

export default function DiscoverPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const { data } = await api.get('/jobs/feed');
            setJobs(data.data?.length ? data.data : demoJobs);
        } catch {
            // Use demo data when API is not available
            setJobs(demoJobs);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (jobId: string, direction: 'LEFT' | 'RIGHT' | 'SUPER') => {
        try {
            await api.post('/swipes', {
                targetId: jobId,
                targetType: 'JOB',
                direction,
            });

            if (direction === 'RIGHT' || direction === 'SUPER') {
                toast.success(direction === 'SUPER' ? '⭐ Super applied!' : '✅ Applied!', {
                    duration: 1500,
                });
            }
        } catch {
            // Silently fail for demo mode
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Discover Jobs</h1>
                    <p className="text-gray-400 text-sm mt-1">Swipe right to apply, left to skip</p>
                </div>
                <button className="btn-ghost flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            <SwipeStack
                jobs={jobs}
                onSwipe={handleSwipe}
                onEmpty={loadJobs}
            />
        </div>
    );
}
