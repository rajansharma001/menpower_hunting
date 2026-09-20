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

export type SupabaseStatus = 'unconfigured' | 'connecting' | 'ready' | 'missing_schema' | 'rls_error' | 'error';

export async function checkSupabaseHealth(): Promise<{ status: SupabaseStatus; message: string; agencyCount?: number }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { status: 'unconfigured', message: 'No Supabase credentials configured. Using local file storage.' };
  }

  try {
    const { count, error } = await supabase.from('agencies').select('*', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          status: 'missing_schema',
          message: 'Connected to Supabase project, but PostgreSQL tables are not yet created. Run schema.sql in your Supabase SQL Editor.'
        };
      }
      if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
        return {
          status: 'rls_error',
          message: 'Connected to Supabase, but Row Level Security is blocking writes. Run the updated schema.sql in Supabase SQL Editor.'
        };
      }
      return { status: 'error', message: `Supabase error: ${error.message}` };
    }

    return {
      status: 'ready',
      message: 'PostgreSQL tables active and ready in Supabase.',
      agencyCount: count ?? 0
    };
  } catch (err: any) {
    return { status: 'error', message: err.message || 'Connection check failed.' };
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string; status?: SupabaseStatus }> {
  try {
    const tempClient = createClient(url, key);
    const { error } = await tempClient.from('agencies').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return {
          success: false,
          status: 'missing_schema',
          message: 'Connected to Supabase project! Note: Database tables are not yet created. Please run schema.sql in Supabase SQL Editor.'
        };
      }
      if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
        return {
          success: false,
          status: 'rls_error',
          message: 'Connected, but RLS policy blocked query. Run updated schema.sql in Supabase SQL Editor.'
        };
      }
      return { success: false, status: 'error', message: error.message };
    }
    return { success: true, status: 'ready', message: 'Successfully connected! PostgreSQL database tables are verified and active.' };
  } catch (err: any) {
    return { success: false, status: 'error', message: err.message || 'Connection failed' };
  }
}

