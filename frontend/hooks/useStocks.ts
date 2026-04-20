'use client';

import { useQuery } from '@tanstack/react-query';
import { stockService } from '../services/stockService';

export const useStockSearch = (query: string) => {
  return useQuery({
    queryKey: ['stocks', 'search', query],
    queryFn: () => stockService.searchStocks(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStockQuote = (ticker: string) => {
  return useQuery({
    queryKey: ['stocks', ticker, 'quote'],
    queryFn: () => stockService.getStockQuote(ticker),
    enabled: Boolean(ticker),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const useStockDetails = (ticker: string) => {
  return useQuery({
    queryKey: ['stocks', ticker, 'details'],
    queryFn: () => stockService.getStockDetails(ticker),
    enabled: Boolean(ticker),
    staleTime: 5 * 60 * 1000,
  });
};

export const useStockHistory = (ticker: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['stocks', ticker, 'history', startDate, endDate],
    queryFn: () => stockService.getStockHistory(ticker, startDate, endDate),
    enabled: Boolean(ticker),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMarketOverview = () => {
  return useQuery({
    queryKey: ['market', 'overview'],
    queryFn: () => stockService.getMarketOverview(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
};
