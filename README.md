# Invest IQ - AI-Powered Stock Research Platform

A production-grade full-stack SaaS platform that acts as "ChatGPT for Stock Research" - combining real-time market data with AI-powered analysis for intelligent investment decisions.

## 🎯 Features

### Core Capabilities
- **Real-time Market Data**: Live stock quotes, historical prices, and market indices
- **AI Research Assistant**: Chat interface for intelligent stock analysis
- **Natural Language Screener**: Find stocks using plain English queries
- **Earnings Call Analysis**: AI-powered insights from earnings transcripts
- **Watchlist Management**: Track and monitor favorite stocks
- **Interactive Charts**: Visual price history and trends

### AI-Powered Insights
- Valuation summaries
- Growth signal identification
- Risk factor analysis
- Strategic initiative tracking
- Management sentiment analysis

## 🏗️ Architecture

```
Invest IQ/
├── backend/         # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── ai/            # Gemini AI integration
│   │   ├── market/        # Market data services
│   │   ├── db/            # Database layer
│   │   └── utils/         # Utilities
│   └── package.json
│
└── frontend/        # Next.js + React + TypeScript
    ├── app/             # Next.js App Router pages
    ├── components/      # Reusable UI components
    ├── hooks/           # React Query hooks
    ├── services/        # API service layer
    ├── types/           # TypeScript types
    └── utils/           # Helper functions
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini API
- **Market Data**: Yahoo Finance (primary), Twelve Data (fallback)
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- Google Gemini API key
- Twelve Data API key (optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key
TWELVE_DATA_API_KEY=your_twelve_data_api_key

FRONTEND_URL=http://localhost:3000
```

5. Set up database:
   - Open Supabase SQL Editor
   - Run the schema in `src/db/schema.sql`

6. Start development server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env.local
```

4. Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📡 API Endpoints

### Stocks
- `GET /api/stocks/search?q={query}` - Search stocks
- `GET /api/stocks/:ticker` - Get stock quote
- `GET /api/stocks/:ticker/details` - Get detailed info
- `GET /api/stocks/:ticker/history` - Get historical prices
- `GET /api/stocks/overview` - Get market overview

### AI Services
- `POST /api/ai/research` - AI research assistant
- `POST /api/ai/screener` - Natural language screener
- `POST /api/ai/earnings` - Earnings call analysis

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:companyId` - Remove from watchlist

## 🗄️ Database Schema

### Tables
- `users` - User accounts
- `companies` - Stock company data
- `stock_prices` - Time-series price data
- `financials` - Annual financial data
- `financial_ratios` - Key financial metrics
- `earnings_calls` - Earnings call transcripts
- `watchlists` - User watchlists
- `watchlist_items` - Watchlist contents

## 🧠 AI Integration

### Research Assistant
Analyzes stocks based on:
- Financial history
- Current valuation metrics
- Growth indicators
- Risk factors

Returns structured JSON with:
- Valuation summary
- Growth signals
- Risk factors
- Overall assessment

### Stock Screener
Converts natural language to database filters:
- "Technology companies with P/E under 20"
- "Large cap stocks with ROE above 15%"
- "Banking sector with low debt"

### Earnings Analyzer
Processes transcripts to extract:
- Growth signals
- Risk indicators
- Strategic initiatives
- Management sentiment

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Real-time data updates
- Loading states and error handling
- Interactive charts
- Search autocomplete
- Color-coded gains/losses
- Clean, modern interface

## 🔒 Security Features

- Rate limiting (general + AI-specific)
- CORS protection
- Helmet security headers
- Request validation (Zod)
- Environment variable isolation
- Error handling without stack traces

## 📊 Data Flow

```
User Input → Frontend → API Client → Backend Routes
                                         ↓
                                   Controllers
                                         ↓
                                     Services
                                    ↙    ↓    ↘
                            Database  Market  AI
                                 ↓      ↓    ↓
                              Response ← ← ← ←
                                         ↓
                                    Frontend
                                         ↓
                                    User View
```

## 🚢 Production Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
npm start
```

### Environment Variables
Ensure all production credentials are set:
- Database URLs
- API keys
- CORS origins
- Rate limiting configs

## 📝 Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with best practices
- **Prettier**: Consistent code formatting
- **Clean Architecture**: Separation of concerns
- **Error Handling**: Graceful error management
- **Logging**: Structured logging with Winston

## 🧪 Testing the Platform

1. Start both backend and frontend
2. Visit `http://localhost:3000/login`
3. Enter any email (demo mode)
4. Explore features:
   - View dashboard with market overview
   - Search for stocks (e.g., "RELIANCE", "TCS")
   - Click on a stock to see details
   - Ask AI questions about the stock
   - Use the screener with natural language
   - Add stocks to your watchlist

## 📚 Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](./backend/src/routes/)
- [Database Schema](./backend/src/db/schema.sql)

## 🤝 Contributing

This is a demonstration project showcasing production-grade architecture and best practices.

## 📄 License

MIT

## 🎓 Learning Resources

This project demonstrates:
- Full-stack TypeScript development
- Clean architecture principles
- API design and integration
- AI service integration
- Real-time data handling
- State management with React Query
- Modern UI/UX patterns
- Production-ready error handling
- Security best practices

---

Built with ❤️ as a production-grade SaaS platform demonstration
