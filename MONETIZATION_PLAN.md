# Plano de Monetização - Age Cred

## 📊 Análise de Mercado

### Público-Alvo
- **Primário**: Agiotas profissionais e semi-profissionais
- **Secundário**: Pequenos investidores que fazem empréstimos pessoais
- **Terciário**: Grupos de poupança comunitária (ROSCA)

### Tamanho do Mercado
- Mercado de empréstimos P2P no Brasil: R$ 2+ bilhões/ano
- Agiotas independentes: estimados em 50.000+ no Brasil
- Potencial de conversão: 5-10% nos primeiros 12 meses

### Diferenciais Competitivos
✅ Interface intuitiva e profissional
✅ Gestão completa de clientes e cobranças
✅ Cálculo automático de juros e atrasos
✅ Integração nativa com WhatsApp
✅ Dashboard financeiro completo
✅ Persistência offline (SQLite local)

---

## 💰 Estratégia de Monetização

### Modelo Recomendado: Freemium + Assinatura

#### 1. Plano GRATUITO (Freemium)
**Objetivo**: Aquisição de usuários e demonstração de valor

**Limites:**
- ✅ Até 5 clientes cadastrados
- ✅ Até 3 empréstimos ativos simultâneos
- ✅ Dashboard básico
- ✅ Todas as funcionalidades core
- ❌ Sem backup na nuvem
- ❌ Sem relatórios avançados
- ❌ Sem suporte prioritário

**Conversão esperada**: 15-20% para planos pagos após 30 dias

---

#### 2. Plano PROFISSIONAL - R$ 29,90/mês
**Objetivo**: Usuários sérios que querem escalar

**Inclui:**
- ✅ **Clientes ilimitados**
- ✅ **Empréstimos ilimitados**
- ✅ **Backup automático na nuvem** (AWS S3/Google Cloud)
- ✅ **Exportação de relatórios PDF**
- ✅ **Gráficos e análises avançadas**
- ✅ **Notificações push personalizadas**
- ✅ **Múltiplos dispositivos** (sincronização)
- ✅ **Suporte por email** (resposta em 24h)
- ✅ **Sem anúncios**

**Valor anual**: R$ 299,00/ano (economiza 17% = ~2 meses grátis)

---

#### 3. Plano EMPRESARIAL - R$ 79,90/mês
**Objetivo**: Agiotas com equipe ou alto volume

**Inclui tudo do Profissional +**
- ✅ **Multi-usuário** (até 5 colaboradores)
- ✅ **Permissões e papéis** (admin, operador, visualizador)
- ✅ **API personalizada** (integração com outros sistemas)
- ✅ **Relatórios personalizados**
- ✅ **White-label** (seu próprio logo)
- ✅ **Suporte prioritário** (WhatsApp + telefone)
- ✅ **Backup incremental** (até 100GB)
- ✅ **Auditoria completa** (log de todas as ações)

**Valor anual**: R$ 799,00/ano (economiza 17%)

---

### Previsão de Receita (12 meses)

| Mês | Usuários Totais | Gratuitos | Profissionais | Empresariais | MRR | ARR |
|-----|----------------|-----------|---------------|--------------|-----|-----|
| 1 | 100 | 95 | 5 | 0 | R$ 150 | R$ 1.800 |
| 3 | 500 | 425 | 70 | 5 | R$ 2.493 | R$ 29.916 |
| 6 | 2.000 | 1.600 | 360 | 40 | R$ 13.960 | R$ 167.520 |
| 12 | 5.000 | 3.750 | 1.150 | 100 | R$ 42.385 | R$ 508.620 |

**MRR** = Monthly Recurring Revenue
**ARR** = Annual Recurring Revenue

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend (já implementado)
- React Native + Expo
- TypeScript
- Zustand (state management)
- SQLite (persistência local)

#### Backend (a implementar)
```
┌─────────────────┐
│   React Native  │
│   Mobile App    │
└────────┬────────┘
         │
         │ HTTPS/REST
         │
┌────────▼────────┐
│   API Gateway   │
│   (AWS/Vercel)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ Auth │  │  API  │
│ API  │  │  Core │
└──────┘  └───┬───┘
              │
         ┌────┴─────┐
         │          │
    ┌────▼───┐  ┌──▼────┐
    │Database│  │Stripe │
    │Postgres│  │  API  │
    └────────┘  └───────┘
```

#### Backend - Opções Recomendadas

**Opção 1: Supabase (Recomendado para MVP)**
- ✅ Backend-as-a-Service completo
- ✅ Autenticação built-in
- ✅ PostgreSQL gerenciado
- ✅ APIs REST e Realtime
- ✅ Storage para backups
- ✅ Plano gratuito generoso
- 💰 Custo: $0 - $25/mês (início)

**Opção 2: Firebase + Cloud Functions**
- ✅ Autenticação robusta
- ✅ Firestore (NoSQL)
- ✅ Cloud Storage
- ✅ Analytics integrado
- ⚠️ Mais caro em escala
- 💰 Custo: $0 - $50/mês

**Opção 3: Node.js + Express (Custom)**
- ✅ Controle total
- ✅ Flexibilidade máxima
- ❌ Mais tempo de desenvolvimento
- ❌ Requer DevOps
- 💰 Custo: $20-100/mês (hosting)

---

## 🔐 Sistema de Autenticação

### Funcionalidades Necessárias

#### 1. Cadastro (Sign Up)
```typescript
interface SignUpData {
  email: string;           // Email válido
  password: string;        // Mín. 8 caracteres
  fullName: string;        // Nome completo
  phone?: string;          // Telefone (opcional)
  acceptedTerms: boolean;  // Aceite dos termos
}
```

#### 2. Login (Sign In)
- Email + senha
- "Lembrar de mim" (async storage)
- Link "Esqueci minha senha"

#### 3. Recuperação de Senha
- Envio de email com token
- Reset via link temporário
- Expiração em 1 hora

#### 4. Segurança Local
- **Opção 1**: PIN de 4-6 dígitos
- **Opção 2**: Biometria (Face ID/Touch ID/Digital)
- Auto-logout após inatividade (configurável)

#### 5. Gerenciamento de Sessão
- JWT tokens (access + refresh)
- Access token: 15 minutos
- Refresh token: 7 dias
- Renovação automática

### Fluxo de Autenticação

```
┌──────────────┐
│ App Launch   │
└──────┬───────┘
       │
       ▼
   Tem token?
       │
   Sim─┼─Não
       │   │
       │   └──► Login Screen
       │
   Token válido?
       │
   Sim─┼─Não
       │   │
       │   └──► Refresh Token
       │           │
       ▼       Sucesso?
   Dashboard      │
               Sim─┼─Não
                   │   │
                   ▼   └──► Login Screen
               Dashboard
```

---

## 💳 Integração com Stripe

### Por que Stripe?
- ✅ Aceita cartões brasileiros
- ✅ PIX integrado
- ✅ Boleto bancário
- ✅ Assinaturas recorrentes
- ✅ Trial periods
- ✅ Webhooks para sincronização
- ✅ Excelente documentação
- ✅ SDKs para React Native

### Taxas Stripe (Brasil)
- Cartão de crédito: 3,99% + R$ 0,39
- PIX: 0,99%
- Boleto: R$ 3,49 por transação

### Produtos e Preços no Stripe

```javascript
// Produto: Age Cred Profissional
{
  name: "Age Cred Profissional",
  description: "Plano completo para agiotas profissionais",
  prices: [
    {
      amount: 2990,        // R$ 29,90
      currency: "brl",
      recurring: {
        interval: "month",
        interval_count: 1
      },
      trial_period_days: 7  // 7 dias grátis
    },
    {
      amount: 29900,       // R$ 299,00
      currency: "brl",
      recurring: {
        interval: "year",
        interval_count: 1
      }
    }
  ]
}
```

### Implementação React Native

**Pacotes necessários:**
```bash
npm install @stripe/stripe-react-native
```

**Fluxo de pagamento:**
1. Usuário seleciona plano
2. App cria PaymentIntent no backend
3. Backend retorna `client_secret`
4. App abre Stripe Checkout
5. Usuário completa pagamento
6. Webhook notifica backend
7. Backend ativa assinatura
8. App sincroniza status

---

## 🗄️ Migração de Dados

### Desafio: SQLite Local → Cloud

Atualmente, os dados estão **apenas no dispositivo**. Precisamos:

#### Fase 1: Dual Storage (Híbrido)
- Manter SQLite local (funciona offline)
- Adicionar sincronização com cloud
- Usuário controla quando sincronizar

#### Fase 2: Sincronização Automática
```typescript
interface SyncStrategy {
  mode: 'manual' | 'auto' | 'wifi-only';
  frequency: 'realtime' | 'hourly' | 'daily';
  conflictResolution: 'local-wins' | 'server-wins' | 'manual';
}
```

#### Fase 3: Schema de Dados Cloud

**Tabelas principais:**
```sql
-- Usuários e assinaturas
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  full_name VARCHAR,
  phone VARCHAR,
  subscription_status VARCHAR,  -- 'free' | 'professional' | 'enterprise'
  subscription_id VARCHAR,      -- Stripe subscription ID
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Clientes (agora por usuário)
clients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR,
  cpf VARCHAR,
  phone VARCHAR,
  -- ... resto dos campos
  synced_at TIMESTAMP,
  deleted_at TIMESTAMP
)

-- Empréstimos
loans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  -- ... resto dos campos
  synced_at TIMESTAMP
)

-- Parcelas
installments (
  id UUID PRIMARY KEY,
  loan_id UUID REFERENCES loans(id),
  -- ... resto dos campos
  synced_at TIMESTAMP
)
```

---

## 📱 Funcionalidades por Plano

| Funcionalidade | Gratuito | Profissional | Empresarial |
|---------------|----------|--------------|-------------|
| **Limites** |
| Clientes | 5 | Ilimitado | Ilimitado |
| Empréstimos ativos | 3 | Ilimitado | Ilimitado |
| Usuários/colaboradores | 1 | 1 | 5 |
| **Recursos** |
| Dashboard básico | ✅ | ✅ | ✅ |
| Gestão de clientes | ✅ | ✅ | ✅ |
| Gestão de empréstimos | ✅ | ✅ | ✅ |
| Cálculo de juros | ✅ | ✅ | ✅ |
| WhatsApp integration | ✅ | ✅ | ✅ |
| **Backup e Sincronização** |
| Backup local | ✅ | ✅ | ✅ |
| Backup na nuvem | ❌ | ✅ | ✅ |
| Sincronização multi-device | ❌ | ✅ | ✅ |
| **Relatórios** |
| Dashboard básico | ✅ | ✅ | ✅ |
| Exportação PDF | ❌ | ✅ | ✅ |
| Gráficos avançados | ❌ | ✅ | ✅ |
| Relatórios personalizados | ❌ | ❌ | ✅ |
| **Notificações** |
| Notificações básicas | ✅ | ✅ | ✅ |
| Notificações personalizadas | ❌ | ✅ | ✅ |
| **Segurança** |
| PIN/Biometria | ✅ | ✅ | ✅ |
| Auditoria de ações | ❌ | Básica | Completa |
| **Suporte** |
| FAQ e documentação | ✅ | ✅ | ✅ |
| Suporte por email | ❌ | ✅ (24h) | ✅ (4h) |
| Suporte prioritário | ❌ | ❌ | ✅ |

---

## 🚀 Roadmap de Implementação

### Fase 1: Fundação (Mês 1-2) - CRÍTICO
**Objetivo**: Preparar infraestrutura básica

#### Sprint 1 (2 semanas)
- [ ] Escolher e configurar backend (Supabase recomendado)
- [ ] Criar conta Stripe e configurar produtos
- [ ] Implementar sistema de autenticação
  - [ ] Tela de login
  - [ ] Tela de cadastro
  - [ ] Recuperação de senha
- [ ] Criar API endpoints básicos
  - [ ] POST /auth/signup
  - [ ] POST /auth/login
  - [ ] POST /auth/refresh
  - [ ] GET /auth/me

#### Sprint 2 (2 semanas)
- [ ] Implementar tela de seleção de planos
- [ ] Integrar Stripe SDK no app
- [ ] Criar fluxo de pagamento
  - [ ] Cartão de crédito
  - [ ] PIX
- [ ] Implementar webhooks Stripe
  - [ ] payment_intent.succeeded
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
- [ ] Testar todo o fluxo end-to-end

---

### Fase 2: Migração de Dados (Mês 2-3)
**Objetivo**: Sincronizar dados locais com cloud

#### Sprint 3 (2 semanas)
- [ ] Criar schema no banco cloud
- [ ] Implementar migration script
- [ ] Adicionar campo `user_id` em todas as tabelas locais
- [ ] Criar service de sincronização
  - [ ] Upload de clientes
  - [ ] Upload de empréstimos
  - [ ] Upload de parcelas
- [ ] Implementar controle de conflitos

#### Sprint 4 (2 semanas)
- [ ] Sincronização automática (background)
- [ ] Indicador de status de sync na UI
- [ ] Tela de configurações de sync
- [ ] Resolver edge cases
  - [ ] Conexão perdida durante sync
  - [ ] Dados conflitantes
  - [ ] Rollback em caso de erro

---

### Fase 3: Funcionalidades Premium (Mês 3-4)
**Objetivo**: Adicionar valor aos planos pagos

#### Sprint 5 (2 semanas)
- [ ] Implementar limites do plano gratuito
  - [ ] Bloqueio ao atingir 5 clientes
  - [ ] Bloqueio ao atingir 3 empréstimos
  - [ ] Modal de upgrade para premium
- [ ] Exportação de relatórios PDF
  - [ ] Relatório de cliente individual
  - [ ] Relatório de empréstimo
  - [ ] Relatório mensal consolidado
- [ ] Gráficos avançados
  - [ ] Evolução de receitas
  - [ ] Taxa de inadimplência
  - [ ] Top 10 clientes

#### Sprint 6 (2 semanas)
- [ ] Sistema de notificações push
  - [ ] Configuração Expo Notifications
  - [ ] Backend para agendar notificações
  - [ ] Personalização de horários
- [ ] Backup automático
  - [ ] Agendamento automático
  - [ ] Histórico de backups
  - [ ] Restore de backup
- [ ] Multi-device (plano profissional)
  - [ ] Sincronização em tempo real
  - [ ] Logout remoto

---

### Fase 4: Funcionalidades Empresariais (Mês 4-5)
**Objetivo**: Atrair clientes enterprise

#### Sprint 7 (2 semanas)
- [ ] Sistema multi-usuário
  - [ ] Convite de colaboradores
  - [ ] Gestão de permissões
  - [ ] Papéis (admin, operador, visualizador)
- [ ] Auditoria completa
  - [ ] Log de todas as ações
  - [ ] Tela de auditoria
  - [ ] Filtros e busca

#### Sprint 8 (2 semanas)
- [ ] Relatórios personalizados
  - [ ] Editor de relatórios
  - [ ] Templates salvos
  - [ ] Agendamento de envio
- [ ] White-label básico
  - [ ] Upload de logo
  - [ ] Cores customizadas
- [ ] API pública (documentação)

---

### Fase 5: Otimização e Marketing (Mês 5-6)
**Objetivo**: Melhorar conversão e adquirir usuários

#### Sprint 9 (2 semanas)
- [ ] Onboarding melhorado
  - [ ] Tutorial interativo
  - [ ] Exemplos pré-carregados
  - [ ] Dicas contextuais
- [ ] Tela de pricing otimizada
  - [ ] Comparação de planos
  - [ ] Depoimentos de clientes
  - [ ] FAQ inline
- [ ] Trial de 7 dias (sem cartão)
- [ ] Analytics completo
  - [ ] Mixpanel ou Amplitude
  - [ ] Funis de conversão
  - [ ] Cohort analysis

#### Sprint 10 (2 semanas)
- [ ] Landing page profissional
- [ ] SEO e conteúdo
- [ ] Campanhas Google Ads
- [ ] Parcerias com influencers
- [ ] Programa de afiliados (10% comissão)

---

## 🎯 Implementação Detalhada

### 1. Tela de Login/Cadastro

**Localização**: `app/auth/login.tsx`, `app/auth/signup.tsx`

```typescript
// app/auth/login.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Input, Button } from '@/components/ui';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold mb-8">Age Cred</Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={loading}
      />

      <TouchableOpacity
        onPress={() => router.push('/auth/forgot-password')}
        className="mt-4"
      >
        <Text className="text-blue-600 text-center">
          Esqueci minha senha
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/auth/signup')}
        className="mt-4"
      >
        <Text className="text-gray-600 text-center">
          Não tem conta? <Text className="text-blue-600">Cadastre-se</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 2. Store de Autenticação

**Localização**: `store/auth-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: 'free' | 'professional' | 'enterprise';
  subscriptionId?: string;
  trialEndsAt?: Date;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateSubscription: (status: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          // Chamada para API
          const response = await fetch('https://api.agecred.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) throw new Error('Login failed');

          const data = await response.json();

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // ... outras funções
    }),
    {
      name: 'auth-storage',
      storage: AsyncStorage,
    }
  )
);
```

---

### 3. Tela de Planos/Pricing

**Localização**: `app/pricing.tsx`

```typescript
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { useRouter } from 'expo-router';

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    features: [
      'Até 5 clientes',
      'Até 3 empréstimos ativos',
      'Dashboard básico',
      'WhatsApp integration',
    ],
    limitations: [
      'Sem backup na nuvem',
      'Sem relatórios PDF',
    ],
    buttonText: 'Plano Atual',
    disabled: true,
  },
  {
    name: 'Profissional',
    price: 'R$ 29,90',
    period: '/mês',
    popular: true,
    features: [
      'Clientes ilimitados',
      'Empréstimos ilimitados',
      'Backup automático',
      'Relatórios PDF',
      'Gráficos avançados',
      'Multi-device',
      'Suporte prioritário',
    ],
    buttonText: 'Começar Agora',
    priceId: 'price_professional_monthly',
  },
  {
    name: 'Empresarial',
    price: 'R$ 79,90',
    period: '/mês',
    features: [
      'Tudo do Profissional',
      'Até 5 colaboradores',
      'Permissões avançadas',
      'API personalizada',
      'White-label',
      'Suporte telefone',
      'Backup 100GB',
    ],
    buttonText: 'Contratar',
    priceId: 'price_enterprise_monthly',
  },
];

export default function Pricing() {
  const router = useRouter();

  const handleSelectPlan = (priceId: string) => {
    router.push(`/checkout?priceId=${priceId}`);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-3xl font-bold text-center mb-2">
          Escolha seu plano
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Cancele quando quiser, sem multas
        </Text>

        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`mb-4 ${plan.popular ? 'border-2 border-blue-600' : ''}`}
          >
            {plan.popular && (
              <View className="bg-blue-600 px-3 py-1 rounded-full self-start mb-2">
                <Text className="text-white text-xs font-bold">
                  MAIS POPULAR
                </Text>
              </View>
            )}

            <Text className="text-2xl font-bold mb-1">{plan.name}</Text>
            <View className="flex-row items-end mb-4">
              <Text className="text-4xl font-bold">{plan.price}</Text>
              <Text className="text-gray-600 ml-1">{plan.period}</Text>
            </View>

            {plan.features.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text className="ml-2 text-gray-700">{feature}</Text>
              </View>
            ))}

            {plan.limitations?.map((limitation, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="close-circle" size={20} color="#ef4444" />
                <Text className="ml-2 text-gray-500">{limitation}</Text>
              </View>
            ))}

            <TouchableOpacity
              className={`mt-4 py-3 rounded-lg ${
                plan.disabled
                  ? 'bg-gray-300'
                  : plan.popular
                  ? 'bg-blue-600'
                  : 'bg-gray-800'
              }`}
              disabled={plan.disabled}
              onPress={() => plan.priceId && handleSelectPlan(plan.priceId)}
            >
              <Text className="text-white text-center font-bold">
                {plan.buttonText}
              </Text>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
```

---

### 4. Backend API (Supabase + Edge Functions)

**Estrutura de pastas:**
```
supabase/
├── migrations/
│   └── 001_initial_schema.sql
└── functions/
    ├── auth/
    │   ├── login.ts
    │   ├── signup.ts
    │   └── refresh.ts
    ├── stripe/
    │   ├── create-checkout.ts
    │   └── webhook.ts
    └── sync/
        ├── sync-clients.ts
        ├── sync-loans.ts
        └── sync-installments.ts
```

**Exemplo: Webhook Stripe**
```typescript
// supabase/functions/stripe/webhook.ts
import Stripe from 'stripe';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;

        // Atualizar status no banco
        await supabase
          .from('users')
          .update({
            subscription_status: subscription.status === 'active'
              ? 'professional'
              : 'free',
            subscription_id: subscription.id,
          })
          .eq('stripe_customer_id', subscription.customer);
        break;

      case 'customer.subscription.deleted':
        // Downgrade para free
        await supabase
          .from('users')
          .update({ subscription_status: 'free' })
          .eq('stripe_customer_id', event.data.object.customer);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
});
```

---

## 📊 Métricas de Sucesso (KPIs)

### Aquisição
- **CAC** (Customer Acquisition Cost): < R$ 50
- **Taxa de conversão gratuito → pago**: > 15%
- **Novos usuários/mês**: Meta de 500 no mês 6

### Engajamento
- **DAU/MAU ratio**: > 40% (usuários ativos diários/mensais)
- **Session length**: > 5 minutos
- **Retention D7**: > 40% (usuários que voltam após 7 dias)
- **Retention D30**: > 20%

### Receita
- **MRR Growth**: 20% mês a mês
- **Churn rate**: < 5% ao mês
- **LTV/CAC ratio**: > 3:1
- **Upgrade rate**: 15% free → paid

### Produto
- **NPS** (Net Promoter Score): > 50
- **Tempo até primeiro empréstimo**: < 5 minutos
- **App crash rate**: < 1%
- **Bug reports**: < 10/mês

---

## ⚖️ Considerações Legais

### 1. Termos de Uso e Política de Privacidade
**CRÍTICO**: Obrigatório antes do lançamento

- [ ] Contratar advogado especializado em digital
- [ ] Redigir Termos de Uso
- [ ] Redigir Política de Privacidade (LGPD)
- [ ] Adicionar aceite obrigatório no cadastro
- [ ] Link acessível em todas as telas

### 2. LGPD (Lei Geral de Proteção de Dados)
- [ ] Nomear DPO (Data Protection Officer)
- [ ] Implementar direitos do titular:
  - Acesso aos dados
  - Correção de dados
  - Exclusão de dados
  - Portabilidade
- [ ] Criptografia de dados sensíveis (CPF, telefone)
- [ ] Logs de acesso e auditoria
- [ ] Política de retenção de dados

### 3. Regulamentação de Crédito
**ATENÇÃO**: Área cinzenta legal no Brasil

- **NÃO SOMOS**: Instituição financeira
- **SOMOS**: Software de gestão
- **Disclaimer obrigatório**:
  > "Este aplicativo é uma ferramenta de gestão financeira pessoal.
  > Não somos uma instituição financeira e não realizamos operações
  > de crédito. A responsabilidade legal pelos empréstimos é do usuário."

### 4. Nota Fiscal e Impostos
- [ ] CNPJ aberto (MEI ou ME)
- [ ] Emissão de nota fiscal automática
- [ ] Integração com gateway de pagamento
- [ ] Enquadramento tributário (Simples Nacional recomendado)

---

## 🎨 Marketing e Go-to-Market

### Canais de Aquisição

#### 1. Google Ads (Prioridade Alta)
**Budget**: R$ 1.000 - 3.000/mês

**Keywords:**
- "app para agiota"
- "sistema de empréstimo pessoal"
- "controlar empréstimos"
- "gestão de agiotagem"

**Campanha sugerida:**
- Anúncio de busca: CPC R$ 2-5
- Display: Remarketing
- YouTube: Tutorial de uso

#### 2. Facebook/Instagram Ads (Prioridade Média)
**Budget**: R$ 500 - 1.500/mês

**Públicos:**
- Interesse: finanças, crédito, investimentos
- Comportamento: pequenos empreendedores
- Lookalike: base de usuários existentes

#### 3. Conteúdo (Prioridade Alta - Orgânico)
**Blog posts SEO:**
- "Como calcular juros de empréstimo"
- "Agiotagem é crime? Entenda a lei"
- "Como organizar seus empréstimos"
- "Melhores práticas para cobrar clientes"

#### 4. Parcerias e Afiliados
- Influencers de finanças (micro: 10-50k seguidores)
- Grupos de WhatsApp/Telegram de investidores
- Fóruns especializados
- Programa de afiliados: 10% comissão recorrente

#### 5. Comunidade
- Grupo VIP no Telegram
- Suporte via WhatsApp
- Lives mensais: "Como usar o Age Cred"

---

## 💡 Estratégia de Conversão

### Funil de Conversão

```
┌──────────────────────┐
│   1000 Visitantes    │
│     Landing Page     │
└──────────┬───────────┘
           │ 40% CVR
┌──────────▼───────────┐
│   400 Downloads      │
│    (App Install)     │
└──────────┬───────────┘
           │ 60% ativação
┌──────────▼───────────┐
│  240 Usuários Ativos │
│  (cadastrou cliente) │
└──────────┬───────────┘
           │ 15% upgrade
┌──────────▼───────────┐
│   36 Assinantes      │
│  (pagando R$ 29,90)  │
└──────────────────────┘

Receita mensal: 36 × R$ 29,90 = R$ 1.076,40
```

### Táticas de Conversão

#### 1. Trial de 7 dias (sem cartão)
```typescript
// Dar acesso total por 7 dias
const trialConfig = {
  duration: 7, // dias
  requiresCreditCard: false, // Não pedir cartão
  autoDowngrade: true, // Downgrade automático
  reminderEmails: [
    { day: 5, message: 'Faltam 2 dias do seu trial' },
    { day: 7, message: 'Seu trial expirou' },
  ],
};
```

#### 2. Onboarding guiado
- Welcome screen explicando benefícios
- Tutorial interativo (primeiro empréstimo)
- Quick wins: "Complete seu perfil" (gamification)

#### 3. Soft paywall
- Mostrar funcionalidades premium com blur
- CTA: "Upgrade para desbloquear"
- Comparação lado a lado: Free vs Pro

#### 4. Email marketing
**Sequência de onboarding:**
- Dia 0: Bem-vindo! Aqui está um guia rápido
- Dia 2: Criou seu primeiro empréstimo? [Tutorial]
- Dia 5: Recursos que você ainda não usou
- Dia 7: Últimos dias do trial - 50% OFF no primeiro mês

---

## 🛡️ Segurança

### Checklist de Segurança

#### App Mobile
- [ ] Criptografia AES-256 para dados sensíveis
- [ ] SSL Pinning (evitar man-in-the-middle)
- [ ] Biometria/PIN obrigatório
- [ ] Auto-logout após inatividade
- [ ] Ofuscar código (ProGuard/R8)
- [ ] Verificar jailbreak/root
- [ ] Limpar clipboard ao sair

#### Backend/API
- [ ] HTTPS obrigatório (TLS 1.3)
- [ ] Rate limiting (evitar ataques DDoS)
- [ ] JWT com expiração curta
- [ ] Sanitização de inputs (SQL injection)
- [ ] CORS configurado corretamente
- [ ] Secrets em variáveis de ambiente
- [ ] Logs sem dados sensíveis

#### Banco de Dados
- [ ] Criptografia at-rest
- [ ] Backups diários automáticos
- [ ] Replicação geográfica
- [ ] Auditoria de acessos
- [ ] CPF hasheado (SHA-256)

---

## 📈 Próximos Passos Imediatos

### Semana 1-2: Decisões Estratégicas
1. ✅ **Revisar este documento** com time/sócios
2. ✅ **Validar preços** com potenciais usuários
3. ✅ **Escolher stack backend** (recomendamos Supabase)
4. ✅ **Criar conta Stripe** e configurar produtos
5. ✅ **Definir orçamento** de marketing inicial

### Semana 3-4: Setup Técnico
6. ⚙️ Configurar Supabase
7. ⚙️ Criar schema de banco de dados
8. ⚙️ Implementar autenticação básica
9. ⚙️ Integrar Stripe SDK
10. ⚙️ Testar fluxo completo

### Mês 2: MVP Monetizado
11. 🚀 Deploy do backend
12. 🚀 Lançar versão com autenticação
13. 🚀 Ativar cobrança (modo teste)
14. 🚀 Beta com 10-20 usuários
15. 🚀 Iterar baseado em feedback

### Mês 3: Lançamento Público
16. 🎉 Landing page profissional
17. 🎉 Aprovação nas stores (Apple + Google)
18. 🎉 Campanha de lançamento
19. 🎉 Primeiros 100 usuários
20. 🎉 Primeiros R$ 1.000 MRR

---

## 💰 Investimento Necessário

### Custos Iniciais (Setup)
| Item | Valor | Frequência |
|------|-------|------------|
| Conta Stripe | R$ 0 | - |
| Supabase (Pro) | $25/mês | Mensal |
| Domínio (.com.br) | R$ 40 | Anual |
| Apple Developer | $99/ano | Anual |
| Google Play | $25 | Único |
| Advogado (Termos) | R$ 500-1.500 | Único |
| **TOTAL INICIAL** | **~R$ 2.000** | - |

### Custos Recorrentes (após lançamento)
| Item | Valor | Nota |
|------|-------|------|
| Supabase | $25-100/mês | Escala com uso |
| Stripe (fees) | 3,99% + R$ 0,39 | Por transação |
| Marketing | R$ 1.000-5.000/mês | Crescimento |
| Suporte | Seu tempo | - |
| **TOTAL MENSAL** | **~R$ 1.500-5.500** | Variável |

### Break-even
- **50 assinantes Professional** = R$ 1.495 MRR
- Cobre custos fixos + marketing básico
- Esperado em: **Mês 3-4**

---

## 🎯 Conclusão e Recomendações

### ✅ Faça Isso:
1. **Comece simples**: MVP com Supabase + Stripe
2. **Trial sem cartão**: Remove fricção de cadastro
3. **Freemium generoso**: 5 clientes é suficiente para testar
4. **Foco no onboarding**: Primeira impressão é crítica
5. **Suporte próximo**: Converse com primeiros usuários

### ❌ Evite Isso:
1. **Over-engineering**: Não construa tudo de uma vez
2. **Preço muito baixo**: R$ 29,90 está correto
3. **Ignorar legal**: Termos de uso são obrigatórios
4. **Sem analytics**: Impossível otimizar sem dados
5. **Lançamento perfeito**: Ship fast, iterate faster

### 🚀 Decisão Final

**Modelo Recomendado:**
- ✅ **Freemium** (5 clientes, 3 empréstimos)
- ✅ **Professional R$ 29,90/mês** (sweet spot)
- ✅ **Trial de 7 dias** (sem cartão)
- ✅ **Supabase + Stripe** (stack recomendada)

**Timeline Realista:**
- Mês 1-2: Desenvolvimento e testes
- Mês 3: Beta privado (50 usuários)
- Mês 4: Lançamento público
- Mês 6: 100-200 usuários pagos
- Mês 12: R$ 40.000+ MRR

---

## 📞 Próximas Ações

**Você está pronto para começar?**

1. Leia este documento completamente
2. Discuta com seus sócios/parceiros
3. Valide preços com 5-10 potenciais usuários
4. Tome a decisão de ir em frente
5. Comece pelo Sprint 1 do Roadmap

**Precisa de ajuda?**
- Use este documento como norte
- Adapte conforme feedback do mercado
- Não tenha medo de pivotar

---

**Boa sorte com o Age Cred! 🚀💰**
