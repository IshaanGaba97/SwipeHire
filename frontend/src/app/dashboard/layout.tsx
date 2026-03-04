'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
    Sparkles, Compass, FileText, Briefcase, MessageSquare, Bell, User,
    LayoutDashboard, Users, LogOut, Settings, Brain
} from 'lucide-react';

const candidateNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/discover', label: 'Discover Jobs', icon: Compass },
    { href: '/dashboard/applications', label: 'Applications', icon: FileText },
    { href: '/dashboard/interviews', label: 'AI Interviews', icon: Brain },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const recruiterNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/dashboard/candidates', label: 'Candidates', icon: Users },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Company', icon: Settings },
];

const adminNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/companies', label: 'Companies', icon: Briefcase },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-900 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const navItems = user.role === 'ADMIN' ? adminNav : user.role === 'RECRUITER' ? recruiterNav : candidateNav;

    return (
        <div className="min-h-screen bg-surface-900 flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-surface-800/50 p-4">
                <Link href="/" className="flex items-center gap-2 px-4 py-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-teal rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">SwipeHire</span>
                </Link>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={pathname === item.href ? 'nav-link-active' : 'nav-link'}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-1">
                    <button onClick={() => { logout(); router.push('/'); }} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface-800/30 backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">
                        {navItems.find((n) => n.href === pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <motion.main
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 p-6 overflow-auto"
                >
                    {children}
                </motion.main>

                {/* Mobile bottom nav */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-800/90 backdrop-blur-xl border-t border-white/5 flex justify-around py-2 px-2 z-50">
                    {navItems.slice(0, 5).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${pathname === item.href ? 'text-brand-400' : 'text-gray-500'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px]">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
