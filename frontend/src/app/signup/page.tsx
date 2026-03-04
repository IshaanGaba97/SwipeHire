'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Briefcase, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const searchParams = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(searchParams.get('role') || 'CANDIDATE');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const signup = useAuthStore((s) => s.signup);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await signup(email, password, name, role);
            toast.success('Account created!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-brand-600/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="glass p-8">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-teal rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-gray-400 mt-1">Join SwipeHire today</p>
                    </div>

                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            { value: 'CANDIDATE', label: 'Candidate', icon: UserCircle, desc: 'Looking for jobs' },
                            { value: 'RECRUITER', label: 'Recruiter', icon: Briefcase, desc: 'Hiring talent' },
                        ].map((r) => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setRole(r.value)}
                                className={`p-4 rounded-xl border transition-all duration-200 text-left ${role === r.value
                                        ? 'border-brand-500 bg-brand-500/10'
                                        : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                                    }`}
                            >
                                <r.icon className={`w-6 h-6 mb-2 ${role === r.value ? 'text-brand-400' : 'text-gray-500'}`} />
                                <div className={`text-sm font-medium ${role === r.value ? 'text-white' : 'text-gray-300'}`}>{r.label}</div>
                                <div className="text-xs text-gray-500">{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-11" placeholder="John Doe" required />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11" placeholder="you@example.com" required />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 pr-11" placeholder="Min 6 characters" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
