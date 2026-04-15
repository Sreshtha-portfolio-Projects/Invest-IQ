export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockSearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

export interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  market_cap: number;
}

export interface Financial {
  id?: string;
  company_id: string;
  year: number;
  revenue: number;
  net_income: number;
  eps: number;
}

export interface FinancialRatio {
  company_id: string;
  pe_ratio: number | null;
  roe: number | null;
  debt_to_equity: number | null;
  revenue_growth: number | null;
}

export interface StockDetails {
  company: Company;
  quote: StockQuote;
  financials: Financial[];
  ratios: FinancialRatio | null;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface TrendingStock {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface MarketOverview {
  indices: MarketIndex[];
  topGainers: TrendingStock[];
  topLosers: TrendingStock[];
  trendingStocks: TrendingStock[];
}
