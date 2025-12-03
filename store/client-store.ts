import { create } from 'zustand';
import { Client } from '@/types';
import * as db from '@/services/database';

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
}

interface ClientActions {
  fetchClients: () => Promise<void>;
  getClientById: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
  clearError: () => void;
}

export const useClientStore = create<ClientState & ClientActions>((set, get) => ({
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const clients = await db.getClients();
      set({ clients, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getClientById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const client = await db.getClientById(id);
      set({ selectedClient: client, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addClient: async (client) => {
    set({ loading: true, error: null });
    try {
      const newClient = await db.createClient(client);
      set((state) => ({
        clients: [...state.clients, newClient],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateClient: async (id, client) => {
    set({ loading: true, error: null });
    try {
      await db.updateClient(id, client);
      await get().fetchClients();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.deleteClient(id);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setSelectedClient: (client) => {
    set({ selectedClient: client });
  },

  clearError: () => {
    set({ error: null });
  },
}));
