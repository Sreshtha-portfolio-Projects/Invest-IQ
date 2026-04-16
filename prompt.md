You are a senior staff engineer.

Initialize a production-grade full-stack project with the following structure:

/frontend → Next.js (App Router, TypeScript, Tailwind)
/backend → Node.js + Express (TypeScript)

Requirements:

- Strict TypeScript setup
- ESLint + Prettier
- Environment variable handling
- Proper folder structure
- No business logic in controllers

Backend structure:

src/
  controllers/
  services/
  routes/
  middleware/
  ai/
  market/
  db/
  utils/

Frontend structure:

app/
components/
hooks/
services/
types/
utils/

Do not implement features yet.
Only scaffold the project with clean architecture.





Setp 2 
Set up Supabase PostgreSQL schema and backend integration.

Create tables:

users
companies
stock_prices
financials
financial_ratios
earnings_calls
watchlists
watchlist_items

Requirements:

- Proper foreign keys
- Indexes on ticker and company_id
- Time-series optimization for stock_prices
- Use Supabase client in backend

Create a database service layer:

/backend/src/db/

Include functions:

getCompanyByTicker
getFinancials
getStockPrices
getWatchlist

Do not mix DB logic into controllers.



Step 3:
Implement a market data service.

Use:
- Yahoo Finance (primary)
- Twelve Data (fallback)

Create:

/backend/src/market/marketService.ts

Functions:

searchStocks(query)
getStockQuote(ticker)
getHistoricalPrices(ticker)
getMarketOverview()

Add caching using Redis-like pattern (in-memory for now).

Ensure:

- API failures handled
- fallback provider used
- rate limit protection

Expose APIs:

GET /stocks/search
GET /stocks/:ticker
GET /stocks/:ticker/history
GET /market/overview


Step 4:
Set up Gemini AI integration.

Create:

/backend/src/ai/geminiClient.ts

Requirements:

- Centralized Gemini client
- API key via env
- Retry logic
- Timeout handling

Create 3 services:

researchAssistant.ts
screenerInterpreter.ts
earningsAnalyzer.ts

All must:

- Use structured prompts
- Return JSON
- Validate responses

Do NOT implement prompts yet.



Step 5: 
Implement optimized Gemini prompts.

1. Research Assistant
2. Screener Interpreter
3. Earnings Analyzer

Requirements:

- Structured JSON output
- No hallucination language
- Include financial reasoning
- Validate missing fields

Ensure backend parses AI response safely.

If AI fails → return fallback response.


Step 6:
Create endpoint:

POST /ai/research

Input:
{
  ticker: string,
  question: string
}

Flow:

fetch company data
fetch financials
build AI context
call Gemini
return structured response

Ensure:

- clean service layer
- no logic in controller
- proper error handling



Step 7:
Create endpoint:

POST /ai/screener

Input:
{
  query: string
}

Flow:

Gemini → convert query to filters
Apply filters to database
Return matching stocks

Implement dynamic query builder.

Support filters:

sector
market_cap
pe_ratio
roe
revenue_growth
debt_to_equity


Step 8:
Create endpoint:

POST /ai/earnings

Input:
{
  ticker: string
}

Flow:

fetch transcript
chunk text
send to Gemini
aggregate response

Return:

growth_signals
risk_signals
sentiment
summary



Step 9: 
Implement watchlist system.

Endpoints:

POST /watchlist
DELETE /watchlist/:id
GET /watchlist

Requirements:

- user-based watchlists
- prevent duplicates
- fast queries


Step 10:
Set up frontend base.

Pages:

/login
/dashboard
/stocks/[ticker]
/screener
/watchlist

Add:

- global layout
- navbar
- API service layer
- React Query setup

No UI polish yet.
Focus on structure.


Step 11:
Build stock detail page.

Sections:

- company header
- price + change
- chart (TradingView or lightweight)
- financial metrics
- AI insights panel
- earnings analysis

Fetch data from backend APIs.

Ensure:

- loading states
- error states


Step 12:
Create AI assistant component.

Features:

- chat interface
- ask stock questions
- show structured response

Integrate with:

POST /ai/research

UI:

- user message
- AI response
- loading state


Step 13: 
Build screener page.

Components:

- input box
- results table

Flow:

user enters query
call /ai/screener
display results

Add:

sorting
basic filters


Step 14:
Build dashboard page.

Sections:

- indices (NIFTY, SENSEX)
- top gainers
- top losers
- trending stocks

Use:

GET /market/overview


Step 15:
Build watchlist page.

Features:

- list stocks
- remove stock
- link to stock page


Step 16:
Improve production readiness.

Add:

- API validation (Zod)
- rate limiting
- logging
- error boundaries
- environment configs
- loading skeletons

Ensure app is stable and scalable.






































































Master Propmt: 


You are a senior staff engineer building a production-grade SaaS platform.

Your task is to build a full-stack AI-powered stock research platform with clean architecture, scalability, and modular design.

This is NOT a demo project. It must resemble a real startup codebase.

--------------------------------------------------

PRODUCT VISION

Build a platform that acts like:

"ChatGPT for Stock Research"

The system should:
- show stock market data
- analyze financials
- allow natural language queries
- provide AI-generated insights

--------------------------------------------------

CORE FEATURES

1. Authentication (Supabase)
2. Market Dashboard
3. Stock Search
4. Company Overview Page
5. AI Investment Research Assistant
6. Natural Language Stock Screener
7. AI Earnings Call Analyzer
8. Watchlist

--------------------------------------------------

TECH STACK

Frontend:
- Next.js (App Router)
- TypeScript
- TailwindCSS
- React Query

Backend:
- Node.js
- Express
- TypeScript

Database:
- Supabase (PostgreSQL)

AI:
- Google Gemini API

Market Data:
- Yahoo Finance (primary)
- Twelve Data (fallback)

--------------------------------------------------

PROJECT STRUCTURE

Root:
 /frontend
 /backend

Frontend:

app/
components/
hooks/
services/
types/
utils/

Backend:

src/
 controllers/
 services/
 routes/
 middleware/
 ai/
 market/
 db/
 utils/

Follow clean architecture:
- Controllers → handle request/response
- Services → business logic
- DB layer → queries only

--------------------------------------------------

DATABASE SCHEMA

Create tables:

users
- id
- email
- created_at

companies
- id
- ticker
- name
- sector
- industry
- market_cap

stock_prices
- id
- company_id
- timestamp
- open
- high
- low
- close
- volume

financials
- id
- company_id
- year
- revenue
- net_income
- eps

financial_ratios
- company_id
- pe_ratio
- roe
- debt_to_equity
- revenue_growth

earnings_calls
- id
- company_id
- quarter
- transcript

watchlists
- id
- user_id

watchlist_items
- watchlist_id
- company_id

--------------------------------------------------

BACKEND IMPLEMENTATION

1. Setup Express server with TypeScript

2. Implement services:

/market/marketService.ts
- searchStocks
- getStockQuote
- getHistoricalPrices
- getMarketOverview

Add fallback logic for APIs.

3. AI Layer:

/ai/geminiClient.ts
- handle API calls
- retry + timeout

/ai/researchAssistant.ts
/ai/screenerInterpreter.ts
/ai/earningsAnalyzer.ts

Use structured prompts.

--------------------------------------------------

AI PROMPTS

Research Assistant:

Return JSON:

{
 valuation_summary: "",
 growth_signals: [],
 risk_factors: [],
 overall_assessment: ""
}

Screener:

Return:

{
 filters: [
  { field, operator, value }
 ]
}

Earnings Analyzer:

Return:

{
 growth_signals: [],
 risk_signals: [],
 strategic_initiatives: [],
 management_sentiment: "",
 summary: ""
}

--------------------------------------------------

API ENDPOINTS

GET /stocks/search?q=
GET /stocks/:ticker
GET /stocks/:ticker/history
GET /market/overview

POST /ai/research
POST /ai/screener
POST /ai/earnings

POST /watchlist
GET /watchlist
DELETE /watchlist/:id

--------------------------------------------------

FRONTEND IMPLEMENTATION

Pages:

/login
/dashboard
/stocks/[ticker]
/screener
/watchlist

--------------------------------------------------

UI REQUIREMENTS

Dashboard:
- indices
- top gainers
- top losers
- trending stocks

Stock Page:
- price + chart
- fundamentals
- AI insights panel
- earnings analysis

Screener:
- natural language input
- results table

Watchlist:
- saved stocks

AI Assistant:
- chat interface

--------------------------------------------------

DATA FLOW

User → Frontend → Backend API → Services → DB/API → AI → Response → UI

--------------------------------------------------

CODE QUALITY

- Use TypeScript everywhere
- No business logic in controllers
- Use environment variables
- Add error handling
- Modular services
- Reusable components

--------------------------------------------------

PRODUCTION REQUIREMENTS

- API validation (Zod)
- Logging
- Rate limiting
- Graceful error handling
- Loading states in UI

--------------------------------------------------

FINAL GOAL

Generate a complete full-stack codebase that demonstrates:

- AI-driven stock analysis
- natural language screening
- earnings call insights

The result should look like a real startup SaaS product.

Generate backend first, then frontend.





## Angel one 



You are a senior staff engineer building a production-grade NSE stock data system using Angel One SmartAPI.

The goal is to integrate Angel One as the primary market data provider with real-time streaming.

---

CONSTRAINTS

* NSE only
* Use Angel One SmartAPI
* Use a single shared account (for now)
* Must support real-time WebSocket streaming
* Clean architecture (no business logic in controllers)

---

BACKEND STRUCTURE

/backend/src/market/broker/

angelClient.ts
angelService.ts
angelMapper.ts

/backend/src/market/realtime/

angelWsManager.ts

/backend/src/market/cache/

marketCache.ts

---

ANGEL CLIENT

angelClient.ts responsibilities:

* Handle login using:

  * API Key
  * Client ID
  * Password
  * TOTP (2FA)

* Store session tokens:

  * jwtToken
  * refreshToken
  * feedToken

* Implement:

login()
getQuote(symbolToken)
getHistorical(symbolToken)
generateSession()

* Handle token refresh automatically
* Retry on failure

---

SERVICE LAYER

angelService.ts

Functions:

getStockQuote(ticker)
getSymbolToken(ticker)
subscribeTicker(ticker)

Responsibilities:

* Convert ticker → symbolToken
* Call angelClient
* Normalize response
* Use cache

---

MAPPER

angelMapper.ts

Normalize broker response into:

{
ticker: string,
exchange: "NSE",
price: number,
change: number,
changePercent: number,
volume: number,
timestamp: number
}

---

REALTIME SYSTEM

angelWsManager.ts

Responsibilities:

* Connect to Angel WebSocket using feedToken
* Subscribe to symbol tokens
* Handle reconnect logic
* Broadcast updates to frontend

Flow:

Frontend subscribes to ticker
→ backend maps to symbolToken
→ subscribe via WebSocket
→ receive ticks
→ normalize
→ broadcast to clients

---

SYMBOL TOKEN MAPPING

* Download Angel instrument master file (JSON)
* Store locally or cache
* Map ticker → symbolToken

---

CACHE

marketCache.ts

* In-memory Map
* TTL: 5 seconds

---

API ENDPOINTS

GET /stocks/:ticker

WebSocket:

/ws → subscribe to ticker

---

IMPORTANT

* Handle login + TOTP securely
* Do not hardcode credentials
* Use environment variables
* Reconnect WebSocket on failure
* Keep modular architecture

---

GOAL

Build a stable, real-time NSE stock backend powered by Angel One SmartAPI with clean architecture and scalable design.
