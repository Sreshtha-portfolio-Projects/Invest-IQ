import { Router } from 'express';
import {
  searchStocks,
  getStockQuote,
  getStockHistory,
  getMarketOverview,
  getStockDetails,
} from '../controllers/stockController';
import {
  validate,
  stockSearchSchema,
  stockTickerSchema,
  stockHistorySchema,
} from '../middleware/validation';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/search', generalLimiter, validate(stockSearchSchema), searchStocks);
router.get('/overview', generalLimiter, getMarketOverview);
router.get('/:ticker', generalLimiter, validate(stockTickerSchema), getStockQuote);
router.get('/:ticker/details', generalLimiter, validate(stockTickerSchema), getStockDetails);
router.get('/:ticker/history', generalLimiter, validate(stockHistorySchema), getStockHistory);

export default router;
