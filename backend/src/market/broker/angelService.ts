import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import angelClient from './angelClient';
import angelMapper from './angelMapper';
import marketCache from '../cache/marketCache';
import type { NormalizedQuote, AngelInstrument } from '../../types/angel.types';
import logger from '../../utils/logger';

/**
 * Angel One Service Layer
 * High-level interface for Angel One operations
 */
class AngelService {
  private instrumentMap: Map<string, string> = new Map(); // ticker → symbolToken
  private reverseMap: Map<string, string> = new Map(); // symbolToken → ticker
  private readonly INSTRUMENTS_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json';
  private readonly CACHE_FILE = path.join(process.cwd(), 'instruments-cache.json');
  private isInitialized = false;

  /**
   * Initialize service and load instruments
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('Initializing Angel One service...');
      
      await angelClient.login();
      await this.loadInstruments();
      
      this.isInitialized = true;
      logger.info('Angel One service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Angel One service:', error);
      throw error;
    }
  }

  /**
   * Load and cache instrument master data
   */
  private async loadInstruments(): Promise<void> {
    try {
      let instruments: AngelInstrument[] = [];

      try {
        const cached = await fs.readFile(this.CACHE_FILE, 'utf-8');
        instruments = JSON.parse(cached) as AngelInstrument[];
        logger.info('Loaded instruments from cache');
      } catch {
        logger.info('Downloading fresh instrument master...');
        const response = await axios.get<AngelInstrument[]>(this.INSTRUMENTS_URL);
        instruments = response.data;
        
        await fs.writeFile(this.CACHE_FILE, JSON.stringify(instruments));
        logger.info('Instrument master downloaded and cached');
      }

      this.instrumentMap.clear();
      this.reverseMap.clear();

      let nseCount = 0;
      for (const inst of instruments) {
        if (inst.exch_seg === 'NSE' && inst.instrumenttype === 'EQ') {
          this.instrumentMap.set(inst.symbol, inst.token);
          this.reverseMap.set(inst.token, inst.symbol);
          nseCount++;
        }
      }

      logger.info(`Loaded ${nseCount} NSE equity instruments`);
    } catch (error) {
      logger.error('Failed to load instruments:', error);
      throw error;
    }
  }

  /**
   * Get symbol token for a ticker
   */
  getSymbolToken(ticker: string): string | null {
    const token = this.instrumentMap.get(ticker);
    if (!token) {
      logger.warn(`Symbol token not found for ticker: ${ticker}`);
      return null;
    }
    return token;
  }

  /**
   * Get ticker from symbol token
   */
  getTicker(symbolToken: string): string | null {
    return this.reverseMap.get(symbolToken) || null;
  }

  /**
   * Get stock quote
   */
  async getStockQuote(ticker: string): Promise<NormalizedQuote> {
    try {
      const cacheKey = `quote:${ticker}`;
      const cached = marketCache.get<NormalizedQuote>(cacheKey);
      if (cached) {
        return cached;
      }

      const symbolToken = this.getSymbolToken(ticker);
      if (!symbolToken) {
        throw new Error(`Symbol token not found for ticker: ${ticker}`);
      }

      const quoteData = await angelClient.getQuote(symbolToken, 'NSE');
      
      if (!quoteData || typeof quoteData !== 'object') {
        throw new Error('Invalid quote response');
      }

      const firstKey = Object.keys(quoteData)[0];
      const data = (quoteData as Record<string, unknown>)[firstKey];

      const normalized = angelMapper.normalizeQuote({
        ...data as {
          symboltoken: string;
          exchange: string;
          tradingsymbol: string;
          ltp: number;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
        },
        tradingsymbol: ticker,
      });

      marketCache.set(cacheKey, normalized);
      return normalized;
    } catch (error) {
      logger.error(`Failed to get quote for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Get historical data
   */
  async getHistoricalPrices(
    ticker: string,
    interval: 'ONE_DAY' | 'ONE_HOUR' | 'FIFTEEN_MINUTE' = 'ONE_DAY',
    fromDate: string,
    toDate: string
  ): Promise<Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>> {
    try {
      const symbolToken = this.getSymbolToken(ticker);
      if (!symbolToken) {
        throw new Error(`Symbol token not found for ticker: ${ticker}`);
      }

      const historicalData = await angelClient.getHistorical({
        symboltoken: symbolToken,
        interval,
        fromdate: fromDate,
        todate: toDate,
        exchange: 'NSE',
      });

      return angelMapper.normalizeHistorical(historicalData as unknown[]);
    } catch (error) {
      logger.error(`Failed to get historical data for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Search for stocks by query
   */
  searchStocks(query: string, limit = 10): Array<{ ticker: string; name: string }> {
    try {
      const results: Array<{ ticker: string; name: string }> = [];
      const searchTerm = query.toUpperCase();

      for (const [ticker] of this.instrumentMap) {
        if (ticker.includes(searchTerm)) {
          results.push({ ticker, name: ticker });
          if (results.length >= limit) break;
        }
      }

      return results;
    } catch (error) {
      logger.error('Search error:', error);
      return [];
    }
  }

  /**
   * Refresh instruments cache (call periodically)
   */
  async refreshInstruments(): Promise<void> {
    try {
      await fs.unlink(this.CACHE_FILE);
      await this.loadInstruments();
      logger.info('Instruments refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh instruments:', error);
    }
  }
}

export default new AngelService();
