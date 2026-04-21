import type { OpenAPIV3 } from 'openapi-types';

/**
 * Keep this spec lightweight and stable.
 * We intentionally document the API surface that's used by the frontend.
 */
export function buildOpenApiSpec(params: {
  title: string;
  version: string;
  serverUrl: string;
}): OpenAPIV3.Document {
  const { title, version, serverUrl } = params;

  const spec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
      title,
      version,
      description: 'Invest IQ backend API (mounted under /api)',
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: 'Stocks' },
      { name: 'AI' },
      { name: 'Watchlist' },
      { name: 'WebSocket' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
          additionalProperties: true,
        },
      },
    },
    paths: {
      '/stocks/search': {
        get: {
          tags: ['Stocks'],
          summary: 'Search stocks by query',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Search query (ticker/company name)',
            },
          ],
          responses: {
            '200': { description: 'Search results' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/stocks/overview': {
        get: {
          tags: ['Stocks'],
          summary: 'Get market overview',
          responses: {
            '200': { description: 'Market overview' },
          },
        },
      },
      '/stocks/{ticker}': {
        get: {
          tags: ['Stocks'],
          summary: 'Get stock quote by ticker',
          parameters: [
            {
              name: 'ticker',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Quote' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/stocks/{ticker}/details': {
        get: {
          tags: ['Stocks'],
          summary: 'Get stock details by ticker',
          parameters: [
            {
              name: 'ticker',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Details' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/stocks/{ticker}/history': {
        get: {
          tags: ['Stocks'],
          summary: 'Get price history by ticker',
          parameters: [
            { name: 'ticker', in: 'path', required: true, schema: { type: 'string' } },
            {
              name: 'interval',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Candlestick interval (depends on broker)',
            },
            {
              name: 'from',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Start date/time (string accepted by backend)',
            },
            {
              name: 'to',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'End date/time (string accepted by backend)',
            },
          ],
          responses: {
            '200': { description: 'History' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/ai/research': {
        post: {
          tags: ['AI'],
          summary: 'AI research on a stock',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          responses: {
            '200': { description: 'Research result' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '429': { description: 'Rate limited' },
          },
        },
      },
      '/ai/screener': {
        post: {
          tags: ['AI'],
          summary: 'AI stock screener',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          responses: {
            '200': { description: 'Screener result' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '429': { description: 'Rate limited' },
          },
        },
      },
      '/ai/earnings': {
        post: {
          tags: ['AI'],
          summary: 'AI earnings analysis',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          responses: {
            '200': { description: 'Earnings analysis' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '429': { description: 'Rate limited' },
          },
        },
      },
      '/watchlist': {
        get: {
          tags: ['Watchlist'],
          summary: 'Get current user watchlist',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Watchlist' },
            '401': { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Watchlist'],
          summary: 'Add company to watchlist',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          responses: {
            '200': { description: 'Added' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/watchlist/{companyId}': {
        delete: {
          tags: ['Watchlist'],
          summary: 'Remove company from watchlist',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'companyId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Removed' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/ws/health': {
        get: {
          tags: ['WebSocket'],
          summary: 'WebSocket service health (HTTP)',
          responses: {
            '200': { description: 'WS health' },
          },
        },
      },
    },
  };

  return spec;
}

