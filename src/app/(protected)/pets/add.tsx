import React, { useState } from 'react';
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
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AppText } from '@/components/AppText';
import { usePetsStore, CreatePetInput } from '@/store/usePetsStore';
import BackButton from '@/components/BackButton';

// ─── Statik Veriler ──────────────────────────────────────────────────────────

const SPECIES_DATA = [
    { value: 'KEDİ', label: 'Kedi', icon: 'fish-outline' as const },
    { value: 'KÖPEK', label: 'Köpek', icon: 'paw-outline' as const },
    { value: 'TAVŞAN', label: 'Tavşan', icon: 'leaf-outline' as const },
    { value: 'HAMSTER', label: 'Hamster', icon: 'ellipse-outline' as const },
    { value: 'KUŞ', label: 'Kuş', icon: 'paper-plane-outline' as const },
    { value: 'BALIK', label: 'Balık', icon: 'water-outline' as const },
    { value: 'DİĞER', label: 'Diğer', icon: 'help-circle-outline' as const },
] as const;

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

// ─── Yardımcı Fonksiyon ──────────────────────────────────────────────────────

const formatDateDisplay = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

const toISODate = (date: Date): string =>
    date.toISOString().split('T')[0];

// ─── Dropdown Bileşeni ──────────────────────────────────────────────────────

interface DropdownItem { value: string; label: string }

interface SelectModalProps {
    visible: boolean;
    title: string;
    items: DropdownItem[];
    selected: string;
    onSelect: (value: string) => void;
    onClose: () => void;
}

function SelectModal({ visible, title, items, selected, onSelect, onClose }: SelectModalProps) {
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
                                {selected === item.value && (
                                    <Ionicons name="checkmark-circle" size={20} color="#38AEE6" />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

// ─── Takvim Modalı ───────────────────────────────────────────────────────────

interface DatePickerModalProps {
    visible: boolean;
    date: Date;
    onChange: (date: Date) => void;
    onClose: () => void;
}

function DatePickerModal({ visible, date, onChange, onClose }: DatePickerModalProps) {
    const [tempDate, setTempDate] = useState(date);

    const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
        if (selected) {
            setTempDate(selected);
            if (Platform.OS === 'android') {
                onChange(selected);
                onClose();
            }
        } else if (Platform.OS === 'android') {
            onClose();
        }
    };

    if (Platform.OS === 'android') {
        return visible ? (
            <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={handleChange}
                maximumDate={new Date()}
            />
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
                        <TouchableOpacity onPress={() => { onChange(tempDate); onClose(); }}>
                            <AppText className="text-base text-tint font-ozel-semi-bold">Tamam</AppText>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={tempDate}
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

interface SelectFieldProps {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    disabled?: boolean;
    error?: string;
    icon: keyof typeof Ionicons.glyphMap;
}

function SelectField({ label, value, placeholder, onPress, disabled, error, icon }: SelectFieldProps) {
    return (
        <View className="mb-5">
            <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">{label}</AppText>
            <TouchableOpacity
                onPress={disabled ? undefined : onPress}
                activeOpacity={disabled ? 1 : 0.7}
                className={`flex-row items-center bg-card border-2 rounded-xl px-4 py-3.5 ${error ? 'border-error' : 'border-quaternary'} ${disabled ? 'opacity-50' : ''}`}
            >
                <Ionicons name={icon} size={20} color="#94A3B8" />
                <AppText className={`flex-1 text-base ml-3 ${value ? 'text-primary' : 'text-tertiary'}`}>
                    {value || placeholder}
                </AppText>
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>
            {error ? <AppText className="text-xs text-error mt-1">{error}</AppText> : null}
        </View>
    );
}

// ─── Ana Ekran ───────────────────────────────────────────────────────────────

export default function AddPet() {
    const { createPet, uploadAvatar, isLoading } = usePetsStore();

    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [breed, setBreed] = useState('');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState('image/jpeg');

    const [showSpeciesModal, setShowSpeciesModal] = useState(false);
    const [showBreedModal, setShowBreedModal] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const isFormValid = name.trim().length > 0 && species.length > 0;

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
            setImageUri(result.assets[0].uri);
            setImageMimeType(result.assets[0].mimeType ?? 'image/jpeg');
        }
    };

    // ─── Kaydet ──────────────────────────────────────────────────────────────

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Hayvan adı zorunludur';
        if (!species) newErrors.species = 'Tür seçimi zorunludur';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        const payload: CreatePetInput = {
            name: name.trim(),
            species,
            breed: breed || undefined,
            gender: gender || undefined,
            birth_date: birthDate ? toISODate(birthDate) : undefined,
        };

        const pet = await createPet(payload);
        if (!pet) {
            Alert.alert('Hata', 'Hayvan kaydedilirken bir sorun oluştu.');
            return;
        }

        if (imageUri) await uploadAvatar(pet.id, imageUri, imageMimeType);

        router.replace('/pets');
    };

    const handleSpeciesSelect = (value: string) => {
        setSpecies(value);
        setBreed('');
        setErrors((e) => ({ ...e, species: '' }));
    };

    const selectedSpeciesLabel = SPECIES_DATA.find((s) => s.value === species)?.label ?? '';
    const breedItems: DropdownItem[] = (BREEDS_DATA[species] ?? []).map((b) => ({ value: b, label: b }));
    const speciesItems: DropdownItem[] = SPECIES_DATA.map((s) => ({ value: s.value, label: s.label }));

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* ── Header ── */}
                    <View className=" px-6 relative mt-8 ">
                        <BackButton />
                    </View>

                    {/* ── Başlık ── */}
                    <View className="items-center mb-8">
                        <AppText className="text-2xl font-ozel text-primary mb-1.5 text-center">
                            Evcil Dostunu Ekle
                        </AppText>
                        <AppText className="text-sm text-secondary text-center">
                            Yeni dostunun profilini oluştur
                        </AppText>
                    </View>

                    {/* ── Avatar ── */}
                    <View className="items-center mb-8">
                        <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                            <View
                                className="w-28 h-28 rounded-full bg-radial1 items-center justify-center overflow-hidden"
                                style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#38AEE6' }}
                            >
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                ) : (
                                    <Ionicons name="camera-outline" size={36} color="#38AEE6" />
                                )}
                            </View>
                            <View
                                className="absolute bottom-0 right-0 w-8 h-8 bg-tint rounded-full items-center justify-center"
                                style={{ shadowColor: '#38AEE6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}
                            >
                                <Ionicons name="pencil" size={14} color="white" />
                            </View>
                        </TouchableOpacity>
                        <AppText className="text-xs text-tertiary mt-3">Fotoğraf seç (isteğe bağlı)</AppText>
                    </View>

                    {/* ── Form ── */}
                    <View className="px-6">

                        {/* Hayvan Adı */}
                        <View className="mb-5">
                            <AppText className="text-sm font-ozel-semi-bold text-primary mb-2">Hayvan Adı</AppText>
                            <View className={`flex-row items-center bg-card border-2 rounded-xl px-4 py-3 ${errors.name ? 'border-error' : 'border-quaternary'}`}>
                                <Ionicons name="paw-outline" size={20} color="#94A3B8" />
                                <TextInput
                                    value={name}
                                    onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
                                    placeholder="Örn: Boncuk"
                                    placeholderTextColor="#94A3B8"
                                    className="flex-1 text-base text-primary font-ozel-regular ml-3"
                                    style={{ minHeight: 40, paddingVertical: 0 }}
                                    autoCapitalize="words"
                                />
                            </View>
                            {errors.name ? <AppText className="text-xs text-error mt-1">{errors.name}</AppText> : null}
                        </View>

                        {/* Tür */}
                        <SelectField
                            label="Tür *"
                            value={selectedSpeciesLabel}
                            placeholder="Tür seçin"
                            onPress={() => setShowSpeciesModal(true)}
                            error={errors.species}
                            icon="paw-outline"
                        />

                        {/* Cins */}
                        <SelectField
                            label="Cins"
                            value={breed}
                            placeholder={species ? 'Cins seçin' : 'Önce tür seçin'}
                            onPress={() => setShowBreedModal(true)}
                            disabled={!species}
                            icon="list-outline"
                        />

                        {/* Cinsiyet */}
                        <SelectField
                            label="Cinsiyet"
                            value={gender}
                            placeholder="Cinsiyet seçin (isteğe bağlı)"
                            onPress={() => setShowGenderModal(true)}
                            icon="male-female-outline"
                        />

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
                                    {birthDate ? formatDateDisplay(birthDate) : 'Tarih seçin (isteğe bağlı)'}
                                </AppText>
                                {birthDate ? (
                                    <TouchableOpacity
                                        onPress={() => setBirthDate(null)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                                    </TouchableOpacity>
                                ) : (
                                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                                )}
                            </TouchableOpacity>
                            <AppText className="text-xs text-tertiary mt-1">
                                İsteğe bağlı · Yaşını hesaplamak için kullanılır
                            </AppText>
                        </View>
                    </View>
                </ScrollView>

                {/* ── Alt Buton ── */}
                <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 bg-background/95">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!isFormValid || isLoading}
                        activeOpacity={0.85}
                        className={`rounded-2xl py-4 px-6 items-center flex-row justify-center ${isFormValid ? 'bg-cute' : 'bg-quaternary'}`}
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
                            <>
                                <AppText className={`font-ozel text-base mr-2 ${isFormValid ? 'text-white' : 'text-tertiary'}`}>
                                    Kaydet
                                </AppText>
                                <Ionicons name="arrow-forward" size={18} color={isFormValid ? 'white' : '#94A3B8'} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* ── Modaller ── */}
            <SelectModal
                visible={showSpeciesModal}
                title="Tür Seçin"
                items={speciesItems}
                selected={species}
                onSelect={handleSpeciesSelect}
                onClose={() => setShowSpeciesModal(false)}
            />
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
                onChange={(d) => setBirthDate(d)}
                onClose={() => setShowDatePicker(false)}
            />
        </SafeAreaView>
    );
}
