import { useAuthStore } from "@/store/useAuthStore";
import { Redirect, Stack } from "expo-router";


export default function AuthLayout() {
    const { user } = useAuthStore();
    if (user) {
        return <Redirect href="/(protected)" />
    }
    
    return (
        <Stack>
            <Stack.Screen name="signin" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
        </Stack>
    );
}