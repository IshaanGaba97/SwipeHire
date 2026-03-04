'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { User, Upload, Save, Loader2, Plus, X } from 'lucide-react';

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>({
        headline: '',
        summary: '',
        skills: [],
        portfolioUrl: '',
        githubUrl: '',
        linkedinUrl: '',
        locationPreference: '',
        salaryExpectation: '',
    });
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data } = await api.get('/candidates/profile');
            if (data.data) setProfile(data.data);
        } catch {
            // Use defaults
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/candidates/profile', profile);
            toast.success('Profile updated!');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const { data } = await api.post('/candidates/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile((p: any) => ({ ...p, resumeUrl: data.data.resumeUrl }));
            toast.success('Resume uploaded!');
        } catch {
            toast.error('Upload failed');
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile((p: any) => ({ ...p, skills: [...p.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setProfile((p: any) => ({ ...p, skills: p.skills.filter((s: string) => s !== skill) }));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">Profile</h1>

            {/* Avatar & Name */}
            <div className="card flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
            </div>

            {/* Resume Upload */}
            <div className="card">
                <h3 className="font-semibold text-white mb-3">Resume</h3>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                        {profile.resumeUrl ? 'Resume uploaded ✓ Click to replace' : 'Upload your resume (PDF, DOC)'}
                    </span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
            </div>

            {/* Details */}
            <div className="card space-y-4">
                <h3 className="font-semibold text-white">Professional Details</h3>

                <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Headline</label>
                    <input value={profile.headline || ''} onChange={(e) => setProfile((p: any) => ({ ...p, headline: e.target.value }))}
                        className="input-field" placeholder="e.g. Senior Full Stack Developer" />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Summary</label>
                    <textarea value={profile.summary || ''} onChange={(e) => setProfile((p: any) => ({ ...p, summary: e.target.value }))}
                        className="input-field min-h-[100px] resize-none" placeholder="Brief summary of your experience..." />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {profile.skills?.map((skill: string) => (
                            <span key={skill} className="badge-blue flex items-center gap-1">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            className="input-field flex-1" placeholder="Add a skill..." />
                        <button onClick={addSkill} className="btn-secondary px-4"><Plus className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="card space-y-4">
                <h3 className="font-semibold text-white">Links</h3>
                {[
                    { key: 'portfolioUrl', label: 'Portfolio URL', ph: 'https://myportfolio.com' },
                    { key: 'githubUrl', label: 'GitHub URL', ph: 'https://github.com/username' },
                    { key: 'linkedinUrl', label: 'LinkedIn URL', ph: 'https://linkedin.com/in/username' },
                ].map((f) => (
                    <div key={f.key}>
                        <label className="text-sm text-gray-400 mb-1.5 block">{f.label}</label>
                        <input value={(profile as any)[f.key] || ''} onChange={(e) => setProfile((p: any) => ({ ...p, [f.key]: e.target.value }))}
                            className="input-field" placeholder={f.ph} />
                    </div>
                ))}
            </div>

            {/* Preferences */}
            <div className="card space-y-4">
                <h3 className="font-semibold text-white">Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Location Preference</label>
                        <input value={profile.locationPreference || ''} onChange={(e) => setProfile((p: any) => ({ ...p, locationPreference: e.target.value }))}
                            className="input-field" placeholder="e.g. Remote, NYC" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Expected Salary ($)</label>
                        <input type="number" value={profile.salaryExpectation || ''} onChange={(e) => setProfile((p: any) => ({ ...p, salaryExpectation: Number(e.target.value) }))}
                            className="input-field" placeholder="e.g. 120000" />
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile</>}
            </button>
        </div>
    );
}
