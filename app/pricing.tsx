import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

interface Plan {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  limitations?: string[];
  buttonText: string;
  disabled?: boolean;
  priceId?: string;
  subscriptionType?: 'free' | 'professional' | 'enterprise';
}

const plans: Plan[] = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    features: [
      'Até 5 clientes',
      'Até 3 empréstimos ativos',
      'Dashboard básico',
      'Gestão de clientes',
      'Cálculo de juros',
      'WhatsApp integration',
    ],
    limitations: [
      'Sem backup na nuvem',
      'Sem relatórios PDF',
      'Sem sincronização multi-device',
    ],
    buttonText: 'Plano Atual',
    disabled: true,
    subscriptionType: 'free',
  },
  {
    name: 'Profissional',
    price: 'R$ 29,90',
    period: '/mês',
    popular: true,
    features: [
      'Clientes ilimitados',
      'Empréstimos ilimitados',
      'Backup automático na nuvem',
      'Relatórios em PDF',
      'Gráficos avançados',
      'Sincronização multi-device',
      'Notificações personalizadas',
      'Suporte prioritário (24h)',
      'Sem anúncios',
    ],
    buttonText: '7 dias grátis, depois R$ 29,90/mês',
    priceId: 'price_professional_monthly',
    subscriptionType: 'professional',
  },
  {
    name: 'Empresarial',
    price: 'R$ 79,90',
    period: '/mês',
    features: [
      'Tudo do Profissional',
      'Até 5 colaboradores',
      'Permissões e papéis avançados',
      'API personalizada',
      'Relatórios personalizados',
      'White-label (seu logo)',
      'Backup até 100GB',
      'Suporte telefone + WhatsApp',
      'Auditoria completa',
    ],
    buttonText: 'Contratar Plano Enterprise',
    priceId: 'price_enterprise_monthly',
    subscriptionType: 'enterprise',
  },
];

export default function Pricing() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleSelectPlan = (plan: Plan) => {
    if (plan.disabled) {
      return;
    }

    if (!plan.priceId) {
      return;
    }

    // TODO: Implementar navegação para checkout
    Alert.alert(
      'Upgrade de Plano',
      `Deseja assinar o plano ${plan.name} por ${plan.price}${plan.period}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            // Aqui você implementará a navegação para o checkout do Stripe
            router.push(`/checkout?priceId=${plan.priceId}`);
          },
        },
      ]
    );
  };

  const isCurrentPlan = (planType: string | undefined) => {
    return user?.subscriptionStatus === planType;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6"
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-center text-gray-900 mb-2">
            Escolha seu plano
          </Text>
          <Text className="text-gray-600 text-center text-base mb-4">
            Cancele quando quiser, sem multas
          </Text>

          {/* Badge Trial */}
          <View className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-center">
              <Ionicons name="gift" size={24} color="white" />
              <Text className="ml-2 text-white font-bold text-lg">
                7 dias grátis em qualquer plano pago
              </Text>
            </View>
          </View>
        </View>

        {/* Plans */}
        {plans.map((plan, index) => {
          const isCurrent = isCurrentPlan(plan.subscriptionType);

          return (
            <Card
              key={plan.name}
              className={`mb-6 ${plan.popular ? 'border-2 border-blue-600 shadow-lg' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <View className="absolute -top-3 right-4 bg-blue-600 px-4 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    ⭐ MAIS POPULAR
                  </Text>
                </View>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <View className="mb-3">
                  <View className="bg-green-100 px-3 py-1 rounded-full self-start">
                    <Text className="text-green-800 text-xs font-bold">
                      ✓ PLANO ATUAL
                    </Text>
                  </View>
                </View>
              )}

              {/* Plan Header */}
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {plan.name}
              </Text>
              <View className="flex-row items-end mb-6">
                <Text className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </Text>
                <Text className="text-gray-600 ml-1 mb-1">
                  {plan.period}
                </Text>
              </View>

              {/* Features */}
              {plan.features.map((feature, idx) => (
                <View key={idx} className="flex-row items-start mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="ml-3 text-gray-700 flex-1 text-base">
                    {feature}
                  </Text>
                </View>
              ))}

              {/* Limitations */}
              {plan.limitations?.map((limitation, idx) => (
                <View key={idx} className="flex-row items-start mb-3">
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text className="ml-3 text-gray-500 flex-1 text-base">
                    {limitation}
                  </Text>
                </View>
              ))}

              {/* CTA Button */}
              <TouchableOpacity
                className={`mt-6 py-4 rounded-lg ${
                  isCurrent
                    ? 'bg-gray-300'
                    : plan.popular
                    ? 'bg-blue-600 active:bg-blue-700'
                    : 'bg-gray-800 active:bg-gray-900'
                }`}
                disabled={isCurrent}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text className="text-white text-center font-bold text-base">
                  {isCurrent ? '✓ Plano Atual' : plan.buttonText}
                </Text>
              </TouchableOpacity>

              {/* Annual Option for Paid Plans */}
              {plan.priceId && !isCurrent && (
                <View className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                  <Text className="text-green-800 text-sm text-center font-medium">
                    💰 Economize 17% pagando anualmente
                  </Text>
                </View>
              )}
            </Card>
          );
        })}

        {/* FAQ Section */}
        <View className="mt-4 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </Text>

          <View className="mb-4">
            <Text className="font-semibold text-gray-900 mb-2">
              ❓ Posso cancelar a qualquer momento?
            </Text>
            <Text className="text-gray-600">
              Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas extras.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold text-gray-900 mb-2">
              ❓ Como funciona o período de teste?
            </Text>
            <Text className="text-gray-600">
              Você tem 7 dias grátis para testar todos os recursos premium. Não é necessário cartão de crédito.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold text-gray-900 mb-2">
              ❓ Meus dados estão seguros?
            </Text>
            <Text className="text-gray-600">
              Sim! Usamos criptografia de ponta e backup automático. Seus dados são armazenados com segurança na nuvem.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold text-gray-900 mb-2">
              ❓ Quais formas de pagamento são aceitas?
            </Text>
            <Text className="text-gray-600">
              Aceitamos cartão de crédito, PIX e boleto bancário através do Stripe.
            </Text>
          </View>
        </View>

        {/* Support */}
        <View className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
          <View className="items-center">
            <Ionicons name="help-circle-outline" size={40} color="#2563eb" />
            <Text className="text-lg font-bold text-gray-900 mt-3 mb-2">
              Precisa de ajuda?
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano
            </Text>
            <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold">
                Falar com suporte
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
