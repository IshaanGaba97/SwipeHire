'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Briefcase, MapPin, DollarSign, Loader2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function RecruiterJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', skills: '',
        salaryMin: '', salaryMax: '', location: '', workType: 'REMOTE',
        experienceMin: '', experienceMax: '',
    });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data.data?.items || []);
        } catch {
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/jobs', {
                ...form,
                skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
                salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
                salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
                experienceMin: form.experienceMin ? Number(form.experienceMin) : undefined,
                experienceMax: form.experienceMax ? Number(form.experienceMax) : undefined,
            });
            toast.success('Job posted!');
            setShowForm(false);
            setForm({ title: '', description: '', skills: '', salaryMin: '', salaryMax: '', location: '', workType: 'REMOTE', experienceMin: '', experienceMax: '' });
            loadJobs();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to post job');
        }
    };

    const toggleActive = async (jobId: string, active: boolean) => {
        try {
            await api.put(`/jobs/${jobId}`, { active: !active });
            loadJobs();
        } catch {
            toast.error('Failed to update');
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Delete this job listing?')) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            toast.success('Job deleted');
            loadJobs();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">My Jobs</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Post Job
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreate}
                    className="card space-y-4"
                >
                    <h2 className="font-semibold text-white text-lg">New Job Listing</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-400 mb-1.5 block">Job Title</label>
                            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                className="input-field" placeholder="e.g. Senior React Developer" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                className="input-field min-h-[120px] resize-none" placeholder="Job description..." required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-400 mb-1.5 block">Skills (comma separated)</label>
                            <input value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                                className="input-field" placeholder="React, TypeScript, Node.js" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Min Salary ($)</label>
                            <input type="number" value={form.salaryMin} onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))}
                                className="input-field" placeholder="100000" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Max Salary ($)</label>
                            <input type="number" value={form.salaryMax} onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))}
                                className="input-field" placeholder="150000" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Location</label>
                            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                className="input-field" placeholder="San Francisco, CA" required />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Work Type</label>
                            <select value={form.workType} onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))}
                                className="input-field">
                                <option value="REMOTE">Remote</option>
                                <option value="HYBRID">Hybrid</option>
                                <option value="ONSITE">Onsite</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Min Experience (years)</label>
                            <input type="number" value={form.experienceMin} onChange={(e) => setForm((f) => ({ ...f, experienceMin: e.target.value }))}
                                className="input-field" placeholder="0" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Max Experience (years)</label>
                            <input type="number" value={form.experienceMax} onChange={(e) => setForm((f) => ({ ...f, experienceMax: e.target.value }))}
                                className="input-field" placeholder="10" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary">Post Job</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                    </div>
                </motion.form>
            )}

            {/* Job List */}
            <div className="space-y-3">
                {jobs.map((job, i) => (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="card flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-white">{job.title}</h3>
                                <span className={job.active ? 'badge-green' : 'badge-red'}>{job.active ? 'Active' : 'Paused'}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                                    {job.salaryMin && job.salaryMax ? `$${(job.salaryMin / 1000).toFixed(0)}k-$${(job.salaryMax / 1000).toFixed(0)}k` : 'Not specified'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggleActive(job.id, job.active)} className="btn-ghost p-2" title={job.active ? 'Pause' : 'Activate'}>
                                {job.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => deleteJob(job.id)} className="btn-ghost p-2 text-red-400 hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {jobs.length === 0 && !showForm && (
                <div className="text-center py-16">
                    <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No jobs posted yet</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">Post Your First Job</button>
                </div>
            )}
        </div>
    );
}
