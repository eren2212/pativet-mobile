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

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedKVKK, setAcceptedKVKK] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuthStore();

  const handleSignUp = async () => {
    // Validasyonlar
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Hata', 'Lütfen telefon numaranızı giriniz.');
      return;
    }
    if (!password) {
      Alert.alert('Hata', 'Lütfen şifrenizi giriniz.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (!acceptedKVKK) {
      Alert.alert('Hata', 'Lütfen KVKK Aydınlatma Metnini okuyup kabul ediniz.');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName, phone);
    setIsLoading(false);

    if (error) {
      Alert.alert('Hata', error.message || 'Kayıt olurken bir hata oluştu.');
    } else {
      Alert.alert('Başarılı', 'Kayıt işlemi başarılı! Giriş yapabilirsiniz.');
      router.replace('/signin');
    }
  };

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
        {/* Header with back button and logo */}
        <View className="px-6 pt-12 pb-8">


          {/* Logo */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="paw" size={32} color="#1E90FF" />
            </View>
          </View>

          {/* Title and subtitle */}
          <Text className="text-3xl font-bold text-gray-800 text-center mb-2">
            Hesap Oluştur
          </Text>
          <Text className="text-base text-gray-500 text-center mb-8">
            VetCare'e katılın ve evcil hayvanınızın sağlığını takip edin.
          </Text>

          {/* Form Fields */}
          <View className="space-y-4">
            {/* Full Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-800"
                  placeholder="Adınız Soyadınız"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                E-posta
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-800"
                  placeholder="ornek@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Telefon
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-800"
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Şifre
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-800"
                  placeholder="••••••••"
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

            {/* KVKK Checkbox */}
            <View className="flex-row items-start mb-6">
              <TouchableOpacity
                onPress={() => setAcceptedKVKK(!acceptedKVKK)}
                className="mt-1"
              >
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${
                    acceptedKVKK ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}
                >
                  {acceptedKVKK && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <Text className="flex-1 ml-3 text-sm text-gray-600">
                <Text
                  className="text-blue-500 underline"
                  onPress={() => Alert.alert('KVKK', 'KVKK Aydınlatma Metni')}
                >
                  KVKK Aydınlatma Metnini
                </Text>{' '}
                okudum ve kabul ediyorum.
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={isLoading}
              className={`bg-blue-500 rounded-xl py-4 items-center ${
                isLoading ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-white text-lg font-semibold">
                {isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center mt-6 mb-8">
              <Text className="text-gray-600">Zaten bir hesabınız var mı? </Text>
              <TouchableOpacity onPress={() => router.replace('/signin')}>
                <Text className="text-blue-500 font-semibold">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
