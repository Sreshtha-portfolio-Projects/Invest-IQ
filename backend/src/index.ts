import { createApp } from './createApp';
import config from './utils/config';
import logger from './utils/logger';
import marketService from './market/marketService';
import angelWsManager from './market/realtime/angelWsManager';

const app = createApp();

const PORT = config.port;

async function startServer(): Promise<void> {
  try {
    logger.info('Initializing Angel One market data service...');
    await marketService.initialize();

    logger.info('Connecting Angel One WebSocket...');
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
