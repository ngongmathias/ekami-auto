# 📅 Setup Calendar with Demo Data - Step by Step

## ⚠️ IMPORTANT: Run in This Order!

You need to run **2 migrations** in the correct order:

---

## **Step 1: Create maintenance_blocks Table** ✅

**File:** `supabase/migrations/20240126_create_maintenance_blocks.sql`

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Copy and paste the entire contents of:
   ```
   supabase/migrations/20240126_create_maintenance_blocks.sql
   ```
4. Click **Run**
5. ✅ You should see: "Success. No rows returned"

**This creates:**
- `maintenance_blocks` table
- Row Level Security policies
- Indexes
- Triggers

---

## **Step 2: Add Demo Bookings** ✅

**File:** `supabase/migrations/20240127_add_demo_bookings_auto.sql`

1. Still in **SQL Editor**
2. Copy and paste the entire contents of:
   ```
   supabase/migrations/20240127_add_demo_bookings_auto.sql
   ```
3. Click **Run**
4. ✅ You should see output like:
   ```
   ✅ Created 10 demo bookings successfully!
   ✅ Created 3 maintenance blocks successfully!
   
   📊 DEMO BOOKINGS CREATED
   - Total: 10 bookings
   - Active: 2
   - Confirmed: 6
   - Pending: 2
   ```

**This creates:**
- 10 demo bookings (using your existing cars)
- 3 maintenance blocks
- Mix of active, confirmed, and pending statuses

---

## **Step 3: View the Results** 🎉

### **Option A: Fleet Calendar (Best!)**
1. Go to your app: `http://localhost:5173/admin`
2. Click **"Fleet Calendar"** tab
3. See all bookings visually!
   - 🟢 Green = Active
   - 🔵 Blue = Confirmed
   - 🟣 Purple = Pending
   - 🟠 Orange = Maintenance

### **Option B: Individual Car Calendar**
1. Go to any car detail page
2. Scroll to **"Check Availability"**
3. See that car's bookings
   - Red dates = Booked
   - Orange dates = Maintenance
   - Green dates = Available

### **Option C: Bookings List**
1. Go to `/admin`
2. Click **"Bookings"** tab
3. See all bookings in a list

---

## 🐛 Troubleshooting

### **Error: "maintenance_blocks table not found"**
- ❌ You skipped Step 1!
- ✅ Run the maintenance_blocks migration first
- Then run the demo bookings script

### **Error: "column user_name does not exist"**
- ❌ You're using an old version of the script
- ✅ The script has been fixed to use `customer_name`
- Re-copy the file and try again

### **Error: "Not enough cars"**
- ❌ You need at least 5 cars in your database
- ✅ Add more cars first
- Or modify the script to use fewer cars

### **No bookings showing on calendar**
- Check if both migrations ran successfully
- Verify: `SELECT COUNT(*) FROM bookings;`
- Verify: `SELECT COUNT(*) FROM maintenance_blocks;`
- Refresh the page

---

## 📊 What You'll Get

### **Bookings Timeline:**
```
TODAY
  ↓
Day -2: Car 1 active booking starts
Day -1: Car 2 active booking starts
Day +3: Car 2 pending booking starts
Day +5: Car 1 active booking ends
        Car 4 pending booking starts
Day +7: Car 5 confirmed booking starts
Day +10: Car 1 confirmed booking starts
Day +12: Car 4 maintenance (detailing)
Day +14: Car 4 confirmed booking starts
Day +15: Car 3 confirmed booking starts
Day +20: Car 1 maintenance (oil change)
Day +25: Car 3 confirmed booking starts
Day +28: Car 5 confirmed booking starts
Day +35: Car 3 maintenance (brake repair)
```

### **Booking Details:**
- **2 Active** - Currently rented (started days ago)
- **6 Confirmed** - Upcoming rentals
- **2 Pending** - Awaiting confirmation
- **3 Maintenance Blocks** - Scheduled maintenance

---

## ✅ Verification

Run these queries to verify everything worked:

```sql
-- Check bookings
SELECT 
  c.car_number,
  b.customer_name,
  b.start_date::date,
  b.end_date::date,
  b.status
FROM bookings b
JOIN cars c ON b.car_id = c.id
WHERE b.customer_email LIKE '%@example.com'
ORDER BY c.car_number, b.start_date;

-- Check maintenance blocks
SELECT 
  c.car_number,
  m.start_date::date,
  m.end_date::date,
  m.reason
FROM maintenance_blocks m
JOIN cars c ON m.car_id = c.id
ORDER BY c.car_number, m.start_date;
```

---

## 🧹 Clean Up Later

When you're done testing:

```sql
-- Delete demo bookings
DELETE FROM bookings 
WHERE customer_email LIKE '%@example.com';

-- Delete demo maintenance blocks
DELETE FROM maintenance_blocks 
WHERE created_at > NOW() - INTERVAL '1 day';
```

---

## 🎯 Quick Reference

### **Column Names (IMPORTANT!):**
- ✅ Use `customer_name` (not user_name)
- ✅ Use `customer_email` (not user_email)
- ✅ Use `customer_phone` (not user_phone)

### **Required Tables:**
1. `cars` - Must exist with at least 5 cars
2. `bookings` - Must exist (already does)
3. `maintenance_blocks` - Created by Step 1

---

**Ready to test! Just follow Steps 1 and 2 in order! 🚀**
