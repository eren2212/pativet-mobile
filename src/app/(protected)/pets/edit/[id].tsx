import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    Alert,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AppText } from '@/components/AppText';
import { usePetsStore, UpdatePetInput, PetDetail } from '@/store/usePetsStore';
import BackButton from '@/components/BackButton';
import Loading from '@/components/loading/Loading';

// ─── Statik Veriler ──────────────────────────────────────────────────────────

const BREEDS_DATA: Record<string, string[]> = {
    KEDİ: ['Tekir', 'Van Kedisi', 'British Shorthair', 'Scottish Fold', 'Siyam', 'Maine Coon', 'Pers Kedisi', 'Ragdoll', 'Ankara Kedisi', 'Bengalli', 'Abyssinian', 'Rus Mavisi', 'Diğer'],
    KÖPEK: ['Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Husky', 'Chihuahua', 'Dachshund', 'Boxer', 'Pomeranian', 'Kangal', 'Çoban Köpeği', 'Diğer'],
    TAVŞAN: ['Hollanda Cüce', 'Rex', 'Angora', 'Lop', 'Mini Rex', 'Flemish Giant', 'Diğer'],
    HAMSTER: ['Suriye Hamster', 'Cüce Hamster', 'Roborovski', 'Campbell', 'Diğer'],
    KUŞ: ['Muhabbet Kuşu', 'Sultan Papağanı', 'Kanarya', 'Jako', 'Amazon Papağanı', 'Diğer'],
    BALIK: ['Japon Balığı', 'Koi', 'Tropik Balık', 'Melek Balığı', 'Diğer'],
    DİĞER: ['Belirtilmedi'],
};

const GENDER_DATA = [
    { value: 'Erkek', label: 'Erkek' },
    { value: 'Dişi', label: 'Dişi' },
    { value: 'Belirsiz', label: 'Belirsiz' },
];

// ─── Yardımcı ────────────────────────────────────────────────────────────────

const formatDateDisplay = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}.${m}.${date.getFullYear()}`;
};

const toISODate = (date: Date) => date.toISOString().split('T')[0];

// ─── Dropdown Bileşeni ───────────────────────────────────────────────────────

interface DropdownItem { value: string; label: string }

function SelectModal({
    visible, title, items, selected, onSelect, onClose,
}: {
    visible: boolean; title: string; items: DropdownItem[];
    selected: string; onSelect: (v: string) => void; onClose: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
            <View className="flex-1 justify-end">
                <TouchableOpacity className="absolute inset-0 bg-black/40" activeOpacity={1} onPress={onClose} />
                <View className="bg-card rounded-t-3xl px-6 pt-5 pb-8" style={{ maxHeight: 420 }}>
                    <View className="w-10 h-1 rounded-full bg-quaternary self-center mb-4" />
                    <AppText className="text-lg font-ozel text-primary text-center mb-4">{title}</AppText>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.value}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => { onSelect(item.value); onClose(); }}
                                className="flex-row items-center py-3.5"
                                style={{ borderBottomWidth: index < items.length - 1 ? 1 : 0, borderBottomColor: '#E2E8F0' }}
                                activeOpacity={0.7}
                            >
                                <AppText className={`flex-1 text-base ${selected === item.value ? 'text-tint' : 'text-primary'}`}>
                                    {item.label}
                                </AppText>
                                {selected === item.value && <Ionicons name="checkmark-circle" size={20} color="#38AEE6" />}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

// ─── Takvim Modalı ───────────────────────────────────────────────────────────

function DatePickerModal({ visible, date, onChange, onClose }: {
    visible: boolean; date: Date; onChange: (d: Date) => void; onClose: () => void;
}) {
    const [temp, setTemp] = useState(date);

    const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
        if (selected) {
            setTemp(selected);
            if (Platform.OS === 'android') { onChange(selected); onClose(); }
        } else if (Platform.OS === 'android') { onClose(); }
    };

    if (Platform.OS === 'android') {
        return visible ? (
            <DateTimePicker value={temp} mode="date" display="default" onChange={handleChange} maximumDate={new Date()} />
        ) : null;
    }

    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
            <View className="flex-1 justify-end">
                <TouchableOpacity className="absolute inset-0 bg-black/40" activeOpacity={1} onPress={onClose} />
                <View className="bg-card rounded-t-3xl pt-4 pb-8">
                    <View className="w-10 h-1 rounded-full bg-quaternary self-center mb-2" />
                    <View className="flex-row items-center justify-between px-6 mb-2">
                        <TouchableOpacity onPress={onClose}>
                            <AppText className="text-base text-secondary">İptal</AppText>
                        </TouchableOpacity>
                        <AppText className="text-lg font-ozel text-primary">Tarih Seç</AppText>
                        <TouchableOpacity onPress={() => { onChange(temp); onClose(); }}>
                            <AppText className="text-base text-tint font-ozel-semi-bold">Tamam</AppText>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={temp}
                        mode="date"
                        display="spinner"
                        onChange={handleChange}
                        maximumDate={new Date()}
                        locale="tr-TR"
                        style={{ height: 180 }}
                    />
                </View>
            </View>
        </Modal>
    );
}

// ─── Dropdown Alanı ─────────────────────────────────────────────────────────

function SelectField({
    label, value, placeholder, onPress, disabled, icon,
}: {
    label: string; value: string; placeholder: string;
    onPress: () => void; disabled?: boolean; icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View className="mb-5">
            <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">{label}</AppText>
            <TouchableOpacity
                onPress={disabled ? undefined : onPress}
                activeOpacity={disabled ? 1 : 0.7}
                className={`flex-row items-center bg-card border-2 border-quaternary rounded-xl px-4 py-3.5 ${disabled ? 'opacity-50' : ''}`}
            >
                <Ionicons name={icon} size={20} color="#94A3B8" />
                <AppText className={`flex-1 text-base ml-3 ${value ? 'text-primary' : 'text-tertiary'}`}>
                    {value || placeholder}
                </AppText>
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>
        </View>
    );
}

// ─── Kırmızı Input Alanı (salt gösterme) ────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <View className="mb-5">
            <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">{label}</AppText>
            <View className="flex-row items-center bg-background border-2 border-quaternary rounded-xl px-4 py-3.5">
                <AppText className="flex-1 text-base text-secondary">{value}</AppText>
                <Ionicons name="lock-closed-outline" size={16} color="#CBD5E1" />
            </View>
        </View>
    );
}

// ─── Ana Sayfa ───────────────────────────────────────────────────────────────

export default function EditPet() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { fetchPetById, updatePet, deletePet, uploadAvatar, isLoading } = usePetsStore();

    const [pet, setPet] = useState<PetDetail | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [breed, setBreed] = useState('');
    const [gender, setGender] = useState('');
    const [weight, setWeight] = useState('');
    const [chipNumber, setChipNumber] = useState('');
    const [birthDate, setBirthDate] = useState<Date | null>(null);

    // Avatar
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState('image/jpeg');
    const [avatarChanged, setAvatarChanged] = useState(false);

    // Modal görünürlükleri
    const [showBreedModal, setShowBreedModal] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ─── Veri Çek ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!id) return;
        (async () => {
            const data = await fetchPetById(id);
            if (data) {
                setPet(data);
                setName(data.name ?? '');
                setBreed(data.breed ?? '');
                setGender(data.gender ?? '');
                setWeight(data.weight != null ? String(data.weight) : '');
                setChipNumber(data.chip_number ?? '');
                setAvatarUri(data.avatar_url ?? null);
            }
            setIsFetching(false);
        })();
    }, [id]);

    // ─── Fotoğraf Seç ────────────────────────────────────────────────────────

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri iznine ihtiyaç duyuluyor.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });
        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            setImageMimeType(result.assets[0].mimeType ?? 'image/jpeg');
            setAvatarChanged(true);
        }
    };

    // ─── Kaydet ──────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Uyarı', 'Hayvan adı boş bırakılamaz.');
            return;
        }

        const payload: UpdatePetInput = {
            name: name.trim(),
            breed: breed || undefined,
            gender: gender || undefined,
            weight: weight ? parseFloat(weight) : undefined,
            chip_number: chipNumber || undefined,
            birth_date: birthDate ? toISODate(birthDate) : undefined,
        };

        const updated = await updatePet(id, payload);
        if (!updated) {
            Alert.alert('Hata', 'Güncelleme sırasında bir sorun oluştu.');
            return;
        }

        if (avatarChanged && avatarUri) {
            await uploadAvatar(id, avatarUri, imageMimeType);
        }

        router.back();
    };

    // ─── Sil ─────────────────────────────────────────────────────────────────

    const handleDelete = () => {
        Alert.alert(
            'Hayvanı Sil',
            `${pet?.name ?? 'Bu hayvanı'} silmek istediğine emin misin? Bu işlem geri alınamaz.`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Evet, Sil',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deletePet(id);
                        if (success) router.replace('/pets');
                        else Alert.alert('Hata', 'Silme işlemi başarısız.');
                    },
                },
            ]
        );
    };

    const breedItems: DropdownItem[] = (BREEDS_DATA[pet?.species ?? ''] ?? []).map((b) => ({ value: b, label: b }));

    // Değişiklik kontrolü
    const hasChanges = pet ? (
        name.trim() !== (pet.name ?? '') ||
        breed !== (pet.breed ?? '') ||
        gender !== (pet.gender ?? '') ||
        weight !== (pet.weight != null ? String(pet.weight) : '') ||
        chipNumber !== (pet.chip_number ?? '') ||
        avatarChanged ||
        birthDate !== null // Doğum tarihi değiştirilmişse
    ) : false;

    const isFormValid = name.trim().length > 0 && hasChanges;

    // ─── Loading ─────────────────────────────────────────────────────────────

    if (isFetching) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Loading />
            </SafeAreaView>
        );
    }

    if (!pet) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
                <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
                <AppText className="text-primary font-ozel text-lg mt-4 text-center">Hayvan bulunamadı</AppText>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <AppText className="text-tint text-base">Geri Dön</AppText>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 160 }}
                >
                    {/* ── Header ── */}
                    <View className=" px-6 relative mt-8 justify-center items-center ">
                        <BackButton />
                        <AppText className="text-lg font-ozel text-primary text-center">
                            {pet.name} Düzenle
                        </AppText>
                    </View>


                    {/* ── Avatar ── */}
                    <View className="items-center mt-4 mb-8">
                        <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                            <View className="w-28 h-28 rounded-full overflow-hidden bg-radial1 border-2 border-quaternary">
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                ) : (
                                    <View className="flex-1 items-center justify-center">
                                        <AppText className="text-3xl font-ozel text-tint">
                                            {pet.name.slice(0, 2).toUpperCase()}
                                        </AppText>
                                    </View>
                                )}
                            </View>
                            <View
                                className="absolute bottom-0 right-0 w-9 h-9 bg-tint rounded-full items-center justify-center"
                                style={{ shadowColor: '#38AEE6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 }}
                            >
                                <Ionicons name="camera" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* ── Form ── */}
                    <View className="px-6">

                        {/* Tür (salt okunur) */}
                        <InfoField label="Tür" value={pet.species} />

                        {/* Adı */}
                        <View className="mb-5">
                            <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">Adı</AppText>
                            <View className="flex-row items-center bg-card border-2 border-quaternary rounded-xl px-4 py-3">
                                <Ionicons name="paw-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Hayvan adı"
                                    placeholderTextColor="#94A3B8"
                                    className="flex-1 text-base text-primary font-ozel-regular ml-3"
                                    style={{ minHeight: 40, paddingVertical: 0 }}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        {/* Cins */}
                        <SelectField
                            label="Cinsi"
                            value={breed}
                            placeholder="Cins seçin"
                            onPress={() => setShowBreedModal(true)}
                            icon="list-outline"
                        />

                        {/* Cinsiyet */}
                        <SelectField
                            label="Cinsiyeti"
                            value={gender}
                            placeholder="Cinsiyet seçin"
                            onPress={() => setShowGenderModal(true)}
                            icon="male-female-outline"
                        />

                        {/* Kilo ve Doğum Tarihi - 2 Kolon */}
                        <View className="flex-row gap-x-4 mb-5">
                            {/* Kilosu */}
                            <View className="flex-1">
                                <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">Kilosu</AppText>
                                <View className="flex-row items-center bg-card border-2 border-quaternary rounded-xl px-4 py-3">
                                    <TextInput
                                        value={weight}
                                        onChangeText={setWeight}
                                        placeholder="0.0"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="decimal-pad"
                                        className="flex-1 text-base text-primary font-ozel-regular"
                                        style={{ minHeight: 40, paddingVertical: 0 }}
                                    />
                                    <AppText className="text-sm text-tertiary ml-1">kg</AppText>
                                </View>
                            </View>

                            {/* Yaş (hesaplanmış, salt okunur) */}
                            <View className="flex-1">
                                <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">Yaşı</AppText>
                                <View className="flex-row items-center bg-background border-2 border-quaternary rounded-xl px-4 py-3">
                                    <AppText className="flex-1 text-base text-secondary font-ozel-regular" style={{ minHeight: 40, textAlignVertical: 'center', lineHeight: 40 }}>
                                        {pet.age ?? '—'}
                                    </AppText>
                                </View>
                            </View>
                        </View>

                        {/* Doğum Tarihi */}
                        <View className="mb-5">
                            <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">Doğum Tarihi</AppText>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                                className="flex-row items-center bg-card border-2 border-quaternary rounded-xl px-4 py-3.5"
                            >
                                <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
                                <AppText className={`flex-1 text-base ml-3 ${birthDate ? 'text-primary' : 'text-tertiary'}`}>
                                    {birthDate ? formatDateDisplay(birthDate) : 'Tarih güncelle (isteğe bağlı)'}
                                </AppText>
                                {birthDate ? (
                                    <TouchableOpacity onPress={() => setBirthDate(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                                    </TouchableOpacity>
                                ) : (
                                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Çip Numarası */}
                        <View className="mb-5">
                            <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">Çip Numarası</AppText>
                            <View className="flex-row items-center bg-card border-2 border-quaternary rounded-xl px-4 py-3">
                                <TextInput
                                    value={chipNumber}
                                    onChangeText={setChipNumber}
                                    placeholder="000000000000000"
                                    placeholderTextColor="#94A3B8"
                                    className="flex-1 text-base text-primary font-ozel-regular"
                                    style={{ minHeight: 40, paddingVertical: 0 }}
                                    keyboardType="number-pad"
                                    maxLength={20}
                                />
                                <Ionicons name="qr-code-outline" size={20} color="#94A3B8" />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* ── Alt Butonlar ── */}
                <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 bg-background/95 gap-y-3">
                    {/* Kaydet */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!isFormValid || isLoading}
                        activeOpacity={0.85}
                        className={`rounded-2xl py-4 items-center flex-row justify-center ${isFormValid ? 'bg-cute' : 'bg-quaternary'}`}
                        style={isFormValid ? {
                            shadowColor: '#3B82F6',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5,
                        } : undefined}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <AppText className={`font-ozel text-base ${isFormValid ? 'text-white' : 'text-tertiary'}`}>
                                Değişiklikleri Kaydet
                            </AppText>
                        )}
                    </TouchableOpacity>

                    {/* Sil */}
                    <TouchableOpacity
                        onPress={handleDelete}
                        disabled={isLoading}
                        activeOpacity={0.85}
                        className="rounded-2xl py-4 items-center bg-error/30"
                    >
                        <AppText className="text-primary font-ozel text-base ">Bu Hayvanı Sil</AppText>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* ── Modaller ── */}
            <SelectModal
                visible={showBreedModal}
                title="Cins Seçin"
                items={breedItems}
                selected={breed}
                onSelect={setBreed}
                onClose={() => setShowBreedModal(false)}
            />
            <SelectModal
                visible={showGenderModal}
                title="Cinsiyet Seçin"
                items={GENDER_DATA}
                selected={gender}
                onSelect={setGender}
                onClose={() => setShowGenderModal(false)}
            />
            <DatePickerModal
                visible={showDatePicker}
                date={birthDate ?? new Date()}
                onChange={setBirthDate}
                onClose={() => setShowDatePicker(false)}
            />
        </SafeAreaView>
    );
}
