import { Button, Input } from '@/components/ui';
import { useClientStore } from '@/store';
import { ClientScore } from '@/types';
import { validateCPF } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const clientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().refine(validateCPF, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  street: z.string().min(3, 'Rua deve ter no mínimo 3 caracteres'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string().min(8, 'CEP inválido'),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function AddClient() {
  const router = useRouter();
  const { addClient } = useClientStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      cpf: '',
      phone: '',
      whatsapp: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      await addClient({
        name: data.name,
        cpf: data.cpf,
        phone: data.phone,
        whatsapp: data.whatsapp,
        address: {
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        score: ClientScore.GOOD,
        notes: data.notes,
      });

      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar cliente');
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
            Dados Pessoais
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome Completo"
                value={value || ''}
                onChangeText={onChange}
                placeholder="João da Silva"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="cpf"
            render={({ field: { onChange, value } }) => (
              <Input
                label="CPF"
                value={value || ''}
                onChangeText={onChange}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                error={errors.cpf?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Telefone"
                value={value || ''}
                onChangeText={onChange}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="whatsapp"
            render={({ field: { onChange, value } }) => (
              <Input
                label="WhatsApp"
                value={value || ''}
                onChangeText={onChange}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                error={errors.whatsapp?.message}
              />
            )}
          />

          <Text className="text-xl font-bold text-gray-900 mb-4 mt-6">
            Endereço
          </Text>

          <Controller
            control={control}
            name="zipCode"
            render={({ field: { onChange, value } }) => (
              <Input
                label="CEP"
                value={value || ''}
                onChangeText={onChange}
                placeholder="00000-000"
                keyboardType="numeric"
                error={errors.zipCode?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Rua"
                value={value || ''}
                onChangeText={onChange}
                placeholder="Rua das Flores"
                error={errors.street?.message}
              />
            )}
          />

          <View className="flex-row gap-3">
            <Controller
              control={control}
              name="number"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Número"
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="123"
                  keyboardType="numeric"
                  error={errors.number?.message}
                  className="flex-1"
                />
              )}
            />

            <Controller
              control={control}
              name="complement"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Complemento"
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="Apto 101"
                  error={errors.complement?.message}
                  className="flex-1"
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="neighborhood"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Bairro"
                value={value || ''}
                onChangeText={onChange}
                placeholder="Centro"
                error={errors.neighborhood?.message}
              />
            )}
          />

          <View className="flex-row gap-3">
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Cidade"
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="São Paulo"
                  error={errors.city?.message}
                  className="flex-1"
                />
              )}
            />

            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Estado"
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="SP"
                  error={errors.state?.message}
                  className="w-24"
                />
              )}
            />
          </View>

          <Text className="text-xl font-bold text-gray-900 mb-4 mt-6">
            Observações
          </Text>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Notas (opcional)"
                value={value || ''}
                onChangeText={onChange}
                placeholder="Informações adicionais"
                multiline
                numberOfLines={4}
                error={errors.notes?.message}
              />
            )}
          />

          <View className=" gap-3 mt-6 mb-8">
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="outline"
              fullWidth
            />
            <Button
              title="Salvar"
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
