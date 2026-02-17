import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import Loading from '@/components/loading/Loading';
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { setSession, isInitialized } = useAuthStore();

  const [loaded, error] = useFonts({
    'Domine-Bold': require('../../assets/fonts/Domine-Bold.ttf'),
    'Domine-Regular': require('../../assets/fonts/Domine-Regular.ttf'),
    'Domine-Medium': require('../../assets/fonts/Domine-Medium.ttf'),
    'Domine-SemiBold': require('../../assets/fonts/Domine-SemiBold.ttf'),
  });

  // 1. SUPABASE BİLGİLERİNİ ÇEKME (Sarı uyarıyı engelleyen temiz yapı)
  useEffect(() => {

    if (loaded || error) {
      SplashScreen.hideAsync();
    }
    let authSubscription: any = null;

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
      }

      const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
      });
      authSubscription = data.subscription;
    };

    initializeAuth();

    return () => authSubscription?.unsubscribe();
  }, [loaded, error]);

  // 3. BİLGİLER ÇEKİLİRKEN EKRANA LOADING ATMA
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Loading />
      </View>
    );
  }

  // 4. SAYFAYI GÖSTER
  return <Slot />;
}