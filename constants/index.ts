import { ClientScore, PaymentFrequency } from '@/types';

export const PAYMENT_FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  [PaymentFrequency.DAILY]: 'Diário',
  [PaymentFrequency.WEEKLY]: 'Semanal',
  [PaymentFrequency.MONTHLY]: 'Mensal',
};

export const CLIENT_SCORE_LABELS: Record<ClientScore, string> = {
  [ClientScore.GOOD]: 'Bom Pagador',
  [ClientScore.REGULAR]: 'Regular',
  [ClientScore.DEFAULTER]: 'Inadimplente',
};

export const CLIENT_SCORE_COLORS: Record<ClientScore, string> = {
  [ClientScore.GOOD]: '#22c55e',
  [ClientScore.REGULAR]: '#eab308',
  [ClientScore.DEFAULTER]: '#ef4444',
};

export const CPF_MASK = '999.999.999-99';
export const PHONE_MASK = '(99) 99999-9999';
export const CEP_MASK = '99999-999';

export const DEFAULT_LATE_INTEREST_RATE = 0.033; // 0.033% ao dia = ~1% ao mês
export const MIN_LOAN_AMOUNT = 100;
export const MAX_LOAN_AMOUNT = 1000000;
export const MIN_INSTALLMENTS = 1;
export const MAX_INSTALLMENTS = 360;

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';

/**
 * Configurações de Debug
 * __DEV__ é uma variável global do React Native que é:
 * - true em desenvolvimento (npm start, expo start)
 * - false em produção (build de release)
 */
export const DEBUG_MODE = __DEV__; // Automaticamente desabilitado em produção
export const ENABLE_TIME_TRAVEL = DEBUG_MODE; // Desabilita time travel em produção
export const SHOW_DEBUG_LOGS = DEBUG_MODE; // Desabilita logs de debug em produção

export * from './theme';
