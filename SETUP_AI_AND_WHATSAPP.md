# 🚀 Setup Guide: AI Assistant & WhatsApp Notifications

## ✅ What Was Implemented:

### **1. AI Assistant with Search** 🤖
- ✅ Connected to OpenAI API
- ✅ Smart car search capability
- ✅ Auto-redirect to filtered results
- ✅ Mock responses when API not configured

### **2. WhatsApp Notifications** 📱
- ✅ Twilio integration
- ✅ Booking notifications
- ✅ Service request notifications
- ✅ Graceful fallback if not configured

---

## 📋 Setup Instructions:

### **Part 1: OpenAI API (for AI Assistant)**

#### **Step 1: Get OpenAI API Key**
1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

#### **Step 2: Add to Environment Variables**

Add to `.env`:
```env
VITE_OPENAI_API_KEY=sk-your-key-here
```

Add to Vercel:
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add `VITE_OPENAI_API_KEY` = `sk-your-key-here`
4. Redeploy

#### **Step 3: Test AI**
1. Open your website
2. Click AI chat button
3. Try: "Show me SUVs"
4. Should redirect to search results!

**Cost:** ~$5-10/month for typical usage

---

### **Part 2: Twilio WhatsApp (for Notifications)**

#### **Step 1: Sign Up for Twilio**
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free trial includes $15 credit)
3. Verify your phone number

#### **Step 2: Get WhatsApp Sandbox**
1. In Twilio Console, go to: **Messaging → Try it out → Send a WhatsApp message**
2. You'll see instructions like:
   ```
   Send "join <code>" to +1 415 523 8886
   ```
3. Open WhatsApp on your phone
4. Send that message to activate sandbox
5. You should receive a confirmation

#### **Step 3: Get Your Credentials**
1. In Twilio Console, go to **Account → API keys & tokens**
2. Copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
3. Note the WhatsApp number (usually `+1 415 523 8886`)

#### **Step 4: Add to Environment Variables**

Add to `.env`:
```env
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Add to Vercel:
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add all three variables
4. Redeploy

#### **Step 5: Test Notifications**

**Option A: Test from Browser Console**
1. Open your website
2. Open browser console (F12)
3. Run:
```javascript
import { sendTestNotification } from './src/lib/whatsappNotifications';
sendTestNotification();
```

**Option B: Make a Test Booking**
1. Go to your website
2. Try to book a car
3. Fill in the form
4. Submit
5. Check your WhatsApp - you should receive a notification!

**Cost:** 
- Free trial: $15 credit
- After trial: ~$0.005 per message
- ~20 bookings/day = $3/month

---

## 🧪 Testing:

### **Test AI Assistant:**

Try these queries:
```
"Show me SUVs"
"I need a family car"
"Find Toyota automatic cars"
"Show me cars under 50,000 XAF"
"I want to rent a luxury car"
"Show me available cars"
```

**Expected behavior:**
1. AI responds with friendly message
2. After 1.5 seconds, redirects to search
3. Shows filtered results

---

### **Test WhatsApp Notifications:**

#### **Test 1: Booking Notification**
1. Go to `/rent`
2. Select a car
3. Click "Book Now"
4. Fill in booking form
5. Submit
6. ✅ Check WhatsApp for notification

#### **Test 2: Service Request Notification**
1. Go to `/repairs`
2. Fill in service request
3. Submit
4. ✅ Check WhatsApp for notification

---

## 🔧 Troubleshooting:

### **AI Not Working:**

**Issue:** AI gives generic responses
**Solution:** 
- Check if `VITE_OPENAI_API_KEY` is set
- Check browser console for errors
- Verify API key is valid

**Issue:** AI doesn't redirect
**Solution:**
- Check console for `[SEARCH:...]` in response
- Verify navigation is working
- Try refreshing page

---

### **WhatsApp Not Working:**

**Issue:** No notifications received
**Solution:**
1. Check if Twilio credentials are correct
2. Verify WhatsApp sandbox is active
3. Check browser console for errors
4. Verify admin phone number is correct

**Issue:** "WhatsApp not configured" in console
**Solution:**
- Add Twilio credentials to `.env`
- Restart dev server
- Redeploy to Vercel

**Issue:** Twilio API error
**Solution:**
- Check if you have credit in Twilio account
- Verify sandbox is still active
- Check if phone number format is correct

---

## 📱 WhatsApp Notification Format:

### **Booking Notification:**
```
🚗 NEW BOOKING!

Customer: John Doe
Car: Toyota Camry 2023
Dates: Dec 1-5, 2024
Pickup: Douala Airport

Contact:
📞 Phone: +237 6 XX XX XX XX
📱 WhatsApp: +237 6 XX XX XX XX

Amount: 150,000 XAF

View details: https://ekamiauto.com/admin/bookings
```

### **Service Request Notification:**
```
🔧 NEW SERVICE REQUEST!

Customer: Jane Smith
Service: Oil Change

Contact:
📧 jane@example.com
📞 +237 6 XX XX XX XX

Issue:
Engine making strange noise...

View: https://ekamiauto.com/admin/services
```

---

## 💰 Costs Summary:

### **OpenAI (AI Assistant):**
- Model: GPT-4o-mini
- Cost: ~$0.15 per 1M tokens
- Typical: ~$0.001 per conversation
- **Monthly: ~$5-10**

### **Twilio (WhatsApp):**
- Cost: $0.005 per message
- ~20 bookings/day = 600/month
- **Monthly: ~$3-5**

### **Total: ~$10-15/month**

---

## 🎯 What Happens Now:

### **When Customer Uses AI:**
1. Customer asks: "Show me SUVs"
2. AI responds: "Great choice! Let me show you..."
3. Redirects to: `/rent?category=suv`
4. Shows filtered results

### **When Customer Books:**
1. Customer submits booking
2. Data saved to database
3. **WhatsApp sent to admin** 📱
4. Email sent (if Resend configured)
5. Customer redirected to payment

### **When Customer Requests Service:**
1. Customer submits service request
2. Data saved to database
3. **WhatsApp sent to admin** 📱
4. Email sent (if Resend configured)
5. Customer sees confirmation

---

## 🚀 Next Steps:

### **For Production:**

1. **Move Twilio to Backend**
   - Create serverless function
   - Don't expose credentials in frontend
   - Use Vercel Serverless Functions or similar

2. **Add More Notifications:**
   - Purchase inquiries
   - Sell car requests
   - Contact form submissions
   - Price alerts

3. **Enhance AI:**
   - Add more search parameters
   - Show car recommendations in chat
   - Add booking capability in chat
   - Add voice input

4. **Monitor Usage:**
   - Track OpenAI costs
   - Track Twilio usage
   - Set up billing alerts

---

## 📚 Resources:

- **OpenAI Docs:** https://platform.openai.com/docs
- **Twilio WhatsApp:** https://www.twilio.com/docs/whatsapp
- **Twilio Console:** https://console.twilio.com
- **OpenAI Usage:** https://platform.openai.com/usage

---

## ✅ Checklist:

- [ ] OpenAI API key added to `.env`
- [ ] OpenAI API key added to Vercel
- [ ] Tested AI assistant
- [ ] Twilio account created
- [ ] WhatsApp sandbox activated
- [ ] Twilio credentials added to `.env`
- [ ] Twilio credentials added to Vercel
- [ ] Tested WhatsApp notifications
- [ ] Verified booking notifications work
- [ ] Verified service request notifications work
- [ ] Deployed to production
- [ ] Monitored costs

---

**Your AI assistant and WhatsApp notifications are ready! 🎉**

**Questions? Check the console logs for detailed debugging information.**
