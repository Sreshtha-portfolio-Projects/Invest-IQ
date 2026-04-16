import { Router, Request, Response } from 'express';
import angelWsManager from '../market/realtime/angelWsManager';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * WebSocket route for real-time stock data
 * Frontend connects to this endpoint to receive live updates
 */
router.get('/health', asyncHandler(async (_req: Request, res: Response) => {
  const subscriptionCount = angelWsManager.getSubscriptionCount();
  
  res.json({
    status: 'ok',
    subscriptions: subscriptionCount,
    timestamp: new Date().toISOString(),
  });
}));

export default router;
