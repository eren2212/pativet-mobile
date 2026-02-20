import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface Pet {
    id: string;
    name: string;
    breed?: string | null;
    avatar_url?: string | null;
}

export interface PetDetail {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    gender: string | null;
    weight: number | null;
    chip_number: string | null;
    avatar_url: string | null;
    age: string | null;
}

export interface CreatePetInput {
    name: string;
    species: string;
    breed?: string;
    birth_date?: string;
    gender?: string;
}

export interface UpdatePetInput {
    name?: string;
    breed?: string;
    gender?: string;
    weight?: number;
    chip_number?: string;
    birth_date?: string;
}

interface PetsState {
    pets: Pet[];
    count: number;
    isLoading: boolean;
    error: string | null;

    fetchPets: () => Promise<void>;
    fetchPetById: (petId: string) => Promise<PetDetail | null>;
    createPet: (data: CreatePetInput) => Promise<Pet | null>;
    updatePet: (petId: string, data: UpdatePetInput) => Promise<PetDetail | null>;
    deletePet: (petId: string) => Promise<boolean>;
    uploadAvatar: (petId: string, imageUri: string, mimeType: string) => Promise<string | null>;
    reset: () => void;
}

const getToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
};

export const usePetsStore = create<PetsState>((set) => ({
    pets: [],
    count: 0,
    isLoading: false,
    error: null,

    fetchPets: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/pets`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Hayvanlar getirilemedi');
            const json = await res.json();
            set({ pets: json.data, count: json.count });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Bilinmeyen hata' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchPetById: async (petId) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/pets/${petId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return null;
            return (await res.json()) as PetDetail;
        } catch {
            return null;
        }
    },

    createPet: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/pets`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message ?? 'Hayvan oluşturulamadı');
            }
            const pet: Pet = await res.json();
            set((s) => ({ pets: [pet, ...s.pets], count: s.count + 1 }));
            return pet;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Bilinmeyen hata' });
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    updatePet: async (petId, data) => {
        set({ isLoading: true, error: null });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/pets/${petId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message ?? 'Güncelleme başarısız');
            }
            const updated: PetDetail = await res.json();
            set((s) => ({
                pets: s.pets.map((p) =>
                    p.id === petId
                        ? { ...p, name: updated.name, breed: updated.breed, avatar_url: updated.avatar_url }
                        : p
                ),
            }));
            return updated;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Bilinmeyen hata' });
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    deletePet: async (petId) => {
        set({ isLoading: true, error: null });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/pets/${petId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Silme başarısız');
            set((s) => ({
                pets: s.pets.filter((p) => p.id !== petId),
                count: Math.max(0, s.count - 1),
            }));
            return true;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Bilinmeyen hata' });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    uploadAvatar: async (petId, imageUri, mimeType) => {
        try {
            const token = await getToken();
            const fileName = imageUri.split('/').pop() ?? 'avatar.jpg';
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: fileName,
                type: mimeType,
            } as unknown as Blob);

            const res = await fetch(`${API_URL}/pets/${petId}/avatar`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Fotoğraf yüklenemedi');
            const result = await res.json();

            set((s) => ({
                pets: s.pets.map((p) =>
                    p.id === petId ? { ...p, avatar_url: result.avatar_url } : p
                ),
            }));
            return result.avatar_url as string;
        } catch (err) {
            console.error('Avatar yükleme hatası:', err);
            return null;
        }
    },

    reset: () => set({ pets: [], count: 0, error: null, isLoading: false }),
}));
