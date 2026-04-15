import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  req.userId = userId;
  next();
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
