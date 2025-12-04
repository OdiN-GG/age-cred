import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuthStore();
  const router = useRouter();

  const handleResetPassword = async () => {
    // Validação de email
    if (!email) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar o email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View className="flex-1 bg-white p-6 justify-center">
        <View className="items-center mb-8">
          <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={50} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Email enviado!
          </Text>
          <Text className="text-gray-600 text-center text-base">
            Enviamos um link de recuperação para
          </Text>
          <Text className="text-blue-600 font-semibold text-base mt-1">
            {email}
          </Text>
        </View>

        <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={20} color="#2563eb" className="mt-0.5" />
            <Text className="flex-1 ml-2 text-blue-900 text-sm">
              Verifique sua caixa de entrada e spam. O link é válido por 1 hora.
            </Text>
          </View>
        </View>

        <Button
          title="Voltar para o login"
          onPress={() => router.replace('/auth/login')}
          fullWidth
          className="mb-4"
        />

        <TouchableOpacity
          onPress={() => {
            setEmailSent(false);
            setEmail('');
          }}
          className="py-3"
        >
          <Text className="text-blue-600 text-center text-base font-medium">
            Reenviar email
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 p-6 pt-12">
          {/* Header */}
          <View className="mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6"
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <View className="items-center mb-6">
              <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Ionicons name="key-outline" size={32} color="#2563eb" />
              </View>
            </View>

            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Esqueceu sua senha?
            </Text>
            <Text className="text-gray-600 text-base text-center">
              Não se preocupe! Digite seu email e enviaremos instruções para redefinir sua senha.
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="seu@email.com"
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={20} color="#6b7280" />}
            />
          </View>

          {/* Botão Enviar */}
          <Button
            title="Enviar link de recuperação"
            onPress={handleResetPassword}
            loading={loading}
            fullWidth
            className="mb-6"
          />

          {/* Link Voltar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center justify-center py-3"
          >
            <Ionicons name="arrow-back-outline" size={18} color="#2563eb" />
            <Text className="ml-2 text-blue-600 font-semibold text-base">
              Voltar para o login
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <Text className="text-gray-700 text-sm text-center">
              Se você não receber o email em alguns minutos, verifique sua pasta de spam ou tente novamente.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
