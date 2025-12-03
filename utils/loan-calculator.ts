import { addDays, addWeeks, addMonths, differenceInDays } from 'date-fns';
import { PaymentFrequency, Installment, InstallmentStatus } from '@/types';
import { useDebugStore } from '@/store';

/**
 * Obtém a data atual (real ou simulada)
 */
export const getCurrentDate = (): Date => {
  try {
    const debugState = useDebugStore.getState();
    return debugState.getCurrentDate();
  } catch {
    return new Date();
  }
};

/**
 * Calcula o valor total do empréstimo com juros
 */
export const calculateTotalAmount = (principalAmount: number, interestRate: number): number => {
  return principalAmount * (1 + interestRate / 100);
};

/**
 * Calcula o valor de cada parcela
 */
export const calculateInstallmentAmount = (totalAmount: number, totalInstallments: number): number => {
  return totalAmount / totalInstallments;
};

/**
 * Calcula a data de vencimento da próxima parcela
 */
export const calculateNextDueDate = (
  startDate: Date,
  installmentNumber: number,
  frequency: PaymentFrequency
): Date => {
  switch (frequency) {
    case PaymentFrequency.DAILY:
      return addDays(startDate, installmentNumber);
    case PaymentFrequency.WEEKLY:
      return addWeeks(startDate, installmentNumber);
    case PaymentFrequency.MONTHLY:
      return addMonths(startDate, installmentNumber);
    default:
      return startDate;
  }
};

/**
 * Calcula a data final do empréstimo
 */
export const calculateEndDate = (
  startDate: Date,
  totalInstallments: number,
  frequency: PaymentFrequency
): Date => {
  return calculateNextDueDate(startDate, totalInstallments - 1, frequency);
};

/**
 * Calcula os juros por atraso
 */
export const calculateLateInterest = (
  originalAmount: number,
  dueDate: Date,
  lateInterestRate: number,
  paymentDate?: Date
): number => {
  const today = getCurrentDate();
  const actualPaymentDate = paymentDate || today;

  if (actualPaymentDate <= dueDate) {
    return 0;
  }

  const daysLate = differenceInDays(actualPaymentDate, dueDate);
  return originalAmount * (lateInterestRate / 100) * daysLate;
};

/**
 * Calcula o status da parcela baseado na data de vencimento
 */
export const calculateInstallmentStatus = (
  dueDate: Date,
  isPaid: boolean
): InstallmentStatus => {
  if (isPaid) {
    return InstallmentStatus.PAID;
  }

  const today = getCurrentDate();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due < today) {
    return InstallmentStatus.OVERDUE;
  }

  return InstallmentStatus.PENDING;
};

/**
 * Gera as parcelas do empréstimo
 */
export const generateInstallments = (
  loanId: string,
  startDate: Date,
  installmentAmount: number,
  totalInstallments: number,
  frequency: PaymentFrequency
): Omit<Installment, 'id'>[] => {
  const installments: Omit<Installment, 'id'>[] = [];

  for (let i = 0; i < totalInstallments; i++) {
    const dueDate = calculateNextDueDate(startDate, i, frequency);
    const status = calculateInstallmentStatus(dueDate, false);

    installments.push({
      loanId,
      installmentNumber: i + 1,
      dueDate,
      originalAmount: installmentAmount,
      interestAmount: 0,
      totalAmount: installmentAmount,
      status,
    });
  }

  return installments;
};

/**
 * Atualiza o valor total da parcela com juros de atraso
 */
export const updateInstallmentWithLateInterest = (
  installment: Installment,
  lateInterestRate: number
): Installment => {
  const lateInterest = calculateLateInterest(
    installment.originalAmount,
    installment.dueDate,
    lateInterestRate
  );

  return {
    ...installment,
    interestAmount: lateInterest,
    totalAmount: installment.originalAmount + lateInterest,
    status: calculateInstallmentStatus(installment.dueDate, installment.status === InstallmentStatus.PAID),
  };
};

/**
 * Calcula o total pago de um empréstimo
 */
export const calculateTotalPaid = (installments: Installment[]): number => {
  return installments
    .filter(i => i.status === InstallmentStatus.PAID)
    .reduce((sum, i) => sum + (i.paidAmount || 0), 0);
};

/**
 * Calcula o total pendente de um empréstimo
 */
export const calculateTotalPending = (installments: Installment[]): number => {
  return installments
    .filter(i => i.status !== InstallmentStatus.PAID)
    .reduce((sum, i) => sum + i.totalAmount, 0);
};

/**
 * Calcula o total em atraso de um empréstimo
 */
export const calculateTotalOverdue = (installments: Installment[]): number => {
  return installments
    .filter(i => i.status === InstallmentStatus.OVERDUE)
    .reduce((sum, i) => sum + i.totalAmount, 0);
};

/**
 * Calcula a porcentagem paga do empréstimo
 */
export const calculatePaymentProgress = (installments: Installment[]): number => {
  const totalInstallments = installments.length;
  const paidInstallments = installments.filter(i => i.status === InstallmentStatus.PAID).length;

  return totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
};

/**
 * Formata valor em moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

/**
 * Formata CPF
 */
export const formatCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata telefone
 */
export const formatPhone = (phone: string): string => {
  phone = phone.replace(/[^\d]/g, '');
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};
