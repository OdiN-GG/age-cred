import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();
  const router = useRouter();

  const handleSignUp = async () => {
    // Validações
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    // Validação de senha
    if (password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 8 caracteres');
      return;
    }

    // Confirmar senha
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    // Termos de uso
    if (!acceptedTerms) {
      Alert.alert('Erro', 'Você deve aceitar os Termos de Uso para continuar');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email,
        password,
        fullName,
        phone,
        acceptedTerms,
      });

      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso! Faça login para continuar.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível criar sua conta');
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
        <View className="flex-1 p-6 pt-12">
          {/* Header */}
          <View className="mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6"
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Criar sua conta
            </Text>
            <Text className="text-gray-600 text-base">
              Comece gratuitamente e atualize quando precisar
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Input
              label="Nome completo *"
              value={fullName}
              onChangeText={setFullName}
              placeholder="João da Silva"
              icon={<Ionicons name="person-outline" size={20} color="#6b7280" />}
            />

            <Input
              label="Email *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="seu@email.com"
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={20} color="#6b7280" />}
            />

            <Input
              label="Telefone (opcional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="(11) 99999-9999"
              icon={<Ionicons name="call-outline" size={20} color="#6b7280" />}
            />

            <Input
              label="Senha *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Mínimo 8 caracteres"
              icon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
            />

            <Input
              label="Confirmar senha *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Digite a senha novamente"
              icon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
            />
          </View>

          {/* Termos */}
          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            className="flex-row items-start mb-6"
          >
            <View
              className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                acceptedTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}
            >
              {acceptedTerms && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text className="flex-1 text-gray-700 text-sm">
              Eu aceito os{' '}
              <Text className="text-blue-600 font-medium">Termos de Uso</Text>
              {' '}e{' '}
              <Text className="text-blue-600 font-medium">Política de Privacidade</Text>
            </Text>
          </TouchableOpacity>

          {/* Botão Cadastrar */}
          <Button
            title="Criar conta"
            onPress={handleSignUp}
            loading={loading}
            fullWidth
            className="mb-6"
          />

          {/* Link Login */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-base">
              Já tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text className="text-blue-600 font-semibold text-base">
                Fazer login
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Trial */}
          <View className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="gift-outline" size={20} color="#2563eb" />
              <Text className="ml-2 font-semibold text-blue-900">
                Comece grátis!
              </Text>
            </View>
            <Text className="text-blue-800 text-sm">
              • Até 5 clientes{'\n'}
              • Até 3 empréstimos ativos{'\n'}
              • Todas as funcionalidades básicas{'\n'}
              • Sem cartão de crédito necessário
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
