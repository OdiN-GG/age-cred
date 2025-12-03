import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Badge } from '@/components/ui';
import { useClientStore } from '@/store';
import { CLIENT_SCORE_LABELS } from '@/constants';
import { formatPhone } from '@/utils';

export default function Clients() {
  const router = useRouter();
  const { clients, fetchClients } = useClientStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const getScoreBadgeVariant = (score: string) => {
    if (score === 'BOM') return 'success';
    if (score === 'REGULAR') return 'warning';
    return 'danger';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-row items-center justify-between border-b border-gray-200 bg-white">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Clientes</Text>
          <Text className="text-gray-600">{clients.length} cadastrados</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/clients/add' as any)}
          className="bg-blue-600 rounded-full p-3"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4 gap-3">
          {clients.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text className="text-gray-500 text-lg mt-4">
                Nenhum cliente cadastrado
              </Text>
              <Text className="text-gray-400 text-center mt-2 px-8">
                Adicione seu primeiro cliente para começar
              </Text>
            </View>
          ) : (
            clients.map((client) => (
              <Card
                key={client.id}
                onPress={() => router.push(`/clients/${client.id}` as any)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      {client.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mb-2">
                      <Ionicons name="call" size={14} color="#6b7280" />
                      <Text className="text-gray-600 text-sm">
                        {formatPhone(client.phone)}
                      </Text>
                    </View>
                    <Badge
                      label={CLIENT_SCORE_LABELS[client.score]}
                      variant={getScoreBadgeVariant(client.score)}
                      size="sm"
                    />
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
