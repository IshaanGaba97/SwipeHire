import { create } from 'zustand';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string, role: string) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('swipehire_token') : null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        const { user, token } = data.data;
        localStorage.setItem('swipehire_token', token);
        localStorage.setItem('swipehire_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    signup: async (email, password, name, role) => {
        const { data } = await api.post('/auth/signup', { email, password, name, role });
        const { user, token } = data.data;
        localStorage.setItem('swipehire_token', token);
        localStorage.setItem('swipehire_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    logout: () => {
        localStorage.removeItem('swipehire_token');
        localStorage.removeItem('swipehire_user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    loadUser: async () => {
        try {
            const token = localStorage.getItem('swipehire_token');
            if (!token) {
                set({ isLoading: false });
                return;
            }
            const { data } = await api.get('/auth/me');
            set({ user: data.data, isAuthenticated: true, isLoading: false });
        } catch {
            localStorage.removeItem('swipehire_token');
            localStorage.removeItem('swipehire_user');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },

    setAuth: (user, token) => {
        localStorage.setItem('swipehire_token', token);
        localStorage.setItem('swipehire_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
    },
}));
