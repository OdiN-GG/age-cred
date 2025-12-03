import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Badge } from '@/components/ui';
import { useLoanStore, useClientStore } from '@/store';
import { formatCurrency, calculatePaymentProgress } from '@/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Loans() {
  const router = useRouter();
  const { loans, fetchLoans, deleteLoan } = useLoanStore();
  const { clients, fetchClients } = useClientStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLoans();
    fetchClients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    await fetchClients();
    setRefreshing(false);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Desconhecido';
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'ATIVO') return 'info';
    if (status === 'CONCLUIDO') return 'success';
    if (status === 'INADIMPLENTE') return 'danger';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ATIVO: 'Ativo',
      CONCLUIDO: 'Concluído',
      INADIMPLENTE: 'Inadimplente',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
  };

  const handleDeleteLoan = (loanId: string, clientName: string) => {
    Alert.alert(
      'Excluir Empréstimo',
      `Tem certeza que deseja excluir o empréstimo de ${clientName}? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoan(loanId);
              Alert.alert('Sucesso', 'Empréstimo excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o empréstimo.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-row items-center justify-between border-b border-gray-200 bg-white">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Empréstimos</Text>
          <Text className="text-gray-600">{loans.length} cadastrados</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/loans/add' as any)}
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
          {loans.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="cash-outline" size={64} color="#9ca3af" />
              <Text className="text-gray-500 text-lg mt-4">
                Nenhum empréstimo cadastrado
              </Text>
              <Text className="text-gray-400 text-center mt-2 px-8">
                Crie seu primeiro empréstimo
              </Text>
            </View>
          ) : (
            loans.map((loan) => {
              const progress = calculatePaymentProgress(loan.installments);
              const clientName = getClientName(loan.clientId);
              return (
                <Card
                  key={loan.id}
                  onPress={() => router.push(`/loans/${loan.id}` as any)}
                >
                  <View>
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 mb-1">
                          {clientName}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {format(loan.startDate, "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Badge
                          label={getStatusLabel(loan.status)}
                          variant={getStatusBadgeVariant(loan.status)}
                          size="sm"
                        />
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteLoan(loan.id, clientName);
                          }}
                          className="p-1"
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="border-t border-gray-200 pt-3 mt-3">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Valor Total:</Text>
                        <Text className="text-gray-900 font-semibold">
                          {formatCurrency(loan.totalAmount)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Parcelas:</Text>
                        <Text className="text-gray-900">
                          {loan.installments.filter((i) => i.status === 'PAGO').length} / {loan.totalInstallments}
                        </Text>
                      </View>
                      <View className="mt-2">
                        <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                          <View
                            className="bg-blue-600 h-full"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                        <Text className="text-xs text-gray-500 text-right mt-1">
                          {progress.toFixed(0)}% concluído
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
