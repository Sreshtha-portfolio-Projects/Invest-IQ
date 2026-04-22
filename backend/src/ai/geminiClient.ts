import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import config from '../utils/config';
import logger from '../utils/logger';
import { ExternalAPIError } from '../utils/errors';

function getGeminiHttpStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const o = error as { status?: number; statusCode?: number };
    if (typeof o.status === 'number') return o.status;
    if (typeof o.statusCode === 'number') return o.statusCode;
  }
  return undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Retrying will not fix these (client/permission errors, or any 429 — use Retry-After in production callers if needed). */
function isNonRetryableGeminiError(error: unknown): boolean {
  const code = getGeminiHttpStatus(error);
  if (code === 404 || code === 400 || code === 429) return true;
  const msg = errorMessage(error);
  if (/\b404\b/.test(msg) || /\b400\b/.test(msg) || /not found for API version/i.test(msg)) {
    return true;
  }
  return false;
}

class GeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT = 30000;

  /**
   * Under Vitest (`VITEST=true`), return deterministic JSON unless `VITEST_GEMINI_REAL=1`.
   * `vitest.config.ts` sets `VITEST_GEMINI_REAL=0` so `.env` cannot accidentally force live calls during `npm test`.
   */
  private useVitestStub(): boolean {
    const v = process.env.VITEST;
    const inVitest = v === 'true' || v === '1';
    if (!inVitest) {
      return false;
    }
    const real = process.env.VITEST_GEMINI_REAL?.trim();
    return real !== '1' && real !== 'true';
  }

  private vitestStubPayload(prompt: string): Record<string, unknown> {
    if (prompt.includes('stock screening assistant')) {
      return { filters: [] };
    }
    if (prompt.includes('earnings call transcript')) {
      return {
        growth_signals: [],
        risk_signals: [],
        strategic_initiatives: [],
        management_sentiment: 'neutral',
      };
    }
    return {
      ticker: 'MOCK',
      valuation_summary: 'Mock valuation summary for tests.',
      growth_signals: ['Mock growth signal'],
      risk_factors: ['Mock risk factor'],
      overall_assessment: 'Mock overall assessment.',
    };
  }

  /** Lazy init so importing this module never constructs the Google client until the first real API call. */
  private ensureModel(): GenerativeModel {
    if (this.model) {
      return this.model;
    }
    if (!config.gemini.apiKey) {
      logger.error('Gemini API key is missing');
      throw new Error('Gemini API key is required');
    }
    this.client = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.client.getGenerativeModel({ model: config.gemini.model });
    return this.model;
  }

  async generateContent(prompt: string, retries = 0): Promise<string> {
    if (this.useVitestStub()) {
      return JSON.stringify(this.vitestStubPayload(prompt));
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.TIMEOUT);
      });

      const generationPromise = this.ensureModel().generateContent(prompt);

      const result = await Promise.race([generationPromise, timeoutPromise]);

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return text;
    } catch (error) {
      logger.error(`Gemini API error (attempt ${retries + 1}):`, error);

      if (isNonRetryableGeminiError(error)) {
        const code = getGeminiHttpStatus(error);
        if (code === 429) {
          throw new ExternalAPIError(
            'Gemini API rate limit or quota exceeded; check billing at https://ai.google.dev/ or retry later'
          );
        }
        throw new ExternalAPIError('AI model unavailable or misconfigured');
      }

      if (retries < this.MAX_RETRIES) {
        const delay = Math.pow(2, retries) * 1000;
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.generateContent(prompt, retries + 1);
      }

      throw new ExternalAPIError('AI service is temporarily unavailable');
    }
  }

  async generateStructuredContent<T>(prompt: string, schema: string): Promise<T> {
    try {
      const fullPrompt = `${prompt}\n\nYou must respond ONLY with valid JSON matching this schema:\n${schema}\n\nDo not include any markdown formatting, explanations, or text outside the JSON object.`;

      const response = await this.generateContent(fullPrompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as T;
      return parsed;
    } catch (error) {
      if (error instanceof ExternalAPIError) {
        throw error;
      }
      logger.error('Error parsing structured content:', error);
      throw new ExternalAPIError('Failed to parse AI response');
    }
  }
}

export default new GeminiClient();
