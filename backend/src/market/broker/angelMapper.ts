import type { NormalizedQuote, AngelTickData } from '../../types/angel.types';
import logger from '../../utils/logger';

/**
 * Angel One Response Mapper
 * Normalizes broker-specific responses to standard format
 */
class AngelMapper {
  /**
   * Normalize quote response from Angel One
   */
  normalizeQuote(data: {
    symboltoken: string;
    exchange: string;
    tradingsymbol: string;
    ltp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }): NormalizedQuote {
    try {
      const price = Number(data.ltp) || 0;
      const prevClose = Number(data.close) || price;
      const change = price - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

      return {
        ticker: data.tradingsymbol,
        exchange: 'NSE',
        price,
        change,
        changePercent,
        open: Number(data.open) || 0,
        high: Number(data.high) || 0,
        low: Number(data.low) || 0,
        close: prevClose,
        volume: Number(data.volume) || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Error normalizing quote:', error);
      throw new Error('Failed to normalize quote data');
    }
  }

  /**
   * Normalize WebSocket tick data
   */
  normalizeTickData(tickData: AngelTickData, tradingSymbol: string): NormalizedQuote {
    try {
      const price = Number(tickData.last_traded_price) || 0;
      const prevClose = Number(tickData.closed_price) || price;
      const change = price - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

      return {
        ticker: tradingSymbol,
        exchange: 'NSE',
        price,
        change,
        changePercent,
        open: Number(tickData.open_price_of_the_day) || 0,
        high: Number(tickData.high_price_of_the_day) || 0,
        low: Number(tickData.low_price_of_the_day) || 0,
        close: prevClose,
        volume: Number(tickData.volume_trade_for_the_day) || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Error normalizing tick data:', error);
      throw new Error('Failed to normalize tick data');
    }
  }

  /**
   * Normalize historical candle data
   */
  normalizeHistorical(data: unknown[]): Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> {
    try {
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((candle: unknown) => {
        const c = candle as string[];
        return {
          date: c[0],
          open: Number(c[1]) || 0,
          high: Number(c[2]) || 0,
          low: Number(c[3]) || 0,
          close: Number(c[4]) || 0,
          volume: Number(c[5]) || 0,
        };
      });
    } catch (error) {
      logger.error('Error normalizing historical data:', error);
      return [];
    }
  }

  /**
   * Extract symbol token from Angel instrument
   */
  extractSymbolToken(instrument: {
    token: string;
    symbol: string;
    exch_seg: string;
  }): { token: string; symbol: string } | null {
    try {
      if (instrument.exch_seg !== 'NSE') {
        return null;
      }

      return {
        token: instrument.token,
        symbol: instrument.symbol,
      };
    } catch (error) {
      logger.error('Error extracting symbol token:', error);
      return null;
    }
  }
}

export default new AngelMapper();
