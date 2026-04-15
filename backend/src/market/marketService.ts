import axios, { AxiosInstance } from 'axios';
import {
  StockQuote,
  HistoricalPrice,
  StockSearchResult,
  MarketOverview,
} from '../types/market.types';
import config from '../utils/config';
import logger from '../utils/logger';
import { ExternalAPIError } from '../utils/errors';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class MarketDataService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private yahooClient: AxiosInstance;
  private twelveDataClient: AxiosInstance;

  constructor() {
    this.yahooClient = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    this.twelveDataClient = axios.create({
      baseURL: 'https://api.twelvedata.com',
      timeout: 10000,
      params: {
        apikey: config.twelveData.apiKey,
      },
    });
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const cacheKey = `search:${query}`;
    const cached = this.getCachedData<StockSearchResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const results = await this.searchWithYahoo(query);
      this.setCachedData(cacheKey, results);
      return results;
    } catch (error) {
      logger.warn('Yahoo Finance search failed, trying Twelve Data:', error);
      try {
        const results = await this.searchWithTwelveData(query);
        this.setCachedData(cacheKey, results);
        return results;
      } catch (fallbackError) {
        logger.error('All search providers failed:', fallbackError);
        throw new ExternalAPIError('Unable to search stocks at this time');
      }
    }
  }

  private async searchWithYahoo(query: string): Promise<StockSearchResult[]> {
    try {
      const response = await this.yahooClient.get(
        'https://query1.finance.yahoo.com/v1/finance/search',
        {
          params: {
            q: query,
            quotesCount: 10,
            newsCount: 0,
          },
        }
      );

      const quotes = response.data.quotes || [];
      return quotes.map((quote: {
        symbol: string;
        shortname?: string;
        longname?: string;
        exchange: string;
        quoteType: string;
      }) => ({
        ticker: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol,
        exchange: quote.exchange,
        type: quote.quoteType,
      }));
    } catch (error) {
      logger.error('Yahoo Finance search error:', error);
      throw error;
    }
  }

  private async searchWithTwelveData(query: string): Promise<StockSearchResult[]> {
    try {
      const response = await this.twelveDataClient.get('/symbol_search', {
        params: {
          symbol: query,
          outputsize: 10,
        },
      });

      const data = response.data.data || [];
      return data.map((item: {
        symbol: string;
        instrument_name: string;
        exchange: string;
        instrument_type: string;
      }) => ({
        ticker: item.symbol,
        name: item.instrument_name,
        exchange: item.exchange,
        type: item.instrument_type,
      }));
    } catch (error) {
      logger.error('Twelve Data search error:', error);
      throw error;
    }
  }

  async getStockQuote(ticker: string): Promise<StockQuote> {
    const cacheKey = `quote:${ticker}`;
    const cached = this.getCachedData<StockQuote>(cacheKey);
    if (cached) return cached;

    try {
      const quote = await this.getQuoteFromYahoo(ticker);
      this.setCachedData(cacheKey, quote);
      return quote;
    } catch (error) {
      logger.warn('Yahoo Finance quote failed, trying Twelve Data:', error);
      try {
        const quote = await this.getQuoteFromTwelveData(ticker);
        this.setCachedData(cacheKey, quote);
        return quote;
      } catch (fallbackError) {
        logger.error('All quote providers failed:', fallbackError);
        throw new ExternalAPIError('Unable to fetch stock quote at this time');
      }
    }
  }

  private async getQuoteFromYahoo(ticker: string): Promise<StockQuote> {
    try {
      const response = await this.yahooClient.get(
        'https://query1.finance.yahoo.com/v8/finance/chart/' + ticker,
        {
          params: {
            interval: '1d',
            range: '1d',
          },
        }
      );

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      return {
        ticker: meta.symbol,
        name: meta.symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.previousClose,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        volume: meta.regularMarketVolume || 0,
        marketCap: 0,
        previousClose: meta.previousClose,
        open: quote.open[0] || meta.regularMarketPrice,
        high: quote.high[0] || meta.regularMarketPrice,
        low: quote.low[0] || meta.regularMarketPrice,
      };
    } catch (error) {
      logger.error('Yahoo Finance quote error:', error);
      throw error;
    }
  }

  private async getQuoteFromTwelveData(ticker: string): Promise<StockQuote> {
    try {
      const response = await this.twelveDataClient.get('/quote', {
        params: {
          symbol: ticker,
        },
      });

      const data = response.data;

      return {
        ticker: data.symbol,
        name: data.name || data.symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        volume: parseInt(data.volume),
        marketCap: 0,
        previousClose: parseFloat(data.previous_close),
        open: parseFloat(data.open),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
      };
    } catch (error) {
      logger.error('Twelve Data quote error:', error);
      throw error;
    }
  }

  async getHistoricalPrices(
    ticker: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalPrice[]> {
    const cacheKey = `history:${ticker}:${startDate}:${endDate}`;
    const cached = this.getCachedData<HistoricalPrice[]>(cacheKey);
    if (cached) return cached;

    try {
      const prices = await this.getHistoricalFromYahoo(ticker, startDate, endDate);
      this.setCachedData(cacheKey, prices);
      return prices;
    } catch (error) {
      logger.warn('Yahoo Finance historical failed, trying Twelve Data:', error);
      try {
        const prices = await this.getHistoricalFromTwelveData(ticker, startDate, endDate);
        this.setCachedData(cacheKey, prices);
        return prices;
      } catch (fallbackError) {
        logger.error('All historical providers failed:', fallbackError);
        throw new ExternalAPIError('Unable to fetch historical prices at this time');
      }
    }
  }

  private async getHistoricalFromYahoo(
    ticker: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalPrice[]> {
    try {
      const start = startDate
        ? Math.floor(new Date(startDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
      const end = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : Math.floor(Date.now() / 1000);

      const response = await this.yahooClient.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
        {
          params: {
            period1: start,
            period2: end,
            interval: '1d',
          },
        }
      );

      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      return timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: quote.open[i] || 0,
        high: quote.high[i] || 0,
        low: quote.low[i] || 0,
        close: quote.close[i] || 0,
        volume: quote.volume[i] || 0,
      }));
    } catch (error) {
      logger.error('Yahoo Finance historical error:', error);
      throw error;
    }
  }

  private async getHistoricalFromTwelveData(
    ticker: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalPrice[]> {
    try {
      const response = await this.twelveDataClient.get('/time_series', {
        params: {
          symbol: ticker,
          interval: '1day',
          start_date: startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          end_date: endDate || new Date().toISOString().split('T')[0],
          outputsize: 5000,
        },
      });

      const values = response.data.values || [];
      return values.map((item: {
        datetime: string;
        open: string;
        high: string;
        low: string;
        close: string;
        volume: string;
      }) => ({
        date: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume),
      }));
    } catch (error) {
      logger.error('Twelve Data historical error:', error);
      throw error;
    }
  }

  async getMarketOverview(): Promise<MarketOverview> {
    const cacheKey = 'market:overview';
    const cached = this.getCachedData<MarketOverview>(cacheKey);
    if (cached) return cached;

    try {
      const indices = await Promise.all([
        this.getStockQuote('^NSEI').catch(() => null),
        this.getStockQuote('^BSESN').catch(() => null),
      ]);

      const topGainers = await this.getTopMovers('gainers');
      const topLosers = await this.getTopMovers('losers');
      const trendingStocks = await this.getTrendingStocks();

      const overview: MarketOverview = {
        indices: indices
          .filter((idx) => idx !== null)
          .map((idx) => ({
            name: idx!.ticker === '^NSEI' ? 'NIFTY 50' : 'SENSEX',
            value: idx!.price,
            change: idx!.change,
            changePercent: idx!.changePercent,
          })),
        topGainers,
        topLosers,
        trendingStocks,
      };

      this.setCachedData(cacheKey, overview);
      return overview;
    } catch (error) {
      logger.error('Error fetching market overview:', error);
      throw new ExternalAPIError('Unable to fetch market overview at this time');
    }
  }

  private async getTopMovers(
    type: 'gainers' | 'losers'
  ): Promise<{ ticker: string; name: string; price: number; changePercent: number }[]> {
    const tickers = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS'];

    try {
      const quotes = await Promise.all(
        tickers.map((ticker) =>
          this.getStockQuote(ticker).catch(() => null)
        )
      );

      const validQuotes = quotes.filter((q) => q !== null) as StockQuote[];

      const sorted = validQuotes.sort((a, b) =>
        type === 'gainers'
          ? b.changePercent - a.changePercent
          : a.changePercent - b.changePercent
      );

      return sorted.slice(0, 5).map((q) => ({
        ticker: q.ticker,
        name: q.name,
        price: q.price,
        changePercent: q.changePercent,
      }));
    } catch (error) {
      logger.error(`Error fetching top ${type}:`, error);
      return [];
    }
  }

  private async getTrendingStocks(): Promise<
    { ticker: string; name: string; price: number; changePercent: number }[]
  > {
    const tickers = ['BHARTIARTL.NS', 'SBIN.NS', 'WIPRO.NS', 'ITC.NS', 'HINDUNILVR.NS'];

    try {
      const quotes = await Promise.all(
        tickers.map((ticker) =>
          this.getStockQuote(ticker).catch(() => null)
        )
      );

      const validQuotes = quotes.filter((q) => q !== null) as StockQuote[];

      return validQuotes.slice(0, 5).map((q) => ({
        ticker: q.ticker,
        name: q.name,
        price: q.price,
        changePercent: q.changePercent,
      }));
    } catch (error) {
      logger.error('Error fetching trending stocks:', error);
      return [];
    }
  }
}

export default new MarketDataService();
