import { Tabs } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false ,title:""}}>
            <Tabs.Screen name="index" options={{

          tabBarIcon: ({ color }) => <AntDesign size={28} name="home" color={color} />,
        }} 
            
            />
            <Tabs.Screen name="calendar" options={{ headerShown: false,
                tabBarIcon: ({ color }) => <AntDesign size={28} name="calendar" color={color} />,
            }} />
            <Tabs.Screen name="clinic" options={{ headerShown: false,
                tabBarIcon: ({ color }) => <FontAwesome5 name="clinic-medical" size={24} color={color} />,
            }} />
            <Tabs.Screen name="chat" options={{ headerShown: false,
                tabBarIcon: ({ color }) => <Ionicons name="chatbox" size={24} color={color} />,
            }} />
            <Tabs.Screen name="profile" options={{ headerShown: false,
                tabBarIcon: ({ color }) => <FontAwesome5 name="user-alt" size={24} color={color} /> ,
            }} />
        </Tabs>
    );
}