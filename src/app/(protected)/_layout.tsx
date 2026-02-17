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
        </Stack>
    );
}