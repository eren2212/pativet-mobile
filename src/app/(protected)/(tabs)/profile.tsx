import { View, TouchableOpacity, ScrollView } from 'react-native';
import { AppText } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function Profile() {
    const { user, signOut } = useAuthStore();

    // Kullanıcı adını al - önce full_name'i kontrol et, yoksa email'den al
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
    const userEmail = user?.email || 'email@example.com';

    const handleSignOut = async () => {
        await signOut();
    };

    const menuItems = [
        {
            id: 1,
            title: 'Evcil Hayvanlarım',
            icon: 'paw' as keyof typeof Ionicons.glyphMap,
            iconColor: '#3B82F6',
            onPress: () => router.push('/pets')
        },
        {
            id: 2,
            title: 'Bildirimler',
            icon: 'notifications' as keyof typeof Ionicons.glyphMap,
            iconColor: '#3B82F6',
            onPress: () => {
                // Bildirimler sayfasına yönlendirme yapılacak
                console.log('Bildirimler');
            }
        },
        {
            id: 3,
            title: 'Hesap Ayarları',
            icon: 'settings' as keyof typeof Ionicons.glyphMap,
            iconColor: '#3B82F6',
            onPress: () => {
                // Hesap ayarları sayfasına yönlendirme yapılacak
                console.log('Hesap Ayarları');
            }
        },
        {
            id: 4,
            title: 'Çıkış Yap',
            icon: 'log-out' as keyof typeof Ionicons.glyphMap,
            iconColor: '#EF4444',
            onPress: handleSignOut,
            isLogout: true
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 bg-background">
                <View className="flex-1 items-center px-6 pt-12">
                    {/* Profil Fotoğrafı ve Düzenle Butonu */}
                    <View className="relative mb-6">
                        {/* Profil Fotoğrafı Container */}
                        <View className="w-32 h-32 rounded-full bg-tint/20 items-center justify-center overflow-hidden border-2 border-quaternary">
                            <Ionicons name="person" size={64} color="#38AEE6" />
                        </View>
                    </View>

                    {/* Kullanıcı Bilgileri */}
                    <AppText className="text-2xl font-ozel text-primary mb-2 text-center">
                        {userName}
                    </AppText>
                    <AppText className="text-base text-secondary mb-8 text-center">
                        {userEmail}
                    </AppText>

                    {/* Menü Öğeleri */}
                    <View className="w-full bg-card rounded-3xl overflow-hidden shadow-sm border border-quaternary">
                        {menuItems.map((item, index) => (
                            <View key={item.id}>
                                <TouchableOpacity
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                    className="flex-row items-center px-6 py-5 "
                                >
                                    {/* İkon Container */}
                                    <View
                                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                        style={{
                                            backgroundColor: item.isLogout ? '#FEE2E2' : '#EFF6FF'
                                        }}
                                    >
                                        <Ionicons
                                            name={item.icon}
                                            size={24}
                                            color={item.iconColor}
                                        />
                                    </View>

                                    {/* Başlık */}
                                    <AppText
                                        className={`flex-1 text-base ${item.isLogout ? 'text-error' : 'text-primary'
                                            }`}
                                    >
                                        {item.title}
                                    </AppText>

                                    {/* Sağ Ok */}
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={item.isLogout ? '#FCA5A5' : '#CBD5E1'}
                                    />
                                </TouchableOpacity>

                                {/* Divider - Son öğeden sonra gösterme */}
                                {index < menuItems.length - 1 && (
                                    <View className="   border-b border-quaternary" />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Versiyon Bilgisi */}
                    <View className="items-center mt-12 mb-8">
                        <AppText className="text-sm text-tertiary mb-1">
                            Versiyon 1.1.0
                        </AppText>
                        <AppText className="text-xs text-tertiary">
                            © 2026 Pativet App
                        </AppText>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}