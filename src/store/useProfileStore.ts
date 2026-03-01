import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
    full_name: string | null;
    email: string | null;
    default_pet_id: string | null;
}

interface ProfileState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;

    fetchProfile: () => Promise<void>;
    reset: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileState>((set, get) => ({
    profile: null,
    isLoading: false,
    error: null,

    fetchProfile: async () => {
        if (get().profile) return; // zaten çekildiyse tekrar çekme

        set({ isLoading: true, error: null });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Profil alınamadı');
            const data: UserProfile = await res.json();
            set({ profile: data });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Bilinmeyen hata' });
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () => set({ profile: null, isLoading: false, error: null }),
}));
