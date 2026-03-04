'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30000, retry: 1 },
    },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const loadUser = useAuthStore((s) => s.loadUser);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <AuthInitializer>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1a1b2e',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        },
                    }}
                />
            </AuthInitializer>
        </QueryClientProvider>
    );
}
