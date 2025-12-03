import { Badge, Button, Card } from '@/components/ui';
import { PAYMENT_FREQUENCY_LABELS } from '@/constants';
import { useClientStore, useLoanStore } from '@/store';
import { Installment, InstallmentStatus } from '@/types';
import {
  calculateTotalOverdue,
  calculateTotalPaid,
  calculateTotalPending,
  formatCurrency,
  updateInstallmentWithLateInterest,
} from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

export default function LoanDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clients, fetchClients } = useClientStore();
  const { getLoanById, selectedLoan, markInstallmentAsPaid, updateInstallmentsStatus } = useLoanStore();
  const [expandedInstallment, setExpandedInstallment] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadLoanDetails();
    }
  }, [id]);

  const loadLoanDetails = async () => {
    await fetchClients();
    if (id) {
      await getLoanById(id);
      await updateInstallmentsStatus();
    }
  };

  const getClient = () => {
    if (!selectedLoan) return null;
    return clients.find((c) => c.id === selectedLoan.clientId);
  };

  const handleMarkAsPaid = (installment: Installment) => {
    const updatedInstallment = updateInstallmentWithLateInterest(
      installment,
      selectedLoan!.lateInterestRate
    );

    Alert.alert(
      'Confirmar Pagamento',
      `Deseja marcar a parcela ${installment.installmentNumber} como paga?\n\nValor: ${formatCurrency(updatedInstallment.totalAmount)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await markInstallmentAsPaid(
              installment.id,
              updatedInstallment.totalAmount
            );
            await loadLoanDetails();
          },
        },
      ]
    );
  };

  const handleSendWhatsApp = (installment: Installment) => {
    const client = getClient();
    if (!client) return;

    const updatedInstallment = updateInstallmentWithLateInterest(
      installment,
      selectedLoan!.lateInterestRate
    );

    const message = `Olá ${client.name}! 👋\n\nLembramos que você possui uma parcela vencendo em ${format(
      installment.dueDate,
      'dd/MM/yyyy'
    )}.\n\nParcela: ${installment.installmentNumber}/${selectedLoan!.totalInstallments}\nValor: ${formatCurrency(
      updatedInstallment.totalAmount
    )}\n\nQualquer dúvida, estamos à disposição!`;

    const phone = client.whatsapp.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    Linking.openURL(`whatsapp://send?phone=55${phone}&text=${encodedMessage}`);
  };

  const getInstallmentStatusBadge = (status: InstallmentStatus) => {
    const badges = {
      [InstallmentStatus.PAID]: { label: 'Pago', variant: 'success' as const },
      [InstallmentStatus.PENDING]: { label: 'Pendente', variant: 'warning' as const },
      [InstallmentStatus.OVERDUE]: { label: 'Atrasado', variant: 'danger' as const },
    };
    return badges[status];
  };

  if (!selectedLoan) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </SafeAreaView>
    );
  }

  const client = getClient();
  const totalPaid = calculateTotalPaid(selectedLoan.installments);
  const totalPending = calculateTotalPending(selectedLoan.installments);
  const totalOverdue = calculateTotalOverdue(selectedLoan.installments);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {client?.name || 'Cliente não encontrado'}
            </Text>
            <Text className="text-gray-600">
              Criado em {format(selectedLoan.startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>

          <View className="border-t border-gray-200 pt-4 gap-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Valor Principal:</Text>
              <Text className="text-gray-900 font-semibold">
                {formatCurrency(selectedLoan.principalAmount)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Taxa de Juros:</Text>
              <Text className="text-gray-900 font-semibold">
                {selectedLoan.interestRate}%
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Valor Total:</Text>
              <Text className="text-blue-600 font-bold text-lg">
                {formatCurrency(selectedLoan.totalAmount)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Frequência:</Text>
              <Text className="text-gray-900 font-semibold">
                {PAYMENT_FREQUENCY_LABELS[selectedLoan.paymentFrequency]}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total de Parcelas:</Text>
              <Text className="text-gray-900 font-semibold">
                {selectedLoan.totalInstallments}x de {formatCurrency(selectedLoan.installmentAmount)}
              </Text>
            </View>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Resumo Financeiro
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-green-600">Total Recebido:</Text>
              <Text className="text-green-600 font-bold">
                {formatCurrency(totalPaid)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-yellow-600">A Receber:</Text>
              <Text className="text-yellow-600 font-bold">
                {formatCurrency(totalPending)}
              </Text>
            </View>
            {totalOverdue > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-red-600">Em Atraso:</Text>
                <Text className="text-red-600 font-bold">
                  {formatCurrency(totalOverdue)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-3">
            Parcelas ({selectedLoan.installments.length})
          </Text>

          {selectedLoan.installments.map((installment) => {
            const updatedInstallment = updateInstallmentWithLateInterest(
              installment,
              selectedLoan.lateInterestRate
            );
            const isExpanded = expandedInstallment === installment.id;
            const statusBadge = getInstallmentStatusBadge(updatedInstallment.status);

            return (
              <Card key={installment.id} className="mb-3">
                <TouchableOpacity
                  onPress={() =>
                    setExpandedInstallment(isExpanded ? null : installment.id)
                  }
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        Parcela {installment.installmentNumber}/{selectedLoan.totalInstallments}
                      </Text>
                      <Text className="text-sm text-gray-600 mb-2">
                        Vencimento: {format(installment.dueDate, 'dd/MM/yyyy')}
                      </Text>
                      <Badge label={statusBadge.label} variant={statusBadge.variant} size="sm" />
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-gray-900">
                        {formatCurrency(updatedInstallment.totalAmount)}
                      </Text>
                      {updatedInstallment.interestAmount > 0 && (
                        <Text className="text-xs text-red-600">
                          +{formatCurrency(updatedInstallment.interestAmount)} juros
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View className="border-t border-gray-200 mt-3 pt-3">
                    <View className="gap-2 mb-3">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Valor Original:</Text>
                        <Text className="text-gray-900 text-sm">
                          {formatCurrency(installment.originalAmount)}
                        </Text>
                      </View>
                      {updatedInstallment.interestAmount > 0 && (
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600 text-sm">Juros por Atraso:</Text>
                          <Text className="text-red-600 text-sm font-semibold">
                            {formatCurrency(updatedInstallment.interestAmount)}
                          </Text>
                        </View>
                      )}
                      {installment.paidAt && (
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600 text-sm">Pago em:</Text>
                          <Text className="text-green-600 text-sm font-semibold">
                            {format(installment.paidAt, 'dd/MM/yyyy')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {installment.status !== InstallmentStatus.PAID && (
                      <View className=" gap-2">
                        <Button
                          title="Cobrar"
                          onPress={() => handleSendWhatsApp(installment)}
                          variant="outline"
                          fullWidth
                          icon={<Ionicons name="logo-whatsapp" size={16} color="#2563eb" />}
                        />
                        <Button
                          title="Marcar Pago"
                          onPress={() => handleMarkAsPaid(installment)}
                          variant="success"
                          fullWidth
                        />
                      </View>
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
