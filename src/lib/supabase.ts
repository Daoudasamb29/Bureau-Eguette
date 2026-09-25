import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Try loading env vars from Vite import.meta.env or standard process.env
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) ||
  '';

const supabaseKey = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.SUPABASE_SERVICE_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.SUPABASE_SERVICE_KEY) ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
