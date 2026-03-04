'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Brain, Loader2, Play, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeInterview, setActiveInterview] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadInterviews();
    }, []);

    const loadInterviews = async () => {
        try {
            const { data } = await api.get('/ai/interviews');
            setInterviews(data.data || []);
        } catch {
            setInterviews([]);
        } finally {
            setLoading(false);
        }
    };

    const startInterview = async (jobId: string) => {
        try {
            const { data } = await api.post('/ai/interview/start', { jobId });
            setActiveInterview(data.data);
            setAnswers({});
            toast.success('Interview started!');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to start interview');
        }
    };

    const submitInterview = async () => {
        if (!activeInterview) return;
        setSubmitting(true);
        try {
            const answerList = activeInterview.questions.map((q: any) => ({
                questionId: q.id,
                answer: answers[q.id] || '',
            }));

            const { data } = await api.post('/ai/interview/evaluate', {
                interviewId: activeInterview.interview.id,
                answers: answerList,
            });

            toast.success(`Interview completed! Score: ${data.data.overallScore}/100`);
            setActiveInterview(null);
            loadInterviews();
        } catch {
            toast.error('Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
    }

    // Active interview session
    if (activeInterview) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">AI Interview</h1>
                    <button onClick={() => setActiveInterview(null)} className="btn-ghost text-sm">Exit</button>
                </div>

                <div className="space-y-4">
                    {activeInterview.questions?.map((q: any, i: number) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <span className="w-7 h-7 bg-brand-500/20 text-brand-400 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                                    {i + 1}
                                </span>
                                <div>
                                    <span className={`text-xs font-medium ${q.category === 'TECHNICAL' ? 'text-blue-400' :
                                            q.category === 'COMMUNICATION' ? 'text-green-400' : 'text-purple-400'
                                        }`}>{q.category}</span>
                                    <p className="text-white mt-1">{q.question}</p>
                                </div>
                            </div>
                            <textarea
                                value={answers[q.id] || ''}
                                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                                className="input-field min-h-[100px] resize-none"
                                placeholder="Type your answer..."
                            />
                        </motion.div>
                    ))}
                </div>

                <button onClick={submitInterview} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Submit Interview</>}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">AI Interviews</h1>
            <p className="text-gray-400">Practice with AI-powered pre-screening interviews</p>

            {/* Completed interviews */}
            <div className="space-y-3">
                {interviews.map((interview, i) => (
                    <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${interview.status === 'COMPLETED' ? 'bg-emerald-500/20' : 'bg-brand-500/20'
                                }`}>
                                {interview.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                                    <Brain className="w-5 h-5 text-brand-400" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{interview.job?.title}</h3>
                                <p className="text-sm text-gray-400">{interview.job?.company?.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {interview.status === 'COMPLETED' && interview.overallScore !== null ? (
                                <span className={`text-lg font-bold ${interview.overallScore >= 70 ? 'text-emerald-400' : interview.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'
                                    }`}>
                                    {interview.overallScore}/100
                                </span>
                            ) : (
                                <span className="badge-orange">In Progress</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {interviews.length === 0 && (
                <div className="text-center py-16">
                    <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No interviews yet</p>
                    <p className="text-gray-500 text-sm">Apply to jobs and start AI interviews to practice</p>
                </div>
            )}
        </div>
    );
}
