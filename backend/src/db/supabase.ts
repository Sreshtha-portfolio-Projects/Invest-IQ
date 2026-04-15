import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../utils/config';
import logger from '../utils/logger';

let supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    const url = config.supabase.url.trim();
    const serviceRoleKey = config.supabase.serviceRoleKey.trim();

    if (!url || !serviceRoleKey) {
      logger.error(
        'Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'
      );
      throw new Error('Supabase configuration is incomplete');
    }

    supabase = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    logger.info('Supabase client initialized');
  }

  return supabase;
};

export default getSupabaseClient;
