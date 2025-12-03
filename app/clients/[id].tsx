import { Badge, Button, Card } from '@/components/ui';
import { CLIENT_SCORE_LABELS } from '@/constants';
import { useClientStore, useLoanStore } from '@/store';
import { Loan } from '@/types';
import { formatCPF, formatCurrency, formatPhone } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clients, getClientById, selectedClient, deleteClient } = useClientStore();
  const { getLoansByClientId } = useLoanStore();
  const [clientLoans, setClientLoans] = useState<Loan[]>([]);

  useEffect(() => {
    if (id) {
      getClientById(id);
      loadClientLoans();
    }
  }, [id]);

  const loadClientLoans = async () => {
    if (id) {
      const loans = await getLoansByClientId(id);
      setClientLoans(loans);
    }
  };

  const handleWhatsApp = () => {
    if (selectedClient) {
      const phone = selectedClient.whatsapp.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=55${phone}`);
    }
  };

  const handleCall = () => {
    if (selectedClient) {
      const phone = selectedClient.phone.replace(/\D/g, '');
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Cliente',
      'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteClient(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const getScoreBadgeVariant = (score: string) => {
    if (score === 'BOM') return 'success';
    if (score === 'REGULAR') return 'warning';
    return 'danger';
  };

  if (!selectedClient) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <View className="items-center mb-4">
            <View className="bg-blue-100 rounded-full p-6 mb-4">
              <Ionicons name="person" size={48} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {selectedClient.name}
            </Text>
            <Badge
              label={CLIENT_SCORE_LABELS[selectedClient.score]}
              variant={getScoreBadgeVariant(selectedClient.score)}
            />
          </View>

          <View className="border-t border-gray-200 pt-4 gap-3">
            <View className="flex-row items-center gap-3">
              <Ionicons name="card" size={20} color="#6b7280" />
              <Text className="text-gray-900">{formatCPF(selectedClient.cpf)}</Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color="#6b7280" />
              <Text className="text-blue-600">
                {formatPhone(selectedClient.phone)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text className="text-blue-600">
                {formatPhone(selectedClient.whatsapp)}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-start gap-3">
              <Ionicons name="location" size={20} color="#6b7280" />
              <Text className="text-gray-900 flex-1">
                {selectedClient.address.street}, {selectedClient.address.number}
                {selectedClient.address.complement && ` - ${selectedClient.address.complement}`}
                {'\n'}
                {selectedClient.address.neighborhood} - {selectedClient.address.city}/{selectedClient.address.state}
                {'\n'}
                CEP: {selectedClient.address.zipCode}
              </Text>
            </View>

            {selectedClient.notes && (
              <View className="flex-row items-start gap-3">
                <Ionicons name="document-text" size={20} color="#6b7280" />
                <Text className="text-gray-900 flex-1">{selectedClient.notes}</Text>
              </View>
            )}
          </View>
        </Card>

        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-3">
            Empréstimos ({clientLoans.length})
          </Text>

          {clientLoans.length === 0 ? (
            <Card>
              <Text className="text-gray-500 text-center py-4">
                Nenhum empréstimo cadastrado
              </Text>
            </Card>
          ) : (
            clientLoans.map((loan) => (
              <Card
                key={loan.id}
                onPress={() => router.push(`/loans/${loan.id}` as any)}
                className="mb-3"
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-gray-600 text-sm mb-1">
                      Valor Total
                    </Text>
                    <Text className="text-xl font-bold text-gray-900">
                      {formatCurrency(loan.totalAmount)}
                    </Text>
                  </View>
                  <Badge
                    label={loan.status}
                    variant={
                      loan.status === 'ATIVO'
                        ? 'info'
                        : loan.status === 'CONCLUIDO'
                        ? 'success'
                        : 'danger'
                    }
                  />
                </View>
                <View className="border-t border-gray-200 mt-3 pt-3">
                  <Text className="text-gray-600 text-sm">
                    Parcelas: {loan.installments.filter((i) => i.status === 'PAGO').length} / {loan.totalInstallments}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>

        <View className="gap-3 mb-8">
          <Button
            title="Novo Empréstimo"
            onPress={() => router.push(`/loans/add?clientId=${id}` as any)}
            variant="primary"
            fullWidth
          />
          <Button
            title="Excluir Cliente"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
