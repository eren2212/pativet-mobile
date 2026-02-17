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
import InputText from '@/components/InputText';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';


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
        <View className="px-6 pt-12 mt-10 pb-8">


          {/* Logo */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="paw" size={32} color="#1E90FF" />
            </View>
          </View>

          {/* Title and subtitle */}
          <AppText className="text-3xl  text-primary mb-2 text-center">
            Hesap Oluştur
          </AppText>
          <AppText className="text-sm text-secondary mb-6 text-center">
            Pativet'e katılın ve evcil hayvanınızın sağlığını takip edin.
          </AppText>

          {/* Form Fields */}
          <View className="space-y-4 gap-2">
            {/* Full Name Input */}
            <InputText
              leftIcon="person-outline"
              placeholder="Adınız Soyadınız"
              label="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              containerClassName="mb-0"
              autoCapitalize="words"
            />

            {/* Email Input */}
            <InputText
              leftIcon="mail-outline"
              placeholder="ornek@email.com"
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerClassName="mb-0"
            />
            {/* Phone Input */}
            <InputText
              leftIcon="call-outline"
              placeholder="05XX XXX XX XX"
              keyboardType="phone-pad"
              label="Telefon"
              value={phone}
              onChangeText={setPhone}
              containerClassName="mb-0"
            />

            {/* Password Input */}
            <InputText
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              placeholder="••••••••"
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              containerClassName="mb-2"
            />

            {/* KVKK Checkbox */}
            <View className="flex-row items-start mb-6">
              <TouchableOpacity
                onPress={() => setAcceptedKVKK(!acceptedKVKK)}
                className="mt-1"
              >
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${acceptedKVKK ? 'bg-cute border-cute' : 'border-gray-300'
                    }`}
                >
                  {acceptedKVKK && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <AppText className="flex-1 ml-3 text-sm text-gray-600">
                <AppText
                  className="text-cute underline"
                  onPress={() => Alert.alert('KVKK', 'KVKK Aydınlatma Metni')}
                >
                  KVKK Aydınlatma Metnini
                </AppText>{' '}
                okudum ve kabul ediyorum.
              </AppText>
            </View>

            {/* Sign Up Button */}
            <Button
              title="Kayıt Ol"
              onPress={handleSignUp}
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
              className="mb-1"
            />

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center mt-6 mb-8">
              <AppText >Zaten bir hesabınız var mı? </AppText>
              <TouchableOpacity onPress={() => router.replace('/signin')}>
                <AppText className="text-cute font-semibold">Giriş Yap</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
