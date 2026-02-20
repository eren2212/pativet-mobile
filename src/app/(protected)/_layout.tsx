import { useAuthStore } from "@/store/useAuthStore";
import { Redirect, Stack } from "expo-router";


export default function ProtectedLayout() {

    const { user } = useAuthStore();
    if (!user) {
        return <Redirect href="/signin" />
    }
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="pets/index" options={{ headerShown: false }} />
            <Stack.Screen name="pets/add" options={{ headerShown: false }} />
            <Stack.Screen name="pets/edit/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}