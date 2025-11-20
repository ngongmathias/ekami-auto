# 📧 Email System - Testing Guide

## ✅ Setup Complete!

Your Resend email system is now fully configured and ready to use!

**What's Configured:**
- ✅ Resend package installed
- ✅ API key added to `.env`
- ✅ Email templates created
- ✅ Integration code ready

---

## 🧪 How to Test Emails

### **Test 1: Booking Confirmation Email**

1. **Go to your site**: http://localhost:8080
2. **Browse cars**: Click "Rent" in navigation
3. **Select a car**: Click on any car
4. **Book it**: Click "Book Now"
5. **Fill booking form**: Enter your details
6. **Complete payment**: Use test card or MoMo
7. **Check your email!** 📧

**You should receive:**
- ✅ Booking confirmation email (beautiful HTML)
- ✅ Payment receipt email

**Admin will receive:**
- ✅ New booking notification at kerryngong@ekamiauto.com

---

### **Test 2: Contact Form Email**

1. **Go to**: http://localhost:8080/contact
2. **Fill the form**: Enter your details and message
3. **Click "Send Message"**
4. **Check console**: You'll see the email being sent

---

## 📊 Monitor Emails in Resend

**Dashboard**: https://resend.com/emails

You can see:
- ✅ All emails sent
- ✅ Delivery status
- ✅ Open rates
- ✅ Click rates
- ✅ Any errors

---

## 🎨 Email Templates

### **Booking Confirmation:**
- Gold gradient header
- Booking details table
- Total amount highlighted
- WhatsApp support button
- Company footer

### **Payment Receipt:**
- Green success header
- Payment details
- Receipt number
- Total amount (large)
- Professional design

---

## 🔧 Customization

### **Change "From" Email:**

Edit `src/lib/resend-email.ts` line 9:

```typescript
const FROM_EMAIL = 'Ekami Auto <onboarding@resend.dev>';
```

**To use your own domain:**
1. Verify domain in Resend
2. Change to: `'Ekami Auto <info@ekamiauto.com>'`

### **Change Email Colors:**

Edit the HTML templates in `src/lib/resend-email.ts`:
- Line ~125: Header gradient color
- Line ~200: Button colors
- Line ~250: Total amount color

---

## 📝 Email Flow

### **When Customer Books:**

1. Customer completes booking ✅
2. Payment processed ✅
3. **Emails sent:**
   - Booking confirmation → Customer
   - Admin notification → kerryngong@ekamiauto.com

### **When Payment Completes:**

1. Payment succeeds ✅
2. **Emails sent:**
   - Payment receipt → Customer
   - Payment confirmation → Admin

---

## 🎯 Production Checklist

Before going live:

- [x] Resend account created
- [x] API key added to `.env`
- [x] Package installed
- [x] Templates tested
- [ ] Domain verified (optional but recommended)
- [ ] Test with real email
- [ ] Check spam folder
- [ ] Verify deliverability

---

## 💡 Tips

1. **Test with your own email** first
2. **Check spam folder** if emails don't arrive
3. **Verify domain** for better deliverability
4. **Monitor Resend dashboard** for issues
5. **Keep API key secret** - never commit to Git

---

## 🆘 Troubleshooting

**Emails not sending?**
- Check console for errors
- Verify API key is correct in `.env`
- Restart dev server
- Check Resend dashboard for errors

**Emails going to spam?**
- Verify your domain in Resend
- Add SPF/DKIM records
- Use custom domain email

**"Invalid API key" error?**
- Double-check the key in `.env`
- Make sure no extra spaces
- Key should start with `re_`

---

## 🎉 You're All Set!

Your email system is production-ready!

**Next steps:**
1. Test with a real booking
2. Check your inbox
3. Monitor Resend dashboard
4. (Optional) Verify domain for better deliverability

**Enjoy your automated email system!** 📧✨
