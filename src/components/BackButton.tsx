import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BackButton() {
    return (
        <View className="absolute left-8 z-10">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-card items-center justify-center shadow-md"
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-back" size={22} color="#0F172A" />
            </TouchableOpacity>
        </View>
    )
}
