import geminiClient from './geminiClient';
import { AIEarningsResponse } from '../types/ai.types';
import logger from '../utils/logger';

class EarningsAnalyzer {
  async analyzeEarningsCall(
    ticker: string,
    quarter: string,
    transcript: string
  ): Promise<AIEarningsResponse> {
    try {
      const chunks = this.chunkTranscript(transcript);
      const analyses = await Promise.all(
        chunks.map((chunk) => this.analyzeChunk(ticker, quarter, chunk))
      );

      return this.aggregateAnalyses(ticker, quarter, analyses);
    } catch (error) {
      logger.error('Earnings analyzer error:', error);
      return this.getFallbackResponse(ticker, quarter);
    }
  }

  private chunkTranscript(transcript: string, maxLength = 8000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const sentences = transcript.split(/[.!?]\s+/);

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
      }
      currentChunk += sentence + '. ';
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.length > 0 ? chunks : [transcript];
  }

  private async analyzeChunk(
    ticker: string,
    quarter: string,
    chunk: string
  ): Promise<Partial<AIEarningsResponse>> {
    const prompt = this.buildEarningsPrompt(ticker, quarter, chunk);

    const schema = `{
  "growth_signals": ["array of positive growth indicators mentioned"],
  "risk_signals": ["array of risks or concerns mentioned"],
  "strategic_initiatives": ["array of strategic plans or initiatives mentioned"],
  "management_sentiment": "string (positive, neutral, or cautious)"
}`;

    try {
      return await geminiClient.generateStructuredContent<Partial<AIEarningsResponse>>(
        prompt,
        schema
      );
    } catch (error) {
      logger.error('Error analyzing chunk:', error);
      return {
        growth_signals: [],
        risk_signals: [],
        strategic_initiatives: [],
        management_sentiment: 'neutral',
      };
    }
  }

  private buildEarningsPrompt(ticker: string, quarter: string, transcript: string): string {
    return `You are analyzing an earnings call transcript. Extract key insights from this section.

Company: ${ticker}
Quarter: ${quarter}

Transcript Section:
${transcript}

Identify:
1. Growth signals: Revenue increases, margin expansion, new products, market share gains, positive guidance
2. Risk signals: Revenue misses, margin compression, competitive threats, regulatory issues, negative guidance
3. Strategic initiatives: New business lines, acquisitions, cost-cutting programs, R&D investments
4. Management sentiment: Overall tone (positive, neutral, cautious)

Focus on concrete facts and specific statements. Avoid speculation.`;
  }

  private aggregateAnalyses(
    ticker: string,
    quarter: string,
    analyses: Partial<AIEarningsResponse>[]
  ): AIEarningsResponse {
    const allGrowthSignals = analyses.flatMap((a) => a.growth_signals || []);
    const allRiskSignals = analyses.flatMap((a) => a.risk_signals || []);
    const allStrategicInitiatives = analyses.flatMap((a) => a.strategic_initiatives || []);

    const uniqueGrowthSignals = Array.from(new Set(allGrowthSignals)).slice(0, 7);
    const uniqueRiskSignals = Array.from(new Set(allRiskSignals)).slice(0, 7);
    const uniqueStrategicInitiatives = Array.from(new Set(allStrategicInitiatives)).slice(0, 5);

    const sentiments = analyses.map((a) => a.management_sentiment || 'neutral');
    const sentimentCounts = sentiments.reduce(
      (acc, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const overallSentiment = Object.entries(sentimentCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    const summary = this.generateSummary(
      uniqueGrowthSignals,
      uniqueRiskSignals,
      uniqueStrategicInitiatives,
      overallSentiment
    );

    return {
      ticker,
      quarter,
      growth_signals: uniqueGrowthSignals,
      risk_signals: uniqueRiskSignals,
      strategic_initiatives: uniqueStrategicInitiatives,
      management_sentiment: overallSentiment,
      summary,
    };
  }

  private generateSummary(
    growthSignals: string[],
    riskSignals: string[],
    initiatives: string[],
    sentiment: string
  ): string {
    const parts = [];

    if (sentiment === 'positive') {
      parts.push('Management expressed optimism about future prospects.');
    } else if (sentiment === 'cautious') {
      parts.push('Management took a cautious stance on near-term outlook.');
    } else {
      parts.push('Management maintained a balanced perspective.');
    }

    if (growthSignals.length > 0) {
      parts.push(
        `Key growth drivers include ${growthSignals.slice(0, 2).join(' and ')}.`
      );
    }

    if (riskSignals.length > 0) {
      parts.push(`Notable concerns involve ${riskSignals.slice(0, 2).join(' and ')}.`);
    }

    if (initiatives.length > 0) {
      parts.push(`Strategic focus areas include ${initiatives.slice(0, 2).join(' and ')}.`);
    }

    return parts.join(' ');
  }

  private getFallbackResponse(ticker: string, quarter: string): AIEarningsResponse {
    return {
      ticker,
      quarter,
      growth_signals: ['Analysis temporarily unavailable'],
      risk_signals: ['Unable to assess risks at this time'],
      strategic_initiatives: ['Data not available'],
      management_sentiment: 'neutral',
      summary: 'Earnings call analysis is temporarily unavailable. Please try again later.',
    };
  }
}

export default new EarningsAnalyzer();
