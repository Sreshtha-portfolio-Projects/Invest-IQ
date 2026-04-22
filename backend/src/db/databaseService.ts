import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';
import {
  Company,
  Financial,
  FinancialRatio,
  StockPrice,
  EarningsCall,
  Watchlist,
} from '../types/database.types';
import type { CompanyFilterOptions } from '../types/companyFilters.types';
import logger from '../utils/logger';

function passesNumericMin(
  value: number,
  min: number | undefined,
  exclusive: boolean | undefined
): boolean {
  if (min === undefined) return true;
  return exclusive ? value > min : value >= min;
}

function passesNumericMax(
  value: number,
  max: number | undefined,
  exclusive: boolean | undefined
): boolean {
  if (max === undefined) return true;
  return exclusive ? value < max : value <= max;
}

export class DatabaseService {
  /** Lazy so importing this module does not require Supabase until first DB call (after dotenv). */
  private get supabase(): SupabaseClient {
    return getSupabaseClient();
  }

  /**
   * Resolve company by ticker. Accepts NSE-style symbols (`RELIANCE`) and Yahoo-style (`RELIANCE.NS`)
   * so Angel/market tickers match seeded `companies` rows.
   */
  async getCompanyByTicker(ticker: string): Promise<Company | null> {
    try {
      const raw = ticker.trim();
      if (!raw) {
        return null;
      }
      const upper = raw.toUpperCase();

      const candidates: string[] = [];
      const add = (s: string): void => {
        if (s && !candidates.includes(s)) {
          candidates.push(s);
        }
      };
      add(raw);
      add(upper);
      if (!upper.includes('.')) {
        add(`${upper}.NS`);
        add(`${upper}.BO`);
      }

      const { data, error } = await this.supabase.from('companies').select('*').in('ticker', candidates);

      if (error) {
        throw error;
      }
      if (!data?.length) {
        return null;
      }
      if (data.length === 1) {
        return data[0];
      }

      const rank = (sym: string): number => {
        if (sym === raw || sym === upper) {
          return 0;
        }
        if (sym === `${upper}.NS`) {
          return 1;
        }
        if (sym === `${upper}.BO`) {
          return 2;
        }
        return 3;
      };

      return [...data].sort((a, b) => rank(a.ticker) - rank(b.ticker))[0];
    } catch (error) {
      logger.error(`Error fetching company by ticker ${ticker}:`, error);
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching company by id ${id}:`, error);
      throw error;
    }
  }

  async createCompany(company: Omit<Company, 'id' | 'created_at'>): Promise<Company> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .insert([company])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error creating company:', error);
      throw error;
    }
  }

  async getFinancials(companyId: string, limit = 5): Promise<Financial[]> {
    try {
      const { data, error } = await this.supabase
        .from('financials')
        .select('*')
        .eq('company_id', companyId)
        .order('year', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error(`Error fetching financials for company ${companyId}:`, error);
      throw error;
    }
  }

  async getFinancialRatios(companyId: string): Promise<FinancialRatio | null> {
    try {
      const { data, error } = await this.supabase
        .from('financial_ratios')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching financial ratios for company ${companyId}:`, error);
      throw error;
    }
  }

  async getStockPrices(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<StockPrice[]> {
    try {
      const { data, error } = await this.supabase
        .from('stock_prices')
        .select('*')
        .eq('company_id', companyId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error(`Error fetching stock prices for company ${companyId}:`, error);
      throw error;
    }
  }

  async getLatestStockPrice(companyId: string): Promise<StockPrice | null> {
    try {
      const { data, error } = await this.supabase
        .from('stock_prices')
        .select('*')
        .eq('company_id', companyId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching latest stock price for company ${companyId}:`, error);
      throw error;
    }
  }

  async insertStockPrices(prices: Omit<StockPrice, 'id'>[]): Promise<void> {
    try {
      const { error } = await this.supabase.from('stock_prices').insert(prices);

      if (error) throw error;
    } catch (error) {
      logger.error('Error inserting stock prices:', error);
      throw error;
    }
  }

  async getEarningsCall(companyId: string, quarter: string): Promise<EarningsCall | null> {
    try {
      const { data, error } = await this.supabase
        .from('earnings_calls')
        .select('*')
        .eq('company_id', companyId)
        .eq('quarter', quarter)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching earnings call for company ${companyId}, quarter ${quarter}:`, error);
      throw error;
    }
  }

  async getLatestEarningsCall(companyId: string): Promise<EarningsCall | null> {
    try {
      const { data, error } = await this.supabase
        .from('earnings_calls')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching latest earnings call for company ${companyId}:`, error);
      throw error;
    }
  }

  async getWatchlist(userId: string): Promise<Watchlist | null> {
    try {
      const { data, error } = await this.supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching watchlist for user ${userId}:`, error);
      throw error;
    }
  }

  async createWatchlist(userId: string): Promise<Watchlist> {
    try {
      const { data, error } = await this.supabase
        .from('watchlists')
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error creating watchlist:', error);
      throw error;
    }
  }

  async getWatchlistItems(watchlistId: string): Promise<Company[]> {
    try {
      const { data, error } = await this.supabase
        .from('watchlist_items')
        .select('company_id, companies(*)')
        .eq('watchlist_id', watchlistId);

      if (error) throw error;

      if (!data) return [];

      const companies: Company[] = [];
      for (const row of data) {
        const nested = row.companies as Company | Company[] | null;
        if (nested == null) continue;
        if (Array.isArray(nested)) {
          companies.push(...nested.filter((c): c is Company => c != null));
        } else {
          companies.push(nested);
        }
      }
      return companies;
    } catch (error) {
      logger.error(`Error fetching watchlist items for watchlist ${watchlistId}:`, error);
      throw error;
    }
  }

  async addToWatchlist(watchlistId: string, companyId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('watchlist_items')
        .insert([{ watchlist_id: watchlistId, company_id: companyId }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Stock already in watchlist');
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(watchlistId: string, companyId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('watchlist_items')
        .delete()
        .eq('watchlist_id', watchlistId)
        .eq('company_id', companyId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  async searchCompanies(query: string, limit = 20): Promise<Company[]> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .or(`ticker.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error(`Error searching companies with query ${query}:`, error);
      throw error;
    }
  }

  async getCompaniesByFilters(filters: CompanyFilterOptions): Promise<Company[]> {
    try {
      let query = this.supabase
        .from('companies')
        .select('*, financial_ratios(*)');

      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }

      if (filters.minMarketCap !== undefined) {
        query = filters.minMarketCapExclusive
          ? query.gt('market_cap', filters.minMarketCap)
          : query.gte('market_cap', filters.minMarketCap);
      }

      if (filters.maxMarketCap !== undefined) {
        query = filters.maxMarketCapExclusive
          ? query.lt('market_cap', filters.maxMarketCap)
          : query.lte('market_cap', filters.maxMarketCap);
      }

      const { data, error } = await query;

      if (error) throw error;

      let results = data || [];

      if (filters.minPE !== undefined || filters.maxPE !== undefined) {
        results = results.filter((company: Company & { financial_ratios: FinancialRatio | null }) => {
          const pe = company.financial_ratios?.pe_ratio;
          if (pe === null || pe === undefined) return false;
          if (!passesNumericMin(pe, filters.minPE, filters.minPEExclusive)) return false;
          if (!passesNumericMax(pe, filters.maxPE, filters.maxPEExclusive)) return false;
          return true;
        });
      }

      if (filters.minROE !== undefined || filters.maxROE !== undefined) {
        results = results.filter((company: Company & { financial_ratios: FinancialRatio | null }) => {
          const roe = company.financial_ratios?.roe;
          if (roe === null || roe === undefined) return false;
          if (!passesNumericMin(roe, filters.minROE, filters.minROEExclusive)) return false;
          if (!passesNumericMax(roe, filters.maxROE, filters.maxROEExclusive)) return false;
          return true;
        });
      }

      if (filters.minDebtToEquity !== undefined || filters.maxDebtToEquity !== undefined) {
        results = results.filter((company: Company & { financial_ratios: FinancialRatio | null }) => {
          const de = company.financial_ratios?.debt_to_equity;
          if (de === null || de === undefined) return false;
          if (!passesNumericMin(de, filters.minDebtToEquity, filters.minDebtToEquityExclusive))
            return false;
          if (!passesNumericMax(de, filters.maxDebtToEquity, filters.maxDebtToEquityExclusive))
            return false;
          return true;
        });
      }

      if (filters.minRevenueGrowth !== undefined || filters.maxRevenueGrowth !== undefined) {
        results = results.filter((company: Company & { financial_ratios: FinancialRatio | null }) => {
          const rg = company.financial_ratios?.revenue_growth;
          if (rg === null || rg === undefined) return false;
          if (!passesNumericMin(rg, filters.minRevenueGrowth, filters.minRevenueGrowthExclusive))
            return false;
          if (!passesNumericMax(rg, filters.maxRevenueGrowth, filters.maxRevenueGrowthExclusive))
            return false;
          return true;
        });
      }

      return results as Company[];
    } catch (error) {
      logger.error('Error filtering companies:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
