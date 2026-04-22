/**
 * Contract smoke tests for every operation in `buildOpenApiSpec` (same document as `/api-docs`).
 * This replaces brittle browser automation against Swagger UI with direct HTTP calls via supertest.
 *
 * Env (optional):
 * - `API_SMOKE_TICKER` — ticker present in your DB for `/stocks/.../details` and AI routes (default RELIANCE).
 * - `API_SMOKE_USER_ID` — existing Supabase `users.id`; required for watchlist tests (otherwise skipped).
 * - `API_SMOKE_BEARER` — sent as `Authorization: Bearer ...` alongside `x-user-id` (backend auth is header-based).
 * - `VITEST_GEMINI_REAL=1` — call real Gemini in tests (Vitest still sets `VITEST=true`). Default: in-process stub in `geminiClient.ts` (no HTTP).
 */
import request, { type Test } from 'supertest';
import type { OpenAPIV3 } from 'openapi-types';
import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';
import { createApp } from '../createApp';
import { buildOpenApiSpec } from '../swagger';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

function expandPath(template: string, pathParams: Record<string, string>): string {
  let out = template;
  for (const [name, value] of Object.entries(pathParams)) {
    out = out.replace(`{${name}}`, encodeURIComponent(value));
  }
  return out;
}

function documentedStatuses(operation: OpenAPIV3.OperationObject): number[] {
  const keys = Object.keys(operation.responses ?? {});
  return keys
    .filter((k) => k !== 'default')
    .map((k) => parseInt(k, 10))
    .filter((n) => !Number.isNaN(n));
}

function dispatch(
  app: ReturnType<typeof createApp>,
  method: HttpMethod,
  url: string
): Test {
  const r = request(app);
  switch (method) {
    case 'get':
      return r.get(url);
    case 'post':
      return r.post(url);
    case 'put':
      return r.put(url);
    case 'patch':
      return r.patch(url);
    case 'delete':
      return r.delete(url);
    case 'options':
      return r.options(url);
    case 'head':
      return r.head(url);
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

/**
 * Responses that are valid in production but not worth listing on every path (e.g. shared rate limiter).
 * Prefer documenting real status codes in `swagger.ts` and keeping this set minimal.
 */
const EXTRA_ACCEPTABLE = new Set([429]);

describe('OpenAPI smoke (same surface as /api-docs)', () => {
  const app = createApp();
  const spec = buildOpenApiSpec({
    title: 'Invest IQ API',
    version: '1.0.0',
    serverUrl: '/api',
  });

  const sampleTicker = process.env.API_SMOKE_TICKER?.trim() || 'RELIANCE';
  /** Must be an existing `users.id` in Supabase for watchlist routes to return 2xx. */
  const testUserId = process.env.API_SMOKE_USER_ID?.trim() ?? randomUUID();

  const samples: Record<string, { pathParams?: Record<string, string>; query?: Record<string, string>; body?: unknown }> = {
    'GET /stocks/search': { query: { q: 'rel' } },
    'GET /stocks/overview': {},
    'GET /stocks/{ticker}': { pathParams: { ticker: sampleTicker } },
    'GET /stocks/{ticker}/details': { pathParams: { ticker: sampleTicker } },
    'GET /stocks/{ticker}/history': {
      pathParams: { ticker: sampleTicker },
      query: { startDate: '2024-01-01', endDate: '2024-12-31' },
    },
    'POST /ai/research': {
      body: { ticker: sampleTicker, question: 'What are key risks?' },
    },
    'POST /ai/screener': {
      body: { query: 'Large cap technology stocks' },
    },
    'POST /ai/earnings': {
      body: { ticker: sampleTicker },
    },
    'GET /watchlist': {},
    'POST /watchlist': {
      body: { ticker: sampleTicker },
    },
    'DELETE /watchlist/{companyId}': {
      pathParams: { companyId: randomUUID() },
    },
    'GET /ws/health': {},
  };

  beforeAll(() => {
    const paths = spec.paths ?? {};
    const missing: string[] = [];
    for (const pathKey of Object.keys(paths)) {
      const item = paths[pathKey] as OpenAPIV3.PathItemObject;
      for (const method of HTTP_METHODS) {
        const op = item[method];
        if (!op) continue;
        const key = `${method.toUpperCase()} ${pathKey}`;
        if (!samples[key]) {
          missing.push(key);
        }
      }
    }
    if (missing.length > 0) {
      throw new Error(
        `Add smoke samples for new OpenAPI operations:\n${missing.join('\n')}`
      );
    }
  });

  for (const pathKey of Object.keys(spec.paths ?? {})) {
    const item = spec.paths![pathKey] as OpenAPIV3.PathItemObject;
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (!operation) continue;

      const key = `${method.toUpperCase()} ${pathKey}`;
      const sample = samples[key];
      if (!sample) continue;

      const skipWatchlistWithoutUser =
        pathKey.includes('watchlist') && !process.env.API_SMOKE_USER_ID?.trim();
      const run = skipWatchlistWithoutUser ? it.skip : it;

      run(`${key} returns a documented or acceptable HTTP status`, async () => {
        const pathParams = sample.pathParams ?? {};
        const path = expandPath(pathKey, pathParams);
        const url = `/api${path}`;
        const documented = documentedStatuses(operation);
        const authRequired = Boolean(operation.security?.some((s) => 'bearerAuth' in s));

        const headers: Record<string, string> = {};
        if (authRequired) {
          // Swagger documents Bearer; the backend currently authenticates via `x-user-id`.
          headers['x-user-id'] = testUserId;
          headers['Authorization'] = `Bearer ${process.env.API_SMOKE_BEARER ?? 'smoke-test-token'}`;
        }

        const req = dispatch(app, method, url).set(headers);

        if (sample.query) {
          req.query(sample.query);
        }
        if (sample.body !== undefined && method !== 'get' && method !== 'head') {
          req.send(sample.body as object);
        }

        const res = await req;
        expect(res.status, `Server error for ${key}`).not.toBe(500);

        const allowed = new Set([...documented, ...EXTRA_ACCEPTABLE]);
        expect(
          allowed.has(res.status),
          `Unexpected ${res.status} for ${key}. Body: ${res.text?.slice(0, 500)}`
        ).toBe(true);

        const ct = res.headers['content-type'] ?? '';
        if (res.status >= 200 && res.status < 300 && ct.includes('json')) {
          const body = JSON.parse(res.text) as { status?: string };
          if (pathKey === '/ws/health') {
            expect(body.status).toBe('ok');
          } else {
            expect(body.status).toBe('success');
          }
        }
      });
    }
  }

  it('POST /api/ai/screener returns 200 with filters and stocks (Gemini stubbed in Vitest)', async () => {
    const res = await request(app)
      .post('/api/ai/screener')
      .send({ query: 'Large cap technology stocks' });

    expect(res.status).toBe(200);
    const body = JSON.parse(res.text) as {
      status: string;
      data: { filters: unknown[]; stocks: unknown[] };
    };
    expect(body.status).toBe('success');
    expect(Array.isArray(body.data.filters)).toBe(true);
    expect(Array.isArray(body.data.stocks)).toBe(true);
  });
});
