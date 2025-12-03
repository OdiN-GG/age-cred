# Age Cred - Sistema de Gerenciamento de Empréstimos

Sistema completo para gerenciamento de empréstimos pessoais desenvolvido com React Native + Expo.

## Funcionalidades Principais

### Gestão de Clientes
- Cadastro completo com validação de CPF
- Dados pessoais: nome, CPF, telefone, WhatsApp
- Endereço completo
- Score de cliente (Bom Pagador, Regular, Inadimplente)
- Histórico de empréstimos
- Observações personalizadas

### Gestão de Empréstimos
- Criação de empréstimos com configuração personalizada
- Taxa de juros configurável
- Frequência de pagamento: Diário, Semanal ou Mensal
- Sistema completo de parcelas
- Cálculo automático de juros por atraso
- Controle individual de cada parcela
- Marcação de parcelas como pagas
- Anexo de comprovantes de pagamento

### Dashboard Financeiro
- Visão geral do negócio
- Total de clientes cadastrados
- Empréstimos ativos
- Total emprestado
- Total recebido
- Valor a receber
- Valor em atraso
- Alertas de inadimplência

### Cobrança via WhatsApp
- Envio de mensagens personalizadas
- Valor atualizado com juros de atraso
- Link direto para WhatsApp do cliente

## Tecnologias Utilizadas

- **React Native 0.81.5** - Framework principal
- **Expo SDK 54** - Plataforma de desenvolvimento
- **Expo Router 6** - Navegação baseada em arquivos
- **NativeWind 4** - Estilização com Tailwind CSS
- **TypeScript 5.9** - Tipagem estática
- **Zustand** - Gerenciamento de estado global
- **React Hook Form + Zod** - Formulários e validação
- **date-fns** - Manipulação de datas
- **Expo SQLite** - Persistência local de dados
- **Expo Notifications** - Notificações push
- **Expo Image Picker** - Captura de fotos
- **Expo File System** - Gerenciamento de arquivos

## Estrutura do Projeto

```
age-cred/
├── app/                        # Rotas do aplicativo (Expo Router)
│   ├── (tabs)/                # Navegação principal com tabs
│   │   ├── index.tsx         # Dashboard
│   │   ├── clients.tsx       # Lista de clientes
│   │   ├── loans.tsx         # Lista de empréstimos
│   │   └── settings.tsx      # Configurações
│   ├── clients/              # Rotas de clientes
│   │   ├── add.tsx          # Adicionar cliente
│   │   └── [id].tsx         # Detalhes do cliente
│   ├── loans/                # Rotas de empréstimos
│   │   ├── add.tsx          # Adicionar empréstimo
│   │   └── [id].tsx         # Detalhes do empréstimo
│   ├── _layout.tsx           # Layout raiz
│   └── index.tsx             # Redirecionamento inicial
├── components/                # Componentes reutilizáveis
│   └── ui/                   # Componentes de UI
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── StatCard.tsx
│       └── Badge.tsx
├── store/                     # Gerenciamento de estado (Zustand)
│   ├── client-store.ts       # Estado de clientes
│   └── loan-store.ts         # Estado de empréstimos
├── services/                  # Serviços e APIs
│   └── database.ts           # Operações SQLite
├── types/                     # Definições TypeScript
│   └── index.ts              # Tipos e interfaces
├── utils/                     # Funções utilitárias
│   └── loan-calculator.ts    # Cálculos de empréstimos
├── constants/                 # Constantes e configurações
│   ├── index.ts
│   └── theme.ts
└── global.css                # Estilos globais NativeWind
```

## Modelagem de Dados

### Cliente
```typescript
interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  whatsapp: string;
  address: Address;
  photoUri?: string;
  score: ClientScore;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
```

### Empréstimo
```typescript
interface Loan {
  id: string;
  clientId: string;
  principalAmount: number;
  interestRate: number;
  lateInterestRate: number;
  paymentFrequency: PaymentFrequency;
  totalInstallments: number;
  installmentAmount: number;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  status: LoanStatus;
  installments: Installment[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
```

### Parcela
```typescript
interface Installment {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: Date;
  originalAmount: number;
  paidAmount?: number;
  interestAmount: number;
  totalAmount: number;
  status: InstallmentStatus;
  paidAt?: Date;
  paymentProofUri?: string;
  notes?: string;
}
```

## Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Expo Go app no celular (iOS/Android)

### Instalação

1. Clone o repositório (se aplicável)
```bash
git clone <repository-url>
cd age-cred
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor de desenvolvimento
```bash
npm start
```

4. Escaneie o QR code com o Expo Go app

### Comandos Disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run android    # Abre no emulador Android
npm run ios        # Abre no simulador iOS
npm run web        # Abre no navegador
```

## Funcionalidades Implementadas

✅ Cadastro completo de clientes
✅ Validação de CPF
✅ Gestão de empréstimos
✅ Sistema de parcelas
✅ Cálculo automático de juros por atraso
✅ Marcação de parcelas como pagas
✅ Dashboard financeiro
✅ Integração com WhatsApp
✅ Persistência local com SQLite
✅ Interface responsiva com NativeWind
✅ Validação de formulários com Zod
✅ Gerenciamento de estado com Zustand
✅ **Time Travel** para simular datas (apenas em desenvolvimento)

## Funcionalidades Futuras

- [ ] Notificações de vencimento
- [ ] Relatórios e exportação para PDF
- [ ] Backup automático na nuvem
- [ ] Autenticação (PIN/Biometria)
- [ ] Gráficos de evolução
- [ ] Modo offline completo
- [ ] Busca e filtros avançados
- [ ] Histórico completo de operações
- [ ] Múltiplos usuários
- [ ] Configurações personalizadas

## Funcionalidades de Desenvolvimento

### Time Travel (Simulação de Datas)

O app possui uma funcionalidade de **Time Travel** que permite simular diferentes datas para testar parcelas atrasadas e juros de mora. Esta funcionalidade está **automaticamente desabilitada em produção**.

#### Como usar:

1. **No ambiente de desenvolvimento**, um botão de relógio (⏰) aparece no Dashboard
2. Clique no botão para abrir o modal "Time Travel"
3. Escolha uma das opções:
   - **+1 dia**: avança 1 dia
   - **+7 dias**: avança 1 semana
   - **Campo customizado**: digite qualquer número (positivo para avançar, negativo para voltar)
   - **Resetar**: volta para a data real

4. O sistema recalculará automaticamente:
   - Status das parcelas (PENDENTE → ATRASADO)
   - Juros de mora acumulados
   - Estatísticas do dashboard

#### Comportamento em Produção:

**Quando você gerar o build de produção** (APK/AAB para Android ou IPA para iOS), a funcionalidade será **automaticamente desabilitada** através da variável global `__DEV__` do React Native.

Não é necessário fazer nada manualmente - o código já está preparado para detectar o ambiente automaticamente:

- **Desenvolvimento** (`npm start`, `expo start`): Time Travel **ATIVO** ✅
- **Produção** (build de release): Time Travel **DESABILITADO** ❌

#### Configurações Disponíveis:

Em `constants/index.ts`, você encontra:

```typescript
export const DEBUG_MODE = __DEV__;              // Modo debug geral
export const ENABLE_TIME_TRAVEL = DEBUG_MODE;   // Simulação de datas
export const SHOW_DEBUG_LOGS = DEBUG_MODE;      // Logs de debug
```

Se desejar **desabilitar manualmente** em desenvolvimento, basta alterar:

```typescript
export const ENABLE_TIME_TRAVEL = false; // Desabilitado manualmente
```

## Regras de Negócio

### Cálculo de Empréstimos
- Valor Total = Valor Principal × (1 + Taxa de Juros / 100)
- Valor da Parcela = Valor Total / Número de Parcelas
- Juros por Atraso = Valor Original × (Taxa de Atraso / 100) × Dias em Atraso

### Status de Parcelas
- **Pendente**: Data de vencimento futura
- **Atrasado**: Data de vencimento passada e não pago
- **Pago**: Marcado como pago

### Score de Clientes
- **Bom Pagador**: Cliente com histórico positivo
- **Regular**: Cliente com alguns atrasos
- **Inadimplente**: Cliente com muitos atrasos ou inadimplência

## Contribuição

Este é um projeto pessoal desenvolvido para demonstração de habilidades em React Native.

## Licença

MIT License

## Autor

Desenvolvido com Claude Code 🤖
