import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import angelClient from './angelClient';
import angelMapper from './angelMapper';
import marketCache from '../cache/marketCache';
import type { NormalizedQuote, AngelInstrument } from '../../types/angel.types';
import logger from '../../utils/logger';
import { NotFoundError } from '../../utils/errors';

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
        
        // Check if file is empty or not valid JSON
        if (!cached || cached.trim() === '') {
          throw new Error('Cache file is empty');
        }
        
        const parsed = JSON.parse(cached) as unknown;
        
        // Validate cache has data
        if (Array.isArray(parsed) && parsed.length > 0) {
          instruments = parsed as AngelInstrument[];
          logger.info(`Loaded ${parsed.length} instruments from cache`);
          this.populateInstrumentMaps(instruments);
          return;
        } else {
          logger.info('Cache file exists but contains empty data, downloading fresh data...');
          throw new Error('Empty cache');
        }
      } catch (cacheError) {
        logger.info('Downloading fresh instrument master from Angel One...');
        try {
          const response = await axios.get<unknown>(this.INSTRUMENTS_URL, {
            timeout: 30000,
            headers: { 'User-Agent': 'Invest-IQ/1.0' },
          });
          
          // Handle different response structures
          if (Array.isArray(response.data)) {
            instruments = response.data as AngelInstrument[];
          } else if (
            response.data &&
            typeof response.data === 'object' &&
            'data' in response.data &&
            Array.isArray((response.data as Record<string, unknown>).data)
          ) {
            instruments = (response.data as Record<string, unknown>).data as AngelInstrument[];
          }
          
          if (instruments.length === 0) {
            logger.warn('Downloaded instruments array is empty, using fallback data');
            instruments = this.getInstrumentFallback();
          } else {
            logger.info(`Downloaded ${instruments.length} instruments from Angel One API`);
          }
          
          await fs.writeFile(this.CACHE_FILE, JSON.stringify(instruments));
          logger.info(`Instrument master cached successfully (${instruments.length} total)`);
        } catch (downloadError) {
          logger.warn('Failed to download instruments from API, using fallback data', downloadError);
          instruments = this.getInstrumentFallback();
          // Try to cache fallback data
          try {
            await fs.writeFile(this.CACHE_FILE, JSON.stringify(instruments));
          } catch {
            // Cache write failed, continue with fallback data
          }
        }
      }

      this.populateInstrumentMaps(instruments);
    } catch (error) {
      logger.error('Failed to load instruments:', error);
      throw error;
    }
  }

  /**
   * Populate instrument maps from data
   */
  private populateInstrumentMaps(instruments: AngelInstrument[]): void {
    this.instrumentMap.clear();
    this.reverseMap.clear();

    let nseCount = 0;
    let bseCount = 0;
    let indexCount = 0;

    const isStockType = (inst: AngelInstrument): boolean =>
      inst.instrumenttype === 'EQ' || inst.instrumenttype === '' || !inst.instrumenttype;

    for (const inst of instruments) {
      // Only NSE/BSE — other segments (e.g. CDS) can reuse names like "NIFTY" and must not overwrite cash tokens
      const isValidExchange = inst.exch_seg === 'NSE' || inst.exch_seg === 'BSE';
      if (!isValidExchange) continue;

      // Angel master lists duplicate rows (symbol NIFTY/BANKNIFTY, empty type, strike -1) alongside AMXIDX spot indices; skip so short tokens do not overwrite 99926xxx
      if (
        inst.exch_seg === 'NSE' &&
        (inst.symbol.trim().toUpperCase() === 'NIFTY' ||
          inst.symbol.trim().toUpperCase() === 'BANKNIFTY') &&
        inst.instrumenttype === '' &&
        inst.strike === '-1.000000'
      ) {
        continue;
      }

      // Include stocks from NSE or BSE (typically have empty instrumenttype)
      const isStock = isStockType(inst);

      // Cash indices only (do not use broad *IDX* — OPTIDX on NFO would match)
      const isIndex = inst.instrumenttype === 'AMXIDX' || inst.instrumenttype === 'INDEX';

      if (isStock || isIndex) {
        const sym = inst.symbol.trim().toUpperCase();
        this.instrumentMap.set(sym, inst.token);
        this.reverseMap.set(inst.token, sym);

        // Angel master uses display names like "Nifty 50" / "Nifty Bank"; app tickers match `name` (e.g. NIFTY, BANKNIFTY)
        if (isIndex && inst.name) {
          const nameKey = inst.name.trim().toUpperCase();
          if (/^[A-Z][A-Z0-9]*$/.test(nameKey)) {
            this.instrumentMap.set(nameKey, inst.token);
          }
        }

        if (isIndex) {
          indexCount++;
        } else if (inst.exch_seg === 'NSE') {
          nseCount++;
        } else if (inst.exch_seg === 'BSE') {
          bseCount++;
        }
      }
    }

    // NSE cash symbols are "RELIANCE-EQ", not "RELIANCE". Map short tickers for lookups used by the app.
    // Second pass so NSE tokens win over BSE plain "RELIANCE" when both exist.
    for (const inst of instruments) {
      if (inst.exch_seg !== 'NSE' || !isStockType(inst)) continue;
      const m = /^([A-Za-z0-9&]+)-(EQ|BE)$/i.exec(inst.symbol);
      if (m) {
        this.instrumentMap.set(m[1].toUpperCase(), inst.token);
      }
    }

    logger.info(`Loaded ${nseCount} NSE + ${bseCount} BSE equity instruments + ${indexCount} indices (total: ${nseCount + bseCount + indexCount})`);

    this.mergeEssentialSeedIfMissing();
  }

  /** Ensures core tickers exist if absent from the downloaded master (e.g. index token drift). */
  private mergeEssentialSeedIfMissing(): void {
    const added: string[] = [];
    for (const inst of this.getSeedInstruments()) {
      const sym = inst.symbol.trim().toUpperCase();
      if (!this.instrumentMap.has(sym)) {
        this.instrumentMap.set(sym, inst.token);
        this.reverseMap.set(inst.token, sym);
        added.push(sym);
      }
    }
    if (added.length > 0) {
      logger.info(`Merged ${added.length} seed instrument(s) missing from master: ${added.join(', ')}`);
    }
  }

  /** Seed rows used when the master file is unavailable and to fill gaps after a normal load. */
  private getSeedInstruments(): AngelInstrument[] {
    return [
      { symbol: 'RELIANCE', exch_seg: 'BSE', instrumenttype: '', token: '500325', name: 'Reliance Industries', expiry: '', strike: '-1.000000', lotsize: '1', tick_size: '5.000000' },
      { symbol: 'TCS', exch_seg: 'BSE', instrumenttype: '', token: '532540', name: 'Tata Consultancy Services', expiry: '', strike: '-1.000000', lotsize: '1', tick_size: '5.000000' },
      { symbol: 'INFY', exch_seg: 'BSE', instrumenttype: '', token: '500209', name: 'Infosys Limited', expiry: '', strike: '-1.000000', lotsize: '1', tick_size: '5.000000' },
      { symbol: 'HDFCBANK', exch_seg: 'BSE', instrumenttype: '', token: '500180', name: 'HDFC Bank', expiry: '', strike: '-1.000000', lotsize: '1', tick_size: '5.000000' },
      { symbol: 'ICICIBANK', exch_seg: 'BSE', instrumenttype: '', token: '532174', name: 'ICICI Bank', expiry: '', strike: '-1.000000', lotsize: '1', tick_size: '5.000000' },
      { symbol: 'NIFTY', exch_seg: 'NSE', instrumenttype: 'AMXIDX', token: '99926000', name: 'Nifty 50', expiry: '', strike: '0.000000', lotsize: '1', tick_size: '0.000000' },
      { symbol: 'BANKNIFTY', exch_seg: 'NSE', instrumenttype: 'AMXIDX', token: '99926009', name: 'Bank Nifty', expiry: '', strike: '0.000000', lotsize: '1', tick_size: '0.000000' },
    ] as AngelInstrument[];
  }

  /**
   * Get fallback instrument data for common stocks (master download failed).
   */
  private getInstrumentFallback(): AngelInstrument[] {
    const fallback = this.getSeedInstruments();
    logger.warn(`Using fallback instrument data with ${fallback.length} entries`);
    return fallback;
  }

  /**
   * Get symbol token for a ticker
   */
  getSymbolToken(ticker: string): string | null {
    const key = ticker.trim().toUpperCase();
    const token = this.instrumentMap.get(key);
    if (!token) {
      logger.warn(`Symbol token not found for ticker: ${key}`);
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
        throw new NotFoundError(`Unknown or unsupported ticker: ${ticker.trim().toUpperCase()}`);
      }

      const quoteData = await angelClient.getQuote(symbolToken, 'NSE');

      if (!quoteData || typeof quoteData !== 'object') {
        throw new Error('Invalid quote response');
      }

      const raw = quoteData as Record<string, unknown>;
      const fetched = raw.fetched;
      let row: {
        symboltoken: string;
        exchange: string;
        tradingsymbol: string;
        ltp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      };

      if (Array.isArray(fetched) && fetched.length > 0) {
        const item = fetched[0] as Record<string, unknown>;
        row = {
          symboltoken: String(item.symbolToken ?? item.symboltoken ?? symbolToken),
          exchange: String(item.exchange ?? 'NSE'),
          tradingsymbol: String(item.tradingSymbol ?? item.tradingsymbol ?? ticker),
          ltp: Number(item.ltp) || 0,
          open: Number(item.open) || 0,
          high: Number(item.high) || 0,
          low: Number(item.low) || 0,
          close: Number(item.close) || 0,
          volume: Number(item.tradeVolume ?? item.volume) || 0,
        };
      } else {
        const firstKey = Object.keys(raw)[0];
        const legacy = raw[firstKey];
        if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) {
          throw new Error('Invalid quote response');
        }
        const l = legacy as Record<string, unknown>;
        row = {
          symboltoken: String(l.symboltoken ?? l.symbolToken ?? symbolToken),
          exchange: String(l.exchange ?? 'NSE'),
          tradingsymbol: String(l.tradingsymbol ?? l.tradingSymbol ?? ticker),
          ltp: Number(l.ltp) || 0,
          open: Number(l.open) || 0,
          high: Number(l.high) || 0,
          low: Number(l.low) || 0,
          close: Number(l.close) || 0,
          volume: Number(l.volume ?? l.tradeVolume) || 0,
        };
      }

      const normalized = angelMapper.normalizeQuote({
        ...row,
        tradingsymbol: ticker,
      });

      marketCache.set(cacheKey, normalized);
      return normalized;
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        logger.error(`Failed to get quote for ${ticker}:`, error);
      }
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
        throw new NotFoundError(`Unknown or unsupported ticker: ${ticker.trim().toUpperCase()}`);
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
      if (!(error instanceof NotFoundError)) {
        logger.error(`Failed to get historical data for ${ticker}:`, error);
      }
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
