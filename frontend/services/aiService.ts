import api from './apiClient';
import {
  AIResearchRequest,
  AIResearchResponse,
  AIScreenerRequest,
  AIScreenerResponse,
  AIEarningsRequest,
  AIEarningsResponse,
} from '../types/ai';

export const aiService = {
  async researchStock(request: AIResearchRequest): Promise<AIResearchResponse> {
    const response = await api.post('/ai/research', request);
    return response.data.data;
  },

  async screenStocks(request: AIScreenerRequest): Promise<AIScreenerResponse> {
    const response = await api.post('/ai/screener', request);
    return response.data.data;
  },

  async analyzeEarnings(request: AIEarningsRequest): Promise<AIEarningsResponse> {
    const response = await api.post('/ai/earnings', request);
    return response.data.data;
  },
};
