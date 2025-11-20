# 📧 Resend Email Setup - Step by Step

## ✅ You've Created Your Resend Account!

Now let's get it working in 5 minutes!

---

## Step 1: Get Your API Key (2 minutes)

1. **Go to** https://resend.com/api-keys
2. **Click** "Create API Key"
3. **Name it:** "Ekami Auto Production"
4. **Copy** the API key (starts with `re_`)
   - ⚠️ **IMPORTANT:** Save it now! You can't see it again!

---

## Step 2: Add API Key to `.env` (30 seconds)

Open your `.env` file and add:

```env
# Resend Email Service
VITE_RESEND_API_KEY=re_your_api_key_here
```

**Replace** `re_your_api_key_here` with your actual API key!

---

## Step 3: Install Resend Package (1 minute)

Run this command in your terminal:

```bash
yarn add resend
```

Or if you use npm:

```bash
npm install resend
```

---

## Step 4: Update Email Service (Already Done!)

The code is ready! Just need to uncomment a few lines.

Open `src/lib/email.ts` and find line ~42. The Resend code is there, just commented out.

**OR** I can do it for you right now! Just say "yes" and I'll update it.

---

## Step 5: Verify Your Domain (Optional but Recommended)

For better deliverability:

1. **Go to** https://resend.com/domains
2. **Click** "Add Domain"
3. **Enter:** ekamiauto.com (or your domain)
4. **Add DNS records** they provide
5. **Wait** for verification (usually 5-10 minutes)

**Without domain verification:**
- ✅ Emails work
- ❌ Might go to spam
- ❌ Shows "via resend.dev"

**With domain verification:**
- ✅ Emails work perfectly
- ✅ Better deliverability
- ✅ Shows your domain

---

## 🧪 Test It!

After setup, test by:

1. **Make a booking** on your site
2. **Complete payment**
3. **Check your email** - You should receive:
   - Booking confirmation
   - Payment receipt

**Admin (kerryngong@ekamiauto.com) will also receive:**
- New booking notification

---

## 📊 Monitor Emails

**Resend Dashboard** shows:
- ✅ Emails sent
- ✅ Delivery status
- ✅ Open rates
- ✅ Click rates
- ✅ Bounces/complaints

Go to: https://resend.com/emails

---

## 💰 Pricing

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for starting!

**When you need more:**
- $20/month for 50,000 emails
- $80/month for 100,000 emails

---

## ✅ Quick Checklist

- [ ] Created Resend account
- [ ] Got API key
- [ ] Added to `.env` file
- [ ] Installed `resend` package
- [ ] Updated `src/lib/email.ts` (I can do this)
- [ ] Tested with a booking
- [ ] (Optional) Verified domain

---

## 🆘 Troubleshooting

**"API key invalid"**
- Check you copied the full key
- Make sure it starts with `re_`
- No extra spaces

**"Emails not sending"**
- Check console for errors
- Verify API key in `.env`
- Restart dev server after adding key

**"Emails going to spam"**
- Verify your domain
- Add SPF/DKIM records
- Use a custom domain email

---

## 🎯 Ready to Enable Emails?

Just tell me and I'll:
1. ✅ Update the email service code
2. ✅ Enable Resend integration
3. ✅ Test it for you

**What's your Resend API key?** (starts with `re_`)

I'll add it to your `.env` and enable everything!
