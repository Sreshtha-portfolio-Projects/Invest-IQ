import api from './apiClient';
import { WatchlistData, AddToWatchlistRequest } from '../types/watchlist';

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistData> {
    const response = await api.get('/watchlist');
    return response.data.data;
  },

  async addToWatchlist(request: AddToWatchlistRequest): Promise<void> {
    await api.post('/watchlist', request);
  },

  async removeFromWatchlist(companyId: string): Promise<void> {
    await api.delete(`/watchlist/${companyId}`);
  },
};
