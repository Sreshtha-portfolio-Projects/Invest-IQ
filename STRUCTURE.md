# Project Structure Overview

## Complete Directory Tree

```
Invest IQ/
│
├── README.md                     # Main project documentation
├── SETUP.md                      # Quick setup guide
│
├── backend/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/          # Request handlers (thin layer)
│   │   │   ├── stockController.ts      # Stock endpoints
│   │   │   ├── aiController.ts         # AI endpoints
│   │   │   └── watchlistController.ts  # Watchlist endpoints
│   │   │
│   │   ├── services/             # Business logic (currently empty, logic in other layers)
│   │   │
│   │   ├── routes/               # API route definitions
│   │   │   ├── index.ts               # Route aggregator
│   │   │   ├── stockRoutes.ts         # Stock routes
│   │   │   ├── aiRoutes.ts            # AI routes
│   │   │   └── watchlistRoutes.ts     # Watchlist routes
│   │   │
│   │   ├── middleware/           # Express middleware
│   │   │   ├── errorHandler.ts        # Global error handling
│   │   │   ├── validation.ts          # Zod schema validation
│   │   │   ├── rateLimiter.ts         # Rate limiting configs
│   │   │   └── auth.ts                # Auth middleware
│   │   │
│   │   ├── ai/                   # AI service layer
│   │   │   ├── geminiClient.ts        # Gemini API client with retry
│   │   │   ├── researchAssistant.ts   # Stock research AI
│   │   │   ├── screenerInterpreter.ts # NL to filters
│   │   │   └── earningsAnalyzer.ts    # Earnings analysis
│   │   │
│   │   ├── market/               # Market data integration
│   │   │   └── marketService.ts       # Yahoo + Twelve Data with caching
│   │   │
│   │   ├── db/                   # Database layer
│   │   │   ├── supabase.ts            # Supabase client
│   │   │   ├── databaseService.ts     # DB operations
│   │   │   └── schema.sql             # PostgreSQL schema
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── config.ts              # Environment config
│   │   │   ├── logger.ts              # Winston logger
│   │   │   ├── errors.ts              # Custom error classes
│   │   │   └── asyncHandler.ts        # Async wrapper
│   │   │
│   │   ├── types/                # TypeScript types
│   │   │   ├── database.types.ts      # DB types
│   │   │   ├── market.types.ts        # Market data types
│   │   │   └── ai.types.ts            # AI types
│   │   │
│   │   └── index.ts              # Express app entry point
│   │
│   ├── logs/                     # Log files (auto-generated)
│   ├── .env.example              # Environment template
│   ├── .gitignore
│   ├── .eslintrc.json            # ESLint config
│   ├── .prettierrc               # Prettier config
│   ├── tsconfig.json             # TypeScript config (strict)
│   ├── nodemon.json              # Nodemon config
│   ├── package.json              # Dependencies
│   └── README.md                 # Backend docs
│
└── frontend/                     # Next.js Frontend
    ├── app/                      # Next.js App Router
    │   ├── dashboard/
    │   │   └── page.tsx               # Market overview page
    │   ├── stocks/
    │   │   └── [ticker]/
    │   │       └── page.tsx           # Dynamic stock detail page
    │   ├── screener/
    │   │   └── page.tsx               # AI stock screener
    │   ├── watchlist/
    │   │   └── page.tsx               # User watchlist
    │   ├── login/
    │   │   └── page.tsx               # Auth page (demo)
    │   ├── layout.tsx                 # Root layout
    │   ├── page.tsx                   # Home redirect
    │   ├── providers.tsx              # React Query provider
    │   └── globals.css                # Global styles
    │
    ├── components/               # Reusable components
    │   ├── Navbar.tsx                 # Navigation bar
    │   ├── SearchBar.tsx              # Stock search with autocomplete
    │   ├── StockCard.tsx              # Stock display card
    │   ├── StockChart.tsx             # Price chart (Recharts)
    │   ├── AIAssistant.tsx            # AI chat interface
    │   ├── Loading.tsx                # Loading spinner
    │   └── ErrorMessage.tsx           # Error display
    │
    ├── hooks/                    # React Query hooks
    │   ├── useStocks.ts               # Stock data hooks
    │   ├── useAI.ts                   # AI mutation hooks
    │   └── useWatchlist.ts            # Watchlist hooks
    │
    ├── services/                 # API service layer
    │   ├── apiClient.ts               # Axios instance + interceptors
    │   ├── stockService.ts            # Stock API calls
    │   ├── aiService.ts               # AI API calls
    │   └── watchlistService.ts        # Watchlist API calls
    │
    ├── types/                    # TypeScript types
    │   ├── market.ts                  # Market data types
    │   ├── ai.ts                      # AI types
    │   └── watchlist.ts               # Watchlist types
    │
    ├── utils/                    # Helper functions
    │   ├── formatters.ts              # Currency/number formatting
    │   └── dateUtils.ts               # Date formatting
    │
    ├── .env.example              # Environment template
    ├── .gitignore
    ├── .eslintrc.json            # ESLint config
    ├── .prettierrc               # Prettier config
    ├── tsconfig.json             # TypeScript config (strict)
    ├── next.config.ts            # Next.js config
    ├── tailwind.config.js        # Tailwind config
    ├── postcss.config.js         # PostCSS config
    ├── package.json              # Dependencies
    └── README.md                 # Frontend docs
```

## Key Architecture Decisions

### Backend

1. **Clean Architecture**
   - Controllers: Thin layer, only handle HTTP
   - Services: Business logic (AI, Market)
   - DB Layer: Database operations only
   - No business logic in controllers

2. **Error Handling**
   - Custom error classes
   - Global error handler
   - Operational vs programmer errors
   - No stack traces in production

3. **Validation**
   - Zod schemas in middleware
   - Input validation before controllers
   - Type-safe request parsing

4. **AI Integration**
   - Retry logic with exponential backoff
   - Timeout handling
   - Structured JSON responses
   - Fallback responses

5. **Market Data**
   - Primary: Yahoo Finance
   - Fallback: Twelve Data
   - In-memory caching (5 min TTL)
   - Rate limit protection

### Frontend

1. **App Router**
   - Next.js 15 App Router
   - Server components where possible
   - Client components for interactivity

2. **State Management**
   - React Query for server state
   - Local state for UI
   - Automatic caching & refetching

3. **API Layer**
   - Centralized Axios client
   - Request interceptors for auth
   - Service layer abstraction

4. **Component Structure**
   - Reusable components
   - Composition over inheritance
   - Props for customization

5. **Styling**
   - Tailwind utility classes
   - Custom component classes
   - Responsive breakpoints

## Data Flow Examples

### Stock Search Flow
```
User types in SearchBar
  → useStockSearch hook (debounced)
    → stockService.searchStocks()
      → API: GET /api/stocks/search?q=query
        → Backend: stockController.searchStocks
          → marketService.searchStocks
            → Try Yahoo Finance
            → Fallback to Twelve Data
          → Return results
        → Frontend: Display in dropdown
```

### AI Research Flow
```
User asks question in AIAssistant
  → useResearchStock mutation
    → aiService.researchStock()
      → API: POST /api/ai/research
        → Backend: aiController.researchStock
          → Fetch company data from DB
          → Fetch financials from DB
          → Build context prompt
          → geminiClient.generateStructuredContent()
            → Call Gemini API
            → Retry on failure
            → Parse JSON response
          → Return structured analysis
        → Frontend: Display in chat
```

### Watchlist Flow
```
User clicks star icon
  → useAddToWatchlist mutation
    → watchlistService.addToWatchlist()
      → API: POST /api/watchlist
        → Backend: watchlistController.addToWatchlist
          → Get/create user watchlist
          → Add company to watchlist_items
          → Return success
        → Frontend: Invalidate watchlist cache
          → Auto-refetch watchlist
```

## Tech Stack Rationale

### Why These Technologies?

**Backend:**
- **Express**: Battle-tested, simple, middleware ecosystem
- **TypeScript**: Type safety, better DX, fewer runtime errors
- **Supabase**: Managed PostgreSQL, real-time, easy setup
- **Gemini**: Multimodal, structured output, generous free tier
- **Winston**: Production-grade logging

**Frontend:**
- **Next.js**: SSR, routing, optimization, great DX
- **React Query**: Server state, caching, auto-refetch
- **Tailwind**: Rapid UI development, consistent design
- **Recharts**: React-native charts, simple API
- **Axios**: Interceptors, better API than fetch

## Scalability Considerations

1. **Caching Strategy**
   - Backend: In-memory cache (can swap to Redis)
   - Frontend: React Query cache
   - Database: Indexed queries

2. **Rate Limiting**
   - Per-IP rate limits
   - Higher limits for AI endpoints
   - Prevents abuse

3. **Database Optimization**
   - Indexes on frequently queried fields
   - Time-series optimization for prices
   - Foreign keys for referential integrity

4. **API Efficiency**
   - Fallback providers
   - Parallel requests where possible
   - Minimal data transfer

5. **Error Recovery**
   - Graceful degradation
   - Retry logic
   - User-friendly error messages

## Security Measures

1. **Environment Variables**
   - Never commit secrets
   - .env.example templates
   - Different configs per environment

2. **CORS**
   - Configured allowed origins
   - Credentials support

3. **Rate Limiting**
   - Prevents DoS
   - Different limits per endpoint

4. **Input Validation**
   - Zod schemas
   - Type checking
   - SQL injection prevention

5. **Error Handling**
   - No sensitive info in errors
   - Logging for debugging
   - User-friendly messages

## Future Enhancements

1. **Authentication**
   - Real user accounts
   - JWT tokens
   - OAuth integration

2. **Real-time Updates**
   - WebSocket for live prices
   - Push notifications
   - Real-time watchlist changes

3. **Advanced Features**
   - Portfolio tracking
   - Price alerts
   - Technical indicators
   - Comparison tools

4. **Performance**
   - Redis caching
   - CDN for static assets
   - Database read replicas
   - API response compression

5. **Monitoring**
   - Application metrics
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics

## Development Best Practices

1. **Code Quality**
   - Strict TypeScript
   - ESLint + Prettier
   - Consistent naming
   - Clear comments

2. **Git Workflow**
   - Feature branches
   - Meaningful commits
   - Pull requests
   - Code reviews

3. **Testing Strategy**
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests for critical flows
   - Manual testing checklist

4. **Documentation**
   - README files
   - Inline comments
   - API documentation
   - Setup guides

5. **Deployment**
   - Environment configs
   - Build scripts
   - Health checks
   - Rollback strategy

---

This project demonstrates production-grade full-stack development with clean architecture, best practices, and scalable patterns.
