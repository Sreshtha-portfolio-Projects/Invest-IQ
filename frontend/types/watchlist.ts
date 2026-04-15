import { Company } from './market';

export interface Watchlist {
  id: string;
  user_id: string;
  created_at?: string;
}

export interface WatchlistData {
  watchlist: Watchlist;
  items: Company[];
}

export interface AddToWatchlistRequest {
  ticker: string;
}
