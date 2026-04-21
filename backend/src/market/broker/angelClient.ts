import type { AngelSession } from '../../types/angel.types';
import config from '../../utils/config';
import logger from '../../utils/logger';

// Workaround for smartapi-javascript typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SmartAPI } = require('smartapi-javascript');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const speakeasy = require('speakeasy');

/**
 * Angel One SmartAPI Client
 * Handles authentication, session management, and API calls
 */
interface SmartAPIInstance {
  generateSession: (clientId: string, password: string, totp: string) => Promise<unknown>;
  setSessionExpiryHook: (callback: () => void) => void;
  /** REST market snapshot (SDK name; not getQuote) */
  marketData: (params: unknown) => Promise<unknown>;
  getCandleData: (params: unknown) => Promise<unknown>;
  getProfile: () => Promise<unknown>;
  logout: (clientId: string) => Promise<unknown>;
}

interface SmartAPIResponse {
  status: boolean;
  message?: string;
  data: unknown;
}

class AngelClient {
  private smartApi: SmartAPIInstance | null = null;
  private session: AngelSession | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;
  private isAuthenticating = false;
  private authPromise: Promise<void> | null = null;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.smartApi = new SmartAPI({
      api_key: config.angel.apiKey,
    }) as SmartAPIInstance;
  }

  /**
   * Generate TOTP token from secret
   */
  private generateTOTP(secret: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    }) as string;
  }

  /**
   * Login and generate session
   */
  async login(): Promise<void> {
    if (this.isAuthenticating) {
      if (this.authPromise) {
        await this.authPromise;
        return;
      }
    }

    this.isAuthenticating = true;
    this.authPromise = this._doLogin();

    try {
      await this.authPromise;
    } finally {
      this.isAuthenticating = false;
      this.authPromise = null;
    }
  }

  private async _doLogin(): Promise<void> {
    try {
      if (!this.smartApi) {
        throw new Error('SmartAPI not initialized');
      }

      const totp = this.generateTOTP(config.angel.totpSecret);
      const sessionPin = (config.angel.mpin || config.angel.password || '').trim();

      if (!sessionPin) {
        throw new Error(
          'Angel One login: set ANGEL_MPIN (4-digit trading PIN) or ANGEL_PASSWORD in backend/.env'
        );
      }

      if (!config.angel.mpin && sessionPin.length > 0 && sessionPin.length !== 4) {
        logger.warn(
          'Angel One SmartAPI expects your 4-digit trading MPIN as the session PIN. Set ANGEL_MPIN in .env (ANGEL_PASSWORD alone is often a longer web password and will fail with "Please enter 4 digit mpin").'
        );
      }

      logger.info('Attempting Angel One login...');

      // SmartAPI generateSession(clientCode, pin, totp): pin must be 4-digit MPIN for MPIN-enabled accounts.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const loginResponse = (await this.smartApi.generateSession(
        config.angel.clientId,
        sessionPin,
        totp
      )) as { status: boolean; message?: string; data: { jwtToken: string; refreshToken: string; feedToken: string } };

      if (!loginResponse.status) {
        const hint =
          /mpin/i.test(loginResponse.message || '') && !config.angel.mpin
            ? ' Set ANGEL_MPIN to your 4-digit Angel trading app PIN in backend/.env.'
            : '';
        throw new Error(`Login failed: ${loginResponse.message || 'Unknown error'}${hint}`);
      }

      this.session = {
        jwtToken: loginResponse.data.jwtToken,
        refreshToken: loginResponse.data.refreshToken,
        feedToken: loginResponse.data.feedToken,
      };

      this.smartApi.setSessionExpiryHook(() => {
        logger.warn('Angel One session expired, re-authenticating...');
        void this.login();
      });

      logger.info('Angel One login successful');
    } catch (error) {
      logger.error('Angel One login failed:', error);
      this.session = null;
      throw error;
    }
  }

  /**
   * Ensure we have a valid session
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.session) {
      await this.login();
    }
  }

  /**
   * Get quote for a symbol
   */
  async getQuote(
    symbolToken: string,
    exchange: string = 'NSE',
    retries = 0
  ): Promise<unknown> {
    try {
      await this.ensureAuthenticated();

      if (!this.smartApi) {
        throw new Error('SmartAPI not initialized');
      }

      const response = await this.smartApi.marketData({
        mode: 'FULL',
        exchangeTokens: {
          [exchange]: [symbolToken],
        },
      }) as SmartAPIResponse;

      if (!response.status) {
        throw new Error(`Get quote failed: ${response.message || 'Unknown error'}`);
      }

      return response.data;
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        logger.warn(`Quote fetch failed, retrying (${retries + 1}/${this.MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.getQuote(symbolToken, exchange, retries + 1);
      }

      logger.error(`Failed to get quote after ${this.MAX_RETRIES} retries:`, error);
      throw error;
    }
  }

  /**
   * Get historical candle data
   */
  async getHistorical(params: {
    symboltoken: string;
    interval: string;
    fromdate: string;
    todate: string;
    exchange?: string;
  }): Promise<unknown> {
    try {
      await this.ensureAuthenticated();

      if (!this.smartApi) {
        throw new Error('SmartAPI not initialized');
      }

      const response = await this.smartApi.getCandleData({
        exchange: params.exchange || 'NSE',
        symboltoken: params.symboltoken,
        interval: params.interval,
        fromdate: params.fromdate,
        todate: params.todate,
      }) as SmartAPIResponse;

      if (!response.status) {
        throw new Error(`Get historical failed: ${response.message || 'Unknown error'}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to get historical data:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  getSession(): AngelSession | null {
    return this.session;
  }

  /**
   * Get feed token for WebSocket
   */
  getFeedToken(): string | null {
    return this.session?.feedToken || null;
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<unknown> {
    try {
      await this.ensureAuthenticated();

      if (!this.smartApi) {
        throw new Error('SmartAPI not initialized');
      }

      const response = await this.smartApi.getProfile() as SmartAPIResponse;

      if (!response.status) {
        throw new Error(`Get profile failed: ${response.message || 'Unknown error'}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to get profile:', error);
      throw error;
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      if (this.smartApi && this.session) {
        await this.smartApi.logout(config.angel.clientId);
        logger.info('Angel One session terminated');
      }
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      this.session = null;
    }
  }
}

export default new AngelClient();
