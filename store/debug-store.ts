import { create } from 'zustand';

interface DebugStore {
  simulatedDate: Date | null;
  setSimulatedDate: (date: Date | null) => void;
  getCurrentDate: () => Date;
  addDays: (days: number) => void;
  resetDate: () => void;
}

export const useDebugStore = create<DebugStore>((set, get) => ({
  simulatedDate: null,

  setSimulatedDate: (date) => set({ simulatedDate: date }),

  getCurrentDate: () => {
    const { simulatedDate } = get();
    return simulatedDate || new Date();
  },

  addDays: (days) => {
    const current = get().getCurrentDate();
    const newDate = new Date(current);
    newDate.setDate(newDate.getDate() + days);
    set({ simulatedDate: newDate });
  },

  resetDate: () => set({ simulatedDate: null }),
}));
