export interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  market_cap: number;
  created_at?: string;
}

export interface StockPrice {
  id?: string;
  company_id: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Financial {
  id?: string;
  company_id: string;
  year: number;
  revenue: number;
  net_income: number;
  eps: number;
  created_at?: string;
}

export interface FinancialRatio {
  company_id: string;
  pe_ratio: number | null;
  roe: number | null;
  debt_to_equity: number | null;
  revenue_growth: number | null;
  updated_at?: string;
}

export interface EarningsCall {
  id?: string;
  company_id: string;
  quarter: string;
  transcript: string;
  created_at?: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  created_at?: string;
}

export interface WatchlistItem {
  watchlist_id: string;
  company_id: string;
  added_at?: string;
}

export interface User {
  id: string;
  email: string;
  created_at?: string;
}
