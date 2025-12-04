# Configuração do Supabase - Age Cred

Este guia vai te ajudar a configurar o backend do Age Cred usando Supabase.

## 📋 Pré-requisitos

- Conta no Supabase (gratuito)
- Conta no Stripe (para pagamentos)
- Node.js instalado (para CLI do Supabase)

---

## 🚀 Passo 1: Criar Projeto no Supabase

### 1.1 Criar conta e projeto

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou Email
4. Clique em "New Project"
5. Preencha:
   - **Project Name**: `age-cred`
   - **Database Password**: Use um gerador de senhas seguras
   - **Region**: `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan**: Free (inicialmente)

6. Clique em "Create new project"
7. Aguarde 2-3 minutos para o projeto ser criado

### 1.2 Salvar credenciais

Após a criação, vá em **Settings > API** e salve:

- `Project URL`: `https://xxxxx.supabase.co`
- `anon public key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
- `service_role key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (NUNCA exponha no app)

---

## 🗄️ Passo 2: Criar Schema do Banco de Dados

### 2.1 Executar SQL no Supabase

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "+ New query"
3. Cole o SQL abaixo:

```sql
-- =====================================================
-- SCHEMA DO AGE CRED - Supabase Backend
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Assinatura
  subscription_status VARCHAR(50) DEFAULT 'free', -- 'free', 'professional', 'enterprise'
  subscription_id VARCHAR(255), -- Stripe subscription ID
  stripe_customer_id VARCHAR(255), -- Stripe customer ID
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TABELA DE CLIENTES
-- =====================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Dados do cliente
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  deleted_at TIMESTAMP,

  -- ID local do dispositivo (para sincronização)
  local_id VARCHAR(255)
);

-- Índices
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_clients_local_id ON clients(local_id);

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. TABELA DE EMPRÉSTIMOS
-- =====================================================
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Dados do empréstimo
  amount DECIMAL(12, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  interest_type VARCHAR(20) NOT NULL, -- 'simple', 'compound'
  installments INTEGER NOT NULL,
  payment_frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  first_payment_date DATE NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  deleted_at TIMESTAMP,

  -- ID local do dispositivo (para sincronização)
  local_id VARCHAR(255)
);

-- Índices
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_client_id ON loans(client_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_local_id ON loans(local_id);

CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. TABELA DE PARCELAS
-- =====================================================
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,

  -- Dados da parcela
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,

  -- Pagamento
  paid_at TIMESTAMP,
  paid_amount DECIMAL(12, 2),

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'overdue'

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  deleted_at TIMESTAMP,

  -- ID local do dispositivo (para sincronização)
  local_id VARCHAR(255)
);

-- Índices
CREATE INDEX idx_installments_loan_id ON installments(loan_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_installments_local_id ON installments(local_id);

CREATE TRIGGER update_installments_updated_at
BEFORE UPDATE ON installments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. TABELA DE BACKUPS (opcional)
-- =====================================================
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Dados do backup
  backup_type VARCHAR(50) NOT NULL, -- 'manual', 'automatic'
  file_url TEXT NOT NULL, -- URL no Supabase Storage
  file_size BIGINT,

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Índice
CREATE INDEX idx_backups_user_id ON backups(user_id);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Política para USERS
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Política para CLIENTS
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (user_id = auth.uid());

-- Política para LOANS
CREATE POLICY "Users can view own loans"
  ON loans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own loans"
  ON loans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own loans"
  ON loans FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own loans"
  ON loans FOR DELETE
  USING (user_id = auth.uid());

-- Política para INSTALLMENTS (via loan_id)
CREATE POLICY "Users can view own installments"
  ON installments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM loans WHERE loans.id = installments.loan_id AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own installments"
  ON installments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM loans WHERE loans.id = installments.loan_id AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own installments"
  ON installments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM loans WHERE loans.id = installments.loan_id AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own installments"
  ON installments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM loans WHERE loans.id = installments.loan_id AND loans.user_id = auth.uid()
  ));

-- Política para BACKUPS
CREATE POLICY "Users can view own backups"
  ON backups FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own backups"
  ON backups FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 7. FUNÇÕES ÚTEIS
-- =====================================================

-- Função para calcular total de empréstimos ativos por usuário
CREATE OR REPLACE FUNCTION get_user_active_loans_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM loans
    WHERE user_id = p_user_id
      AND status = 'active'
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular total de clientes por usuário
CREATE OR REPLACE FUNCTION get_user_clients_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM clients
    WHERE user_id = p_user_id
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SUCESSO! 🎉
-- =====================================================
-- Seu banco de dados está pronto para uso!
```

4. Clique em "Run" para executar
5. Verifique se não há erros

---

## 🔐 Passo 3: Configurar Autenticação

### 3.1 Configurar Email Provider

1. No dashboard, vá em **Authentication > Providers**
2. Ative o **Email** provider (já vem ativado por padrão)
3. Configure:
   - **Enable Email Confirmations**: Ative (recomendado)
   - **Secure email change**: Ative (recomendado)

### 3.2 Configurar Email Templates (opcional)

1. Vá em **Authentication > Email Templates**
2. Personalize os templates:
   - Confirm signup
   - Reset password
   - Magic link

---

## 📱 Passo 4: Integrar no App React Native

### 4.1 Instalar dependências

```bash
npm install @supabase/supabase-js
```

### 4.2 Criar arquivo de configuração

Crie o arquivo `services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Seu Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'; // Seu anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 4.3 Atualizar o Auth Store

Atualize `store/auth-store.ts` para usar o Supabase:

```typescript
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';

export type SubscriptionStatus = 'free' | 'professional' | 'enterprise';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId?: string;
  trialEndsAt?: Date;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  acceptedTerms: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateSubscription: (status: SubscriptionStatus) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Buscar dados do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError) throw userError;

          set({
            user: {
              id: userData.id,
              email: userData.email,
              fullName: userData.full_name,
              phone: userData.phone,
              subscriptionStatus: userData.subscription_status as SubscriptionStatus,
              subscriptionId: userData.subscription_id,
              trialEndsAt: userData.trial_ends_at ? new Date(userData.trial_ends_at) : undefined,
            },
            isAuthenticated: true,
            isLoading: false,
          });

          // Atualizar last_login_at
          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Erro ao fazer login');
        }
      },

      signUp: async (signUpData: SignUpData) => {
        set({ isLoading: true });
        try {
          // Criar usuário no Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email: signUpData.email,
            password: signUpData.password,
          });

          if (error) throw error;
          if (!data.user) throw new Error('Erro ao criar usuário');

          // Criar registro na tabela users
          const { error: userError } = await supabase.from('users').insert({
            id: data.user.id,
            email: signUpData.email,
            full_name: signUpData.fullName,
            phone: signUpData.phone,
            subscription_status: 'free',
            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
          });

          if (userError) throw userError;

          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Erro ao criar conta');
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
          });
        } catch (error: any) {
          throw new Error(error.message || 'Erro ao fazer logout');
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'agecred://reset-password',
          });

          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message || 'Erro ao enviar email de recuperação');
        }
      },

      updateSubscription: (status: SubscriptionStatus) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              subscriptionStatus: status,
            },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 💳 Passo 5: Configurar Stripe (Pagamentos)

### 5.1 Criar conta Stripe

1. Acesse [https://stripe.com/br](https://stripe.com/br)
2. Crie uma conta
3. Ative o modo de teste

### 5.2 Criar produtos e preços

1. No dashboard do Stripe, vá em **Products**
2. Crie os produtos:

**Produto 1: Age Cred Profissional**
- Nome: `Age Cred Profissional`
- Preço mensal: `R$ 29,90`
- Preço anual: `R$ 299,00`
- Trial: 7 dias

**Produto 2: Age Cred Empresarial**
- Nome: `Age Cred Empresarial`
- Preço mensal: `R$ 79,90`
- Preço anual: `R$ 799,00`
- Trial: 7 dias

3. Copie os `price_id` de cada preço (será usado no app)

### 5.3 Configurar Webhooks

1. Vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://xxxxx.supabase.co/functions/v1/stripe-webhook`
4. Eventos para escutar:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copie o **Webhook Secret** (será usado no backend)

---

## 🔧 Passo 6: Criar Edge Functions (Backend)

### 6.1 Instalar Supabase CLI

```bash
npm install -g supabase
```

### 6.2 Fazer login

```bash
supabase login
```

### 6.3 Inicializar projeto

```bash
supabase init
```

### 6.4 Criar função de webhook do Stripe

Crie o arquivo `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    console.log('Stripe event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Determinar tipo de plano baseado no price_id
        let subscriptionStatus = 'free';
        const priceId = subscription.items.data[0]?.price.id;

        if (priceId?.includes('professional')) {
          subscriptionStatus = 'professional';
        } else if (priceId?.includes('enterprise')) {
          subscriptionStatus = 'enterprise';
        }

        // Atualizar usuário
        await supabase
          .from('users')
          .update({
            subscription_status: subscriptionStatus,
            subscription_id: subscription.id,
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer as string);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Downgrade para free
        await supabase
          .from('users')
          .update({
            subscription_status: 'free',
            subscription_id: null,
            subscription_ends_at: null,
          })
          .eq('stripe_customer_id', subscription.customer as string);

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return new Response(err.message, { status: 400 });
  }
});
```

### 6.5 Deploy da função

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

---

## ✅ Passo 7: Testar Tudo

### 7.1 Testar autenticação

1. Abra o app
2. Tente criar uma conta
3. Verifique se o usuário aparece no Supabase > Authentication
4. Tente fazer login
5. Tente recuperar senha

### 7.2 Testar sincronização

1. Crie um cliente no app
2. Verifique se aparece no Supabase > Table Editor > clients

---

## 🎉 Pronto!

Seu backend está configurado e pronto para uso!

### Próximos passos:

1. ✅ Implementar tela de checkout com Stripe
2. ✅ Implementar sincronização de dados (SQLite ↔ Supabase)
3. ✅ Implementar limites de plano (5 clientes, 3 empréstimos)
4. ✅ Implementar backup automático
5. ✅ Testar fluxo completo de pagamento

---

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Stripe](https://stripe.com/docs)
- [Supabase + React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Stripe + React Native](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)

---

**Precisa de ajuda?** Abra uma issue no repositório ou consulte a documentação oficial.
