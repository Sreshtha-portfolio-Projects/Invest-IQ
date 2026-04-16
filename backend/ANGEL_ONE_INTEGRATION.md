# Angel One SmartAPI Integration

This backend now uses **Angel One SmartAPI** as the primary market data provider for NSE real-time stock data.

## 🏗️ Architecture

```
/backend/src/market/
├── broker/
│   ├── angelClient.ts       # Low-level Angel One API client
│   ├── angelService.ts      # Business logic layer
│   └── angelMapper.ts       # Response normalization
├── realtime/
│   └── angelWsManager.ts    # WebSocket streaming manager
├── cache/
│   └── marketCache.ts       # In-memory cache with TTL
└── marketService.ts         # Unified market data interface
```

## 🔑 Setup

### 1. Get Angel One Credentials

1. Open an account at [Angel One](https://www.angelone.in/)
2. Login to [SmartAPI Portal](https://smartapi.angelbroking.com/)
3. Create an app and get your:
   - **API Key**
   - **Client ID** (your Angel One account number)
   - **Password** (your trading password)
   - **TOTP Secret** (for 2FA)

### 2. Enable TOTP (2FA)

Angel One requires TOTP for authentication. Generate your TOTP secret:

```bash
# Install QR code reader if needed
npm install -g qrcode-terminal

# In your app settings, enable TOTP and scan the QR code
# Get the secret key (base32 format) from the QR code
```

### 3. Configure Environment Variables

Add these to `backend/.env`:

```env
# Angel One SmartAPI
ANGEL_API_KEY=your_api_key_here
ANGEL_CLIENT_ID=your_client_id_here
ANGEL_PASSWORD=your_trading_password_here
ANGEL_TOTP_SECRET=your_totp_secret_here
```

## 📡 Features

### REST API

**Get Stock Quote** (NSE only)
```bash
GET /api/stocks/RELIANCE
```

**Search Stocks**
```bash
GET /api/stocks/search?q=TCS
```

**Get Historical Data**
```bash
GET /api/stocks/INFY/history?startDate=2024-01-01&endDate=2024-12-31
```

### WebSocket (Real-time)

Connect to `ws://localhost:5000/ws/stocks`

**Subscribe to ticker:**
```json
{
  "action": "subscribe",
  "ticker": "RELIANCE"
}
```

**Receive real-time updates:**
```json
{
  "type": "tick",
  "ticker": "RELIANCE",
  "data": {
    "ticker": "RELIANCE",
    "exchange": "NSE",
    "price": 2450.50,
    "change": 15.25,
    "changePercent": 0.63,
    "open": 2440.00,
    "high": 2455.00,
    "low": 2438.50,
    "close": 2435.25,
    "volume": 4567890,
    "timestamp": 1704364800000
  }
}
```

**Unsubscribe:**
```json
{
  "action": "unsubscribe",
  "ticker": "RELIANCE"
}
```

## 🔄 Authentication Flow

1. **Login** - Uses Client ID + Password + TOTP
2. **Session Tokens** - Stores JWT, Refresh Token, Feed Token
3. **Auto-Refresh** - Automatically refreshes expired sessions
4. **Feed Token** - Used for WebSocket authentication

## 📦 Symbol Token Mapping

Angel One uses symbol tokens instead of tickers. The service:

1. Downloads instrument master file on startup
2. Caches locally (`instruments-cache.json`)
3. Maps ticker ↔ symbolToken
4. Only NSE equity instruments are loaded

**Refresh instruments:**
```typescript
import angelService from './market/broker/angelService';
await angelService.refreshInstruments();
```

## 🔌 WebSocket Manager

**Features:**
- Auto-reconnect with exponential backoff
- Heartbeat to keep connection alive
- Subscription management
- Broadcast to multiple clients

**Connection states:**
- `CONNECTING` - Establishing connection
- `OPEN` - Connected and ready
- `CLOSED` - Disconnected, will attempt reconnect

## 💾 Caching Strategy

**Market Cache (`marketCache.ts`)**
- In-memory Map with TTL
- Default TTL: 5 seconds
- Auto-cleanup every 60 seconds

**Quote Cache:**
```typescript
marketCache.set('quote:RELIANCE', data, 5000); // 5 sec TTL
const cached = marketCache.get('quote:RELIANCE');
```

## 📊 Data Normalization

All Angel One responses are normalized to a standard format:

```typescript
interface NormalizedQuote {
  ticker: string;
  exchange: 'NSE';
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}
```

## 🔐 Security

- ✅ Never hardcode credentials
- ✅ Use environment variables
- ✅ TOTP stored securely
- ✅ Session tokens in memory only
- ✅ Auto-logout on app termination

## 🐛 Debugging

**Enable debug logs:**
```typescript
// In logger.ts, set level to 'debug'
level: 'debug'
```

**Check Angel connection:**
```bash
curl http://localhost:5000/health
```

**Check WebSocket subscriptions:**
```bash
wscat -c ws://localhost:5000/ws/stocks
```

## ⚠️ Limitations

1. **NSE Only** - Only NSE equity instruments
2. **Shared Account** - Single Angel One account for all users
3. **Rate Limits** - Subject to Angel One API limits
4. **Market Hours** - Real-time data during market hours only

## 🚀 Production Checklist

- [ ] Use strong password for Angel account
- [ ] Rotate TOTP secret periodically
- [ ] Monitor API rate limits
- [ ] Set up logging and monitoring
- [ ] Implement circuit breaker for failures
- [ ] Use multiple accounts for load distribution
- [ ] Set up alerts for session failures

## 📚 Resources

- [Angel One SmartAPI Docs](https://smartapi.angelbroking.com/docs)
- [SmartAPI Node.js SDK](https://github.com/angel-one/smartapi-javascript)
- [WebSocket Specification](https://smartapi.angelbroking.com/docs/WebSocket)

## 🔧 Troubleshooting

**Login fails:**
- Check credentials in `.env`
- Verify TOTP secret is correct
- Ensure 2FA is enabled in Angel account

**WebSocket not connecting:**
- Verify feed token is available
- Check Angel WebSocket service status
- Review firewall/proxy settings

**Symbol not found:**
- Refresh instruments: `angelService.refreshInstruments()`
- Verify ticker is NSE equity
- Check instrument master file

**No real-time data:**
- Ensure market hours (9:15 AM - 3:30 PM IST)
- Check WebSocket connection status
- Verify subscription was successful

---

**Built with ❤️ for NSE real-time stock data**
