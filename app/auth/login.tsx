import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    // Validação básica
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
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
      >
        <View className="flex-1 p-6 justify-center">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="bg-blue-600 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="wallet" size={40} color="white" />
            </View>
            <Text className="text-4xl font-bold text-gray-900 mb-2">Age Cred</Text>
            <Text className="text-gray-600 text-center text-base">
              Gestão profissional de empréstimos
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

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              icon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
            />
          </View>

          {/* Botão de Login */}
          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            className="mb-4"
          />

          {/* Link Esqueci Senha */}
          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            className="mb-6"
          >
            <Text className="text-blue-600 text-center text-base font-medium">
              Esqueci minha senha
            </Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="mx-4 text-gray-500">OU</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          {/* Link Cadastro */}
          <TouchableOpacity
            onPress={() => router.push('/auth/signup')}
            className="border-2 border-blue-600 rounded-lg py-3"
          >
            <Text className="text-blue-600 text-center text-base font-semibold">
              Criar nova conta
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-8">
            <Text className="text-gray-500 text-center text-sm">
              Ao continuar, você concorda com nossos{' '}
              <Text className="text-blue-600 font-medium">Termos de Uso</Text>
              {' '}e{' '}
              <Text className="text-blue-600 font-medium">Política de Privacidade</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
