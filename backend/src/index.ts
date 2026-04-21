import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import * as ws from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import config from './utils/config';
import logger from './utils/logger';
import marketService from './market/marketService';
import angelWsManager from './market/realtime/angelWsManager';
import type { NormalizedQuote } from './types/angel.types';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiSpec } from './swagger';

const appBase = express();
const wsInstance = expressWs(appBase);
const app = wsInstance.app;

app.use(helmet());

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Invest IQ API',
    message: 'API is mounted under /api. Open the frontend for the web app.',
    health: '/health',
    apiBase: '/api',
    docs: {
      stocks: 'GET /api/stocks/search?q=',
      market: 'GET /api/stocks/overview',
      ai: 'POST /api/ai/research | /api/ai/screener | /api/ai/earnings',
      watchlist: 'GET|POST|DELETE /api/watchlist',
    },
    frontend: config.frontendUrl,
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const openApiSpec = buildOpenApiSpec({
  title: 'Invest IQ API',
  version: '1.0.0',
  serverUrl: '/api',
});

app.get('/api/openapi.json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api', routes);

// WebSocket endpoint for real-time stock data
app.ws('/ws/stocks', (socket, _req: Request) => {
  logger.info('WebSocket client connected');

  const subscriptions = new Map<string, (data: NormalizedQuote) => void>();

  socket.on('message', (msg: ws.Data) => {
    try {
      const msgStr = msg.toString();
      const message = JSON.parse(msgStr) as { action: string; ticker?: string };

      if (message.action === 'subscribe' && message.ticker) {
        const ticker = message.ticker;
        
        const callback = (data: NormalizedQuote) => {
          socket.send(JSON.stringify({
            type: 'tick',
            ticker,
            data,
          }));
        };

        subscriptions.set(ticker, callback);
        angelWsManager.subscribe(ticker, callback);

        socket.send(JSON.stringify({
          type: 'subscribed',
          ticker,
        }));

        logger.info(`WebSocket subscribed to ${ticker}`);
      }

      if (message.action === 'unsubscribe' && message.ticker) {
        const ticker = message.ticker;
        const callback = subscriptions.get(ticker);
        
        if (callback) {
          angelWsManager.unsubscribe(ticker, callback);
          subscriptions.delete(ticker);
          
          socket.send(JSON.stringify({
            type: 'unsubscribed',
            ticker,
          }));

          logger.info(`WebSocket unsubscribed from ${ticker}`);
        }
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
    }
  });

  socket.on('close', () => {
    for (const [ticker, callback] of subscriptions) {
      angelWsManager.unsubscribe(ticker, callback);
    }
    subscriptions.clear();
    logger.info('WebSocket client disconnected');
  });

  socket.on('error', (error: Error) => {
    logger.error('WebSocket error:', error);
  });
});

app.use(errorHandler);

const PORT = config.port;

// Initialize services and start server
async function startServer(): Promise<void> {
  try {
    logger.info('Initializing Angel One market data service...');
    await marketService.initialize();
    
    logger.info('Connecting to Angel One WebSocket...');
    await angelWsManager.connect();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
      logger.info(`WebSocket endpoint: ws://localhost:${PORT}/ws/stocks`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  angelWsManager.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  angelWsManager.disconnect();
  process.exit(0);
});

void startServer();

export default app;
