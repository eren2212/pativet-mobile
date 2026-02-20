import React, { useEffect, useCallback } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppText } from '@/components/AppText';
import { usePetsStore, Pet } from '@/store/usePetsStore';
import BackButton from '@/components/BackButton';
import Loading from '@/components/loading/Loading';

function PetAvatar({ uri, name }: { uri?: string | null; name: string }) {
    const initials = name.slice(0, 2).toUpperCase();
    if (uri) {
        return (
            <Image
                source={{ uri }}
                className="w-full h-full rounded-full"
                resizeMode="cover"
            />
        );
    }
    return (
        <View className="w-full h-full rounded-full bg-radial1 items-center justify-center">
            <AppText className="text-primary text-base font-ozel">{initials}</AppText>
        </View>
    );
}

function PetCard({ pet }: { pet: Pet }) {
    return (
        <View className="flex-row items-center bg-card rounded-2xl px-4 py-4 mb-3"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
        >
            {/* Avatar */}
            <View className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-quaternary">
                <PetAvatar uri={pet.avatar_url} name={pet.name} />
            </View>

            {/* Info */}
            <View className="flex-1">
                <AppText className="text-base font-ozel text-primary mb-0.5">{pet.name}</AppText>
                {pet.breed ? (
                    <AppText className="text-sm text-secondary">{pet.breed}</AppText>
                ) : null}
            </View>

            {/* Düzenle butonu */}
            <TouchableOpacity
                onPress={() => router.push(`/pets/edit/${pet.id}`)}
                className="w-9 h-9 rounded-full bg-radial1 items-center justify-center"
                activeOpacity={0.7}
            >
                <Ionicons name="pencil" size={16} color="#38AEE6" />
            </TouchableOpacity>
        </View>
    );
}

function EmptyState() {
    return (
        <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 rounded-full bg-radial1 items-center justify-center mb-6">
                <Ionicons name="paw" size={48} color="#38AEE6" />
            </View>
            <AppText className="text-xl font-ozel text-primary text-center mb-2">
                Henüz Hayvanın Yok
            </AppText>
            <AppText className="text-sm text-secondary text-center mb-8">
                İlk evcil dostunu ekleyerek başla!
            </AppText>
            <TouchableOpacity
                onPress={() => router.push('/pets/add')}
                className="bg-cute px-8 py-4 rounded-2xl"
                activeOpacity={0.8}
            >
                <AppText className="text-white font-ozel text-base">+ Hayvan Ekle</AppText>
            </TouchableOpacity>
        </View>
    );
}

export default function MyPets() {
    const { pets, count, isLoading, fetchPets } = usePetsStore();

    const load = useCallback(async () => {
        await fetchPets();
    }, [fetchPets]);

    useEffect(() => {
        load();
    }, [load]);

    if (isLoading && pets.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Loading />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-center px-6 pt-4 pb-4 relative mt-4 mb-4">
                <BackButton />
                <AppText className="text-lg font-ozel text-primary text-center">
                    Evcil Hayvanlarım
                </AppText>
            </View>

            {count === 0 && !isLoading ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <PetCard pet={item} />}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    onRefresh={load}
                    refreshing={isLoading}
                />
            )}

            {/* FAB - Yeni Ekle */}
            {count > 0 && (
                <TouchableOpacity
                    onPress={() => router.push('/pets/add')}
                    className="absolute bottom-10 right-6 bg-cute rounded-full px-5 py-3.5 flex-row items-center"
                    activeOpacity={0.85}
                    style={{
                        shadowColor: '#3B82F6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <AppText className="text-white font-ozel text-base ml-1">Yeni Ekle</AppText>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}
