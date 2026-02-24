import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClinicWorkingHours {
    day_of_week: number; // 1=Mon … 7=Sun
    is_closed: boolean;
    open_time: string | null;   // "09:00"
    close_time: string | null;  // "19:00"
    break_start: string | null;
    break_end: string | null;
}

export interface Clinic {
    id: string;
    name: string;
    address: string;
    rating: number;
    is_open_24_7: boolean;
    distance_meters?: number;
    working_hours: ClinicWorkingHours[];
}

export interface ClinicsFilters {
    search: string;
    is_24_7: boolean;
    top_rated: boolean;
}

interface ClinicsState {
    clinics: Clinic[];
    count: number;
    isLoading: boolean;
    error: string | null;
    location: { lat: number; lng: number } | null;
    filters: ClinicsFilters;

    setLocation: (loc: { lat: number; lng: number } | null) => void;
    setFilter: (filter: Partial<ClinicsFilters>) => void;
    fetchClinics: () => Promise<void>;
    reset: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useClinicsStore = create<ClinicsState>((set, get) => ({
    clinics: [],
    count: 0,
    isLoading: false,
    error: null,
    location: null,
    filters: { search: '', is_24_7: false, top_rated: false },

    setLocation: (loc) => set({ location: loc }),

    setFilter: (filter) =>
        set((s) => ({ filters: { ...s.filters, ...filter } })),

    fetchClinics: async () => {
        set({ isLoading: true, error: null });
        try {
            const { location, filters } = get();
            const token = await getToken();

            const params = new URLSearchParams();
            if (location) {
                params.append('lat', String(location.lat));
                params.append('lng', String(location.lng));
            }
            if (filters.search) params.append('search', filters.search);
            if (filters.is_24_7) params.append('is_24_7', 'true');
            if (filters.top_rated) params.append('top_rated', 'true');

            const res = await fetch(`${API_URL}/clinics?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Klinikler getirilemedi');

            const json = await res.json();
            set({ clinics: json.data ?? [], count: json.count ?? 0 });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Bilinmeyen hata' });
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () =>
        set({ clinics: [], count: 0, error: null, isLoading: false, location: null }),
}));
