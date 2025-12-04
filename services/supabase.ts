import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL ou Anon Key não configurados!\n' +
    'Por favor, configure as variáveis de ambiente no arquivo .env:\n' +
    '- EXPO_PUBLIC_SUPABASE_URL\n' +
    '- EXPO_PUBLIC_SUPABASE_ANON_KEY\n\n' +
    'Usando modo de desenvolvimento com mocks.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
