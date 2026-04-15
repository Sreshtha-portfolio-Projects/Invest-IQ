import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        next(new ValidationError(messages.join(', ')));
      } else {
        next(error);
      }
    }
  };
};

export const stockSearchSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
  }),
});

export const stockTickerSchema = z.object({
  params: z.object({
    ticker: z.string().min(1, 'Ticker is required'),
  }),
});

export const stockHistorySchema = z.object({
  params: z.object({
    ticker: z.string().min(1, 'Ticker is required'),
  }),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const aiResearchSchema = z.object({
  body: z.object({
    ticker: z.string().min(1, 'Ticker is required'),
    question: z.string().min(1, 'Question is required'),
  }),
});

export const aiScreenerSchema = z.object({
  body: z.object({
    query: z.string().min(1, 'Query is required'),
  }),
});

export const aiEarningsSchema = z.object({
  body: z.object({
    ticker: z.string().min(1, 'Ticker is required'),
  }),
});

export const watchlistAddSchema = z.object({
  body: z.object({
    ticker: z.string().min(1, 'Ticker is required'),
  }),
});

export const watchlistDeleteSchema = z.object({
  params: z.object({
    companyId: z.string().uuid('Invalid company ID'),
  }),
});
