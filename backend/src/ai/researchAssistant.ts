import geminiClient from './geminiClient';
import { AIResearchResponse } from '../types/ai.types';
import { Company, Financial, FinancialRatio } from '../types/database.types';
import logger from '../utils/logger';

class ResearchAssistant {
  async analyzeStock(
    company: Company,
    financials: Financial[],
    ratios: FinancialRatio | null,
    question: string
  ): Promise<AIResearchResponse> {
    try {
      const prompt = this.buildResearchPrompt(company, financials, ratios, question);

      const schema = `{
  "ticker": "string",
  "valuation_summary": "string (2-3 sentences about current valuation)",
  "growth_signals": ["array of 3-5 positive growth indicators"],
  "risk_factors": ["array of 3-5 key risks or concerns"],
  "overall_assessment": "string (1-2 sentences final recommendation)"
}`;

      const response = await geminiClient.generateStructuredContent<AIResearchResponse>(
        prompt,
        schema
      );

      response.ticker = company.ticker;

      return response;
    } catch (error) {
      logger.error('Research assistant error:', error);
      return this.getFallbackResponse(company.ticker);
    }
  }

  private buildResearchPrompt(
    company: Company,
    financials: Financial[],
    ratios: FinancialRatio | null,
    question: string
  ): string {
    const financialData = financials
      .map(
        (f) =>
          `Year ${f.year}: Revenue: ₹${f.revenue}, Net Income: ₹${f.net_income}, EPS: ₹${f.eps}`
      )
      .join('\n');

    const ratioData = ratios
      ? `P/E Ratio: ${ratios.pe_ratio}, ROE: ${ratios.roe}%, Debt/Equity: ${ratios.debt_to_equity}, Revenue Growth: ${ratios.revenue_growth}%`
      : 'Financial ratios not available';

    return `You are a professional stock analyst. Analyze the following company and answer the investor's question.

Company: ${company.name} (${company.ticker})
Sector: ${company.sector}
Industry: ${company.industry}
Market Cap: ₹${company.market_cap}

Financial History:
${financialData}

Financial Ratios:
${ratioData}

Investor Question: ${question}

Provide a comprehensive analysis covering:
1. Current valuation relative to peers and historical averages
2. Growth signals and positive momentum indicators
3. Risk factors and potential concerns
4. Overall investment assessment

Be factual, specific, and avoid speculation. Base your analysis on the provided data.`;
  }

  private getFallbackResponse(ticker: string): AIResearchResponse {
    return {
      ticker,
      valuation_summary:
        'Unable to generate valuation analysis at this time. Please try again later.',
      growth_signals: ['Data analysis temporarily unavailable'],
      risk_factors: ['Unable to assess risks at this time'],
      overall_assessment: 'Analysis service temporarily unavailable. Please retry your request.',
    };
  }
}

export default new ResearchAssistant();
