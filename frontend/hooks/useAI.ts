'use client';

import { useMutation } from '@tanstack/react-query';
import { aiService } from '../services/aiService';
import { AIResearchRequest, AIScreenerRequest, AIEarningsRequest } from '../types/ai';

export const useResearchStock = () => {
  return useMutation({
    mutationFn: (request: AIResearchRequest) => aiService.researchStock(request),
  });
};

export const useScreenStocks = () => {
  return useMutation({
    mutationFn: (request: AIScreenerRequest) => aiService.screenStocks(request),
  });
};

export const useAnalyzeEarnings = () => {
  return useMutation({
    mutationFn: (request: AIEarningsRequest) => aiService.analyzeEarnings(request),
  });
};
