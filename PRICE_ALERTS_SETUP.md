# 🔔 Price Drop Alerts - Setup Guide

## Overview
Price Drop Alerts allow users to subscribe to notifications when car prices decrease. Users can set different alert types and receive email notifications.

---

## 🎯 Features

### **For Users:**
- ✅ Subscribe to price alerts without login (email only)
- ✅ Three alert types:
  - **Any Drop** - Notify on any price decrease
  - **Target Price** - Notify when price reaches target
  - **Percentage Drop** - Notify when price drops by X%
- ✅ Email notifications with car details
- ✅ Unsubscribe anytime

### **For Admins:**
- ✅ View all active alerts
- ✅ See alert statistics
- ✅ Manually trigger alerts
- ✅ Track notification history

---

## 📦 What's Included

### **1. Database Tables**
- `price_alerts` - User subscriptions
- `price_alert_history` - Notification tracking

### **2. UI Components**
- `PriceAlertModal` - Subscription form
- Bell button on car detail pages
- Admin alert management (coming next)

### **3. Functions**
- `check_price_alerts()` - SQL function to find triggered alerts
- Auto-update timestamps
- Price change detection

---

## 🚀 Setup Instructions

### **Step 1: Run Database Migration**

1. Go to **Supabase Dashboard** → SQL Editor
2. Run: `supabase/migrations/20240125_create_price_alerts.sql`
3. Verify tables created:
   - `price_alerts`
   - `price_alert_history`

### **Step 2: Set Up Email Service (Resend.com)**

1. **Sign up** at https://resend.com (Free: 3,000 emails/month)
2. **Get API Key:**
   - Dashboard → API Keys
   - Create new key
   - Copy the key

3. **Add to Environment Variables:**
```env
# Add to .env file
VITE_RESEND_API_KEY=re_your_api_key_here
```

4. **Add to Vercel:**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_RESEND_API_KEY`
   - Value: Your Resend API key
   - Redeploy

### **Step 3: Configure Email Domain (Optional)**

For production emails from your domain:
1. Resend Dashboard → Domains
2. Add `ekamiauto.com`
3. Add DNS records (they'll provide them)
4. Verify domain

For now, you can use Resend's test domain: `onboarding@resend.dev`

---

## 🧪 Testing

### **Test Alert Creation:**

1. Go to any car detail page
2. Click the **Bell icon** (🔔)
3. Fill in the form:
   - Name: Test User
   - Email: your-email@example.com
   - Alert Type: Any Drop
4. Click "Create Alert"
5. Check Supabase → `price_alerts` table

### **Test in Supabase:**

```sql
-- View all alerts
SELECT * FROM price_alerts ORDER BY created_at DESC;

-- Check specific car's alerts
SELECT 
  pa.*,
  c.make,
  c.model,
  c.car_number
FROM price_alerts pa
JOIN cars c ON c.id = pa.car_id
WHERE c.car_number = 'EK-001';

-- Test alert trigger function
SELECT * FROM check_price_alerts(
  'your-car-id-here'::uuid,
  50000::decimal,  -- old price
  45000::decimal   -- new price
);
```

---

## 📧 Email Notifications

### **When Alerts Trigger:**

Emails are sent when:
1. Admin changes car price in admin panel
2. Price decreases from previous value
3. Alert conditions are met:
   - Any drop: Any decrease
   - Target price: New price ≤ target
   - Percentage: Drop ≥ threshold

### **Email Content:**
- Car details (make, model, year)
- Old price vs New price
- Price drop amount
- Percentage saved
- Link to car page
- Unsubscribe link

---

## 🎨 Admin Features (Next Step)

Coming in admin dashboard:
- View all active alerts
- Alert statistics
- Manually trigger notifications
- View notification history
- Disable/enable alerts

---

## 🔧 Troubleshooting

### **Alert not created:**
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies

### **No email received:**
- Verify Resend API key
- Check email service logs
- Confirm email address is valid
- Check spam folder

### **Alerts not triggering:**
- Price must actually decrease
- Alert must be active (`is_active = true`)
- Check alert type conditions

---

## 💡 Usage Tips

### **For Users:**
- Set realistic target prices
- Use percentage drops for flexibility
- One alert per car per email
- Unsubscribe if no longer interested

### **For Admins:**
- Monitor alert statistics
- Don't spam users with frequent changes
- Test with your own email first
- Keep price history for transparency

---

## 📊 Database Schema

### **price_alerts Table:**
```sql
- id: UUID (primary key)
- car_id: UUID (foreign key to cars)
- user_email: TEXT
- user_name: TEXT
- target_price: DECIMAL (optional)
- current_price: DECIMAL
- alert_type: TEXT (any_drop, target_price, percentage_drop)
- percentage_threshold: INTEGER
- is_active: BOOLEAN
- notified_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **price_alert_history Table:**
```sql
- id: UUID (primary key)
- alert_id: UUID (foreign key)
- car_id: UUID (foreign key)
- old_price: DECIMAL
- new_price: DECIMAL
- price_difference: DECIMAL
- percentage_change: DECIMAL
- notification_sent: BOOLEAN
- notification_error: TEXT
- created_at: TIMESTAMP
```

---

## 🚀 Next Steps

1. ✅ Database & UI - DONE
2. ⏳ Email service integration - IN PROGRESS
3. ⏳ Admin management interface
4. ⏳ Price change detection
5. ⏳ Testing & deployment

---

**Need help?** Check the code comments or ask for assistance! 🎯
