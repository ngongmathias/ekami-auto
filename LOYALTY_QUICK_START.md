# 🎁 Loyalty Program - Quick Start Guide

## 📍 How to Access

### **For Customers:**
1. **Click "🎁 Rewards" in the navigation menu** (top of page)
2. **Or visit:** `https://ekamiauto.com/loyalty`
3. **Sign in** if not already signed in
4. **Automatically receive 100 welcome points!** 🎉

### **For Admins:**
1. Go to `/admin`
2. Click **"Loyalty Program"** tab
3. Manage members, rewards, and view statistics

---

## 🎯 How It Works (Simple Explanation)

### **Step 1: Customer Signs Up**
- New customer creates account
- **Automatically gets 100 welcome points** ✨
- Starts at **Bronze tier**

### **Step 2: Customer Earns Points**
Every action earns points:
- **Book a car** → Earn points (1 point per 100 XAF)
- **Buy a car** → Earn more points
- **Refer a friend** → Bonus points
- **Leave a review** → Extra points

### **Step 3: Customer Unlocks Tiers**
As points accumulate, customers unlock better tiers:
- **Bronze** (0 pts) → Start here
- **Silver** (1,000 pts) → 5% discount + 25% bonus points
- **Gold** (5,000 pts) → 10% discount + 50% bonus points
- **Platinum** (15,000 pts) → 15% discount + 100% bonus points

### **Step 4: Customer Redeems Rewards**
Use points to get rewards:
- **5% Discount** (500 pts)
- **Free Car Wash** (300 pts)
- **Free Upgrade** (1,500 pts)
- **Weekend Special** (5,000 pts)

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Run the Database Migration**
```sql
-- In Supabase Dashboard:
-- 1. Go to SQL Editor
-- 2. Copy contents of: supabase/migrations/20240129_create_loyalty_program.sql
-- 3. Click "Run"
```

### **Step 2: Test the Customer View**
```
1. Visit: http://localhost:5173/loyalty
2. Sign in with your account
3. You'll see:
   - Your tier card (Bronze to start)
   - 100 welcome points
   - Available rewards
   - Transaction history
```

### **Step 3: Test the Admin View**
```
1. Visit: http://localhost:5173/admin
2. Sign in as admin (kerryngong@ekamiauto.com)
3. Click "Loyalty Program" tab
4. You'll see:
   - All members
   - Rewards management
   - Statistics
```

---

## 📱 What Customers See

### **Loyalty Dashboard (/loyalty)**

**Top Section - Tier Card:**
```
┌─────────────────────────────────────────┐
│  🥉 Bronze Member                       │
│  0% discount on all bookings            │
│                                         │
│  Available Points: 100                  │
│                                         │
│  Progress to Silver                     │
│  [████░░░░░░░░░░░░░░░░] 10%            │
│  900 more points needed                 │
└─────────────────────────────────────────┘
```

**Stats Grid:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Lifetime     │ Total        │ Referrals    │ Reviews      │
│ Points       │ Bookings     │              │              │
│ 100          │ 0            │ 0            │ 0            │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Three Tabs:**
1. **Overview** - Your benefits and tier comparison
2. **Rewards** - Catalog of rewards to redeem
3. **History** - All your points transactions

---

## 👨‍💼 What Admins See

### **Admin Dashboard (/admin → Loyalty Program)**

**Three Tabs:**

1. **Members Tab:**
   - List of all loyalty members
   - Email, tier, points, bookings, total spent
   - "Adjust Points" button for manual adjustments

2. **Rewards Tab:**
   - Grid of all rewards
   - Add/Edit/Delete buttons
   - Toggle availability
   - Set points required and tier restrictions

3. **Statistics Tab:**
   - Total members
   - Points issued/redeemed
   - Average points per member
   - Tier distribution chart

---

## 💡 Example Scenarios

### **Scenario 1: New Customer Journey**
```
Day 1: Sign up
→ Gets 100 welcome points (Bronze)

Day 2: Books car for 50,000 XAF
→ Earns 500 points
→ Total: 600 points

Day 3: Leaves review
→ Earns 100 points
→ Total: 700 points

Day 4: Redeems 5% discount voucher
→ Uses 500 points
→ Remaining: 200 points
```

### **Scenario 2: Reaching Silver Tier**
```
Customer has 900 points (Bronze)

Books car for 50,000 XAF
→ Earns 500 points
→ Total: 1,400 points

🎉 REACHES SILVER TIER!
→ Now gets 5% discount on all bookings
→ Now earns 25% bonus points (625 instead of 500)
```

### **Scenario 3: VIP Customer**
```
Customer has 14,500 points (Gold)

Buys car for 5,000,000 XAF
→ Earns 50,000 points (base)
→ Gets 50% bonus (Gold tier)
→ Total earned: 75,000 points
→ New total: 89,500 points

🎉 REACHES PLATINUM TIER!
→ 15% discount on all bookings
→ 100% bonus points (double points!)
→ VIP perks: free insurance, airport pickup, etc.
```

---

## 🎁 Available Rewards (Default)

### **Entry Level (Bronze+):**
- **5% Discount Voucher** - 500 points
- **Free Car Wash** - 300 points

### **Mid Level (Silver+):**
- **10% Discount Voucher** - 1,000 points
- **Free Upgrade** - 1,500 points

### **High Level (Gold+):**
- **20% Discount Voucher** - 2,000 points
- **Weekend Special** (Free Fri-Sun) - 5,000 points

### **VIP Level (Platinum+):**
- **VIP Package** (All perks) - 10,000 points

---

## 🔧 How to Add Points Manually (Admin)

```
1. Go to /admin → Loyalty Program
2. Click "Members" tab
3. Find the customer
4. Click "Adjust Points"
5. Enter points (positive to add, negative to deduct)
   Example: 1000 (adds 1000 points)
   Example: -500 (removes 500 points)
6. Enter description: "Bonus for referral"
7. Click OK
```

---

## 🎯 How to Add New Reward (Admin)

```
1. Go to /admin → Loyalty Program
2. Click "Rewards" tab
3. Click "Add Reward" button
4. Fill in the form:
   - Name: "Free GPS Rental"
   - Description: "Get free GPS for your rental"
   - Points Required: 800
   - Type: Freebie
   - Min Tier: Bronze
5. Click "Create Reward"
```

---

## 📊 Points Calculation Formula

### **Base Points:**
```
Points = Booking Amount / 100

Example:
50,000 XAF booking = 500 points
100,000 XAF booking = 1,000 points
```

### **With Tier Multiplier:**
```
Bronze: 500 points × 1.0 = 500 points
Silver: 500 points × 1.25 = 625 points
Gold: 500 points × 1.5 = 750 points
Platinum: 500 points × 2.0 = 1,000 points
```

---

## 🎨 Visual Guide

### **Tier Colors:**
- 🥉 **Bronze** - Orange gradient
- 🥈 **Silver** - Gray gradient
- 🥇 **Gold** - Yellow gradient
- 💎 **Platinum** - Purple gradient

### **Transaction Colors:**
- 🟢 **Green** - Points earned
- 🔴 **Red** - Points redeemed

### **Reward Status:**
- ✅ **Available** - Can redeem
- 🔒 **Locked** - Need higher tier or more points

---

## ✅ Testing Checklist

### **Customer Side:**
- [ ] Visit `/loyalty` page
- [ ] See welcome bonus (100 points)
- [ ] View tier card and progress bar
- [ ] Browse rewards catalog
- [ ] Try to redeem a reward (if enough points)
- [ ] Check transaction history
- [ ] Test on mobile

### **Admin Side:**
- [ ] Access `/admin` → Loyalty Program
- [ ] View members list
- [ ] Adjust points for a member
- [ ] Add a new reward
- [ ] Edit existing reward
- [ ] View statistics

---

## 🚨 Common Questions

### **Q: Where do I see the loyalty program?**
A: Click "🎁 Rewards" in the top navigation menu, or visit `/loyalty`

### **Q: How do customers earn points?**
A: Automatically when they book cars, buy cars, refer friends, or leave reviews

### **Q: Can I manually give points to customers?**
A: Yes! Go to Admin → Loyalty Program → Members → Adjust Points

### **Q: How do customers redeem rewards?**
A: They click "Redeem Now" on any reward they can afford

### **Q: What happens when they redeem?**
A: They get a redemption code to use on their next booking

### **Q: Can I create custom rewards?**
A: Yes! Admin → Loyalty Program → Rewards → Add Reward

---

## 🎉 You're All Set!

**The loyalty program is now live and accessible!**

**Customer Access:** Click "🎁 Rewards" in navigation
**Admin Access:** `/admin` → Loyalty Program tab

**Start rewarding your loyal customers today! 🚀**
