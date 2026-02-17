import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import Loading from '@/components/loading/Loading';
import "../../global.css";

export default function App() {
  const { setSession, isInitialized, user } = useAuthStore();

  // 1. SUPABASE BİLGİLERİNİ ÇEKME (Sarı uyarıyı engelleyen temiz yapı)
  useEffect(() => {
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
  }, []);

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