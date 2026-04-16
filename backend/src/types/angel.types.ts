/**
 * Angel One SmartAPI Type Definitions
 */

export interface AngelAuthCredentials {
  clientId: string;
  password: string;
  apiKey: string;
  totpSecret: string;
}

export interface AngelSession {
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
}

export interface AngelQuoteResponse {
  symboltoken: string;
  exchange: string;
  tradingsymbol: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  lowerCircuit: string;
  upperCircuit: string;
}

export interface NormalizedQuote {
  ticker: string;
  exchange: 'NSE';
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface AngelHistoricalParams {
  symboltoken: string;
  interval: 'ONE_MINUTE' | 'THREE_MINUTE' | 'FIVE_MINUTE' | 'FIFTEEN_MINUTE' | 'ONE_HOUR' | 'ONE_DAY';
  fromdate: string; // YYYY-MM-DD HH:mm
  todate: string;   // YYYY-MM-DD HH:mm
}

export interface AngelHistoricalCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AngelInstrument {
  token: string;
  symbol: string;
  name: string;
  expiry: string;
  strike: string;
  lotsize: string;
  instrumenttype: string;
  exch_seg: string;
  tick_size: string;
}

export interface AngelWebSocketMessage {
  action: 1 | 2; // 1 = subscribe, 2 = unsubscribe
  params: {
    mode: 1 | 2 | 3; // 1 = LTP, 2 = Quote, 3 = Snap Quote
    tokenList: Array<{
      exchangeType: number; // 1 = NSE
      tokens: string[];
    }>;
  };
}

export interface AngelTickData {
  exchange_type: number;
  symbol_token: string;
  trading_symbol: string;
  last_traded_price: number;
  last_traded_quantity: number;
  average_traded_price: number;
  volume_trade_for_the_day: number;
  total_buy_quantity: number;
  total_sell_quantity: number;
  open_price_of_the_day: number;
  high_price_of_the_day: number;
  low_price_of_the_day: number;
  closed_price: number;
}
