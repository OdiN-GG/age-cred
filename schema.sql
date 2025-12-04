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
