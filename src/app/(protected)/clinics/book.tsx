import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
// @ts-ignore
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useClinicsStore } from '@/store/useClinicsStore';
import COLORS from '@/theme/color';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const TR_MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Bugünden itibaren `count` günlük dizi üretir */
function buildDateRange(count = 30): Date[] {
    const dates: Date[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < count; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        dates.push(d);
    }
    return dates;
}

function formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function DateItem({
    date,
    isSelected,
    onPress,
}: {
    date: Date;
    isSelected: boolean;
    onPress: () => void;
}) {
    const dayName = TR_DAYS[date.getDay()];
    const dayNum = date.getDate();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            className={`items-center justify-center w-[58px] h-[72px] rounded-2xl mx-1.5 ${isSelected ? 'bg-tint' : 'bg-card'
                }`}
            style={isSelected ? {
                shadowColor: COLORS.tint,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
            } : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
                elevation: 1,
            }}
        >
            <AppText className={`text-xs mb-1 ${isSelected ? 'text-white' : 'text-tertiary'}`}>
                {dayName}
            </AppText>
            <AppText className={`text-lg ${isSelected ? 'text-white' : 'text-primary'}`}>
                {dayNum}
            </AppText>
        </TouchableOpacity>
    );
}

type SlotStatus = 'available' | 'selected' | 'booked';

function SlotItem({
    time,
    status,
    onPress,
}: {
    time: string;
    status: SlotStatus;
    onPress: () => void;
}) {
    const isBooked = status === 'booked';
    const isSelected = status === 'selected';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isBooked}
            activeOpacity={0.75}
            className={`flex-1 mx-1.5 mb-3 rounded-2xl py-3.5 items-center justify-center
        ${isBooked ? 'bg-quaternary' : isSelected ? 'bg-tint' : 'bg-card border border-quaternary'}
      `}
            style={!isBooked ? {
                shadowColor: isSelected ? COLORS.tint : '#000',
                shadowOffset: { width: 0, height: isSelected ? 4 : 1 },
                shadowOpacity: isSelected ? 0.3 : 0.06,
                shadowRadius: isSelected ? 8 : 3,
                elevation: isSelected ? 5 : 1,
            } : undefined}
        >
            <AppText
                className={`text-sm ${isBooked ? 'text-tertiary line-through' : isSelected ? 'text-white' : 'text-primary'
                    }`}
            >
                {time}
            </AppText>
        </TouchableOpacity>
    );
}

// ─── Empty State (Tatil) ──────────────────────────────────────────────────────

function HolidayState() {
    return (
        <View className="flex-1 items-center justify-center py-16 px-8">
            <View className="w-20 h-20 rounded-full bg-radial1 items-center justify-center mb-5">
                <MaterialCommunityIcons name="calendar-remove" size={38} color={COLORS.tint} />
            </View>
            <AppText className="text-lg text-primary text-center mb-2">Bu Gün Tatil</AppText>
            <AppText className="text-sm text-secondary text-center leading-[20px]">
                Seçtiğiniz tarihte klinik hizmet vermiyor.{'\n'}Lütfen başka bir gün seçin.
            </AppText>
        </View>
    );
}

// ─── Countdown Banner ─────────────────────────────────────────────────────────

function CountdownBanner({ expiresAt }: { expiresAt: string }) {
    const [seconds, setSeconds] = useState(() => {
        const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
        return Math.max(0, diff);
    });

    useEffect(() => {
        if (seconds <= 0) return;
        const id = setInterval(() => {
            setSeconds((s) => {
                if (s <= 1) { clearInterval(id); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const isUrgent = seconds <= 60;

    return (
        <View className={`flex-row items-center justify-center gap-2 py-2.5 px-4 mx-5 mb-3 rounded-xl ${isUrgent ? 'bg-error/10' : 'bg-radial1'}`}>
            <Ionicons name="time-outline" size={16} color={isUrgent ? COLORS.error : COLORS.tint} />
            <AppText className={`text-sm ${isUrgent ? 'text-error' : 'text-tint'}`}>
                Rezervasyon sona eriyor: {formatCountdown(seconds)}
            </AppText>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BookScreen() {
    const { id: clinicId } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 20;

    const { selectedClinic } = useClinicsStore();
    const {
        defaultPetInfo,
        isFetchingPet,
        selectedDate,
        availableSlots,
        isLoadingSlots,
        selectedSlot,
        expiresAt,
        isReserving,
        reserveError,
        fetchDefaultPetInfo,
        setSelectedClinic,
        setSelectedDate,
        setSelectedSlot,
        fetchAvailableSlots,
        reserveSlot,
        reset,
    } = useAppointmentStore();

    const dateRange = buildDateRange(30);
    const dateScrollRef = useRef<ScrollView>(null);

    // Aktif rezervasyon varsa direkt summary'e yönlendir (geri basınca döngüye girmesin)
    useEffect(() => {
        if (expiresAt && new Date(expiresAt) > new Date()) {
            router.replace(`/clinics/summary?id=${clinicId}`);
        }
    }, []);

    // Başlangıçta default pet bilgisini çek
    useEffect(() => {
        fetchDefaultPetInfo();
    }, []);

    // Klinik bilgisini store'a yaz
    useEffect(() => {
        if (clinicId && selectedClinic) {
            setSelectedClinic(clinicId, selectedClinic.name);
        }
    }, [clinicId, selectedClinic]);

    // Seçili tarihe göre slotları yenile
    useEffect(() => {
        if (clinicId && selectedDate) {
            fetchAvailableSlots(clinicId, selectedDate);
        }
    }, [clinicId, selectedDate]);

    const hasNoSlots =
        !isLoadingSlots &&
        availableSlots.sabah.length === 0 &&
        availableSlots.ogledenSonra.length === 0;

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(toDateString(date));
    }, [setSelectedDate]);

    const handleSlotPress = useCallback((time: string) => {
        setSelectedSlot(selectedSlot === time ? null : time);
    }, [selectedSlot, setSelectedSlot]);

    const handleReserve = async () => {
        if (!selectedSlot) {
            Alert.alert('Saat Seçin', 'Lütfen önce bir randevu saati seçin.');
            return;
        }
        if (!defaultPetInfo) {
            Alert.alert('Hayvan Bulunamadı', 'Varsayılan evcil hayvan bilgisi alınamadı. Lütfen tekrar deneyin.');
            return;
        }

        const success = await reserveSlot(clinicId);
        if (success) {
            router.push(`/clinics/summary?id=${clinicId}`);
        } else {
            Alert.alert(
                'Rezervasyon Başarısız',
                reserveError ?? 'Bu saat zaten dolu olabilir. Lütfen başka bir saat seçin.',
            );
        }
    };

    // Seçili ayın başlığı
    const selectedDateObj = dateRange.find((d) => toDateString(d) === selectedDate) ?? dateRange[0];
    const monthLabel = `${TR_MONTHS[selectedDateObj.getMonth()]} ${selectedDateObj.getFullYear()}`;

    // Slot grid: 3 sütun
    const renderSlots = (times: string[]) => {
        const rows: string[][] = [];
        for (let i = 0; i < times.length; i += 3) {
            rows.push(times.slice(i, i + 3));
        }
        return rows.map((row, ri) => (
            <View key={ri} className="flex-row mx-[-6px]">
                {row.map((time) => (
                    <SlotItem
                        key={time}
                        time={time}
                        status={selectedSlot === time ? 'selected' : 'available'}
                        onPress={() => handleSlotPress(time)}
                    />
                ))}
                {/* Eksik hücreleri doldur */}
                {row.length < 3 && Array(3 - row.length).fill(null).map((_, idx) => (
                    <View key={`empty-${idx}`} className="flex-1 mx-1.5" />
                ))}
            </View>
        ));
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <View className="flex-row items-center px-5 pt-4 pb-3">
                <TouchableOpacity
                    onPress={() => { reset(); router.back(); }}
                    className="w-10 h-10 rounded-full bg-card items-center justify-center mr-3"
                    activeOpacity={0.7}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
                >
                    <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <AppText className="text-lg text-primary flex-1">Tarih ve Saat Seç</AppText>
                {isFetchingPet && (
                    <ActivityIndicator size="small" color={COLORS.tint} />
                )}
            </View>

            {/* ── Countdown (rezervasyon varsa) ────────────────────────── */}
            {expiresAt && <CountdownBanner expiresAt={expiresAt} />}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 + bottomPadding }}
            >
                {/* ── Ay Başlığı + Takvim ──────────────────────────────── */}
                <View className="px-5 mb-4">
                    <AppText className="text-xl text-primary mb-4">{monthLabel}</AppText>

                    <ScrollView
                        ref={dateScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 2, paddingVertical: 4 }}
                    >
                        {dateRange.map((d) => {
                            const ds = toDateString(d);
                            return (
                                <DateItem
                                    key={ds}
                                    date={d}
                                    isSelected={selectedDate === ds}
                                    onPress={() => handleDateSelect(d)}
                                />
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ── Ayırıcı ──────────────────────────────────────────── */}
                <View className="h-px bg-quaternary mx-5 mb-5" />

                {/* ── Slotlar ──────────────────────────────────────────── */}
                {isLoadingSlots ? (
                    <View className="items-center py-16">
                        <ActivityIndicator size="large" color={COLORS.tint} />
                        <AppText className="text-sm text-secondary mt-3">Müsait saatler yükleniyor...</AppText>
                    </View>
                ) : hasNoSlots ? (
                    <HolidayState />
                ) : (
                    <View className="px-5">
                        {/* Slot başlığı */}
                        <View className="flex-row items-center justify-between mb-4">
                            <AppText className="text-[17px] text-primary">Müsait Saatler</AppText>
                            <View className="flex-row items-center gap-1 bg-radial1 px-3 py-1 rounded-full">
                                <Ionicons name="checkmark-circle" size={13} color={COLORS.tint} />
                                <AppText className="text-xs text-tint">
                                    {availableSlots.sabah.length + availableSlots.ogledenSonra.length} Müsait
                                </AppText>
                            </View>
                        </View>

                        {/* SABAH */}
                        {availableSlots.sabah.length > 0 && (
                            <View className="mb-5">
                                <AppText className="text-xs text-tertiary mb-3 tracking-widest">SABAH</AppText>
                                {renderSlots(availableSlots.sabah)}
                            </View>
                        )}

                        {/* ÖĞLEDEN SONRA */}
                        {availableSlots.ogledenSonra.length > 0 && (
                            <View className="mb-5">
                                <AppText className="text-xs text-tertiary mb-3 tracking-widest">ÖĞLEDEN SONRA</AppText>
                                {renderSlots(availableSlots.ogledenSonra)}
                            </View>
                        )}

                        {/* Legend */}
                        <View className="flex-row items-center gap-5 mt-1 mb-4">
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-4 h-4 rounded-full border border-quaternary bg-card" />
                                <AppText className="text-xs text-secondary">Boş</AppText>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-4 h-4 rounded-full bg-tint" />
                                <AppText className="text-xs text-secondary">Seçili</AppText>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-4 h-4 rounded-full bg-quaternary" />
                                <AppText className="text-xs text-secondary">Dolu</AppText>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* ── Bottom CTA ───────────────────────────────────────────────── */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 border-t border-quaternary"
                style={{ paddingBottom: bottomPadding }}
            >
                {/* Seçilen zaman bilgisi */}
                {selectedSlot && (
                    <View className="flex-row items-center justify-between mb-3 px-1">
                        <View>
                            <AppText className="text-xs text-secondary">Seçilen Zaman</AppText>
                            <AppText className="text-sm text-primary mt-0.5">
                                {selectedDateObj.getDate()} {TR_MONTHS[selectedDateObj.getMonth()]}, {selectedSlot}
                            </AppText>
                        </View>
                        {selectedClinic?.appointment_duration && (
                            <View className="items-end">
                                <AppText className="text-xs text-secondary">Süre</AppText>
                                <AppText className="text-sm text-primary mt-0.5">
                                    {selectedClinic.appointment_duration} dk
                                </AppText>
                            </View>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleReserve}
                    disabled={!selectedSlot || isReserving || hasNoSlots}
                    activeOpacity={0.85}
                    className={`rounded-2xl py-4 flex-row items-center justify-center ${!selectedSlot || hasNoSlots ? 'bg-quaternary' : 'bg-tint'}`}
                    style={selectedSlot && !hasNoSlots ? {
                        shadowColor: COLORS.tint,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 6,
                    } : undefined}
                >
                    {isReserving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <AppText className={`text-base mr-2 ${!selectedSlot || hasNoSlots ? 'text-tertiary' : 'text-white'}`}>
                                Devam Et
                            </AppText>
                            <Ionicons
                                name="arrow-forward"
                                size={18}
                                color={!selectedSlot || hasNoSlots ? COLORS.tertiary : '#fff'}
                            />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
