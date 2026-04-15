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
  };
  twelveData: {
    apiKey: string;
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
  },
  twelveData: {
    apiKey: process.env.TWELVE_DATA_API_KEY || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export default config;
