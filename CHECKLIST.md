# Setup Verification Checklist

Use this checklist to verify your Invest IQ installation is working correctly.

## 📋 Pre-Installation Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created
- [ ] Google Gemini API key obtained
- [ ] (Optional) Twelve Data API key obtained

## 🔧 Backend Setup Checklist

### Installation
- [ ] Navigated to `backend` directory
- [ ] Ran `npm install` successfully
- [ ] No installation errors

### Configuration
- [ ] Copied `.env.example` to `.env`
- [ ] Added `SUPABASE_URL`
- [ ] Added `SUPABASE_ANON_KEY`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added `GEMINI_API_KEY`
- [ ] Added `TWELVE_DATA_API_KEY` (or left empty)
- [ ] Verified `PORT` is set (default: 5000)

### Database
- [ ] Opened Supabase SQL Editor
- [ ] Copied content from `src/db/schema.sql`
- [ ] Executed SQL successfully
- [ ] Verified tables created (companies, stock_prices, etc.)
- [ ] Checked sample data inserted (RELIANCE, TCS, etc.)

### Start Backend
- [ ] Ran `npm run dev`
- [ ] Server started without errors
- [ ] Saw "Server running on port 5000" message
- [ ] Verified health endpoint: `http://localhost:5000/health`
  - [ ] Returns `{"status":"ok","timestamp":"..."}`

### Test Backend Endpoints
- [ ] Stock search works: `http://localhost:5000/api/stocks/search?q=TCS`
- [ ] Returns array of search results
- [ ] No CORS errors in browser console

## 💻 Frontend Setup Checklist

### Installation
- [ ] Navigated to `frontend` directory
- [ ] Ran `npm install` successfully
- [ ] No installation errors

### Configuration
- [ ] Copied `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

### Start Frontend
- [ ] Ran `npm run dev`
- [ ] Server started without errors
- [ ] Saw "Ready on http://localhost:3000" message
- [ ] No compilation errors

## 🧪 Feature Testing Checklist

### Login Page
- [ ] Visit `http://localhost:3000`
- [ ] Redirects to `/login`
- [ ] Login page loads correctly
- [ ] Can enter email
- [ ] Click "Get Started" works
- [ ] Redirects to `/dashboard`

### Dashboard Page
- [ ] Dashboard loads successfully
- [ ] See market indices (NIFTY 50, SENSEX)
- [ ] See top gainers section
- [ ] See top losers section
- [ ] See trending stocks section
- [ ] Numbers are displayed correctly
- [ ] No loading errors

### Search Functionality
- [ ] Click on search bar
- [ ] Type "RELIANCE"
- [ ] See autocomplete dropdown
- [ ] Results appear within 1-2 seconds
- [ ] Click on a result
- [ ] Redirects to stock detail page

### Stock Detail Page
- [ ] Page loads for selected stock
- [ ] Company name displays
- [ ] Current price shows
- [ ] Price change (+ or -) displays
- [ ] Chart loads (if historical data available)
- [ ] "Open", "High", "Low", "Volume" cards show data
- [ ] Financial ratios section displays
- [ ] Recent financials section displays

### AI Research Tab
- [ ] Click "AI Research" tab
- [ ] See AI assistant interface
- [ ] Type a question: "What are the growth prospects?"
- [ ] Click send or press Enter
- [ ] Loading indicator appears
- [ ] Response loads within 10-30 seconds
- [ ] See structured response with:
  - [ ] Valuation summary
  - [ ] Growth signals (bullet points)
  - [ ] Risk factors (bullet points)
  - [ ] Overall assessment

### Earnings Analysis Tab
- [ ] Click "Earnings Analysis" tab
- [ ] See "Analyze Earnings Call" button
- [ ] Click button
- [ ] Loading indicator appears
- [ ] Analysis appears (or error if no data)
- [ ] If successful, see:
  - [ ] Quarter information
  - [ ] Summary text
  - [ ] Growth signals
  - [ ] Risk signals
  - [ ] Strategic initiatives
  - [ ] Management sentiment badge

### Watchlist Feature
- [ ] From stock detail page, click star icon
- [ ] See confirmation or success message
- [ ] Navigate to Watchlist page
- [ ] See added stock in watchlist
- [ ] Stock card shows correct information
- [ ] Click "View Details" goes to stock page
- [ ] Click trash icon removes stock
- [ ] Confirm removal works

### Screener Page
- [ ] Navigate to Screener page
- [ ] Page loads correctly
- [ ] See input box for natural language query
- [ ] See example queries
- [ ] Click an example - populates input
- [ ] Type custom query: "Technology companies with P/E under 20"
- [ ] Click "Screen Stocks"
- [ ] Loading state appears
- [ ] Results load within 10-30 seconds
- [ ] See applied filters section
- [ ] See results table with:
  - [ ] Company names
  - [ ] Sectors
  - [ ] Market caps
  - [ ] P/E ratios
  - [ ] ROE values
- [ ] Click ticker link goes to stock detail

### Navigation
- [ ] Click "Dashboard" in navbar - goes to dashboard
- [ ] Click "Screener" in navbar - goes to screener
- [ ] Click "Watchlist" in navbar - goes to watchlist
- [ ] Click "Invest IQ" logo - goes to dashboard
- [ ] All navigation transitions work smoothly

### Responsive Design
- [ ] Resize browser window
- [ ] UI adjusts properly on smaller screens
- [ ] Mobile menu works (if applicable)
- [ ] Cards stack vertically on mobile
- [ ] No horizontal scroll on mobile

## 🐛 Troubleshooting Checklist

### Backend Issues
- [ ] Port 5000 is not in use by another app
- [ ] All environment variables are set correctly
- [ ] Supabase credentials are valid
- [ ] Database schema was executed
- [ ] Gemini API key is valid and active
- [ ] Check backend console for errors

### Frontend Issues
- [ ] Backend is running before starting frontend
- [ ] API URL in `.env.local` is correct
- [ ] No CORS errors in browser console
- [ ] React Query is configured properly
- [ ] Check browser console for errors

### API Connection Issues
- [ ] Backend and frontend are both running
- [ ] Ports are correct (backend: 5000, frontend: 3000)
- [ ] Firewall is not blocking connections
- [ ] CORS is configured for `http://localhost:3000`

### Database Issues
- [ ] Supabase project is active
- [ ] Database schema executed successfully
- [ ] Sample data is present in companies table
- [ ] Connection strings are correct

### AI Issues
- [ ] Gemini API key is valid
- [ ] Not hitting rate limits
- [ ] Responses are within timeout period
- [ ] Check backend logs for AI errors

## ✅ Success Criteria

All of the following should work:
- ✅ Backend health check returns 200
- ✅ Frontend loads without errors
- ✅ Login and navigation work
- ✅ Dashboard shows market data
- ✅ Search finds stocks
- ✅ Stock detail page loads with data
- ✅ Charts display correctly
- ✅ AI chat responds to questions
- ✅ Screener processes queries
- ✅ Watchlist add/remove works
- ✅ No console errors

## 🎯 Quick Verification Script

Run these commands to verify everything:

### Backend Health
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Stock Search
```bash
curl "http://localhost:5000/api/stocks/search?q=TCS"
# Should return: {"status":"success","data":[...]}
```

### Frontend
```bash
# Just open browser to http://localhost:3000
# Should redirect to login page
```

## 📞 Get Help

If any checks fail:
1. Review `SETUP.md` for detailed instructions
2. Check backend console for error messages
3. Check browser console for frontend errors
4. Verify all environment variables
5. Ensure database schema is correct
6. Test API endpoints individually

## 🎉 Ready to Use!

Once all checks pass:
- ✅ Your installation is complete
- ✅ All features are working
- ✅ Ready to explore and develop
- ✅ Can start customizing

Enjoy Invest IQ! 🚀
