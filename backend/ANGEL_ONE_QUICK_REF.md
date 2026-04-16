# Angel One SmartAPI - Quick Reference

## 🔑 Environment Variables

```env
ANGEL_API_KEY=abc123xyz
ANGEL_CLIENT_ID=A123456
ANGEL_PASSWORD=YourTradingPassword
ANGEL_TOTP_SECRET=JBSWY3DPEHPK3PXP
```

## 🚀 Start Backend

```bash
cd backend
npm install  # First time only
npm run dev
```

## 📡 Test Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Get Stock Quote (NSE)
```bash
curl http://localhost:5000/api/stocks/RELIANCE
curl http://localhost:5000/api/stocks/TCS
curl http://localhost:5000/api/stocks/INFY
```

### Search Stocks
```bash
curl "http://localhost:5000/api/stocks/search?q=BANK"
```

### Get Historical Data
```bash
curl "http://localhost:5000/api/stocks/RELIANCE/history"
```

## 🔌 WebSocket Connection

### Using wscat
```bash
npm install -g wscat
wscat -c ws://localhost:5000/ws/stocks
```

### Subscribe to ticker
```json
{"action":"subscribe","ticker":"RELIANCE"}
```

### Unsubscribe
```json
{"action":"unsubscribe","ticker":"RELIANCE"}
```

## 📝 Common NSE Tickers

### Indices
- `NIFTY` - NIFTY 50
- `BANKNIFTY` - BANK NIFTY
- `FINNIFTY` - FIN NIFTY

### Top Stocks
- `RELIANCE` - Reliance Industries
- `TCS` - Tata Consultancy Services
- `INFY` - Infosys
- `HDFCBANK` - HDFC Bank
- `ICICIBANK` - ICICI Bank
- `HINDUNILVR` - Hindustan Unilever
- `ITC` - ITC Limited
- `BHARTIARTL` - Bharti Airtel
- `SBIN` - State Bank of India
- `WIPRO` - Wipro

### Sectors
- **IT**: TCS, INFY, WIPRO, HCLTECH, TECHM
- **Banking**: HDFCBANK, ICICIBANK, SBIN, KOTAKBANK, AXISBANK
- **Energy**: RELIANCE, ONGC, BPCL, IOC, GAIL
- **Auto**: MARUTI, TATAMOTORS, M&M, BAJAJ-AUTO, HEROMOTOCO
- **Pharma**: SUNPHARMA, DRREDDY, CIPLA, DIVISLAB, BIOCON

## 🔧 Troubleshooting Commands

### Check if backend is running
```bash
curl http://localhost:5000/health
```

### Test TOTP generation
```bash
node -e "const s=require('speakeasy'); console.log(s.totp({secret:'YOUR_SECRET',encoding:'base32'}))"
```

### Check logs
```bash
# Backend logs show in console
# Or check: backend/logs/combined.log
```

### Verify environment variables loaded
```bash
node -e "require('dotenv').config(); console.log(process.env.ANGEL_CLIENT_ID)"
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Login failed | Check credentials in `.env` |
| Invalid TOTP | Verify TOTP secret, check server time sync |
| Symbol not found | Use NSE ticker format (no `.NS` suffix) |
| WebSocket won't connect | Verify feed token, check Angel service status |
| No real-time data | Check market hours (9:15 AM - 3:30 PM IST) |
| Rate limit error | Reduce request frequency, use cache |

## 📊 Data Format

### Quote Response
```json
{
  "status": "success",
  "data": {
    "ticker": "RELIANCE",
    "name": "RELIANCE",
    "price": 2450.50,
    "change": 15.25,
    "changePercent": 0.63,
    "volume": 4567890,
    "open": 2440.00,
    "high": 2455.00,
    "low": 2438.50,
    "close": 2435.25,
    "previousClose": 2435.25,
    "marketCap": 0
  }
}
```

### WebSocket Tick
```json
{
  "type": "tick",
  "ticker": "RELIANCE",
  "data": {
    "ticker": "RELIANCE",
    "exchange": "NSE",
    "price": 2450.75,
    "change": 15.50,
    "changePercent": 0.64,
    "open": 2440.00,
    "high": 2455.00,
    "low": 2438.50,
    "close": 2435.25,
    "volume": 4568000,
    "timestamp": 1713283200000
  }
}
```

## 🎯 Market Hours

**NSE Trading Hours (IST):**
- Pre-open: 9:00 AM - 9:15 AM
- Normal: 9:15 AM - 3:30 PM
- Post-close: 3:40 PM - 4:00 PM

**Real-time data available:** 9:15 AM - 3:30 PM IST (Mon-Fri, excluding holidays)

## 🔄 Session Lifecycle

1. **Startup** → Login with TOTP
2. **Active** → Session valid for ~24 hours
3. **Expiry Hook** → Auto re-login
4. **Shutdown** → Graceful logout

## 📈 Performance

**Caching:**
- Quote cache: 5 seconds
- Reduces API load
- Faster responses

**WebSocket:**
- Sub-second latency
- No polling overhead
- Efficient bandwidth

**Instruments:**
- Loaded once on startup
- ~2500 NSE equities
- Fast in-memory lookup

## 🛡️ Security

✅ Never commit `.env` file
✅ Use strong trading password
✅ Rotate TOTP secret periodically
✅ Monitor for unauthorized access
✅ Use IP whitelist in production

## 📞 Get Help

**Angel One Support:**
- Email: smartapisupport@angelbroking.com
- Phone: 022-39413600
- Portal: https://smartapi.angelbroking.com

**Documentation:**
- Setup Guide: `ANGEL_ONE_SETUP.md`
- Integration Docs: `ANGEL_ONE_INTEGRATION.md`
- Complete Summary: `ANGEL_ONE_COMPLETE.md`

## ✨ Quick Start

```bash
# 1. Get Angel One credentials
# 2. Update backend/.env
# 3. Install dependencies
cd backend && npm install

# 4. Start server
npm run dev

# 5. Test in another terminal
curl http://localhost:5000/api/stocks/RELIANCE

# 6. Test WebSocket
wscat -c ws://localhost:5000/ws/stocks
> {"action":"subscribe","ticker":"RELIANCE"}
```

---

**Your NSE real-time data system is ready!** 📈🚀
