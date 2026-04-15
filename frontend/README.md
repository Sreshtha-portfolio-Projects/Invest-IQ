# Invest IQ Frontend

AI-powered stock research platform frontend built with Next.js, React, and TypeScript.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 📊 Interactive stock charts
- 🤖 AI research assistant with chat interface
- 🔍 Natural language stock screener
- 📈 Real-time market dashboard
- ⭐ Watchlist management
- 📱 Mobile-friendly design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
app/
├── dashboard/       # Market overview page
├── stocks/[ticker]/ # Stock detail page
├── screener/        # AI stock screener
├── watchlist/       # User watchlist
├── login/           # Authentication page
├── layout.tsx       # Root layout
└── providers.tsx    # React Query provider

components/
├── Navbar.tsx       # Navigation bar
├── SearchBar.tsx    # Stock search
├── StockCard.tsx    # Stock display card
├── StockChart.tsx   # Price chart
├── AIAssistant.tsx  # AI chat interface
├── Loading.tsx      # Loading state
└── ErrorMessage.tsx # Error state

hooks/
├── useStocks.ts     # Stock data hooks
├── useAI.ts         # AI service hooks
└── useWatchlist.ts  # Watchlist hooks

services/
├── apiClient.ts     # Axios instance
├── stockService.ts  # Stock API calls
├── aiService.ts     # AI API calls
└── watchlistService.ts # Watchlist API calls

types/
├── market.ts        # Market data types
├── ai.ts            # AI types
└── watchlist.ts     # Watchlist types

utils/
├── formatters.ts    # Currency & number formatting
└── dateUtils.ts     # Date formatting
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Pages

### Dashboard (`/dashboard`)
- Market indices (NIFTY, SENSEX)
- Top gainers and losers
- Trending stocks
- Stock search

### Stock Detail (`/stocks/[ticker]`)
- Real-time quote and price chart
- Financial metrics and ratios
- AI research assistant
- Earnings call analysis
- Add to watchlist

### Screener (`/screener`)
- Natural language query input
- AI-powered filter interpretation
- Results table with sorting

### Watchlist (`/watchlist`)
- Saved stocks
- Quick access to details
- Remove stocks

### Login (`/login`)
- Demo authentication
- Entry point to app

## Components

### SearchBar
Autocomplete search with dropdown results

### StockChart
Interactive line chart showing price history

### AIAssistant
Chat interface for asking questions about stocks with structured AI responses

### StockCard
Compact display of stock with price and change

## State Management

Uses React Query for:
- Caching API responses
- Automatic refetching
- Loading and error states
- Optimistic updates

## Styling

Tailwind CSS with custom configuration:
- Primary blue color scheme
- Success/danger colors for gains/losses
- Responsive breakpoints
- Custom component classes

## License

MIT
