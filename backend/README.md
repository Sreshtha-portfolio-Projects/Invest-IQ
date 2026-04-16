# Invest IQ Backend

AI-powered stock research platform backend built with Node.js, Express, and TypeScript.

**Now powered by Angel One SmartAPI for real-time NSE data! 🚀**

## Features

- 🔍 Real-time NSE stock quotes via Angel One SmartAPI
- 📊 Historical price data (OHLCV)
- 🔴 **NEW**: WebSocket streaming for live market data
- 🤖 AI-powered research assistant (Gemini)
- 🎯 Natural language stock screener
- 📈 Earnings call analysis
- ⭐ Watchlist management
- 🔒 Rate limiting and security

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express + express-ws (WebSocket)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase)
- **Market Data**: Angel One SmartAPI (NSE real-time) ⭐ NEW
- **AI**: Google Gemini API
- **Cache**: In-memory with TTL

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Express middleware
├── ai/              # AI service layer (Gemini)
├── market/          # Market data integration ⭐ ENHANCED
│   ├── broker/      # Angel One client, service, mapper
│   ├── realtime/    # WebSocket streaming manager
│   └── cache/       # Market data cache
├── db/              # Database layer (Supabase)
├── utils/           # Utilities
└── types/           # TypeScript types
```

## Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Configure environment variables:
```bash
cp .env.example .env
```

### 3. Update `.env` with your credentials:

**Angel One SmartAPI (Required for NSE data):**
```env
ANGEL_API_KEY=your_api_key
ANGEL_CLIENT_ID=your_client_id  
ANGEL_PASSWORD=your_trading_password
ANGEL_TOTP_SECRET=your_totp_secret
```

**Other Services:**
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
```

See `ANGEL_ONE_SETUP.md` for detailed Angel One setup instructions.

### 4. Set up database:
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

### Stocks (Angel One NSE Data)
- `GET /api/stocks/search?q={query}` - Search NSE stocks
- `GET /api/stocks/:ticker` - Get real-time NSE quote
- `GET /api/stocks/:ticker/details` - Get detailed stock info
- `GET /api/stocks/:ticker/history` - Get historical OHLCV data
- `GET /api/stocks/overview` - Get market overview

### WebSocket (Real-time Streaming) ⭐ NEW
- `ws://localhost:5000/ws/stocks` - Real-time NSE stock data
  - Subscribe: `{"action":"subscribe","ticker":"RELIANCE"}`
  - Unsubscribe: `{"action":"unsubscribe","ticker":"RELIANCE"}`
  - Receive: Real-time tick updates

### AI
- `POST /api/ai/research` - AI research assistant
- `POST /api/ai/screener` - Natural language screener
- `POST /api/ai/earnings` - Earnings call analysis

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:companyId` - Remove from watchlist

## 📚 Documentation

- `ANGEL_ONE_SETUP.md` - Detailed setup guide for Angel One
- `ANGEL_ONE_INTEGRATION.md` - Technical integration details
- `ANGEL_ONE_COMPLETE.md` - Complete summary
- `ANGEL_ONE_QUICK_REF.md` - Quick reference guide

## 🔥 What's New with Angel One

✅ **Real-time NSE data** - Live quotes from official source
✅ **WebSocket streaming** - Sub-second latency for price updates
✅ **Symbol token mapping** - Automatic ticker → token conversion
✅ **Session management** - Auto-refresh with TOTP
✅ **Clean architecture** - Modular broker layer
✅ **Fallback & retry** - Robust error handling
✅ **NSE-focused** - ~2500 NSE equity instruments

## License

MIT
