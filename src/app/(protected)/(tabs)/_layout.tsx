import { Tabs } from "expo-router";
import { Platform, Pressable } from "react-native";
import { useEffect } from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming
} from 'react-native-reanimated';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import COLORS from "@/theme/color"; // Bebek mavili paletimiz

// --- 1. HER TIKLAMAYI YAKALAYAN ÖZEL TAB BUTONUMUZ ---
const CustomTabButton = (props: any) => {
    const { onPress, accessibilityState, children, style } = props;
    const focused = accessibilityState?.selected;

    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);

    // Sihrin gerçekleştiği yer: HER fiziksel tıklamada burası çalışır
    const handlePress = (e: any) => {
        // 1. Animasyonu zorla tetikle (Şu anki değer ne olursa olsun fırlatır)
        rotation.value = withSequence(
            withTiming(-15, { duration: 80 }),
            withTiming(15, { duration: 80 }),
            withTiming(-10, { duration: 80 }),
            withSpring(0, { damping: 3, stiffness: 80 })
        );

        // 2. React Navigation'ın kendi sekme değiştirme işlemini çalıştır
        if (onPress) onPress(e);
    };

    // Sadece sekmeden ayrıldığımızda ikonun tekrar küçülmesi için useEffect kullanıyoruz
    useEffect(() => {
        if (!focused) {
            scale.value = withSpring(1);
            rotation.value = withTiming(0);
        } else {
            // Uygulama ilk açıldığında aktif sekmenin büyük durması için
            scale.value = withSpring(1.2, { damping: 10, stiffness: 100 });
        }
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}deg` }
            ]
        };
    });

    return (
        // Orijinal style'ı alıyoruz ve ikonları tam ortalayacak şekilde esnetiyoruz
        <Pressable
            onPress={handlePress}
            style={[style, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}
        >
            <Animated.View style={animatedStyle}>
                {/* İçerik (İkon) buraya otomatik olarak düşecek */}
                {children}
            </Animated.View>
        </Pressable>
    );
};

// --- 2. TABS LAYOUT ---
export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: COLORS.cute, // Kendi rengin
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarHideOnKeyboard: true,

                // BÜTÜN SEKMELERE "BENİM YAZDIĞIM BUTONU KULLAN" DİYORUZ:
                tabBarButton: (props) => <CustomTabButton {...props} />,

                tabBarStyle: {
                    position: "absolute",
                    bottom: Platform.OS === "ios" ? 25 : 15,
                    backgroundColor: COLORS.card || "#FFFFFF",
                    borderRadius: 20,
                    height: 65,
                    borderTopWidth: 0,
                    paddingTop: 24,
                    marginHorizontal: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 5,
                }
            }}
        >
            {/* ARTIK İKONLARI SARMALAMAYA GEREK YOK, KOD TERTEMİZ OLDU! */}
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