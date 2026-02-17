import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputText from '@/components/InputText';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';


export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuthStore();

  const handleSignIn = async () => {
    // Validasyonlar
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!password) {
      Alert.alert('Hata', 'Lütfen şifrenizi giriniz.');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Hata', error.message || 'Giriş yaparken bir hata oluştu.');
    }
  };

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-16">
          {/* Logo Card */}
          <View className="items-center mb-4">
            <Image
              style={{ width: 250, height: 200 }}
              source={require('../../../assets/images/pativet-2.png')}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
          </View>
          {/* Welcome Text */}
          <View className="mb-8">
            <AppText className="text-3xl  text-primary mb-2 ">
              Hoş Geldiniz
            </AppText>
            <AppText className="text-base text-secondary ">
              Devam etmek için lütfen giriş yapın.
            </AppText>
          </View>

          {/* Form Fields */}
          <View className="space-y-8 gap-2">

            <View className="gap-2">
              {/* Email Input */}
              <InputText
                leftIcon="mail-outline"
                label="E-posta"
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                containerClassName="mb-0"
              />

              {/* Password Input */}
              <InputText
                label="Şifre"
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                containerClassName="mb-2"
              />
            </View>


            {/* Forgot Password Link */}
            <View className="items-end mb-6">
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Şifremi Unuttum',
                    'Şifre sıfırlama linki e-posta adresinize gönderilecektir.'
                  )
                }
              >
                <AppText className="text-cute font-medium">
                  Şifremi Unuttum?
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <Button
              title="Giriş Yap"
              onPress={handleSignIn}
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
              className="mb-6"
            />

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <AppText className="text-secondary">Henüz hesabınız yok mu? </AppText>
              <TouchableOpacity onPress={() => router.replace('/signup')}>
                <AppText className="text-cute font-semibold">Kayıt Ol</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Animal Icons */}
        <View className="flex-row justify-center items-end space-x-4 py-8 opacity-30">
          <Ionicons name="paw" size={32} color="#9CA3AF" />
          <Ionicons name="paw" size={40} color="#9CA3AF" />
          <Ionicons name="paw" size={32} color="#9CA3AF" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
