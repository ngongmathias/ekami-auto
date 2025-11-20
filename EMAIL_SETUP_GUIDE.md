# 📧 Email Notifications Setup Guide

## ✅ What's Already Built

The email system is **fully implemented** and ready to use! It includes:

- ✅ Booking confirmation emails
- ✅ Payment receipt emails
- ✅ Admin notifications
- ✅ Beautiful HTML email templates
- ✅ Company branding (Ekami Auto)
- ✅ WhatsApp integration in emails

**Current Status:** Emails are logged to console (development mode)

---

## 🚀 How to Enable Real Emails (Production)

### **Option 1: Resend (Recommended - Easiest)**

**Why Resend?**
- ✅ Free tier: 3,000 emails/month
- ✅ Simple API
- ✅ Great deliverability
- ✅ Easy setup

**Setup Steps:**

1. **Sign up at** https://resend.com
2. **Get your API key** from dashboard
3. **Add to `.env`:**
   ```env
   VITE_RESEND_API_KEY=re_your_api_key_here
   ```

4. **Install Resend:**
   ```bash
   yarn add resend
   ```

5. **Update `src/lib/email.ts`** - Uncomment the Resend code (lines 42-54)

**That's it!** Emails will start sending automatically.

---

### **Option 2: SendGrid**

**Why SendGrid?**
- ✅ Free tier: 100 emails/day
- ✅ Reliable
- ✅ Good analytics

**Setup Steps:**

1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `.env`:
   ```env
   VITE_SENDGRID_API_KEY=SG.your_api_key_here
   ```

4. Install SendGrid:
   ```bash
   yarn add @sendgrid/mail
   ```

5. Update email service to use SendGrid API

---

### **Option 3: AWS SES**

**Why AWS SES?**
- ✅ Very cheap ($0.10 per 1,000 emails)
- ✅ Highly scalable
- ✅ Enterprise-grade

**Setup Steps:**

1. Set up AWS account
2. Verify your domain
3. Get AWS credentials
4. Use AWS SDK

---

## 📝 Current Email Flow

### **When a Booking is Made:**

1. Customer completes booking
2. Payment is processed
3. **Two emails sent:**
   - ✅ Booking confirmation → Customer
   - ✅ New booking alert → Admin (kerryngong@ekamiauto.com)

### **When Payment is Completed:**

1. Payment succeeds
2. **Two emails sent:**
   - ✅ Payment receipt → Customer
   - ✅ Payment confirmation → Admin

---

## 🎨 Email Templates

### **Booking Confirmation Email:**
- Beautiful gradient header (gold)
- Booking details table
- Total amount
- What's next section
- WhatsApp support button
- Company footer

### **Payment Receipt Email:**
- Green success header
- Payment details
- Receipt information
- Total amount (highlighted)
- Company footer

---

## 🔧 How to Customize Emails

Edit `src/lib/email.ts`:

**Change colors:**
```typescript
// Line 125 - Header gradient
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR 100%);
```

**Change logo:**
```typescript
// Add logo image in header
<img src="https://your-domain.com/logo.png" alt="Logo" />
```

**Change footer:**
```typescript
// Line 180 - Footer content
<p>Your Company Name</p>
<p>Your Contact Info</p>
```

---

## 📊 Email Analytics (Optional)

Track email opens and clicks:

1. **With Resend:** Built-in analytics dashboard
2. **With SendGrid:** Email activity tracking
3. **With AWS SES:** Use CloudWatch

---

## 🧪 Testing Emails

### **Test in Development:**

Emails are logged to console. Check browser console to see:
```
📧 Booking Confirmation Email: {
  to: "customer@example.com",
  subject: "Booking Confirmation - BK123",
  ...
}
```

### **Test with Real Email Service:**

1. Set up Resend (easiest)
2. Send test booking
3. Check your inbox!

---

## ✅ Production Checklist

Before going live:

- [ ] Choose email service (Resend recommended)
- [ ] Sign up and get API key
- [ ] Add API key to `.env`
- [ ] Install email service package
- [ ] Update `src/lib/email.ts` with real API calls
- [ ] Test with real email address
- [ ] Verify emails not going to spam
- [ ] Set up domain authentication (SPF/DKIM)
- [ ] Test all email types:
  - [ ] Booking confirmation
  - [ ] Payment receipt
  - [ ] Admin notifications

---

## 🎯 Quick Start (Resend - 5 Minutes)

```bash
# 1. Sign up at resend.com

# 2. Get API key from dashboard

# 3. Add to .env
echo "VITE_RESEND_API_KEY=re_your_key" >> .env

# 4. Install package
yarn add resend

# 5. Uncomment Resend code in src/lib/email.ts (lines 42-54)

# 6. Test!
```

---

## 📞 Email Addresses Used

**From:** info@ekamiauto.com (configured in `.env`)
**Admin:** kerryngong@ekamiauto.com (receives notifications)
**Reply-To:** info@ekamiauto.com

---

## 💡 Tips

1. **Start with Resend** - Easiest to set up
2. **Test thoroughly** - Send test emails before launch
3. **Monitor deliverability** - Check spam rates
4. **Use custom domain** - Better deliverability than Gmail
5. **Set up SPF/DKIM** - Prevents emails going to spam

---

## 🆘 Troubleshooting

**Emails not sending?**
- Check API key is correct
- Verify email service is active
- Check console for errors
- Ensure `from` email is verified

**Emails going to spam?**
- Set up SPF/DKIM records
- Use verified domain
- Avoid spam trigger words
- Test with mail-tester.com

---

**Ready to send emails!** 📧✨

For now, emails are logged to console. When you're ready for production, just follow the Resend setup (5 minutes)!
