import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Card } from '@/components/ui';
import { useClientStore, useLoanStore } from '@/store';
import { PaymentFrequency } from '@/types';
import {
  calculateTotalAmount,
  calculateInstallmentAmount,
  formatCurrency,
} from '@/utils';
import { PAYMENT_FREQUENCY_LABELS, DEFAULT_LATE_INTEREST_RATE } from '@/constants';

const loanSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  principalAmount: z.string().refine((val) => parseFloat(val) > 0, 'Valor deve ser maior que 0'),
  interestRate: z.string().refine((val) => parseFloat(val) >= 0, 'Taxa deve ser maior ou igual a 0'),
  lateInterestRate: z.string().refine((val) => parseFloat(val) >= 0, 'Taxa deve ser maior ou igual a 0'),
  paymentFrequency: z.enum(['DIARIO', 'SEMANAL', 'MENSAL']),
  totalInstallments: z.string().refine((val) => parseInt(val) > 0, 'Número de parcelas deve ser maior que 0'),
  notes: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

export default function AddLoan() {
  const router = useRouter();
  const { clientId: urlClientId } = useLocalSearchParams<{ clientId?: string }>();
  const { clients, fetchClients } = useClientStore();
  const { addLoan } = useLoanStore();
  const [loading, setLoading] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState('Selecione um cliente');
  const [calculatedValues, setCalculatedValues] = useState({
    totalAmount: 0,
    installmentAmount: 0,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      clientId: urlClientId || '',
      principalAmount: '',
      interestRate: '10',
      lateInterestRate: (DEFAULT_LATE_INTEREST_RATE * 100).toFixed(3),
      paymentFrequency: 'MENSAL',
      totalInstallments: '12',
      notes: '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (urlClientId) {
      const client = clients.find((c) => c.id === urlClientId);
      if (client) {
        setValue('clientId', client.id);
        setSelectedClientName(client.name);
      }
    }
  }, [urlClientId, clients]);

  useEffect(() => {
    const principal = parseFloat(watchedValues.principalAmount) || 0;
    const interest = parseFloat(watchedValues.interestRate) || 0;
    const installments = parseInt(watchedValues.totalInstallments) || 1;

    const total = calculateTotalAmount(principal, interest);
    const installment = calculateInstallmentAmount(total, installments);

    setCalculatedValues({
      totalAmount: total,
      installmentAmount: installment,
    });
  }, [
    watchedValues.principalAmount,
    watchedValues.interestRate,
    watchedValues.totalInstallments,
  ]);

  const onSubmit = async (data: LoanFormData) => {
    setLoading(true);
    try {
      await addLoan({
        clientId: data.clientId,
        principalAmount: parseFloat(data.principalAmount),
        interestRate: parseFloat(data.interestRate),
        lateInterestRate: parseFloat(data.lateInterestRate),
        paymentFrequency: data.paymentFrequency,
        totalInstallments: parseInt(data.totalInstallments),
        startDate: new Date(),
        notes: data.notes,
      });

      Alert.alert('Sucesso', 'Empréstimo cadastrado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar empréstimo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Informações do Empréstimo
          </Text>

          <Controller
            control={control}
            name="clientId"
            render={({ field: { value } }) => (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2 text-base">
                  Cliente
                </Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  onPress={() => setShowClientPicker(!showClientPicker)}
                >
                  <Text className="text-base text-gray-900">
                    {selectedClientName}
                  </Text>
                </TouchableOpacity>
                {errors.clientId && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.clientId.message}
                  </Text>
                )}

                {showClientPicker && (
                  <Card className="mt-2 max-h-60">
                    <ScrollView>
                      {clients.map((client) => (
                        <TouchableOpacity
                          key={client.id}
                          className="py-3 border-b border-gray-200"
                          onPress={() => {
                            setValue('clientId', client.id);
                            setSelectedClientName(client.name);
                            setShowClientPicker(false);
                          }}
                        >
                          <Text className="text-base text-gray-900">
                            {client.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Card>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="principalAmount"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Valor do Empréstimo (R$)"
                value={value || ''}
                onChangeText={onChange}
                placeholder="1000.00"
                keyboardType="numeric"
                error={errors.principalAmount?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="interestRate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Taxa de Juros (%)"
                value={value || ''}
                onChangeText={onChange}
                placeholder="10"
                keyboardType="numeric"
                error={errors.interestRate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="lateInterestRate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Taxa de Juros por Atraso (% ao dia)"
                value={value || ''}
                onChangeText={onChange}
                placeholder="0.033"
                keyboardType="numeric"
                error={errors.lateInterestRate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="paymentFrequency"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2 text-base">
                  Frequência de Pagamento
                </Text>
                <View className="flex-row gap-2">
                  {Object.entries(PAYMENT_FREQUENCY_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      className={`flex-1 py-3 px-4 rounded-lg border ${
                        value === key
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onPress={() => onChange(key)}
                    >
                      <Text
                        className={`text-center font-medium ${
                          value === key ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="totalInstallments"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Número de Parcelas"
                value={value || ''}
                onChangeText={onChange}
                placeholder="12"
                keyboardType="numeric"
                error={errors.totalInstallments?.message}
              />
            )}
          />

          <Card className="bg-blue-50 border-blue-200 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Resumo do Empréstimo
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Valor Emprestado:</Text>
                <Text className="text-gray-900 font-semibold">
                  {formatCurrency(parseFloat(watchedValues.principalAmount) || 0)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Juros ({watchedValues.interestRate}%):</Text>
                <Text className="text-gray-900 font-semibold">
                  {formatCurrency(
                    calculatedValues.totalAmount -
                      (parseFloat(watchedValues.principalAmount) || 0)
                  )}
                </Text>
              </View>
              <View className="border-t border-blue-300 pt-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-900 font-bold">Valor Total:</Text>
                  <Text className="text-blue-600 font-bold text-lg">
                    {formatCurrency(calculatedValues.totalAmount)}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Valor por Parcela:</Text>
                <Text className="text-gray-900 font-semibold">
                  {formatCurrency(calculatedValues.installmentAmount)}
                </Text>
              </View>
            </View>
          </Card>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Observações (opcional)"
                value={value || ''}
                onChangeText={onChange}
                placeholder="Informações adicionais"
                multiline
                numberOfLines={4}
                error={errors.notes?.message}
              />
            )}
          />

          <View className="flex-row gap-3 mt-6 mb-8">
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="outline"
              fullWidth
            />
            <Button
              title="Criar Empréstimo"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
