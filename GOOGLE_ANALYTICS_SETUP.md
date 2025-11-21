# 📊 Google Analytics 4 Setup Guide

## 🎯 What's Already Done

✅ Google Analytics 4 tracking code added to `index.html`  
✅ Custom analytics hooks created (`useAnalytics`)  
✅ Automatic page view tracking enabled  
✅ Event tracking functions ready to use  

---

## 🚀 Quick Setup (5 minutes)

### **Step 1: Create Google Analytics 4 Property**

1. Go to https://analytics.google.com
2. Click **Admin** (bottom left)
3. Click **Create Property**
4. Enter property details:
   - **Property name:** Ekami Auto
   - **Time zone:** Africa/Douala (GMT+1)
   - **Currency:** XAF (CFA Franc)
5. Click **Next** → **Create**

### **Step 2: Get Your Measurement ID**

1. In Admin → Property → **Data Streams**
2. Click **Add stream** → **Web**
3. Enter:
   - **Website URL:** https://ekamiauto.com
   - **Stream name:** Ekami Auto Website
4. Click **Create stream**
5. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`)

### **Step 3: Update Your Code**

1. Open `index.html`
2. Replace `G-XXXXXXXXXX` with your actual Measurement ID (2 places):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID-HERE"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-YOUR-ID-HERE');
   </script>
   ```

3. Commit and push:
   ```bash
   git add index.html
   git commit -m "Add Google Analytics measurement ID"
   git push
   ```

### **Step 4: Verify It's Working**

1. Go to Google Analytics → **Reports** → **Realtime**
2. Visit your website
3. You should see yourself in the realtime report! 🎉

---

## 📊 What's Being Tracked

### **Automatic Tracking:**
- ✅ Page views (every page navigation)
- ✅ Page titles
- ✅ URL paths

### **Custom Events Available:**

#### **Car Interactions:**
- `view_item` - When user views a car
- `begin_checkout` - When user starts booking
- `purchase` - When booking is completed
- `generate_lead` - When purchase inquiry is submitted

#### **User Actions:**
- `search` - Search queries
- `filter_applied` - Filter usage
- `add_to_compare` - Cars added to comparison
- `contact_whatsapp` - WhatsApp button clicks
- `contact_phone` - Phone button clicks

#### **Content:**
- `view_blog_post` - Blog post views
- `submit_comment` - Comment submissions

#### **Settings:**
- `currency_change` - Currency selector usage

---

## 🎯 Using Analytics in Your Code

### **Example 1: Track Car View**
```typescript
import { useAnalytics } from '../hooks/useAnalytics';

function CarDetailPage() {
  const { trackCarView } = useAnalytics();
  
  useEffect(() => {
    trackCarView(car.id, car.name, car.price);
  }, [car]);
}
```

### **Example 2: Track Button Click**
```typescript
const { trackWhatsAppClick } = useAnalytics();

<button onClick={() => {
  trackWhatsAppClick(car.id, car.name);
  // ... rest of your code
}}>
  Contact on WhatsApp
</button>
```

### **Example 3: Track Custom Event**
```typescript
const { trackEvent } = useAnalytics();

trackEvent('custom_event_name', {
  category: 'engagement',
  label: 'feature_used',
  value: 123
});
```

---

## 📈 Key Reports to Monitor

### **1. Realtime Report**
- See current visitors
- Track live conversions
- Monitor popular pages

### **2. Acquisition Report**
- Where users come from
- Traffic sources
- Campaign performance

### **3. Engagement Report**
- Most viewed pages
- Most viewed cars
- User journey flow

### **4. Monetization Report**
- Booking conversions
- Purchase inquiries
- Revenue tracking

### **5. User Report**
- Demographics
- Technology (devices, browsers)
- Location data

---

## 🎯 Recommended Custom Reports

### **Car Performance Report:**
- Which cars get the most views?
- Which cars get booked most?
- Conversion rate by car type

### **Booking Funnel:**
1. Car view
2. Booking started
3. Payment page
4. Booking completed

### **User Journey:**
- Entry pages
- Navigation paths
- Exit pages

---

## 🔒 Privacy & GDPR

### **What We Track:**
- ✅ Anonymous usage data
- ✅ Page views and clicks
- ✅ Device and browser info
- ✅ Geographic location (city level)

### **What We DON'T Track:**
- ❌ Personal information
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Payment details

### **User Privacy:**
- IP addresses are anonymized
- No personally identifiable information
- Compliant with GDPR
- Users can opt-out via browser settings

---

## 🚨 Troubleshooting

### **Not seeing data?**
1. Check Measurement ID is correct
2. Wait 24-48 hours for full data
3. Check Realtime report for immediate data
4. Verify site is deployed and live

### **Events not tracking?**
1. Check browser console for errors
2. Verify `window.gtag` is defined
3. Test in incognito mode
4. Check ad blockers are disabled

### **Multiple properties?**
- Use different Measurement IDs for:
  - Development: `G-DEV-ID`
  - Production: `G-PROD-ID`

---

## 📞 Need Help?

- Google Analytics Help: https://support.google.com/analytics
- GA4 Documentation: https://developers.google.com/analytics/devguides/collection/ga4

---

## ✅ Checklist

- [ ] Created GA4 property
- [ ] Got Measurement ID
- [ ] Updated `index.html` with real ID
- [ ] Deployed to production
- [ ] Verified in Realtime report
- [ ] Set up custom reports
- [ ] Shared access with team

**Once completed, you'll have powerful insights into your users! 📊**
