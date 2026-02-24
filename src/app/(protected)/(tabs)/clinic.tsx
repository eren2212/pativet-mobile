import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    StatusBar,
    ListRenderItemInfo,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppText } from '@/components/AppText';
import { useClinicsStore, Clinic, ClinicWorkingHours } from '@/store/useClinicsStore';
import COLORS from '@/theme/color';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDistance(meters?: number): string | null {
    if (meters == null) return null;
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
}

function checkIsOpen(clinic: Clinic): boolean {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_COLORS = ['#2A9D8F', '#1B6CA8', '#6B9E7E', '#1D6A52', '#8B5E8A', '#C4762A'];

const DUMMY_SERVICES: string[][] = [
    ['Röntgen', 'Cerrahi'],
    ['7/24 Acil', 'Aşı'],
    ['Diş Bakımı', 'Laboratuvar'],
    ['Kuaför'],
    ['Ultrason', 'Kan Tahlili'],
    ['Ortopedi', 'Dahiliye'],
];

type ActiveFilter = 'nearby' | '24_7' | 'top_rated';

// ─── RatingBadge ──────────────────────────────────────────────────────────────

function RatingBadge({ rating }: { rating: number }) {
    return (
        <View
            className="absolute top-[7px] right-[7px] bg-white rounded-xl px-1.5 py-[3px] flex-row items-center"
            style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3 }}
        >
            <Ionicons name="star" size={10} color="#F59E0B" />
            <AppText className="text-[11px] text-primary ml-0.5">{rating.toFixed(1)}</AppText>
        </View>
    );
}

// ─── ServiceTag ───────────────────────────────────────────────────────────────

function ServiceTag({ label }: { label: string }) {
    return (
        <View className="bg-background rounded-full px-2.5 py-1 mr-1.5 mb-1">
            <AppText className="text-[11px] text-secondary">{label}</AppText>
        </View>
    );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            className={`px-[18px] py-[9px] rounded-full ${active ? 'bg-tint' : 'bg-card border border-quaternary'}`}
        >
            <AppText
                className="text-[13px]"
                style={{ color: active ? '#fff' : COLORS.secondary }}
            >
                {label}
            </AppText>
        </TouchableOpacity>
    );
}

// ─── ClinicCard ───────────────────────────────────────────────────────────────

function ClinicCard({ clinic, index }: { clinic: Clinic; index: number }) {
    const isOpen = checkIsOpen(clinic);
    const distance = formatDistance(clinic.distance_meters);
    const bgColor = CARD_COLORS[index % CARD_COLORS.length];
    const services = DUMMY_SERVICES[index % DUMMY_SERVICES.length];
    const dotColor = isOpen ? COLORS.success : COLORS.error;

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/clinics/${clinic.id}`)}>
            <View
                className="bg-card mx-4 mb-3 rounded-[18px] overflow-hidden border border-quaternary"
                style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 }}
            >
                {/* Body */}
                <View className="flex-row p-3.5">
                    {/* Left: clinic image box */}
                    <View
                        className="w-[88px] h-[88px] rounded-[14px] items-center justify-center mr-3.5"
                        style={{ backgroundColor: bgColor }}
                    >
                        <MaterialCommunityIcons name="hospital-building" size={38} color="rgba(255,255,255,0.65)" />
                        <RatingBadge rating={clinic.rating} />
                    </View>

                    {/* Right: info */}
                    <View className="flex-1">
                        <AppText className="text-[15px] text-primary mb-[7px] leading-5" numberOfLines={2}>
                            {clinic.name}
                        </AppText>

                        {/* Status + Distance */}
                        <View className="flex-row items-center mb-2.5">
                            <View className="w-2 h-2 rounded-full mr-[5px]" style={{ backgroundColor: dotColor }} />
                            <AppText className="text-[13px]" style={{ color: dotColor }}>
                                {isOpen ? 'Açık' : 'Kapalı'}
                            </AppText>
                            {distance && (
                                <>
                                    <AppText className="text-[13px] text-tertiary"> · </AppText>
                                    <AppText className="text-[13px] text-tertiary">{distance}</AppText>
                                </>
                            )}
                        </View>

                        {/* Service tags */}
                        <View className="flex-row flex-wrap">
                            {services.map((s) => <ServiceTag key={s} label={s} />)}
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── EmptyList ────────────────────────────────────────────────────────────────

function EmptyList() {
    return (
        <View className="items-center justify-center pt-20">
            <MaterialCommunityIcons name="hospital" size={52} color={COLORS.tertiary} />
            <AppText className="mt-3.5 text-[15px] text-tertiary">Klinik bulunamadı</AppText>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ClinicScreen() {
    const { clinics, isLoading, setLocation, setFilter, fetchClinics } = useClinicsStore();

    const [activeFilter, setActiveFilter] = useState<ActiveFilter>('nearby');
    const [searchText, setSearchText] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (isMounted.current) setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            }
            if (isMounted.current) fetchClinics();
        })();
        return () => {
            isMounted.current = false;
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterPress = (filter: ActiveFilter) => {
        setActiveFilter(filter);
        if (filter === 'nearby') setFilter({ is_24_7: false, top_rated: false });
        else if (filter === '24_7') setFilter({ is_24_7: true, top_rated: false });
        else setFilter({ is_24_7: false, top_rated: true });
        fetchClinics();
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setFilter({ search: text }); fetchClinics(); }, 1000);
    };

    const renderClinic = useCallback(
        ({ item, index }: ListRenderItemInfo<Clinic>) => <ClinicCard clinic={item} index={index} />,
        [],
    );
    const keyExtractor = useCallback((item: Clinic) => item.id, []);

    const ListHeader = (
        <>
            {/* Search bar */}
            <View
                className="flex-row items-center bg-card rounded-2xl mx-4 mb-3 px-3.5 h-[50px]"
                style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }}
            >
                <Feather name="search" size={18} color={COLORS.tertiary} />
                <TextInput
                    placeholder="Klinik adı veya ilçe ara"
                    placeholderTextColor={COLORS.tertiary}
                    value={searchText}
                    onChangeText={handleSearch}
                    className="flex-1 ml-2.5 text-primary text-sm font-ozel-regular"
                />
                <TouchableOpacity activeOpacity={0.7}>
                    <Feather name="sliders" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14, gap: 10 }}
            >
                <FilterChip label="Yakınımda" active={activeFilter === 'nearby'} onPress={() => handleFilterPress('nearby')} />
                <FilterChip label="7/24 Acil" active={activeFilter === '24_7'} onPress={() => handleFilterPress('24_7')} />
                <FilterChip label="Puanı Yüksek" active={activeFilter === 'top_rated'} onPress={() => handleFilterPress('top_rated')} />
            </ScrollView>
        </>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View className="flex-row items-start justify-between px-5 pt-4 pb-3">
                <View className="flex-1">
                    <AppText className="text-[28px] text-primary leading-[34px]">Klinik Bul</AppText>
                    <AppText className="text-sm text-secondary mt-1">
                        Pamuk için en yakın sağlık merkezini seçin
                    </AppText>
                </View>
                <View
                    className="rounded-full p-2.5 ml-3 mt-0.5"
                    style={{ backgroundColor: COLORS.tint + '1A' }}
                >
                    <MaterialCommunityIcons name="paw" size={24} color={COLORS.tint} />
                </View>
            </View>

            <FlatList
                data={clinics}
                keyExtractor={keyExtractor}
                renderItem={renderClinic}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={<EmptyList />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={fetchClinics}
                        tintColor={COLORS.tint}
                        colors={[COLORS.tint]}
                    />
                }
            />
        </SafeAreaView>
    );
}
