import geminiClient from './geminiClient';
import { ScreenerFilter } from '../types/ai.types';
import logger from '../utils/logger';

class ScreenerInterpreter {
  async interpretQuery(query: string): Promise<ScreenerFilter[]> {
    try {
      const prompt = this.buildScreenerPrompt(query);

      const schema = `{
  "filters": [
    {
      "field": "string (one of: sector, market_cap, pe_ratio, roe, revenue_growth, debt_to_equity)",
      "operator": "string (one of: eq, gt, lt, gte, lte, contains)",
      "value": "string or number"
    }
  ]
}`;

      const response = await geminiClient.generateStructuredContent<{ filters: ScreenerFilter[] }>(
        prompt,
        schema
      );

      return response.filters;
    } catch (error) {
      logger.error('Screener interpreter error:', error);
      return [];
    }
  }

  private buildScreenerPrompt(query: string): string {
    return `You are a stock screening assistant. Convert the user's natural language query into structured filters.

User Query: "${query}"

Available fields:
- sector: Company sector (exact match)
- market_cap: Market capitalization in rupees (numeric)
- pe_ratio: Price-to-Earnings ratio (numeric)
- roe: Return on Equity percentage (numeric)
- revenue_growth: Revenue growth percentage (numeric)
- debt_to_equity: Debt-to-Equity ratio (numeric)

Operators:
- eq: equals
- gt: greater than
- lt: less than
- gte: greater than or equal to
- lte: less than or equal to
- contains: text contains (for sector)

Examples:
"Technology companies with P/E under 20" →
[
  {"field": "sector", "operator": "eq", "value": "Technology"},
  {"field": "pe_ratio", "operator": "lt", "value": 20}
]

"Large cap stocks with ROE above 15%" →
[
  {"field": "market_cap", "operator": "gte", "value": 50000000000},
  {"field": "roe", "operator": "gt", "value": 15}
]

Convert the user's query into filters. Be precise and use only the available fields and operators.`;
  }
}

export default new ScreenerInterpreter();
