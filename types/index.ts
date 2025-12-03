// ==================== ENUMS ====================

export enum ClientScore {
  GOOD = 'BOM',
  REGULAR = 'REGULAR',
  DEFAULTER = 'INADIMPLENTE',
}

export enum PaymentFrequency {
  DAILY = 'DIARIO',
  WEEKLY = 'SEMANAL',
  MONTHLY = 'MENSAL',
}

export enum InstallmentStatus {
  PENDING = 'PENDENTE',
  PAID = 'PAGO',
  OVERDUE = 'ATRASADO',
}

export enum LoanStatus {
  ACTIVE = 'ATIVO',
  COMPLETED = 'CONCLUIDO',
  DEFAULTED = 'INADIMPLENTE',
  CANCELLED = 'CANCELADO',
}

// ==================== INTERFACES ====================

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Client {
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

export interface Installment {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: Date;
  originalAmount: number;
  paidAmount?: number;
  interestAmount: number; // Juros por atraso
  totalAmount: number; // Valor original + juros
  status: InstallmentStatus;
  paidAt?: Date;
  paymentProofUri?: string; // Comprovante de pagamento
  notes?: string;
}

export interface Loan {
  id: string;
  clientId: string;
  principalAmount: number; // Valor principal emprestado
  interestRate: number; // Taxa de juros (%)
  lateInterestRate: number; // Taxa de juros por atraso (% ao dia/semana/mês)
  paymentFrequency: PaymentFrequency;
  totalInstallments: number;
  installmentAmount: number; // Valor de cada parcela
  totalAmount: number; // Valor total do empréstimo com juros
  startDate: Date;
  endDate: Date;
  status: LoanStatus;
  installments: Installment[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeLoans: number;
  totalLent: number; // Total emprestado
  totalReceived: number; // Total recebido
  totalPending: number; // Total a receber
  totalOverdue: number; // Total em atraso
  monthlyRevenue: number; // Receita do mês
  monthlyProfit: number; // Lucro do mês (juros)
}

export interface PaymentReminder {
  id: string;
  clientId: string;
  loanId: string;
  installmentId: string;
  dueDate: Date;
  amount: number;
  sent: boolean;
  sentAt?: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment_due' | 'payment_overdue' | 'payment_received' | 'general';
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}

// ==================== FORM TYPES ====================

export interface ClientFormData {
  name: string;
  cpf: string;
  phone: string;
  whatsapp: string;
  address: Address;
  photoUri?: string;
  notes?: string;
}

export interface LoanFormData {
  clientId: string;
  principalAmount: number;
  interestRate: number;
  lateInterestRate: number;
  paymentFrequency: PaymentFrequency;
  totalInstallments: number;
  startDate: Date;
  notes?: string;
}

// ==================== UTILITY TYPES ====================

export interface FilterOptions {
  status?: LoanStatus | InstallmentStatus;
  clientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}
