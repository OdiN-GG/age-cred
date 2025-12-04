import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Pequeno delay para garantir que o store foi inicializado
    const timer = setTimeout(() => {
      setChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (checking || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Redirecionar para tabs se autenticado
  return <Redirect href="/(tabs)" />;
}