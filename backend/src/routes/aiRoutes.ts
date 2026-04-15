import { Router } from 'express';
import { researchStock, screenStocks, analyzeEarnings } from '../controllers/aiController';
import {
  validate,
  aiResearchSchema,
  aiScreenerSchema,
  aiEarningsSchema,
} from '../middleware/validation';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/research', aiLimiter, validate(aiResearchSchema), researchStock);
router.post('/screener', aiLimiter, validate(aiScreenerSchema), screenStocks);
router.post('/earnings', aiLimiter, validate(aiEarningsSchema), analyzeEarnings);

export default router;
