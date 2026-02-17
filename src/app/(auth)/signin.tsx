import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-sky-300 to-white"
      style={{ backgroundColor: '#E0F7FF' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-16">
          {/* Logo Card */}
          <View className="bg-white/40 rounded-3xl p-8 items-center mb-8 shadow-lg backdrop-blur-lg">
            <View className="bg-white/60 rounded-2xl p-6 items-center justify-center mb-4">
              <View className="bg-white rounded-2xl p-4">
                <Ionicons name="paw" size={48} color="#1E90FF" />
              </View>
              <View className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2">
                <Ionicons name="medical" size={16} color="white" />
              </View>
            </View>
            <Text className="text-3xl font-bold text-white mb-1">
              PetCare+
            </Text>
            <Text className="text-base text-white/80">
              Sağlık Takip Asistanı
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-blue-900 mb-2">
              Hoş Geldiniz
            </Text>
            <Text className="text-base text-gray-600">
              Devam etmek için lütfen giriş yapın.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            {/* Email Input */}
            <View className="mb-4">
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-800"
                  placeholder="E-posta"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-800"
                  placeholder="Şifre"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
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
                <Text className="text-blue-500 font-medium">
                  Şifremi Unuttum?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              className={`bg-blue-500 rounded-xl py-4 items-center flex-row justify-center shadow-lg ${
                isLoading ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-white text-lg font-semibold mr-2">
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Text>
              {!isLoading && (
                <Ionicons name="arrow-forward" size={20} color="white" />
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Henüz hesabınız yok mu? </Text>
              <TouchableOpacity onPress={() => router.replace('/signup')}>
                <Text className="text-blue-500 font-semibold">Kayıt Ol</Text>
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
