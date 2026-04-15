import api from './apiClient';
import {
  StockQuote,
  StockSearchResult,
  HistoricalPrice,
  MarketOverview,
  StockDetails,
} from '../types/market';

export const stockService = {
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const response = await api.get('/stocks/search', { params: { q: query } });
    return response.data.data;
  },

  async getStockQuote(ticker: string): Promise<StockQuote> {
    const response = await api.get(`/stocks/${ticker}`);
    return response.data.data;
  },

  async getStockDetails(ticker: string): Promise<StockDetails> {
    const response = await api.get(`/stocks/${ticker}/details`);
    return response.data.data;
  },

  async getStockHistory(
    ticker: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalPrice[]> {
    const response = await api.get(`/stocks/${ticker}/history`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async getMarketOverview(): Promise<MarketOverview> {
    const response = await api.get('/stocks/overview');
    return response.data.data;
  },
};
