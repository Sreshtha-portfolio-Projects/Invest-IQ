import { Router } from 'express';
import stockRoutes from './stockRoutes';
import aiRoutes from './aiRoutes';
import watchlistRoutes from './watchlistRoutes';
import websocketRoutes from './websocketRoutes';

const router = Router();

router.use('/stocks', stockRoutes);
router.use('/market', stockRoutes);
router.use('/ai', aiRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/ws', websocketRoutes);

export default router;
