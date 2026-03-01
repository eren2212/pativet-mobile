import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useProfileStore } from './useProfileStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailableSlots {
    sabah: string[];
    ogledenSonra: string[];
}

export interface ReservationSummary {
    appointment_date: string;
    clinics: { name: string };
    pets: { name: string; species: string };
}

export interface DefaultPetInfo {
    petId: string;
}

interface AppointmentState {
    // Default pet
    defaultPetInfo: DefaultPetInfo | null;
    isFetchingPet: boolean;

    // Selected clinic
    selectedClinicId: string | null;
    selectedClinicName: string | null;

    // Date & Slot
    selectedDate: string; // 'YYYY-MM-DD'
    availableSlots: AvailableSlots;
    isLoadingSlots: boolean;
    slotsError: string | null;
    selectedSlot: string | null; // 'HH:mm'

    // Reservation
    reservationId: string | null;
    expiresAt: string | null; // ISO string
    isReserving: boolean;
    reserveError: string | null;

    // Summary
    summary: ReservationSummary | null;
    isLoadingSummary: boolean;

    // Confirm
    isConfirming: boolean;
    confirmedAppointmentId: string | null;

    // Actions
    fetchDefaultPetInfo: () => Promise<void>;
    setSelectedClinic: (id: string, name: string) => void;
    setSelectedDate: (date: string) => void;
    setSelectedSlot: (slot: string | null) => void;
    fetchAvailableSlots: (clinicId: string, date: string) => Promise<void>;
    reserveSlot: (clinicId: string) => Promise<boolean>;
    cancelReservation: () => Promise<boolean>;
    fetchSummary: () => Promise<void>;
    confirmReservation: (reason?: string) => Promise<boolean>;
    reset: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
};

const todayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
    defaultPetInfo: null,
    isFetchingPet: false,

    selectedClinicId: null,
    selectedClinicName: null,

    selectedDate: todayString(),
    availableSlots: { sabah: [], ogledenSonra: [] },
    isLoadingSlots: false,
    slotsError: null,
    selectedSlot: null,

    reservationId: null,
    expiresAt: null,
    isReserving: false,
    reserveError: null,

    summary: null,
    isLoadingSummary: false,

    isConfirming: false,
    confirmedAppointmentId: null,

    // Profile store'dan default_pet_id'yi alır, ardından API'den pet detayını çeker
    fetchDefaultPetInfo: async () => {
        const { defaultPetInfo } = get();
        if (defaultPetInfo) return; // zaten varsa tekrar çekme

        set({ isFetchingPet: true });
        try {
            // 1. Önce profili çek (zaten çekildiyse store'dan gelir, tekrar istek atmaz)
            await useProfileStore.getState().fetchProfile();

            const profile = useProfileStore.getState().profile;
            const petId = profile?.default_pet_id;
            console.log('petId', petId);
            console.log('profile', profile);
            if (!petId) return;

            set({
                defaultPetInfo: {
                    petId,
                },
            });
        } catch {
            // sessizce geç
        } finally {
            set({ isFetchingPet: false });
        }
    },

    setSelectedClinic: (id, name) =>
        set({ selectedClinicId: id, selectedClinicName: name }),

    setSelectedDate: (date) =>
        set({ selectedDate: date, selectedSlot: null, availableSlots: { sabah: [], ogledenSonra: [] } }),

    setSelectedSlot: (slot) => set({ selectedSlot: slot }),

    fetchAvailableSlots: async (clinicId, date) => {
        set({ isLoadingSlots: true, slotsError: null, availableSlots: { sabah: [], ogledenSonra: [] } });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/clinics/${clinicId}/available-slots?date=${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Müsait saatler alınamadı');
            const data: AvailableSlots = await res.json();
            set({ availableSlots: data });
        } catch (err) {
            set({ slotsError: err instanceof Error ? err.message : 'Bilinmeyen hata' });
        } finally {
            set({ isLoadingSlots: false });
        }
    },

    reserveSlot: async (clinicId) => {
        const { selectedSlot, selectedDate, defaultPetInfo } = get();
        if (!selectedSlot || !defaultPetInfo) return false;

        set({ isReserving: true, reserveError: null });
        try {
            const token = await getToken();

            // Tarihi ve saati birleştirerek ISO string oluştur
            const appointmentDate = `${selectedDate}T${selectedSlot}:00.000+03:00`;

            const res = await fetch(`${API_URL}/clinics/${clinicId}/reserve`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    petId: defaultPetInfo.petId,
                    appointmentDate,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message ?? 'Rezervasyon başarısız');
            }

            const data = await res.json();
            set({ reservationId: data.reservationId, expiresAt: data.expiresAt });
            return true;
        } catch (err) {
            set({ reserveError: err instanceof Error ? err.message : 'Bilinmeyen hata' });
            return false;
        } finally {
            set({ isReserving: false });
        }
    },

    fetchSummary: async () => {
        const { reservationId } = get();
        if (!reservationId) return;

        set({ isLoadingSummary: true });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/clinics/reservations/${reservationId}/summary`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Özet alınamadı');
            const data: ReservationSummary = await res.json();
            set({ summary: data });
        } catch {
            // hata yönetimi summary ekranında yapılır
        } finally {
            set({ isLoadingSummary: false });
        }
    },

    confirmReservation: async (reason) => {
        const { reservationId } = get();
        if (!reservationId) return false;

        set({ isConfirming: true });
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/clinics/reservations/${reservationId}/confirm`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: reason ?? undefined }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message ?? 'Onaylama başarısız');
            }

            const data = await res.json();
            set({ confirmedAppointmentId: data.appointmentId });
            return true;
        } catch {
            return false;
        } finally {
            set({ isConfirming: false });
        }
    },

    cancelReservation: async () => {
        const { reservationId } = get();
        if (!reservationId) return true; // zaten yok, sorun değil

        try {
            const token = await getToken();
            await fetch(`${API_URL}/clinics/reservations/${reservationId}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            // Sunucu hatası olsa bile store'u temizle
        }

        // Rezervasyon bilgilerini temizle, tarih/slot seçimi kalsın
        set({
            reservationId: null,
            expiresAt: null,
            summary: null,
            reserveError: null,
        });
        return true;
    },

    reset: () =>
        set({
            selectedClinicId: null,
            selectedClinicName: null,
            selectedDate: todayString(),
            availableSlots: { sabah: [], ogledenSonra: [] },
            isLoadingSlots: false,
            slotsError: null,
            selectedSlot: null,
            reservationId: null,
            expiresAt: null,
            isReserving: false,
            reserveError: null,
            summary: null,
            isLoadingSummary: false,
            isConfirming: false,
            confirmedAppointmentId: null,
        }),
}));
