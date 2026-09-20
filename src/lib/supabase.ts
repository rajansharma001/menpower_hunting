import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage override (configured in Settings) or env variables
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const customUrl = localStorage.getItem('manpower_supabase_url');
  const customKey = localStorage.getItem('manpower_supabase_anon_key');

  const env = (import.meta as any).env || {};
  const url = customUrl || env.VITE_SUPABASE_URL || '';
  const anonKey = customKey || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  return { url, anonKey };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const tempClient = createClient(url, key);
    const { error } = await tempClient.from('agencies').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's connected to Supabase but schema is pending
      if (error.message?.includes('relation "public.agencies" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase project! Note: Database schema tables are not yet created. Run schema.sql in Supabase SQL editor.'
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}
