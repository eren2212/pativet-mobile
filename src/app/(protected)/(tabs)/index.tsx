import { View, Text, Button } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import Loading from '@/components/loading/Loading';


export default function Calendar() {
    const { signOut, user } = useAuthStore();
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-2xl font-bold text-black">Home</Text>
            <Text className="text-2xl font-bold text-black">{user?.email}</Text>
            <Button title="Sign Out" onPress={() => signOut()} />
        </View>
    );
}