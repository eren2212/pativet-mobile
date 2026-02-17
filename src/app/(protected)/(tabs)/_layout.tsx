import { Tabs } from "expo-router";
import { Platform } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import COLORS from "@/theme/color"; // Senin hazırladığımız renk paletin

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false, // Alt yazıları tamamen gizler, ikonları merkeze çeker
                tabBarActiveTintColor: COLORS.cute, // Aktif ikon rengi (Bebek mavisi vs.)
                tabBarInactiveTintColor: COLORS.secondary, // Pasif ikon rengi
                tabBarHideOnKeyboard: true, // Kanka bu çok önemli: Chat ekranında klavye açılınca menü yukarı zıplamaz!

                // Asıl şovu yaptığımız yer: tabBarStyle
                tabBarStyle: {
                    position: "absolute", // Menüyü ekrandan koparıp havada (floating) durmasını sağlar
                    bottom: Platform.OS === "ios" ? 25 : 15, // Cihazın altına yapışmasın diye boşluk
                    backgroundColor: COLORS.card || "#FFFFFF", // Kartın arka plan rengi
                    borderRadius: 20, // Köşeleri yumuşatır
                    height: 65, // Menü kalınlığı
                    borderTopWidth: 0, // Üstteki o varsayılan çirkin ince gri çizgiyi yok eder
                    paddingTop: 12,
                    marginHorizontal: 20,
                    // iOS için gölge ayarları
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,

                    // Android için gölge ayarı
                    elevation: 5,
                },
                tabBarItemStyle: {
                    // İkonların tıklanma alanını ve ortalamasını düzenler
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color }) => <AntDesign size={26} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    tabBarIcon: ({ color }) => <AntDesign size={26} name="calendar" color={color} />,
                }}
            />
            <Tabs.Screen
                name="clinic"
                options={{
                    tabBarIcon: ({ color }) => <FontAwesome5 name="clinic-medical" size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="chatbox" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color }) => <FontAwesome5 name="user-alt" size={22} color={color} />,
                }}
            />
        </Tabs>
    );
}