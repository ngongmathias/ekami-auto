# 🤖 AI Chatbot Setup Guide

## ✅ What's Been Built

Your Ekami Auto website now has a **smart AI chatbot** powered by OpenAI GPT-4! Here's what it includes:

### **Features:**
- ✅ Floating chat widget (bottom right corner)
- ✅ Smart AI assistant that knows about your business
- ✅ 24/7 customer support
- ✅ Conversation history saved in database
- ✅ Works for both logged-in users and guests
- ✅ Admin dashboard to view all chat logs
- ✅ Beautiful, responsive UI
- ✅ Dark mode support
- ✅ WhatsApp handoff for complex questions

---

## 🔧 Setup Steps

### **Step 1: Get OpenAI API Key** (5 minutes)

1. Go to https://platform.openai.com
2. Sign up or sign in
3. Click on your profile (top right) → "View API keys"
4. Click "Create new secret key"
5. Give it a name: "Ekami Auto Chatbot"
6. Copy the key (starts with `sk-...`)
7. **IMPORTANT:** Save it somewhere safe - you can't see it again!

**Cost:**
- New accounts get $5 free credit
- After that: ~$0.002 per conversation (very cheap!)
- Example: 1000 conversations = ~$2

---

### **Step 2: Add API Key to Environment Variables**

#### **For Local Development:**

1. Open your `.env` file
2. Add this line:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file
4. Restart your dev server (`npm run dev`)

#### **For Production (Vercel):**

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Click "Add New"
5. Enter:
   - **Key:** `VITE_OPENAI_API_KEY`
   - **Value:** `sk-your-actual-key-here`
   - **Environment:** Select all (Production, Preview, Development)
6. Click "Save"
7. **Redeploy your site** (Deployments tab → ... → Redeploy)

---

### **Step 3: Run Database Migration**

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL from: `supabase/migrations/20240123_create_chat_system.sql`
6. Click **Run** (or press F5)
7. You should see "Success. No rows returned"

✅ **Done!** Your database is ready for chat conversations.

---

## 🧪 Testing the Chatbot

### **Test on Localhost:**

1. Make sure your dev server is running (`npm run dev`)
2. Open http://localhost:5173
3. Look for the **gold chat button** in the bottom right corner
4. Click it to open the chat
5. Try asking:
   - "What cars do you have available?"
   - "How much does it cost to rent a car?"
   - "Tell me about your services"
   - "I want to buy a car"

### **Expected Behavior:**

- ✅ Chat widget opens smoothly
- ✅ Welcome message appears
- ✅ AI responds within 2-3 seconds
- ✅ Conversation is saved (refresh page, chat history persists)
- ✅ Works for both guests and logged-in users

---

## 👨‍💼 Admin Features

### **View Chat Logs:**

1. Go to `/admin` (must be logged in as admin)
2. Click the **"Chat Logs"** tab
3. You'll see:
   - All conversations
   - User names and emails
   - Message counts
   - Conversation status
   - Ratings (if provided)
   - Search and filter options

### **View Conversation Details:**

1. Click **"View"** on any conversation
2. See the full chat history
3. Read customer feedback (if provided)
4. Check ratings

---

## 🎨 Customization

### **Change AI Personality:**

Edit `src/lib/openai.ts` and modify the `CHATBOT_SYSTEM_PROMPT`:

```typescript
export const CHATBOT_SYSTEM_PROMPT = `You are Ekami Auto's helpful AI assistant...`;
```

You can:
- Change the tone (more formal, more casual, etc.)
- Add more business information
- Adjust response length
- Add specific guidelines

### **Change Chat Widget Colors:**

Edit `src/components/chat/ChatWidget.tsx`:

- Button color: `bg-gradient-to-br from-ekami-gold-500 to-ekami-gold-600`
- Header color: `bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600`
- User message color: `bg-ekami-gold-500`

---

## 💰 Cost Management

### **Monitor Usage:**

1. Go to https://platform.openai.com/usage
2. View your API usage
3. Set spending limits if needed

### **Estimated Costs:**

- **Light usage** (10 chats/day): ~$0.60/month
- **Medium usage** (50 chats/day): ~$3/month
- **Heavy usage** (200 chats/day): ~$12/month

**Very affordable for the value it provides!**

### **Cost Optimization:**

The chatbot uses `gpt-4o-mini` which is:
- 60% cheaper than GPT-4
- Still very smart and capable
- Perfect for customer support

---

## 🔧 Troubleshooting

### **Issue: Chat button doesn't appear**

**Fix:**
- Check browser console for errors
- Make sure `VITE_OPENAI_API_KEY` is set
- Restart dev server

### **Issue: "OpenAI API Key is missing" error**

**Fix:**
- Add `VITE_OPENAI_API_KEY` to `.env` file
- For production: Add to Vercel environment variables
- Redeploy after adding

### **Issue: AI doesn't respond**

**Fix:**
- Check OpenAI API key is valid
- Check you have credits remaining (https://platform.openai.com/usage)
- Check browser console for errors
- Verify database migration ran successfully

### **Issue: Conversations not saving**

**Fix:**
- Run the database migration
- Check Supabase project is not paused
- Verify RLS policies are set up correctly

### **Issue: Admin can't see chat logs**

**Fix:**
- Make sure you're logged in with admin email:
  - kerryngong@ekamiauto.com
  - mathiasngongngai@gmail.com
- Check database migration ran successfully

---

## 📊 What the AI Knows

The chatbot is trained to help with:

### **Services:**
- Car rentals (pricing, availability, process)
- Car sales (new and used)
- Car repairs and maintenance
- Sell your car service

### **Company Info:**
- Location: Douala, Cameroon
- Contact: info@ekamiauto.com
- WhatsApp: +237 6 52 76 52 81
- Manager: kerryngong@ekamiauto.com

### **What It Can Do:**
- Answer general questions
- Guide booking process
- Provide pricing information
- Explain services
- Transfer to human support when needed

### **What It Can't Do:**
- Make actual bookings (directs to website)
- Access real-time car availability
- Process payments
- Provide specific car details (directs to website)

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] OpenAI API key added to Vercel
- [ ] Database migration run on production Supabase
- [ ] Tested chat widget locally
- [ ] Verified AI responses are appropriate
- [ ] Checked admin chat logs work
- [ ] Set up usage alerts on OpenAI dashboard
- [ ] Tested on mobile devices
- [ ] Verified dark mode works

---

## 🎉 You're Done!

Your AI chatbot is ready to help customers 24/7!

### **Next Steps:**

1. ✅ Get OpenAI API key
2. ✅ Add to environment variables
3. ✅ Run database migration
4. ✅ Test locally
5. ✅ Deploy to production
6. ✅ Monitor usage and feedback

### **Benefits:**

- 🤖 24/7 customer support
- ⚡ Instant responses
- 💰 Reduces support workload
- 📈 Increases customer engagement
- 🎯 Captures leads even when you're offline

---

## 📞 Need Help?

If you encounter any issues:

1. Check this guide first
2. Check browser console for errors
3. Verify all environment variables are set
4. Make sure database migration ran successfully
5. Check OpenAI dashboard for API issues

---

**Enjoy your new AI assistant! 🎉**
