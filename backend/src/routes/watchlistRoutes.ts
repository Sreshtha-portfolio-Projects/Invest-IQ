import { Router } from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../controllers/watchlistController';
import { validate, watchlistAddSchema, watchlistDeleteSchema } from '../middleware/validation';
import { generalLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', generalLimiter, getWatchlist);
router.post('/', generalLimiter, validate(watchlistAddSchema), addToWatchlist);
router.delete('/:companyId', generalLimiter, validate(watchlistDeleteSchema), removeFromWatchlist);

export default router;
