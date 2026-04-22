import angelService from './broker/angelService';
import marketCache from './cache/marketCache';
import type { NormalizedQuote } from '../types/angel.types';
import type {
  StockQuote,
  HistoricalPrice,
  StockSearchResult,
  MarketOverview,
} from '../types/market.types';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/errors';

/**
 * Market Data Service (Angel One Primary)
 * Unified interface for market data with Angel One as primary provider
 */
class MarketDataService {
  private isInitialized = false;

  /**
   * Initialize Angel One service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await angelService.initialize();
      this.isInitialized = true;
      logger.info('Market data service initialized with Angel One');
    } catch (error) {
      logger.error('Failed to initialize market data service:', error);
      throw error;
    }
  }

  /** Ensures instrument master is loaded (tests use `createApp()` without `index.ts` startup). */
  private async ensureReady(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Convert Angel normalized quote to app StockQuote format
   */
  private convertToStockQuote(normalized: NormalizedQuote): StockQuote {
    return {
      ticker: normalized.ticker,
      name: normalized.ticker,
      price: normalized.price,
      change: normalized.change,
      changePercent: normalized.changePercent,
      volume: normalized.volume,
      marketCap: 0,
      previousClose: normalized.close,
      open: normalized.open,
      high: normalized.high,
      low: normalized.low,
    };
  }

  /**
   * Search stocks
   */
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      await this.ensureReady();
      const results = angelService.searchStocks(query, 20);
      return results.map((r) => ({
        ticker: r.ticker,
        name: r.name,
        exchange: 'NSE',
        type: 'EQ',
      }));
    } catch (error) {
      logger.error('Search error:', error);
      return [];
    }
  }

  /**
   * Get stock quote
   */
  async getStockQuote(ticker: string): Promise<StockQuote> {
    try {
      await this.ensureReady();
      const normalized = await angelService.getStockQuote(ticker);
      return this.convertToStockQuote(normalized);
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        logger.error(`Failed to get quote for ${ticker}:`, error);
      }
      throw error;
    }
  }

  /**
   * Get historical prices
   */
  async getHistoricalPrices(
    ticker: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalPrice[]> {
    try {
      await this.ensureReady();
      const fromDate = startDate || this.getDateDaysAgo(365);
      const toDate = endDate || this.getTodayDate();

      const data = await angelService.getHistoricalPrices(
        ticker,
        'ONE_DAY',
        fromDate,
        toDate
      );

      return data.map((d) => ({
        date: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }));
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        logger.error(`Failed to get historical prices for ${ticker}:`, error);
      }
      throw error;
    }
  }

  async getMarketOverview(): Promise<MarketOverview> {
    try {
      await this.ensureReady();
      const cacheKey = 'market:overview';
      const cached = marketCache.get<MarketOverview>(cacheKey);
      if (cached) {
        return cached;
      }

      const niftyTickers = ['NIFTY', 'BANKNIFTY'];
      const topTickers = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];

      const [indices, stocks] = await Promise.all([
        Promise.all(niftyTickers.map((t) => this.getStockQuote(t).catch(() => null))),
        Promise.all(topTickers.map((t) => this.getStockQuote(t).catch(() => null))),
      ]);

      const validStocks = stocks.filter((s): s is StockQuote => s !== null);
      const sortedByChange = [...validStocks].sort((a, b) => b.changePercent - a.changePercent);

      const overview: MarketOverview = {
        indices: indices
          .filter((idx): idx is StockQuote => idx !== null)
          .map((idx) => ({
            name: idx.ticker === 'NIFTY' ? 'NIFTY 50' : 'BANK NIFTY',
            value: idx.price,
            change: idx.change,
            changePercent: idx.changePercent,
          })),
        topGainers: sortedByChange.slice(0, 5).map((s) => ({
          ticker: s.ticker,
          name: s.name,
          price: s.price,
          changePercent: s.changePercent,
        })),
        topLosers: sortedByChange.slice(-5).reverse().map((s) => ({
          ticker: s.ticker,
          name: s.name,
          price: s.price,
          changePercent: s.changePercent,
        })),
        trendingStocks: validStocks.slice(0, 5).map((s) => ({
          ticker: s.ticker,
          name: s.name,
          price: s.price,
          changePercent: s.changePercent,
        })),
      };

      marketCache.set(cacheKey, overview, 30000); // 30 seconds
      return overview;
    } catch (error) {
      logger.error('Failed to get market overview:', error);
      throw error;
    }
  }

  /**
   * Helper: Get date N days ago in YYYY-MM-DD HH:mm format
   */
  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDate(date);
  }

  /**
   * Helper: Get today's date in YYYY-MM-DD HH:mm format
   */
  private getTodayDate(): string {
    return this.formatDate(new Date());
  }

  /**
   * Helper: Format date for Angel API
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 09:15`;
  }
}

export default new MarketDataService();
