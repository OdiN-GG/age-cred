import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { initDatabase } from '@/services/database';
import { SHOW_DEBUG_LOGS } from '@/constants';

import "../global.css";

export default function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        if (SHOW_DEBUG_LOGS) {
          console.log('==================== INICIANDO BANCO ====================');
        }
        await initDatabase();
        if (SHOW_DEBUG_LOGS) {
          console.log('==================== BANCO INICIALIZADO ====================');
        }
        setIsReady(true);
      } catch (err: any) {
        console.error('==================== ERRO AO INICIALIZAR BANCO ====================');
        console.error('Error initializing database:', err);
        setError(err?.message || JSON.stringify(err));
      }
    }

    prepare();
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-red-600 text-lg font-bold mb-2">Erro ao inicializar banco</Text>
        <Text className="text-gray-700 text-center">{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Inicializando banco de dados...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Auth Routes */}
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />

      {/* Pricing */}
      <Stack.Screen
        name="pricing"
        options={{
          title: 'Planos e Preços',
          presentation: 'modal'
        }}
      />

      {/* Client Routes */}
      <Stack.Screen name="clients/add" options={{ title: 'Novo Cliente', presentation: 'modal' }} />
      <Stack.Screen name="clients/[id]" options={{ title: 'Detalhes do Cliente' }} />

      {/* Loan Routes */}
      <Stack.Screen name="loans/add" options={{ title: 'Novo Empréstimo', presentation: 'modal' }} />
      <Stack.Screen name="loans/[id]" options={{ title: 'Detalhes do Empréstimo' }} />
    </Stack>
  );
}
