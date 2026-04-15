import { Request, Response } from 'express';
import researchAssistant from '../ai/researchAssistant';
import screenerInterpreter from '../ai/screenerInterpreter';
import earningsAnalyzer from '../ai/earningsAnalyzer';
import databaseService from '../db/databaseService';
import type { CompanyFilterOptions } from '../types/companyFilters.types';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/errors';

export const researchStock = asyncHandler(async (req: Request, res: Response) => {
  const { ticker, question } = req.body as { ticker: string; question: string };

  const company = await databaseService.getCompanyByTicker(ticker);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  const [financials, ratios] = await Promise.all([
    databaseService.getFinancials(company.id),
    databaseService.getFinancialRatios(company.id),
  ]);

  const analysis = await researchAssistant.analyzeStock(company, financials, ratios, question);

  res.json({
    status: 'success',
    data: analysis,
  });
});

export const screenStocks = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.body as { query: string };

  const filters = await screenerInterpreter.interpretQuery(query);

  const dbFilters: CompanyFilterOptions = {};

  for (const filter of filters) {
    switch (filter.field) {
      case 'sector':
        if (filter.operator === 'eq') {
          dbFilters.sector = filter.value as string;
        }
        break;
      case 'market_cap':
        if (filter.operator === 'gte') {
          dbFilters.minMarketCap = filter.value as number;
        } else if (filter.operator === 'gt') {
          dbFilters.minMarketCap = filter.value as number;
          dbFilters.minMarketCapExclusive = true;
        } else if (filter.operator === 'lte') {
          dbFilters.maxMarketCap = filter.value as number;
        } else if (filter.operator === 'lt') {
          dbFilters.maxMarketCap = filter.value as number;
          dbFilters.maxMarketCapExclusive = true;
        }
        break;
      case 'pe_ratio':
        if (filter.operator === 'gte') {
          dbFilters.minPE = filter.value as number;
        } else if (filter.operator === 'gt') {
          dbFilters.minPE = filter.value as number;
          dbFilters.minPEExclusive = true;
        } else if (filter.operator === 'lte') {
          dbFilters.maxPE = filter.value as number;
        } else if (filter.operator === 'lt') {
          dbFilters.maxPE = filter.value as number;
          dbFilters.maxPEExclusive = true;
        }
        break;
      case 'roe':
        if (filter.operator === 'gte') {
          dbFilters.minROE = filter.value as number;
        } else if (filter.operator === 'gt') {
          dbFilters.minROE = filter.value as number;
          dbFilters.minROEExclusive = true;
        } else if (filter.operator === 'lte') {
          dbFilters.maxROE = filter.value as number;
        } else if (filter.operator === 'lt') {
          dbFilters.maxROE = filter.value as number;
          dbFilters.maxROEExclusive = true;
        }
        break;
      case 'debt_to_equity':
        if (filter.operator === 'gte') {
          dbFilters.minDebtToEquity = filter.value as number;
        } else if (filter.operator === 'gt') {
          dbFilters.minDebtToEquity = filter.value as number;
          dbFilters.minDebtToEquityExclusive = true;
        } else if (filter.operator === 'lte') {
          dbFilters.maxDebtToEquity = filter.value as number;
        } else if (filter.operator === 'lt') {
          dbFilters.maxDebtToEquity = filter.value as number;
          dbFilters.maxDebtToEquityExclusive = true;
        }
        break;
      case 'revenue_growth':
        if (filter.operator === 'gte') {
          dbFilters.minRevenueGrowth = filter.value as number;
        } else if (filter.operator === 'gt') {
          dbFilters.minRevenueGrowth = filter.value as number;
          dbFilters.minRevenueGrowthExclusive = true;
        } else if (filter.operator === 'lte') {
          dbFilters.maxRevenueGrowth = filter.value as number;
        } else if (filter.operator === 'lt') {
          dbFilters.maxRevenueGrowth = filter.value as number;
          dbFilters.maxRevenueGrowthExclusive = true;
        }
        break;
    }
  }

  const companies = await databaseService.getCompaniesByFilters(dbFilters);

  const stocks = companies.map((company) => ({
    ticker: company.ticker,
    name: company.name,
    sector: company.sector,
    market_cap: company.market_cap,
    pe_ratio: null,
    roe: null,
  }));

  res.json({
    status: 'success',
    data: {
      filters,
      stocks,
    },
  });
});

export const analyzeEarnings = asyncHandler(async (req: Request, res: Response) => {
  const { ticker } = req.body as { ticker: string };

  const company = await databaseService.getCompanyByTicker(ticker);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  const earningsCall = await databaseService.getLatestEarningsCall(company.id);

  if (!earningsCall) {
    throw new NotFoundError('No earnings call data available for this company');
  }

  const analysis = await earningsAnalyzer.analyzeEarningsCall(
    ticker,
    earningsCall.quarter,
    earningsCall.transcript
  );

  res.json({
    status: 'success',
    data: analysis,
  });
});
