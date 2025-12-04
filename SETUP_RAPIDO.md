# 🚀 Setup Rápido - Age Cred

## ✅ O que já está pronto

- ✅ Frontend completo (Login, Cadastro, Recuperação de Senha)
- ✅ Store de autenticação com Zustand
- ✅ Integração com Supabase configurada
- ✅ Tela de pricing/planos
- ✅ Sistema de proteção de rotas

---

## 🔧 Como configurar o Supabase (Obrigatório para produção)

### Opção 1: Testar com Mock (Desenvolvimento)

O app **já funciona em modo desenvolvimento** sem configurar o Supabase!

```bash
npm start
```

Você pode:
- Criar conta (dados ficam no AsyncStorage local)
- Fazer login
- Testar toda a navegação

**Limitações do mock:**
- Dados não persistem entre instalações
- Não tem backend real
- Não sincroniza entre dispositivos

---

### Opção 2: Configurar Supabase Real (Recomendado)

#### Passo 1: Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Preencha:
   - **Name**: `age-cred`
   - **Database Password**: Gere uma senha forte
   - **Region**: `South America (São Paulo)`
5. Aguarde 2-3 minutos

#### Passo 2: Executar SQL do banco

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "+ New query"
3. Cole todo o SQL que está em `SUPABASE_SETUP.md` (a partir da linha 48)
4. Clique em "Run"
5. Verifique se não há erros

#### Passo 3: Copiar credenciais

1. Vá em **Settings > API**
2. Copie:
   - **Project URL**
   - **anon public key**

#### Passo 4: Configurar no app

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os valores:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Reinicie o servidor Expo:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm start
```

#### Passo 5: Testar

1. Abra o app
2. Crie uma nova conta
3. Verifique se o usuário aparece em:
   - **Supabase Dashboard > Authentication > Users**
   - **Supabase Dashboard > Table Editor > users**

---

## 📱 Como testar agora (sem Supabase)

### 1. Iniciar o app

```bash
npm start
```

### 2. Escolher plataforma

- Pressione `a` para Android
- Pressione `i` para iOS
- Ou escaneie o QR code com Expo Go

### 3. Testar funcionalidades

**Criar conta:**
1. Toque em "Criar nova conta"
2. Preencha os dados
3. Aceite os termos
4. Toque em "Criar conta"
5. ✅ Você será redirecionado para o dashboard

**Fazer login:**
1. Use o email que você cadastrou
2. Use qualquer senha (em modo mock)
3. ✅ Login funcionará

**Recuperar senha:**
1. Toque em "Esqueci minha senha"
2. Digite um email
3. ✅ Verá mensagem de sucesso (simulado)

**Ver planos:**
1. Navegue até a tela de pricing (se disponível)
2. ✅ Verá os 3 planos (Gratuito, Profissional, Empresarial)

---

## 🎯 Próximos Passos

### Agora (Desenvolvimento)
- [x] ✅ App funcionando com mocks
- [ ] Testar todas as telas
- [ ] Validar fluxo de navegação
- [ ] Testar em dispositivo físico

### Depois (Produção)
1. [ ] Configurar Supabase (seguir SUPABASE_SETUP.md)
2. [ ] Testar autenticação real
3. [ ] Configurar Stripe para pagamentos
4. [ ] Implementar limites do plano gratuito
5. [ ] Implementar sincronização de dados

---

## 🐛 Troubleshooting

### "Cannot find module '@/services/supabase'"

**Solução:**
```bash
# Limpar cache
npx expo start -c
```

### "Supabase URL ou Anon Key não configurados"

Isso é normal! O app funciona em modo mock. Para usar Supabase real, configure o `.env`.

### Erro ao instalar dependências

```bash
# Limpar tudo e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro no TypeScript

```bash
# Verificar erros
npx tsc --noEmit
```

---

## 📚 Documentação Completa

- **Plano de Monetização**: `MONETIZATION_PLAN.md`
- **Setup do Supabase**: `SUPABASE_SETUP.md`
- **Implementação de Auth**: `AUTH_IMPLEMENTATION.md`

---

## 🎉 Pronto!

Seu app está funcionando em modo de desenvolvimento com mocks.

**Quando quiser ir para produção:**
1. Siga o guia `SUPABASE_SETUP.md`
2. Configure o `.env` com suas credenciais
3. Teste autenticação real
4. Configure pagamentos com Stripe

**Precisa de ajuda?** Consulte a documentação ou abra uma issue.
