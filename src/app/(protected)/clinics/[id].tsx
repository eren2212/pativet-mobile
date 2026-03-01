import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Platform,
    Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
// @ts-ignore
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText } from '@/components/AppText';
import { useClinicsStore, ClinicDetail, ClinicWorkingHours } from '@/store/useClinicsStore';
import COLORS from '@/theme/color';
import Loading from '@/components/loading/Loading';
import BackButton from '@/components/BackButton';
import MapView, { Callout, Marker } from 'react-native-maps';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BANNER_URL = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80';
const LOGO_URL = 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=300&q=80';

const MOCK_TAGS = ['7/24 Acil', 'Laboratuvar', 'Pet Kuaför'];

const MOCK_DOCTORS = [
    { id: '1', name: 'Dr. Ayşe Y.', title: 'Cerrahi', image: 'https://i.pravatar.cc/150?img=47' },
    { id: '2', name: 'Dr. Mehmet K.', title: 'Dahiliye', image: 'https://i.pravatar.cc/150?img=12' },
    { id: '3', name: 'Dr. Selin A.', title: 'Diş Hekimi', image: 'https://i.pravatar.cc/150?img=44' },
    { id: '4', name: 'Dr. Can B.', title: 'Radyoloji', image: 'https://i.pravatar.cc/150?img=68' },
];

type ActiveTab = 'hekimler' | 'hizmetler' | 'iletisim';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function checkIsOpen(clinic: ClinicDetail): boolean {
    if (clinic.is_open_24_7) return true;
    if (!clinic.working_hours?.length) return false;

    const now = new Date();
    const jsDay = now.getDay();
    const apiDay = jsDay === 0 ? 7 : jsDay;

    const today = clinic.working_hours.find(
        (h: ClinicWorkingHours) => h.day_of_week === apiDay,
    );
    if (!today || today.is_closed || !today.open_time || !today.close_time) return false;

    const cur = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

    if (today.break_start && today.break_end) {
        if (cur >= toMin(today.break_start) && cur < toMin(today.break_end)) return false;
    }
    return cur >= toMin(today.open_time) && cur < toMin(today.close_time);
}


function getOpenLabel(clinic: ClinicDetail): string {
    if (clinic.is_open_24_7) return 'Açık • 24 Saat';
    return checkIsOpen(clinic) ? 'Açık' : 'Kapalı';
}

const openMap = (clinic: ClinicDetail) => {
    const latitude = clinic.latitude ?? 0;
    const longitude = clinic.longitude ?? 0;

    const url = Platform.select({
        ios: `maps:0,0?q=${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}`
    });

    Linking.openURL(url!);
};

const callPhone = (phone: string) => {
    const url = Platform.select({
        ios: `telprompt:${phone}`,
        android: `tel:${phone}`
    });

    Linking.openURL(url!);
};

// ─── DoctorCard ───────────────────────────────────────────────────────────────

function DoctorCard({ name, title, image }: { name: string; title: string; image: string }) {
    return (
        <View className="items-center w-[78px]">
            <Image
                source={{ uri: image }}
                className="w-[68px] h-[68px] rounded-full mb-2 bg-quaternary"
                resizeMode="cover"
            />
            <AppText className="text-xs text-primary text-center leading-4" numberOfLines={1}>
                {name}
            </AppText>
            <AppText className="text-[11px] text-tertiary text-center mt-0.5" numberOfLines={1}>
                {title}
            </AppText>
        </View>
    );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────

const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'hekimler', label: 'Hekimler' },
    { key: 'hizmetler', label: 'Hizmetler' },
    { key: 'iletisim', label: 'İletişim' },
];

function TabBar({ active, onChange }: { active: ActiveTab; onChange: (t: ActiveTab) => void }) {
    return (
        <View className="flex-row px-5 border-b border-quaternary mb-1">
            {TABS.map((tab) => {
                const isActive = active === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => onChange(tab.key)}
                        activeOpacity={0.7}
                        className="mr-7 py-3.5 items-center relative"
                    >
                        <AppText
                            className={`text-sm ${isActive ? 'text-cute' : 'text-tertiary'}`}
                        >
                            {tab.label}
                        </AppText>
                        {isActive && (
                            <View className="absolute -bottom-px left-0 right-0 h-[2.5px] rounded-sm bg-cute" />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ClinicDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { selectedClinic, isDetailLoading, detailError, fetchClinicById } = useClinicsStore();

    const [activeTab, setActiveTab] = useState<ActiveTab>('hekimler');

    useEffect(() => { if (id) fetchClinicById(id); }, [id]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isDetailLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Loading />
            </SafeAreaView>
        );
    }

    // ── Error / Not Found ─────────────────────────────────────────────────────
    if (detailError || !selectedClinic) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
                <MaterialCommunityIcons name="hospital" size={52} color={COLORS.tertiary} />
                <AppText className="mt-3 text-[15px] text-tertiary text-center">
                    {detailError ?? 'Klinik bulunamadı'}
                </AppText>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <AppText className="text-[15px] text-tint">← Geri Dön</AppText>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const clinic = selectedClinic;
    const isOpen = checkIsOpen(clinic);
    const openLabel = getOpenLabel(clinic);
    const statusColor = isOpen || clinic.is_open_24_7 ? COLORS.success : COLORS.error;
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 20;

    return (
        <View className="flex-1 bg-background">

            {/* ── Scrollable body ────────────────────────────────────────── */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 + bottomPadding }}
                bounces={Platform.OS === 'ios'}
            >

                {/* ── Banner + Logo ── */}
                <View className="w-full h-60 relative">
                    <Image
                        source={{ uri: BANNER_URL }}
                        className="w-full h-60"
                        resizeMode="cover"
                    />
                    {/* ── Floating Back Button ────────────────────────────────────── */}
                    <View className=" absolute  top-16">
                        <BackButton />
                    </View>
                    {/* Top dark gradient so back button is readable */}
                    <View className="absolute top-0 left-0 right-0 h-[90px] bg-black/20" />

                    {/* Logo overlapping bottom edge */}
                    <View
                        className="absolute left-5 w-[76px] h-[76px] rounded-full bg-card overflow-hidden border-[3px] border-card"
                        style={{
                            bottom: -38,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.18,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <Image source={{ uri: LOGO_URL }} className="w-full h-full" resizeMode="cover" />
                    </View>
                </View>

                {/* ── Clinic Info ── */}
                <View className="pt-[50px] px-5 pb-4 bg-background">

                    {/* Name */}
                    <AppText className="text-[22px] text-primary leading-7 mb-2">
                        {clinic.name}
                    </AppText>

                    {/* Rating row */}
                    <View className="flex-row items-center mb-3">
                        <FontAwesome name="star" size={16} color="#F59E0B" />
                        <AppText className="text-[15px] text-primary mx-1.5">
                            {clinic.rating.toFixed(1)}
                        </AppText>
                    </View>

                    {/* Address */}
                    <View className="flex-row items-start gap-2 mb-2">
                        <Ionicons name="location-outline" size={16} color={COLORS.tertiary} />
                        <AppText className="flex-1 text-[13px] text-secondary leading-[18px]" numberOfLines={2}>
                            {clinic.address}
                        </AppText>
                    </View>

                    {/* Open status */}
                    <View className="flex-row items-start gap-2 mb-2">
                        <Ionicons name="time-outline" size={16} color={statusColor} />
                        <AppText
                            className="flex-1 text-[13px] leading-[18px]"
                            style={{ color: statusColor }}
                        >
                            {openLabel}
                        </AppText>
                    </View>
                </View>

                {/* ── Divider ── */}
                <View className="h-px bg-quaternary mx-5" />

                {/* ── Tabs ── */}
                <TabBar active={activeTab} onChange={setActiveTab} />

                {/* ── Tab: Hekimler ── */}
                {activeTab === 'hekimler' && (
                    <View className="pt-2">

                        {/* Section header */}
                        <View className="flex-row items-center justify-between px-5 py-3.5">
                            <AppText className="text-[17px] text-primary">Hekim Kadrosu</AppText>
                            <TouchableOpacity activeOpacity={0.7}>
                                <AppText className="text-[13px] text-cute">Tümünü Gör</AppText>
                            </TouchableOpacity>
                        </View>

                        {/* Doctor cards */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingBottom: 8 }}
                        >
                            {MOCK_DOCTORS.map((doc) => (
                                <DoctorCard
                                    key={doc.id}
                                    name={doc.name}
                                    title={doc.title}
                                    image={doc.image}
                                />
                            ))}
                        </ScrollView>

                        {clinic.about && (
                            <View className="px-5 pt-4 pb-2">
                                <AppText className="text-[17px] text-primary">Hakkında</AppText>
                                <AppText className="text-[13px] text-secondary leading-[21px] mt-2.5">
                                    {clinic.about}
                                </AppText>
                            </View>
                        )}
                    </View>
                )}

                {/* ── Tab: Hizmetler ── */}
                {activeTab === 'hizmetler' && (
                    <View className="items-center justify-center pt-16 pb-10">
                        <MaterialCommunityIcons name="medical-bag" size={44} color={COLORS.tertiary} />
                        <AppText className="mt-3 text-sm text-tertiary">
                            Hizmetler yakında eklenecek
                        </AppText>
                    </View>
                )}

                {/* ── Tab: İletişim ── */}
                {activeTab === 'iletisim' && (
                    <View className="px-5 pt-4 pb-2">
                        <View className="flex-col items-start gap-1">
                            <AppText className="text-[17px] text-primary">Telefon Numarası</AppText>
                            <AppText className="text-[13px] text-secondary leading-[21px] mt-2.5">
                                <TouchableOpacity onPress={() => callPhone(clinic.phone_number!)}>
                                    <AppText className="text-[13px] text-cute underline">{clinic.phone_number}</AppText>
                                </TouchableOpacity>
                            </AppText>
                        </View>

                        <AppText className="text-[17px] text-primary mb-4 mt-8">Adres</AppText>
                        <View className="flex-1 rounded-lg overflow-hidden">
                            <MapView
                                style={{
                                    width: "100%",
                                    height: 400,
                                    borderRadius: 16,
                                }}
                                initialRegion={{
                                    latitude: clinic.latitude || 37.8715,
                                    longitude: clinic.longitude || 32.4846,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                showsUserLocation
                                showsMyLocationButton
                            >
                                <Marker
                                    coordinate={{
                                        latitude: clinic.latitude || 37.8715,
                                        longitude: clinic.longitude || 32.4846,
                                    }}
                                    title={clinic.name}
                                    description="Yol tarifi almak için tıkla"
                                >
                                    <Callout onPress={() => openMap(clinic)}>
                                        <TouchableOpacity style={{ padding: 6 }}>
                                            <AppText className="text-[14px] text-cute font-semibold">
                                                Yol Tarifi Al
                                            </AppText>
                                        </TouchableOpacity>
                                    </Callout>
                                </Marker>
                            </MapView>
                        </View>
                        <View className="flex-row items-center justify-center gap-2 mt-2 bg-error/10 rounded-lg px-4 p-2">
                            <FontAwesome name="exclamation-triangle" size={16} color={COLORS.error} />
                            <AppText className="text-sm text-secondary p-2">Yol tarifi için pin'e tıklayınız.</AppText>
                        </View>
                    </View>
                )}
            </ScrollView>


            {/* ── Sticky CTA ──────────────────────────────────────────────── */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 border-t border-quaternary"
                style={{ paddingBottom: bottomPadding }}
            >
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(`/clinics/book?id=${clinic.id}`)}
                    className="bg-tint rounded-2xl py-4 flex-row items-center justify-center"
                    style={{
                        shadowColor: COLORS.tint,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 6,
                    }}
                >
                    <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                    <AppText className="text-base text-white">Randevu Oluştur</AppText>
                </TouchableOpacity>
            </View>

        </View>
    );
}
