import { Request, Response } from 'express';
import databaseService from '../db/databaseService';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ValidationError } from '../utils/errors';

export const getWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  let watchlist = await databaseService.getWatchlist(userId);

  if (!watchlist) {
    watchlist = await databaseService.createWatchlist(userId);
  }

  const items = await databaseService.getWatchlistItems(watchlist.id);

  res.json({
    status: 'success',
    data: {
      watchlist,
      items,
    },
  });
});

export const addToWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { ticker } = req.body as { ticker: string };

  let watchlist = await databaseService.getWatchlist(userId);

  if (!watchlist) {
    watchlist = await databaseService.createWatchlist(userId);
  }

  const company = await databaseService.getCompanyByTicker(ticker);

  if (!company) {
    throw new NotFoundError('Company not found in database');
  }

  try {
    await databaseService.addToWatchlist(watchlist.id, company.id);
  } catch (error) {
    if (error instanceof Error && error.message === 'Stock already in watchlist') {
      throw new ValidationError('Stock is already in your watchlist');
    }
    throw error;
  }

  res.status(201).json({
    status: 'success',
    message: 'Stock added to watchlist',
  });
});

export const removeFromWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const companyId = req.params.companyId as string;

  const watchlist = await databaseService.getWatchlist(userId);

  if (!watchlist) {
    throw new NotFoundError('Watchlist not found');
  }

  await databaseService.removeFromWatchlist(watchlist.id, companyId);

  res.json({
    status: 'success',
    message: 'Stock removed from watchlist',
  });
});
