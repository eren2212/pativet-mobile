import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// @ts-ignore
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import COLORS from '@/theme/color';
import Loading from '@/components/loading/Loading';

// ─── Countdown ────────────────────────────────────────────────────────────────

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
    const [seconds, setSeconds] = useState(() => {
        const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
        return Math.max(0, diff);
    });
    const expiredRef = useRef(false);

    useEffect(() => {
        if (seconds <= 0) return;
        const id = setInterval(() => {
            setSeconds((s) => {
                const next = s - 1;
                if (next <= 0 && !expiredRef.current) {
                    expiredRef.current = true;
                    clearInterval(id);
                    onExpire();
                }
                return Math.max(0, next);
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    const isUrgent = seconds <= 60;

    return (
        <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${isUrgent ? 'bg-error/10' : 'bg-radial1'}`}>
            <Ionicons name="time-outline" size={14} color={isUrgent ? COLORS.error : COLORS.tint} />
            <AppText className={`text-sm ${isUrgent ? 'text-error' : 'text-tint'}`}>
                {m}:{s}
            </AppText>
        </View>
    );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
    iconName,
    label,
    value,
    isLast = false,
}: {
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value: string;
    isLast?: boolean;
}) {
    return (
        <View className={`flex-row items-center py-4 ${!isLast ? 'border-b border-quaternary' : ''}`}>
            <View className="w-9 h-9 rounded-full bg-radial1 items-center justify-center mr-4">
                <Ionicons name={iconName} size={18} color={COLORS.tint} />
            </View>
            <View className="flex-1">
                <AppText className="text-xs text-tertiary mb-0.5">{label}</AppText>
                <AppText className="text-[15px] text-primary">{value}</AppText>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SummaryScreen() {
    const insets = useSafeAreaInsets();
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 20;

    const {
        summary,
        isLoadingSummary,
        expiresAt,
        isConfirming,
        fetchSummary,
        confirmReservation,
        cancelReservation,
        reset,
    } = useAppointmentStore();

    const [reason, setReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, []);

    const handleExpire = () => {
        Alert.alert(
            'Süre Doldu',
            'Rezervasyon süreniz doldu. Lütfen tekrar saat seçin.',
            [{ text: 'Tamam', onPress: () => { reset(); router.back(); } }],
        );
    };

    const handleBack = () => {
        Alert.alert(
            'Geri Dön',
            'Rezervasyonunuz iptal edilecek ve saat yeniden müsait olacak. Devam etmek istiyor musunuz?',
            [
                { text: 'Hayır', style: 'cancel' },
                {
                    text: 'Evet, İptal Et',
                    style: 'destructive',
                    onPress: async () => {
                        setIsCancelling(true);
                        await cancelReservation();
                        setIsCancelling(false);
                        router.back();
                    },
                },
            ],
        );
    };

    const handleConfirm = async () => {
        const success = await confirmReservation(reason.trim() || undefined);
        if (success) {
            router.replace('/clinics/confirmed');
        } else {
            Alert.alert(
                'Onaylama Başarısız',
                'Randevu onaylanamadı. Süre dolmuş olabilir. Lütfen tekrar saat seçin.',
                [{ text: 'Tamam', onPress: () => { reset(); router.back(); } }],
            );
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoadingSummary || !summary) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Loading />
            </SafeAreaView>
        );
    }

    const petLabel = `${summary.pets.name} (${summary.pets.species})`;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <View className="flex-row items-center px-5 pt-4 pb-3">
                <TouchableOpacity
                    onPress={handleBack}
                    disabled={isCancelling}
                    className="w-10 h-10 rounded-full bg-card items-center justify-center mr-3"
                    activeOpacity={0.7}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    {isCancelling
                        ? <ActivityIndicator size="small" color={COLORS.tint} />
                        : <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
                    }
                </TouchableOpacity>
                <AppText className="text-lg text-primary flex-1">Randevu Özeti</AppText>
                {expiresAt && (
                    <CountdownTimer expiresAt={expiresAt} onExpire={handleExpire} />
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 + bottomPadding }}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Klinik Kartı ─────────────────────────────────────────── */}
                <View
                    className="bg-card rounded-2xl px-5 mb-5 mt-2"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.07,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                >
                    {/* Klinik Başlığı */}
                    <View className="flex-row items-center py-4 border-b border-quaternary">
                        <View className="w-10 h-10 rounded-xl bg-tint items-center justify-center mr-4">
                            <MaterialCommunityIcons name="hospital-building" size={20} color="#fff" />
                        </View>
                        <View className="flex-1">
                            <AppText className="text-xs text-tertiary mb-0.5">KLİNİK</AppText>
                            <AppText className="text-[15px] text-primary">{summary.clinics.name}</AppText>
                        </View>
                    </View>

                    {/* Randevu Detayları */}
                    <InfoRow
                        iconName="paw-outline"
                        label="Hasta"
                        value={petLabel}
                    />
                    <InfoRow
                        iconName="calendar-outline"
                        label="Tarih & Saat"
                        value={summary.appointment_date}
                    />
                    <InfoRow
                        iconName="person-outline"
                        label="Hekim"
                        value="Klinik Veterineri"
                        isLast
                    />
                </View>

                {/* ── Ziyaret Nedeni ───────────────────────────────────────── */}
                <AppText className="text-[15px] text-primary mb-3">
                    Ziyaret Nedeni <AppText className="text-tertiary text-sm">(Opsiyonel)</AppText>
                </AppText>
                <View
                    className="bg-card rounded-2xl px-4 pt-3 pb-1 mb-5"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        elevation: 1,
                    }}
                >
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Örn: Aşı kontrolü, halsizlik..."
                        placeholderTextColor={COLORS.tertiary}
                        multiline
                        numberOfLines={4}
                        maxLength={300}
                        textAlignVertical="top"
                        style={{
                            fontFamily: 'Domine-Regular',
                            fontSize: 14,
                            color: COLORS.primary,
                            minHeight: 90,
                            paddingTop: Platform.OS === 'ios' ? 4 : 0,
                        }}
                    />
                    <View className="flex-row justify-end pb-2">
                        <AppText className="text-xs text-tertiary">{reason.length}/300</AppText>
                    </View>
                </View>

                {/* ── Bilgi Notu ───────────────────────────────────────────── */}
                <View className="flex-row items-start gap-3 bg-radial1 rounded-2xl px-4 py-4">
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.tint} style={{ marginTop: 1 }} />
                    <AppText className="text-sm text-secondary flex-1 leading-[20px]">
                        Randevunuz onaylandıktan sonra bir bildirim alacaksınız. Değişiklik yapmak için lütfen klinikle iletişime geçin.
                    </AppText>
                </View>
            </ScrollView>

            {/* ── Onay Butonu ─────────────────────────────────────────────── */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 border-t border-quaternary"
                style={{ paddingBottom: bottomPadding }}
            >
                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={isConfirming}
                    activeOpacity={0.85}
                    className="bg-tint rounded-2xl py-4 flex-row items-center justify-center"
                    style={{
                        shadowColor: COLORS.tint,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 6,
                    }}
                >
                    {isConfirming ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <AppText className="text-base text-white mr-2">Randevuyu Onayla</AppText>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
