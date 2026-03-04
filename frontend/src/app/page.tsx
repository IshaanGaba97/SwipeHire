'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Brain, MessageSquare, Shield } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-surface-900 overflow-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-teal rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">SwipeHire</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="btn-ghost">Log In</Link>
                        <Link href="/signup" className="btn-primary text-sm">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 px-6">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px] animate-pulse-soft" />
                    <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent-teal/15 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8">
                            <Zap className="w-4 h-4 text-accent-orange" />
                            <span className="text-sm text-gray-300">AI-Powered Job Matching</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="text-white">Swipe Your Way to</span>
                            <br />
                            <span className="gradient-text">Your Dream Job</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            SwipeHire uses AI to match candidates with jobs. Swipe right to apply,
                            get AI-powered interview prep, and land your next role — all in one platform.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                                >
                                    Start Swiping <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                            <Link href="/signup?role=RECRUITER">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-secondary text-lg px-8 py-4"
                                >
                                    I&apos;m Hiring
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Floating cards preview */}
                    <div className="relative mt-20 max-w-lg mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative"
                        >
                            {/* Back card */}
                            <div className="absolute top-4 left-4 right-4 glass p-6 rounded-2xl transform rotate-[-3deg] opacity-60">
                                <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                                <div className="h-3 w-48 bg-white/5 rounded mb-2" />
                                <div className="h-3 w-40 bg-white/5 rounded" />
                            </div>

                            {/* Front card */}
                            <div className="relative glass p-8 rounded-2xl border-brand-500/20">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        S
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Senior React Developer</h3>
                                        <p className="text-gray-400 text-sm">Startup Inc. • Remote</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    {['React', 'TypeScript', 'Node.js'].map((skill) => (
                                        <span key={skill} className="badge-blue text-xs">{skill}</span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-accent-green font-semibold">$120k - $180k</span>
                                    <span className="badge-green">92% Match</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-center mb-16"
                    >
                        <span className="text-white">Why </span>
                        <span className="gradient-text">SwipeHire?</span>
                    </motion.h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: 'Swipe to Apply', desc: 'Browse jobs like Tinder. Swipe right to apply, left to skip.', color: 'from-brand-500 to-brand-700' },
                            { icon: Brain, title: 'AI Matching', desc: 'Our AI scores how well you match each job — 0 to 100.', color: 'from-purple-500 to-purple-700' },
                            { icon: MessageSquare, title: 'AI Interviews', desc: 'Practice with AI-powered pre-screening interviews.', color: 'from-accent-teal to-emerald-700' },
                            { icon: Shield, title: 'Smart Resume', desc: 'AI extracts your skills and generates a professional summary.', color: 'from-accent-orange to-orange-700' },
                        ].map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card group cursor-default"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-500" />
                        <span className="text-gray-400">SwipeHire © 2026</span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Contact</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
