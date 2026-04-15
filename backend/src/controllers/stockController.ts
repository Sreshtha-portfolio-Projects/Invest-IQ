import { Request, Response } from 'express';
import marketService from '../market/marketService';
import databaseService from '../db/databaseService';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/errors';

export const searchStocks = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  const results = await marketService.searchStocks(q as string);

  res.json({
    status: 'success',
    data: results,
  });
});

export const getStockQuote = asyncHandler(async (req: Request, res: Response) => {
  const ticker = req.params.ticker as string;
  const quote = await marketService.getStockQuote(ticker);

  res.json({
    status: 'success',
    data: quote,
  });
});

export const getStockHistory = asyncHandler(async (req: Request, res: Response) => {
  const ticker = req.params.ticker as string;
  const { startDate, endDate } = req.query;

  const history = await marketService.getHistoricalPrices(
    ticker,
    startDate as string,
    endDate as string
  );

  res.json({
    status: 'success',
    data: history,
  });
});

export const getMarketOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await marketService.getMarketOverview();

  res.json({
    status: 'success',
    data: overview,
  });
});

export const getStockDetails = asyncHandler(async (req: Request, res: Response) => {
  const ticker = req.params.ticker as string;

  let company = await databaseService.getCompanyByTicker(ticker);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  const [quote, financials, ratios] = await Promise.all([
    marketService.getStockQuote(ticker),
    databaseService.getFinancials(company.id),
    databaseService.getFinancialRatios(company.id),
  ]);

  res.json({
    status: 'success',
    data: {
      company,
      quote,
      financials,
      ratios,
    },
  });
});
