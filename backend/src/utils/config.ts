import dotenv from 'dotenv';

// Must run before this module reads process.env (imported early by routes → db → supabase).
dotenv.config();

export interface Config {
  port: number;
  nodeEnv: string;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  gemini: {
    apiKey: string;
    /** Model id for `generativelanguage.googleapis.com` (see Google AI Studio / ListModels). */
    model: string;
  };
  twelveData: {
    apiKey: string;
  };
  angel: {
    apiKey: string;
    clientId: string;
    /** Trading terminal / app 4-digit MPIN (preferred for SmartAPI session). */
    mpin: string;
    /** Legacy name; SmartAPI often expects MPIN here — use ANGEL_MPIN when possible. */
    password: string;
    totpSecret: string;
  };
  frontendUrl: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },
  twelveData: {
    apiKey: process.env.TWELVE_DATA_API_KEY || '',
  },
  angel: {
    apiKey: process.env.ANGEL_API_KEY || '',
    clientId: process.env.ANGEL_CLIENT_ID || '',
    mpin: process.env.ANGEL_MPIN || '',
    password: process.env.ANGEL_PASSWORD || '',
    totpSecret: process.env.ANGEL_TOTP_SECRET || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export default config;
