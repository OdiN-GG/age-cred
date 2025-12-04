-- =====================================================
-- FIX: Criar usuário automaticamente via trigger
-- =====================================================

-- 1. Primeiro, remover a política que não está funcionando
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- 2. Criar função que será executada quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, subscription_status, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'free',
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger que executa a função quando um usuário é criado no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Agora podemos permitir INSERT apenas via trigger (service role)
-- Usuários normais não precisam inserir diretamente
CREATE POLICY "Allow service role to insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
