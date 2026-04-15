export interface AIResearchRequest {
  ticker: string;
  question: string;
}

export interface AIResearchResponse {
  ticker: string;
  valuation_summary: string;
  growth_signals: string[];
  risk_factors: string[];
  overall_assessment: string;
}

export interface AIScreenerRequest {
  query: string;
}

export interface ScreenerFilter {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number;
}

export interface AIScreenerResponse {
  filters: ScreenerFilter[];
  stocks: {
    ticker: string;
    name: string;
    sector: string;
    market_cap: number;
    pe_ratio: number | null;
    roe: number | null;
  }[];
}

export interface AIEarningsRequest {
  ticker: string;
}

export interface AIEarningsResponse {
  ticker: string;
  quarter: string;
  growth_signals: string[];
  risk_signals: string[];
  strategic_initiatives: string[];
  management_sentiment: string;
  summary: string;
}
