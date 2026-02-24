import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    StyleSheet,
    ListRenderItemInfo,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – @expo/vector-icons is a runtime dep bundled with expo
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText } from '@/components/AppText';
import { useClinicsStore, Clinic, ClinicWorkingHours } from '@/store/useClinicsStore';
import COLORS from '@/theme/color';
import Loading from '@/components/loading/Loading';

// ─── Helper: Distance Formatter ───────────────────────────────────────────────

function formatDistance(meters?: number): string | null {
    if (meters == null) return null;
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
}

// ─── Helper: Open/Closed Status ───────────────────────────────────────────────

function checkIsOpen(clinic: Clinic): boolean {
    if (clinic.is_open_24_7) return true;
    if (!clinic.working_hours?.length) return false;

    const now = new Date();
    // JS: 0=Sun…6=Sat  →  API: 1=Mon…7=Sun
    const jsDay = now.getDay();
    const apiDay = jsDay === 0 ? 7 : jsDay;

    const today = clinic.working_hours.find(
        (h: ClinicWorkingHours) => h.day_of_week === apiDay,
    );
    if (!today || today.is_closed || !today.open_time || !today.close_time) return false;

    const cur = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

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

// ─── Rating Badge ─────────────────────────────────────────────────────────────

function RatingBadge({ rating }: { rating: number }) {
    return (
        <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <AppText style={styles.ratingText}>{rating.toFixed(1)}</AppText>
        </View>
    );
}

// ─── Service Tag ──────────────────────────────────────────────────────────────

function ServiceTag({ label }: { label: string }) {
    return (
        <View style={styles.serviceTag}>
            <AppText style={styles.serviceTagText}>{label}</AppText>
        </View>
    );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

interface FilterChipProps {
    label: string;
    active: boolean;
    onPress: () => void;
}

function FilterChip({ label, active, onPress }: FilterChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[styles.filterChip, active ? styles.filterChipActive : styles.filterChipInactive]}
        >
            <AppText style={[styles.filterChipText, { color: active ? '#fff' : COLORS.secondary }]}>
                {label}
            </AppText>
        </TouchableOpacity>
    );
}

// ─── Clinic Card ──────────────────────────────────────────────────────────────

interface ClinicCardProps {
    clinic: Clinic;
    index: number;
}

function ClinicCard({ clinic, index }: ClinicCardProps) {
    const isOpen = checkIsOpen(clinic);
    const distance = formatDistance(clinic.distance_meters);
    const bgColor = CARD_COLORS[index % CARD_COLORS.length];
    const services = DUMMY_SERVICES[index % DUMMY_SERVICES.length];

    return (
        <View style={styles.card}>
            <View style={styles.cardBody}>
                {/* Clinic visual */}
                <View style={[styles.clinicImageBox, { backgroundColor: bgColor }]}>
                    <MaterialCommunityIcons
                        name="hospital-building"
                        size={38}
                        color="rgba(255,255,255,0.65)"
                    />
                    <RatingBadge rating={clinic.rating} />
                </View>

                {/* Info column */}
                <View style={styles.cardInfo}>
                    <AppText style={styles.clinicName} numberOfLines={2}>
                        {clinic.name}
                    </AppText>

                    {/* Status + Distance */}
                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: isOpen ? COLORS.success : COLORS.error },
                            ]}
                        />
                        <AppText
                            style={[
                                styles.statusText,
                                { color: isOpen ? COLORS.success : COLORS.error },
                            ]}
                        >
                            {isOpen ? 'Açık' : 'Kapalı'}
                        </AppText>

                        {distance && (
                            <>
                                <AppText style={styles.dot}> · </AppText>
                                <AppText style={styles.distanceText}>{distance}</AppText>
                            </>
                        )}
                    </View>

                    {/* Service tags */}
                    <View style={styles.tagsRow}>
                        {services.map((s) => (
                            <ServiceTag key={s} label={s} />
                        ))}
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
                <TouchableOpacity activeOpacity={0.7}>
                    <AppText style={styles.detailsLink}>Detaylar</AppText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Empty / Loading Placeholder ──────────────────────────────────────────────

function EmptyList() {
    return (
        <View style={styles.placeholder}>
            <MaterialCommunityIcons name="hospital" size={52} color={COLORS.tertiary} />
            <AppText style={styles.emptyText}>Klinik bulunamadı</AppText>
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

    // On mount: ask for location permission, grab coords, then fetch
    useEffect(() => {
        isMounted.current = true;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                if (isMounted.current) {
                    setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
                }
            }
            if (isMounted.current) fetchClinics();
        })();

        return () => {
            isMounted.current = false;
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
        // intentionally run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleFilterPress = (filter: ActiveFilter) => {
        setActiveFilter(filter);
        if (filter === 'nearby') {
            setFilter({ is_24_7: false, top_rated: false });
        } else if (filter === '24_7') {
            setFilter({ is_24_7: true, top_rated: false });
        } else {
            setFilter({ is_24_7: false, top_rated: true });
        }
        // Zustand set() is synchronous, so fetchClinics() reads updated state immediately
        fetchClinics();
    };

    const handleSearch = (text: string) => {

        setSearchText(text);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setFilter({ search: text });
            fetchClinics();
        }, 500);
    };

    // ── Render helpers ────────────────────────────────────────────────────────

    const renderClinic = useCallback(
        ({ item, index }: ListRenderItemInfo<Clinic>) => (
            <ClinicCard clinic={item} index={index} />
        ),
        [],
    );

    const keyExtractor = useCallback((item: Clinic) => item.id, []);

    const ListHeader = (
        <>
            {/* Search bar */}
            <View style={styles.searchBar}>
                <Feather name="search" size={18} color={COLORS.tertiary} />
                <TextInput
                    placeholder="Klinik adı veya ilçe ara"
                    placeholderTextColor={COLORS.tertiary}
                    value={searchText}
                    onChangeText={handleSearch}
                    style={styles.searchInput}
                />
                <TouchableOpacity activeOpacity={0.7}>
                    <Feather name="sliders" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipList}
            >
                <FilterChip
                    label="Yakınımda"
                    active={activeFilter === 'nearby'}
                    onPress={() => handleFilterPress('nearby')}
                />
                <FilterChip
                    label="7/24 Acil"
                    active={activeFilter === '24_7'}
                    onPress={() => handleFilterPress('24_7')}
                />
                <FilterChip
                    label="Puanı Yüksek"
                    active={activeFilter === 'top_rated'}
                    onPress={() => handleFilterPress('top_rated')}
                />
            </ScrollView>
        </>
    );

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <AppText style={styles.title}>Klinik Bul</AppText>
                    <AppText style={styles.subtitle}>
                        Pamuk için en yakın sağlık merkezini seçin
                    </AppText>
                </View>
                <View style={styles.pawBadge}>
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
                contentContainerStyle={styles.listContent}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerText: { flex: 1 },
    title: {
        fontSize: 28,
        color: COLORS.primary,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 4,
    },
    pawBadge: {
        backgroundColor: COLORS.tint + '1A', // 10 % opacity
        borderRadius: 50,
        padding: 10,
        marginLeft: 12,
        marginTop: 2,
    },

    // Search bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: COLORS.primary,
        fontFamily: 'Domine-Regular',
        fontSize: 14,
    },

    // Filter chips
    chipList: {
        paddingHorizontal: 16,
        paddingBottom: 14,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 50,
    },
    filterChipActive: {
        backgroundColor: COLORS.tint,
    },
    filterChipInactive: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.quaternary,
    },
    filterChipText: {
        fontSize: 13,
    },

    // Card
    card: {
        backgroundColor: COLORS.card,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    cardBody: {
        flexDirection: 'row',
        padding: 14,
    },
    clinicImageBox: {
        width: 88,
        height: 88,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardInfo: { flex: 1 },
    clinicName: {
        fontSize: 15,
        color: COLORS.primary,
        marginBottom: 7,
        lineHeight: 20,
    },

    // Status row
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
    },
    statusText: { fontSize: 13 },
    dot: {
        fontSize: 13,
        color: COLORS.tertiary,
    },
    distanceText: {
        fontSize: 13,
        color: COLORS.tertiary,
    },

    // Tags
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    serviceTag: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    serviceTagText: {
        fontSize: 11,
        color: COLORS.secondary,
    },

    // Rating badge (absolute inside clinicImageBox)
    ratingBadge: {
        position: 'absolute',
        top: 7,
        right: 7,
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    ratingText: {
        fontSize: 11,
        color: COLORS.primary,
        marginLeft: 2,
    },

    // Card footer
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: COLORS.quaternary,
        paddingHorizontal: 14,
        paddingVertical: 9,
        alignItems: 'flex-end',
    },
    detailsLink: {
        fontSize: 13,
        color: COLORS.tint,
    },

    // List
    listContent: {
        paddingBottom: 110,
    },

    // Empty / loading
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 14,
        fontSize: 15,
        color: COLORS.tertiary,
    },
});
