# Angel One SmartAPI Setup Guide

## 📋 Prerequisites

1. Angel One trading account
2. API access enabled
3. Node.js 18+ installed

## 🔑 Step 1: Get Angel One Credentials

### 1.1 Create Angel One Account

1. Visit [Angel One](https://www.angelone.in/)
2. Open a trading account
3. Complete KYC verification

### 1.2 Enable SmartAPI

1. Login to [SmartAPI Portal](https://smartapi.angelbroking.com/)
2. Go to **My Apps** → **Create New App**
3. Fill in app details:
   - **App Name**: Invest IQ
   - **Redirect URL**: `http://localhost:3000` (for development)
   - **Post Back URL**: Leave blank
4. Click **Create**
5. **Save your API Key** (you'll need this)

### 1.3 Get Your Credentials

You'll need 4 pieces of information:

#### A. API Key
- From SmartAPI portal after creating app
- Format: `xxxxxxxx` (alphanumeric)

#### B. Client ID
- Your Angel One account number
- Format: `A123456` or similar
- Find in: Angel One app → Profile → Client ID

#### C. Trading Password
- Your Angel One trading password
- Same password used for trading on Angel One platform

#### D. TOTP Secret (2FA)

**IMPORTANT:** Angel One requires TOTP (Time-based One-Time Password) for API authentication.

**How to get TOTP Secret:**

1. Login to [SmartAPI Portal](https://smartapi.angelbroking.com/)
2. Go to **My Profile** → **API** section
3. Enable **TOTP Authentication**
4. You'll see a QR code
5. **IMPORTANT:** Click "Can't scan QR code?" or "Show secret key"
6. Copy the **Base32 secret key** (looks like: `JBSWY3DPEHPK3PXP`)
7. **Save this secret** - you'll use it in `.env`

**Alternative method using Google Authenticator:**
1. Scan the QR code with Google Authenticator
2. To extract the secret, use a QR code reader on the QR image
3. The secret is in the format: `otpauth://totp/Angel:ClientID?secret=YOURSECRET`
4. Extract `YOURSECRET` part

## 🔧 Step 2: Configure Backend

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `smartapi-javascript` - Angel One SDK
- `speakeasy` - TOTP generation
- `ws` - WebSocket support
- `express-ws` - WebSocket for Express

### 2.2 Update Environment Variables

Edit `backend/.env`:

```env
# Angel One SmartAPI
ANGEL_API_KEY=your_api_key_from_smartapi_portal
ANGEL_CLIENT_ID=A123456
ANGEL_PASSWORD=your_trading_password
ANGEL_TOTP_SECRET=JBSWY3DPEHPK3PXP

# Keep existing variables...
PORT=5000
SUPABASE_URL=...
GEMINI_API_KEY=...
```

**Example:**
```env
ANGEL_API_KEY=abc123xyz
ANGEL_CLIENT_ID=A123456
ANGEL_PASSWORD=MyTradingPass@123
ANGEL_TOTP_SECRET=JBSWY3DPEHPK3PXP
```

### 2.3 Test TOTP Generation

You can test if your TOTP is working:

```bash
node -e "const speakeasy = require('speakeasy'); console.log(speakeasy.totp({ secret: 'YOUR_SECRET', encoding: 'base32' }));"
```

Compare the output with your Google Authenticator app - they should match!

## 🚀 Step 3: Start Backend

```bash
cd backend
npm run dev
```

You should see:

```
Initializing Angel One market data service...
Attempting Angel One login...
Angel One login successful
Loaded 2500 NSE equity instruments
Angel One service initialized successfully
Connecting to Angel One WebSocket...
Angel One WebSocket connected
Server running on port 5000 in development mode
WebSocket endpoint: ws://localhost:5000/ws/stocks
```

## ✅ Step 4: Verify Integration

### 4.1 Check Health

```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-04-16T..."}
```

### 4.2 Test Stock Quote

```bash
curl "http://localhost:5000/api/stocks/RELIANCE"
```

Should return NSE quote data:
```json
{
  "status": "success",
  "data": {
    "ticker": "RELIANCE",
    "price": 2450.50,
    "change": 15.25,
    "changePercent": 0.63,
    ...
  }
}
```

### 4.3 Test Search

```bash
curl "http://localhost:5000/api/stocks/search?q=TCS"
```

### 4.4 Test WebSocket

Use `wscat` (install: `npm install -g wscat`):

```bash
wscat -c ws://localhost:5000/ws/stocks
```

Then send:
```json
{"action":"subscribe","ticker":"RELIANCE"}
```

You should receive real-time tick updates!

## 🐛 Troubleshooting

### Login Failed: Invalid Credentials

**Cause:** Wrong Client ID, Password, or TOTP

**Fix:**
1. Verify Client ID matches your Angel One account
2. Try logging into Angel One web/app with the same password
3. Generate a new TOTP code and compare with Google Authenticator
4. Check for trailing spaces in `.env` file

### Login Failed: TOTP Invalid

**Cause:** Incorrect TOTP secret or time sync issue

**Fix:**
1. Re-extract TOTP secret from SmartAPI portal
2. Ensure server time is synced (TOTP is time-sensitive)
3. Try generating TOTP manually: `node -e "console.log(require('speakeasy').totp({secret:'YOUR_SECRET',encoding:'base32'}))"`
4. Compare with Google Authenticator

### WebSocket Not Connecting

**Cause:** Feed token not available or Angel WebSocket service down

**Fix:**
1. Check backend logs for "Feed token not available"
2. Verify login was successful
3. Check Angel One service status
4. Restart backend to refresh session

### Symbol Not Found

**Cause:** Instrument not in NSE equity list

**Fix:**
1. Verify ticker is correct NSE symbol (e.g., "RELIANCE" not "RELIANCE.NS")
2. Check if instrument master loaded: Look for "Loaded X NSE equity instruments" in logs
3. Refresh instruments cache: Delete `instruments-cache.json` and restart

### No Real-time Data

**Cause:** Outside market hours or WebSocket disconnected

**Fix:**
1. NSE market hours: 9:15 AM - 3:30 PM IST (Mon-Fri)
2. Check WebSocket status in logs
3. Verify subscription was successful
4. Try subscribing to a different ticker

### Rate Limit Errors

**Cause:** Hitting Angel One API limits

**Fix:**
1. Reduce polling frequency
2. Use cache (already implemented)
3. Consider multiple API keys for production

## 🔐 Security Best Practices

### For Development
- ✅ Use `.env` file (never commit)
- ✅ Add `.env` to `.gitignore`
- ✅ Keep TOTP secret secure

### For Production
- ✅ Use environment variables from hosting platform
- ✅ Rotate passwords periodically
- ✅ Use different account for production
- ✅ Enable IP whitelisting in Angel portal
- ✅ Monitor login attempts
- ✅ Set up alerts for authentication failures

## 📊 Data Coverage

**What Angel One Provides:**
- ✅ NSE real-time quotes
- ✅ NSE historical data (OHLCV)
- ✅ Real-time WebSocket streaming
- ✅ ~2500 NSE equity instruments
- ✅ Market depth (if needed)

**What's NOT included:**
- ❌ BSE data (NSE only per requirements)
- ❌ Options/Futures (equity only)
- ❌ Fundamental data (revenue, earnings)
- ❌ News or sentiment data

## 🔄 Session Management

**How it works:**
1. Login on server start
2. Get JWT + Refresh + Feed tokens
3. Tokens stored in memory
4. Auto-refresh on expiry
5. WebSocket uses feed token
6. Graceful logout on shutdown

**Session lifetime:**
- JWT Token: ~24 hours
- Refresh Token: Can extend session
- Feed Token: For WebSocket auth

## 📈 Performance

**Caching:**
- Quote cache: 5 seconds TTL
- Reduces API calls
- Faster response times

**WebSocket:**
- Real-time updates (< 1 second latency)
- Multiple clients supported
- Auto-reconnect on failure

**Instrument loading:**
- Downloads ~2MB JSON file
- Caches locally
- Loads ~2500 instruments
- Refreshes daily (optional)

## 🧪 Testing

### Manual Test Script

Create `test-angel.ts`:

```typescript
import angelService from './src/market/broker/angelService';

async function test() {
  await angelService.initialize();
  
  const quote = await angelService.getStockQuote('RELIANCE');
  console.log('Quote:', quote);
  
  const results = angelService.searchStocks('TCS');
  console.log('Search:', results);
}

test();
```

Run: `npx ts-node test-angel.ts`

## 📞 Support

**Angel One Support:**
- Email: smartapisupport@angelbroking.com
- Phone: 022-39413600
- Docs: https://smartapi.angelbroking.com/docs

**Common Issues:**
- Invalid session: Re-login
- Rate limit: Reduce frequency
- Symbol not found: Check ticker format

## 🎯 Next Steps

1. ✅ Configure credentials
2. ✅ Test login
3. ✅ Verify quote fetch
4. ✅ Test WebSocket
5. ✅ Update frontend to use WebSocket
6. Add error monitoring
7. Set up logging alerts
8. Plan for production deployment

---

**Your NSE real-time data system is ready!** 🚀
