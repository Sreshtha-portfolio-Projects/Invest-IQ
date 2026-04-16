import WebSocket from 'ws';
import angelClient from '../broker/angelClient';
import angelService from '../broker/angelService';
import angelMapper from '../broker/angelMapper';
import type { AngelWebSocketMessage, AngelTickData, NormalizedQuote } from '../../types/angel.types';
import logger from '../../utils/logger';

/**
 * Angel One WebSocket Manager
 * Handles real-time market data streaming
 */
class AngelWsManager {
  private ws: WebSocket | null = null;
  private readonly WS_URL = 'wss://smartapisocket.angelone.in/smart-stream';
  private subscriptions: Map<string, Set<(data: NormalizedQuote) => void>> = new Map();
  private symbolTokenToTicker: Map<string, string> = new Map();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_DELAY = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  /**
   * Connect to Angel One WebSocket
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const feedToken = angelClient.getFeedToken();
      const clientId = process.env.ANGEL_CLIENT_ID;

      if (!feedToken || !clientId) {
        throw new Error('Feed token or client ID not available');
      }

      logger.info('Connecting to Angel One WebSocket...');

      this.ws = new WebSocket(this.WS_URL, {
        headers: {
          'Authorization': feedToken,
          'x-api-key': process.env.ANGEL_API_KEY || '',
          'x-client-code': clientId,
          'x-feed-token': feedToken,
        },
      });

      this.ws.on('open', () => {
        logger.info('Angel One WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.startHeartbeat();
        this.resubscribeAll();
      });

      this.ws.on('message', (data: Buffer) => {
        this.handleMessage(data);
      });

      this.ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });

      this.ws.on('close', () => {
        logger.warn('WebSocket closed');
        this.stopHeartbeat();
        this.isConnecting = false;
        this.scheduleReconnect();
      });

    } catch (error) {
      logger.error('WebSocket connection failed:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: Buffer): void {
    try {
      const message = data.toString('utf-8');
      const parsed = JSON.parse(message);

      if (parsed.action === 'tick' && parsed.data) {
        for (const tickData of parsed.data as AngelTickData[]) {
          this.processTick(tickData);
        }
      }
    } catch (error) {
      logger.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Process tick data and notify subscribers
   */
  private processTick(tickData: AngelTickData): void {
    try {
      const symbolToken = tickData.symbol_token;
      const ticker = this.symbolTokenToTicker.get(symbolToken) || tickData.trading_symbol;

      const normalizedData = angelMapper.normalizeTickData(tickData, ticker);

      const subscribers = this.subscriptions.get(ticker);
      if (subscribers) {
        for (const callback of subscribers) {
          callback(normalizedData);
        }
      }
    } catch (error) {
      logger.error('Error processing tick:', error);
    }
  }

  /**
   * Subscribe to ticker updates
   */
  subscribe(ticker: string, callback: (data: NormalizedQuote) => void): void {
    try {
      const symbolToken = angelService.getSymbolToken(ticker);
      if (!symbolToken) {
        logger.error(`Cannot subscribe: symbol token not found for ${ticker}`);
        return;
      }

      if (!this.subscriptions.has(ticker)) {
        this.subscriptions.set(ticker, new Set());
      }

      this.subscriptions.get(ticker)!.add(callback);
      this.symbolTokenToTicker.set(symbolToken, ticker);

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendSubscription([symbolToken], 'subscribe');
      }

      logger.info(`Subscribed to ${ticker} (token: ${symbolToken})`);
    } catch (error) {
      logger.error(`Failed to subscribe to ${ticker}:`, error);
    }
  }

  /**
   * Unsubscribe from ticker updates
   */
  unsubscribe(ticker: string, callback?: (data: NormalizedQuote) => void): void {
    try {
      const symbolToken = angelService.getSymbolToken(ticker);
      
      if (callback) {
        this.subscriptions.get(ticker)?.delete(callback);
      } else {
        this.subscriptions.delete(ticker);
      }

      if (this.subscriptions.get(ticker)?.size === 0) {
        this.subscriptions.delete(ticker);
        
        if (symbolToken && this.ws?.readyState === WebSocket.OPEN) {
          this.sendSubscription([symbolToken], 'unsubscribe');
        }

        this.symbolTokenToTicker.delete(symbolToken || '');
        logger.info(`Unsubscribed from ${ticker}`);
      }
    } catch (error) {
      logger.error(`Failed to unsubscribe from ${ticker}:`, error);
    }
  }

  /**
   * Send subscription message to WebSocket
   */
  private sendSubscription(tokens: string[], action: 'subscribe' | 'unsubscribe'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('WebSocket not connected, cannot send subscription');
      return;
    }

    const message: AngelWebSocketMessage = {
      action: action === 'subscribe' ? 1 : 2,
      params: {
        mode: 2, // Quote mode
        tokenList: [
          {
            exchangeType: 1, // NSE
            tokens,
          },
        ],
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Resubscribe to all active tickers
   */
  private resubscribeAll(): void {
    const tokens: string[] = [];

    for (const ticker of this.subscriptions.keys()) {
      const symbolToken = angelService.getSymbolToken(ticker);
      if (symbolToken) {
        tokens.push(symbolToken);
      }
    }

    if (tokens.length > 0) {
      this.sendSubscription(tokens, 'subscribe');
      logger.info(`Resubscribed to ${tokens.length} symbols`);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.RECONNECT_DELAY * this.reconnectAttempts;

    logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      void this.connect();
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.symbolTokenToTicker.clear();
    logger.info('WebSocket disconnected');
  }

  /**
   * Get active subscriptions count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

export default new AngelWsManager();
