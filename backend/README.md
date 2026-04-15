# Invest IQ Backend

AI-powered stock research platform backend built with Node.js, Express, and TypeScript.

## Features

- 🔍 Stock search and real-time quotes
- 📊 Historical price data
- 🤖 AI-powered research assistant
- 🎯 Natural language stock screener
- 📈 Earnings call analysis
- ⭐ Watchlist management
- 🔒 Rate limiting and security

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini API
- **Market Data**: Yahoo Finance, Twelve Data

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Express middleware
├── ai/              # AI service layer
├── market/          # Market data integration
├── db/              # Database layer
├── utils/           # Utilities
└── types/           # TypeScript types
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
- Supabase URL and keys
- Gemini API key
- Twelve Data API key

4. Set up database:
- Run the SQL schema in `src/db/schema.sql` in your Supabase SQL editor

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## API Endpoints

### Stocks
- `GET /api/stocks/search?q={query}` - Search stocks
- `GET /api/stocks/:ticker` - Get stock quote
- `GET /api/stocks/:ticker/details` - Get detailed stock info
- `GET /api/stocks/:ticker/history` - Get historical prices
- `GET /api/market/overview` - Get market overview

### AI
- `POST /api/ai/research` - AI research assistant
- `POST /api/ai/screener` - Natural language screener
- `POST /api/ai/earnings` - Earnings call analysis

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:companyId` - Remove from watchlist

## License

MIT
