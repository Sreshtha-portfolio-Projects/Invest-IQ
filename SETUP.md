# Quick Setup Guide - Invest IQ

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL or Supabase account
- [ ] Google Gemini API key
- [ ] (Optional) Twelve Data API key

## Step 1: Backend Setup (5 minutes)

### 1.1 Install Dependencies
```bash
cd backend
npm install
```

### 1.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
PORT=5000
NODE_ENV=development

# Get from Supabase Dashboard > Settings > API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Get from Google AI Studio: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSy...

# Get from Twelve Data: https://twelvedata.com/apikey
TWELVE_DATA_API_KEY=your_key_here

FRONTEND_URL=http://localhost:3000
```

### 1.3 Setup Database

**Option A: Using Supabase (Recommended)**
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Go to SQL Editor
4. Copy and paste content from `backend/src/db/schema.sql`
5. Click "Run"

**Option B: Local PostgreSQL**
```bash
psql -U postgres -d your_database < backend/src/db/schema.sql
```

### 1.4 Start Backend
```bash
npm run dev
```

✅ Backend should be running on `http://localhost:5000`

Test: Visit `http://localhost:5000/health` - should return `{"status":"ok"}`

## Step 2: Frontend Setup (3 minutes)

### 2.1 Install Dependencies
```bash
cd frontend
npm install
```

### 2.2 Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2.3 Start Frontend
```bash
npm run dev
```

✅ Frontend should be running on `http://localhost:3000`

## Step 3: Test the Application

### 3.1 Access the App
1. Open browser to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter any email (demo mode)
4. Click "Get Started"

### 3.2 Test Features

**Dashboard**
- Should see market indices (NIFTY 50, SENSEX)
- Top gainers, losers, and trending stocks
- Search bar at the top

**Stock Search**
- Try searching: "RELIANCE", "TCS", "INFY"
- Click on a result to view details

**Stock Detail Page**
- View real-time quote
- See price chart
- Check financial metrics
- Try AI Research tab
  - Ask: "What are the growth prospects?"
  - Ask: "Should I invest in this stock?"
- Try Earnings Analysis tab
  - Click "Analyze Earnings Call"

**Screener**
- Go to Screener page
- Try: "Technology companies with P/E under 20"
- Try: "Large cap stocks with ROE above 15%"

**Watchlist**
- Add stocks from detail pages (star icon)
- View your watchlist
- Remove stocks

## Troubleshooting

### Backend not starting?
- Check if port 5000 is free: `netstat -ano | findstr :5000` (Windows) or `lsof -i :5000` (Mac/Linux)
- Verify all environment variables are set
- Check Supabase connection: test credentials in Supabase dashboard

### Frontend not loading data?
- Check if backend is running
- Verify API URL in `.env.local`
- Open browser console for errors
- Check Network tab for failed requests

### Database errors?
- Verify schema was executed successfully
- Check Supabase dashboard > Table Editor
- Should see tables: users, companies, stock_prices, etc.

### API rate limits?
- Yahoo Finance: No key needed, but rate limited
- Twelve Data: Free tier has limits
- Gemini: Check your quota at https://makersuite.google.com/

## Common Issues

**"Gemini API key is missing"**
- Add GEMINI_API_KEY to backend/.env
- Restart backend server

**"Unable to connect to database"**
- Check SUPABASE_URL and keys in backend/.env
- Verify project is active in Supabase dashboard

**"No stocks found"**
- Run the INSERT statements from schema.sql
- Check if companies table has data

**"AI features not working"**
- Verify Gemini API key is valid
- Check backend logs for errors
- Try simpler queries first

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Environment Variables
Set these in your hosting platform:
- All variables from `.env.example`
- Use production database URL
- Update FRONTEND_URL to production domain
- Use production CORS settings

## API Keys - Where to Get Them

1. **Supabase** (Free tier available)
   - Visit: https://supabase.com
   - Create account → New project
   - Get keys from Settings → API

2. **Google Gemini** (Free tier: 60 requests/minute)
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key
   - Copy and use

3. **Twelve Data** (Optional, free tier: 800 requests/day)
   - Visit: https://twelvedata.com/pricing
   - Sign up for free tier
   - Get API key from dashboard

## Next Steps

- Add authentication (currently demo mode)
- Implement user accounts
- Add more Indian stocks to database
- Connect real-time WebSocket for live prices
- Add technical indicators
- Implement portfolio tracking
- Add alerts and notifications

## Support

If you encounter issues:
1. Check the logs in backend console
2. Check browser console for frontend errors
3. Verify all environment variables
4. Ensure database schema is correct
5. Test API endpoints with Postman/curl

## Architecture Summary

```
User Browser
    ↓
Next.js Frontend (Port 3000)
    ↓
Express Backend (Port 5000)
    ↓
├── Supabase (PostgreSQL)
├── Yahoo Finance API
├── Twelve Data API (fallback)
└── Google Gemini AI
```

Enjoy exploring Invest IQ! 🚀
