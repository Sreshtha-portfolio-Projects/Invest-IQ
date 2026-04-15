export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockSearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

export interface MarketOverview {
  indices: {
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }[];
  topGainers: {
    ticker: string;
    name: string;
    price: number;
    changePercent: number;
  }[];
  topLosers: {
    ticker: string;
    name: string;
    price: number;
    changePercent: number;
  }[];
  trendingStocks: {
    ticker: string;
    name: string;
    price: number;
    changePercent: number;
  }[];
}
