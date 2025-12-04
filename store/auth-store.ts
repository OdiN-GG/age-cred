import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

export type SubscriptionStatus = 'free' | 'professional' | 'enterprise';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId?: string;
  trialEndsAt?: Date;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateSubscription: (status: SubscriptionStatus) => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  acceptedTerms: boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Sign In
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Se Supabase não estiver configurado, usar mock em desenvolvimento
          if (!isSupabaseConfigured() && __DEV__) {
            console.log('🔧 Modo desenvolvimento: usando mock de autenticação');
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockUser: User = {
              id: '1',
              email: email,
              fullName: 'Usuário Teste',
              subscriptionStatus: 'free',
              createdAt: new Date(),
            };

            set({
              user: mockUser,
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token',
              isAuthenticated: true,
              isLoading: false,
            });

            return;
          }

          // Autenticação real com Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (!data.user) {
            throw new Error('Erro ao fazer login');
          }

          // Buscar dados do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError) throw userError;

          // Atualizar last_login_at
          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);

          set({
            user: {
              id: userData.id,
              email: userData.email,
              fullName: userData.full_name,
              phone: userData.phone,
              subscriptionStatus: userData.subscription_status as SubscriptionStatus,
              subscriptionId: userData.subscription_id,
              trialEndsAt: userData.trial_ends_at ? new Date(userData.trial_ends_at) : undefined,
              createdAt: new Date(userData.created_at),
            },
            accessToken: data.session?.access_token || null,
            refreshToken: data.session?.refresh_token || null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Erro no login:', error);
          set({
            error: (error as Error).message,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Sign Up
      signUp: async (data: SignUpData) => {
        set({ isLoading: true, error: null });

        try {
          if (!data.acceptedTerms) {
            throw new Error('Você deve aceitar os termos de uso');
          }

          // Se Supabase não estiver configurado, usar mock em desenvolvimento
          if (!isSupabaseConfigured() && __DEV__) {
            console.log('🔧 Modo desenvolvimento: usando mock de cadastro');
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockUser: User = {
              id: '1',
              email: data.email,
              fullName: data.fullName,
              phone: data.phone,
              subscriptionStatus: 'free',
              trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
              createdAt: new Date(),
            };

            set({
              user: mockUser,
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token',
              isAuthenticated: true,
              isLoading: false,
            });

            return;
          }

          // Cadastro real com Supabase
          // Passamos os dados como metadata que será usado pelo trigger
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                phone: data.phone,
              }
            }
          });

          if (authError) throw authError;
          if (!authData.user) throw new Error('Erro ao criar usuário');

          // O trigger handle_new_user() cria o registro automaticamente na tabela users
          // Agora fazemos login para pegar os dados completos
          await get().signIn(data.email, data.password);
        } catch (error) {
          console.error('Erro no cadastro:', error);
          set({
            error: (error as Error).message,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Sign Out
      signOut: async () => {
        set({ isLoading: true });

        try {
          // Se Supabase estiver configurado, fazer logout real
          if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
          }

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Erro no logout:', error);
          set({
            error: (error as Error).message,
            isLoading: false
          });
        }
      },

      // Reset Password
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // Se Supabase não estiver configurado, simular em desenvolvimento
          if (!isSupabaseConfigured() && __DEV__) {
            console.log('🔧 Modo desenvolvimento: simulando recuperação de senha');
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
            return;
          }

          // Recuperação real com Supabase
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'agecred://reset-password',
          });

          if (error) throw error;

          set({ isLoading: false });
        } catch (error) {
          console.error('Erro ao recuperar senha:', error);
          set({
            error: (error as Error).message,
            isLoading: false
          });
          throw error;
        }
      },

      // Refresh Access Token
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          // Se Supabase não estiver configurado, ignorar em desenvolvimento
          if (!isSupabaseConfigured() && __DEV__) {
            console.log('🔧 Modo desenvolvimento: refresh token simulado');
            return;
          }

          // Refresh real com Supabase
          const { data, error } = await supabase.auth.refreshSession();

          if (error) throw error;

          set({
            accessToken: data.session?.access_token || null,
            refreshToken: data.session?.refresh_token || null,
          });
        } catch (error) {
          console.error('Erro ao atualizar token:', error);
          // Se falhar, fazer logout
          get().signOut();
          throw error;
        }
      },

      // Update Subscription
      updateSubscription: (status: SubscriptionStatus) => {
        set((state) => ({
          user: state.user ? { ...state.user, subscriptionStatus: status } : null,
        }));
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Set User (útil para atualizar dados do usuário)
      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Não persistir tokens sensíveis por segurança
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
