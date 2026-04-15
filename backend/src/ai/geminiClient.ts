import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import config from '../utils/config';
import logger from '../utils/logger';
import { ExternalAPIError } from '../utils/errors';

class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT = 30000;

  constructor() {
    if (!config.gemini.apiKey) {
      logger.error('Gemini API key is missing');
      throw new Error('Gemini API key is required');
    }

    this.client = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateContent(prompt: string, retries = 0): Promise<string> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.TIMEOUT);
      });

      const generationPromise = this.model.generateContent(prompt);

      const result = await Promise.race([generationPromise, timeoutPromise]);

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return text;
    } catch (error) {
      logger.error(`Gemini API error (attempt ${retries + 1}):`, error);

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
      logger.error('Error parsing structured content:', error);
      throw new ExternalAPIError('Failed to parse AI response');
    }
  }
}

export default new GeminiClient();
