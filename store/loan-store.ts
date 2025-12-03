import { create } from 'zustand';
import { Loan, Installment, LoanStatus, InstallmentStatus } from '@/types';
import * as db from '@/services/database';
import {
  calculateTotalAmount,
  calculateInstallmentAmount,
  calculateEndDate,
  generateInstallments,
  updateInstallmentWithLateInterest,
} from '@/utils';

interface LoanState {
  loans: Loan[];
  selectedLoan: Loan | null;
  loading: boolean;
  error: string | null;
}

interface LoanActions {
  fetchLoans: () => Promise<void>;
  getLoanById: (id: string) => Promise<void>;
  getLoansByClientId: (clientId: string) => Promise<Loan[]>;
  addLoan: (loanData: {
    clientId: string;
    principalAmount: number;
    interestRate: number;
    lateInterestRate: number;
    paymentFrequency: string;
    totalInstallments: number;
    startDate: Date;
    notes?: string;
  }) => Promise<void>;
  updateLoan: (id: string, loan: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  markInstallmentAsPaid: (installmentId: string, paidAmount: number, paymentProofUri?: string) => Promise<void>;
  updateInstallmentsStatus: () => Promise<void>;
  setSelectedLoan: (loan: Loan | null) => void;
  clearError: () => void;
}

export const useLoanStore = create<LoanState & LoanActions>((set, get) => ({
  loans: [],
  selectedLoan: null,
  loading: false,
  error: null,

  fetchLoans: async () => {
    set({ loading: true, error: null });
    try {
      const loans = await db.getLoans();
      const loansWithInstallments = await Promise.all(
        loans.map(async (loan) => {
          const installments = await db.getInstallmentsByLoanId(loan.id);
          return { ...loan, installments };
        })
      );
      set({ loans: loansWithInstallments, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getLoanById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const loan = await db.getLoanById(id);
      set({ selectedLoan: loan, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getLoansByClientId: async (clientId: string) => {
    try {
      const loans = await db.getLoansByClientId(clientId);
      return loans;
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    }
  },

  addLoan: async (loanData) => {
    set({ loading: true, error: null });
    try {
      const totalAmount = calculateTotalAmount(
        loanData.principalAmount,
        loanData.interestRate
      );
      const installmentAmount = calculateInstallmentAmount(
        totalAmount,
        loanData.totalInstallments
      );
      const endDate = calculateEndDate(
        loanData.startDate,
        loanData.totalInstallments,
        loanData.paymentFrequency as any
      );

      const loan = await db.createLoan({
        clientId: loanData.clientId,
        principalAmount: loanData.principalAmount,
        interestRate: loanData.interestRate,
        lateInterestRate: loanData.lateInterestRate,
        paymentFrequency: loanData.paymentFrequency as any,
        totalInstallments: loanData.totalInstallments,
        installmentAmount,
        totalAmount,
        startDate: loanData.startDate,
        endDate,
        status: LoanStatus.ACTIVE,
        notes: loanData.notes,
      });

      const installments = generateInstallments(
        loan.id,
        loanData.startDate,
        installmentAmount,
        loanData.totalInstallments,
        loanData.paymentFrequency as any
      );

      await Promise.all(
        installments.map((installment) => db.createInstallment(installment))
      );

      await get().fetchLoans();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateLoan: async (id, loan) => {
    set({ loading: true, error: null });
    try {
      await db.updateLoan(id, loan);
      await get().fetchLoans();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteLoan: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.deleteLoan(id);
      set((state) => ({
        loans: state.loans.filter((l) => l.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  markInstallmentAsPaid: async (installmentId, paidAmount, paymentProofUri) => {
    set({ loading: true, error: null });
    try {
      await db.updateInstallment(installmentId, {
        paidAmount,
        status: InstallmentStatus.PAID,
        paidAt: new Date(),
        paymentProofUri,
      });

      await get().fetchLoans();

      if (get().selectedLoan) {
        await get().getLoanById(get().selectedLoan!.id);
      }

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateInstallmentsStatus: async () => {
    try {
      const loans = get().loans;

      for (const loan of loans) {
        for (const installment of loan.installments) {
          if (installment.status !== InstallmentStatus.PAID) {
            const updatedInstallment = updateInstallmentWithLateInterest(
              installment,
              loan.lateInterestRate
            );

            if (
              updatedInstallment.status !== installment.status ||
              updatedInstallment.totalAmount !== installment.totalAmount
            ) {
              await db.updateInstallment(installment.id, {
                status: updatedInstallment.status,
                interestAmount: updatedInstallment.interestAmount,
                totalAmount: updatedInstallment.totalAmount,
              });
            }
          }
        }
      }

      await get().fetchLoans();
    } catch (error) {
      console.error('Error updating installments status:', error);
    }
  },

  setSelectedLoan: (loan) => {
    set({ selectedLoan: loan });
  },

  clearError: () => {
    set({ error: null });
  },
}));
