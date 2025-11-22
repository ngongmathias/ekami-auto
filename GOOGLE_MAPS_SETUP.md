# 🗺️ Google Maps API Setup Guide

## 🎯 What You'll Get

- **Free Tier:** $200 credit/month (≈28,000 map loads)
- **Features:** Maps, Geocoding, Distance Matrix, Places
- **No credit card required** for basic usage

---

## 🚀 Step-by-Step Setup (5 minutes)

### **Step 1: Go to Google Cloud Console**

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account (use: kerryngong@ekamiauto.com or personal)

---

### **Step 2: Create a New Project**

1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Enter project details:
   - **Project name:** Ekami Auto
   - **Organization:** Leave as "No organization"
4. Click **"Create"**
5. Wait ~30 seconds for project creation

---

### **Step 3: Enable Google Maps APIs**

1. In the search bar at top, type: **"Maps JavaScript API"**
2. Click on **"Maps JavaScript API"**
3. Click **"Enable"**
4. Wait for it to enable (~10 seconds)

Repeat for these APIs:
- **Geocoding API** (for address → coordinates)
- **Distance Matrix API** (for distance calculation)
- **Places API** (for location search)

---

### **Step 4: Create API Key**

1. Go to: **APIs & Services** → **Credentials** (left sidebar)
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. Your API key will appear! Copy it (looks like: `AIzaSyB...`)

**⚠️ IMPORTANT:** Don't close this window yet!

---

### **Step 5: Restrict Your API Key (Security)**

1. Click **"RESTRICT KEY"** in the popup
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Click **"+ ADD AN ITEM"**
   - Add these referrers:
     ```
     https://ekamiauto.com/*
     https://*.ekamiauto.com/*
     http://localhost:*
     https://localhost:*
     ```
3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check these APIs:
     - ✅ Maps JavaScript API
     - ✅ Geocoding API
     - ✅ Distance Matrix API
     - ✅ Places API
4. Click **"Save"**

---

### **Step 6: Enable Billing (Optional but Recommended)**

**Note:** You get $200 free credit/month. You won't be charged unless you exceed this.

1. Go to **Billing** in the left sidebar
2. Click **"Link a billing account"**
3. Follow the prompts to add a credit card
4. This unlocks higher quotas and removes "For development purposes only" watermark

**You can skip this step if you want to test first!**

---

## 📋 Your API Key

Once you have it, it will look like this:
```
AIzaSyB-dKzOBnGRzRqL8V0eIAPg-iuqCxHPtE8
```

**Keep it safe!** We'll add it to your `.env` file.

---

## 🔒 Security Best Practices

✅ **DO:**
- Restrict API key to your domains
- Use environment variables (`.env`)
- Monitor usage in Google Cloud Console
- Set usage quotas/alerts

❌ **DON'T:**
- Share API key publicly
- Commit API key to GitHub
- Use unrestricted keys in production

---

## 💰 Pricing (Free Tier)

| Feature | Free Monthly | Cost After |
|---------|-------------|------------|
| Map Loads | 28,000 | $7 per 1,000 |
| Geocoding | 40,000 | $5 per 1,000 |
| Distance Matrix | 40,000 | $5 per 1,000 |
| Places API | 28,000 | $17 per 1,000 |

**For most small businesses, you'll stay within the free tier!**

---

## 🧪 Test Your API Key

Once you have your key, test it here:
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places
```

Replace `YOUR_API_KEY` with your actual key. If it loads without errors, you're good! ✅

---

## 📞 Need Help?

- Google Maps Documentation: https://developers.google.com/maps/documentation
- API Key Help: https://developers.google.com/maps/documentation/javascript/get-api-key
- Pricing Calculator: https://mapsplatform.google.com/pricing/

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Maps JavaScript API
- [ ] Enabled Geocoding API
- [ ] Enabled Distance Matrix API
- [ ] Enabled Places API
- [ ] Created API key
- [ ] Restricted API key to domains
- [ ] Copied API key
- [ ] (Optional) Enabled billing

---

## 🎯 Next Steps

Once you have your API key:
1. Share it with me (I'll add it to `.env` file)
2. We'll integrate Google Maps into:
   - Booking page (location picker)
   - Car detail page (show location)
   - Contact page (office location)

**Let me know when you have your API key!** 🗺️
