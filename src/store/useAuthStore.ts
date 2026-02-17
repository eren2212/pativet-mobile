import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
    user: User | null;
    session: Session | null;
    isInitialized: boolean; // Uygulama ilk açıldığında oturum kontrolü bitene kadar loading göstermek için

    // Aksiyonlar
    setSession: (session: Session | null) => void;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isInitialized: false,

    setSession: (session) =>
        set({ session, user: session?.user || null, isInitialized: true }),

    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (data.session) {
            set({ session: data.session, user: data.user });
        }

        return { error };
    },

    signUp: async (email: string, password: string, fullName: string, phone: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                },
            },
        });

        if (data.session) {
            set({ session: data.session, user: data.user });
        }

        return { error };
    },

    signOut: async () => {

        set({ isInitialized: false });
        await supabase.auth.signOut();
        set({ session: null, user: null, isInitialized: true });
    },
}));