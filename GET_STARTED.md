# 🚀 Get Started with Angel One - Action Items

## ✅ What's Done

Your backend is fully integrated with Angel One SmartAPI:

- ✅ Angel One client, service, mapper built
- ✅ WebSocket manager implemented
- ✅ Market cache with TTL
- ✅ Symbol token mapping
- ✅ Session management with TOTP
- ✅ REST & WebSocket endpoints
- ✅ TypeScript compilation passes
- ✅ Clean architecture maintained
- ✅ Comprehensive documentation

## 🎯 What You Need to Do

### Step 1: Get Angel One Credentials (Required)

**You need 4 values:**

1. **API Key**
   - Go to: https://smartapi.angelbroking.com/
   - Login → My Apps → Create New App
   - Copy the API Key

2. **Client ID**
   - Your Angel One account number (e.g., A123456)
   - Find in: Angel One app → Profile

3. **Trading Password**
   - Your Angel One trading password

4. **TOTP Secret**
   - SmartAPI Portal → Profile → Enable TOTP
   - Click "Show secret key" or "Can't scan QR?"
   - Copy the Base32 secret (e.g., JBSWY3DPEHPK3PXP)

**Time estimate:** 10-15 minutes

**See detailed guide:** `backend/ANGEL_ONE_SETUP.md`

### Step 2: Configure Backend

Edit `backend/.env`:

```env
# Add these 4 lines:
ANGEL_API_KEY=your_api_key_here
ANGEL_CLIENT_ID=your_client_id_here
ANGEL_PASSWORD=your_trading_password_here
ANGEL_TOTP_SECRET=your_totp_secret_here
```

**Time estimate:** 2 minutes

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `smartapi-javascript` - Angel One SDK
- `speakeasy` - TOTP generation
- `ws` - WebSocket support
- `express-ws` - WebSocket for Express

**Time estimate:** 1-2 minutes

### Step 4: Start Backend

```bash
npm run dev
```

You should see:
```
✓ Initializing Angel One market data service...
✓ Attempting Angel One login...
✓ Angel One login successful
✓ Loaded 2500 NSE equity instruments
✓ Connecting to Angel One WebSocket...
✓ Angel One WebSocket connected
✓ Server running on port 5000
✓ WebSocket endpoint: ws://localhost:5000/ws/stocks
```

**Time estimate:** 30 seconds

### Step 5: Test It

Open a new terminal:

```bash
# Test quote
curl http://localhost:5000/api/stocks/RELIANCE

# Test search
curl "http://localhost:5000/api/stocks/search?q=TCS"

# Test WebSocket (install wscat first: npm install -g wscat)
wscat -c ws://localhost:5000/ws/stocks
> {"action":"subscribe","ticker":"RELIANCE"}
```

**Time estimate:** 2-3 minutes

## 📋 Quick Checklist

- [ ] Open Angel One account
- [ ] Create SmartAPI app
- [ ] Get API Key
- [ ] Get Client ID
- [ ] Get Trading Password
- [ ] Enable TOTP, get secret
- [ ] Update `backend/.env`
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test endpoints
- [ ] Test WebSocket

**Total time:** 20-30 minutes

## 🆘 If You Get Stuck

### Login fails?
→ Read: `backend/ANGEL_ONE_SETUP.md` → Troubleshooting section
→ Test TOTP: `node -e "console.log(require('speakeasy').totp({secret:'YOUR_SECRET',encoding:'base32'}))"`

### WebSocket won't connect?
→ Check if login succeeded (look for "login successful" in logs)
→ Verify feed token available
→ Check Angel service status

### Symbol not found?
→ Use NSE ticker format: "RELIANCE" (not "RELIANCE.NS")
→ Check if instruments loaded (should see "Loaded X instruments")

### Need help?
→ Check: `backend/ANGEL_ONE_QUICK_REF.md` (common issues)
→ Review: `backend/ANGEL_ONE_INTEGRATION.md` (technical details)

## 📚 Documentation Map

1. **Start here** → `ANGEL_ONE_SETUP.md` (step-by-step setup)
2. **Quick lookup** → `ANGEL_ONE_QUICK_REF.md` (commands, tickers, troubleshooting)
3. **Technical deep-dive** → `ANGEL_ONE_INTEGRATION.md` (architecture, features)
4. **Overview** → `ANGEL_ONE_COMPLETE.md` (what was built)
5. **Summary** → `ANGEL_ONE_SUMMARY.md` (this file)

## 🎯 Expected Results

After setup, your backend will:

✅ Fetch real-time NSE stock quotes
✅ Stream live price updates via WebSocket
✅ Download & cache ~2500 NSE instruments
✅ Auto-refresh sessions when expired
✅ Handle errors gracefully
✅ Reconnect WebSocket automatically

## 🔒 Security Reminder

- ✅ Never commit `.env` file
- ✅ `.env` is in `.gitignore`
- ✅ Keep TOTP secret secure
- ✅ Use strong trading password
- ✅ Monitor for unauthorized access

## 🚀 Next Steps (After Setup)

Once backend is running:

1. **Update frontend** (if needed)
   - Add WebSocket client
   - Subscribe to real-time tickers
   - Handle tick updates

2. **Test thoroughly**
   - Different NSE tickers
   - Historical data
   - Search functionality
   - WebSocket subscriptions

3. **Monitor logs**
   - Watch for errors
   - Check session refresh
   - Verify instrument loading

4. **Production prep**
   - Set up monitoring
   - Add logging alerts
   - Plan for multiple accounts
   - Consider Redis cache

## ✨ You're Almost There!

**What's required:** Just Angel One credentials
**Time needed:** 20-30 minutes total
**Difficulty:** Easy (detailed guide provided)

**Once configured, you'll have:**
- Real-time NSE stock data
- WebSocket streaming
- Production-grade backend
- Clean architecture

---

**Start with Step 1 above and you'll be running in minutes!** 🎉

Questions? Check `backend/ANGEL_ONE_SETUP.md` for detailed instructions.
