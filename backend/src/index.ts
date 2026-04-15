import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import config from './utils/config';
import logger from './utils/logger';

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});

export default app;
