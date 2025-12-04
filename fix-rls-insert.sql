-- =====================================================
-- FIX: Adicionar política de INSERT para tabela users
-- =====================================================

-- Permitir que usuários insiram seus próprios dados durante o signup
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
