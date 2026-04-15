/**
 * Screener / DB filter options. When `*Exclusive` is true, the bound uses strict
 * inequality (>, <); when false or omitted, inclusive (>=, <=).
 */
export interface CompanyFilterOptions {
  sector?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  /** true => market_cap > minMarketCap; false/omit => >= */
  minMarketCapExclusive?: boolean;
  /** true => market_cap < maxMarketCap; false/omit => <= */
  maxMarketCapExclusive?: boolean;
  minPE?: number;
  maxPE?: number;
  minPEExclusive?: boolean;
  maxPEExclusive?: boolean;
  minROE?: number;
  maxROE?: number;
  minROEExclusive?: boolean;
  maxROEExclusive?: boolean;
  minDebtToEquity?: number;
  maxDebtToEquity?: number;
  minDebtToEquityExclusive?: boolean;
  maxDebtToEquityExclusive?: boolean;
  minRevenueGrowth?: number;
  maxRevenueGrowth?: number;
  minRevenueGrowthExclusive?: boolean;
  maxRevenueGrowthExclusive?: boolean;
}
