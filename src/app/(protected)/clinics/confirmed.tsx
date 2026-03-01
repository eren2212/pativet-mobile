import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import COLORS from '@/theme/color';

export default function ConfirmedScreen() {
    const insets = useSafeAreaInsets();
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 24;

    const { summary, selectedClinicName, reset } = useAppointmentStore();

    // Çember animasyonu
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const checkScaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 60,
                    friction: 6,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(checkScaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 80,
                friction: 5,
            }),
        ]).start();
    }, []);

    const handleGoHome = () => {
        reset();
        router.replace('/(tabs)');
    };

    const handleViewAppointments = () => {
        reset();
        router.replace('/(tabs)/calendar');
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <View className="flex-1 items-center justify-center px-6" style={{ paddingBottom: bottomPadding }}>

                {/* ── Animasyonlu Onay İkonu ─────────────────────────────── */}
                <Animated.View
                    style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
                    className="w-28 h-28 rounded-full bg-tint items-center justify-center mb-8"
                >
                    <Animated.View style={{ transform: [{ scale: checkScaleAnim }] }}>
                        <Ionicons name="checkmark" size={56} color="#fff" />
                    </Animated.View>
                </Animated.View>

                {/* ── Başlık ─────────────────────────────────────────────── */}
                <AppText className="text-2xl text-primary text-center mb-3">
                    Randevu Oluşturuldu!
                </AppText>
                <AppText className="text-sm text-secondary text-center leading-[22px] mb-8">
                    Randevunuz başarıyla gönderildi.{'\n'}Klinik onayladığında bildirim alacaksınız.
                </AppText>

                {/* ── Özet Kartı ─────────────────────────────────────────── */}
                {summary && (
                    <View
                        className="w-full bg-card rounded-2xl px-5 py-5 mb-8"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.07,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <SummaryRow
                            icon="business-outline"
                            label="Klinik"
                            value={summary.clinics.name}
                        />
                        <SummaryRow
                            icon="paw-outline"
                            label="Hasta"
                            value={`${summary.pets.name} (${summary.pets.species})`}
                        />
                        <SummaryRow
                            icon="calendar-outline"
                            label="Tarih & Saat"
                            value={summary.appointment_date}
                            isLast
                        />
                    </View>
                )}

                {/* ── Durum Rozeti ───────────────────────────────────────── */}
                <View className="flex-row items-center gap-2 bg-success/10 px-5 py-3 rounded-full mb-10">
                    <View className="w-2 h-2 rounded-full bg-success" />
                    <AppText className="text-sm text-success">Onay bekleniyor</AppText>
                </View>

                {/* ── Butonlar ───────────────────────────────────────────── */}
                <View className="w-full gap-3">
                    <Button
                        title="Randevularıma Git"
                        onPress={handleViewAppointments}
                        variant="primary"
                        icon="calendar"
                    />
                    <Button
                        title="Ana Sayfaya Dön"
                        onPress={handleGoHome}
                        variant="secondary"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

function SummaryRow({
    icon,
    label,
    value,
    isLast = false,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value: string;
    isLast?: boolean;
}) {
    return (
        <View className={`flex-row items-center py-3 ${!isLast ? 'border-b border-quaternary' : ''}`}>
            <View className="w-8 h-8 rounded-full bg-radial1 items-center justify-center mr-3">
                <Ionicons name={icon} size={15} color={COLORS.tint} />
            </View>
            <View className="flex-1">
                <AppText className="text-xs text-tertiary mb-0.5">{label}</AppText>
                <AppText className="text-sm text-primary">{value}</AppText>
            </View>
        </View>
    );
}
