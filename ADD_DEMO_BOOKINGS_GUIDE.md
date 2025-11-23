# 📅 Add Demo Bookings - Quick Guide

## 🎯 Purpose

This guide helps you add demo bookings to your database so you can test the calendar features!

---

## ⚡ Quick Method (RECOMMENDED)

### **Use the Automatic Script**

This script automatically finds your cars and creates bookings for them!

1. **Go to Supabase Dashboard**
2. **Click "SQL Editor"**
3. **Copy and paste this file:**
   ```
   supabase/migrations/20240127_add_demo_bookings_auto.sql
   ```
4. **Click "Run"**
5. **Done!** ✅

**What it creates:**
- ✅ 10 demo bookings across 5 cars
- ✅ 3 maintenance blocks
- ✅ Mix of active, confirmed, and pending bookings
- ✅ Bookings spanning the next 2 months

---

## 📊 What You'll Get

### **Bookings Created:**

1. **Active Bookings (2)** - Currently rented
   - Started a few days ago
   - Ending in the next week
   - Status: `active`
   - Payment: `paid`

2. **Confirmed Bookings (6)** - Upcoming rentals
   - Various dates over next 2 months
   - Status: `confirmed`
   - Payment: `paid`

3. **Pending Bookings (2)** - Awaiting confirmation
   - Near-future dates
   - Status: `pending`
   - Payment: `pending`

### **Maintenance Blocks Created:**

1. **Scheduled Maintenance** - Oil change
2. **Brake Repair** - Inspection and repair
3. **Detailing** - Professional cleaning

---

## 🎨 How to View the Results

### **1. Fleet Calendar View**

1. Go to `/admin`
2. Click **"Fleet Calendar"** tab
3. You'll see:
   - 🟢 Green events = Active bookings
   - 🔵 Blue events = Confirmed bookings
   - 🟣 Purple events = Pending bookings
   - 🟠 Orange events = Maintenance blocks

### **2. Individual Car Calendar**

1. Go to any car detail page
2. Scroll to **"Check Availability"** section
3. You'll see the calendar with:
   - Red dates = Booked
   - Orange dates = Maintenance
   - Green dates = Available

### **3. Bookings Management**

1. Go to `/admin`
2. Click **"Bookings"** tab
3. See all bookings in a list

---

## 🔧 Manual Method (If Needed)

If you want to customize the bookings:

1. **Get Your Car IDs:**
   ```sql
   SELECT id, car_number, make, model, year 
   FROM cars 
   ORDER BY car_number 
   LIMIT 5;
   ```

2. **Copy the IDs**

3. **Open this file:**
   ```
   supabase/migrations/20240127_add_demo_bookings.sql
   ```

4. **Replace placeholders:**
   - Find `YOUR_CAR_ID_1`
   - Replace with actual UUID from step 1
   - Repeat for all 5 cars

5. **Run the script in Supabase SQL Editor**

---

## 📅 Booking Timeline

Here's what the demo data looks like:

```
TODAY
  ↓
Day -2: Car 1 booking starts (Active)
Day -1: Car 2 booking starts (Active)
Day +3: Car 2 booking starts (Pending)
Day +5: Car 1 booking ends
        Car 4 booking starts (Pending)
Day +6: Car 2 booking ends
Day +7: Car 5 booking starts (Confirmed)
Day +8: Car 2 booking ends
Day +9: Car 4 booking ends
Day +10: Car 1 booking starts (Confirmed)
Day +12: Car 4 maintenance starts
Day +13: Car 4 maintenance ends
Day +14: Car 4 booking starts (Confirmed)
Day +15: Car 3 booking starts (Confirmed)
Day +16: Car 4 booking ends
Day +17: Car 1 booking ends
Day +20: Car 1 maintenance starts
Day +21: Car 5 booking ends
Day +22: Car 1 maintenance ends
         Car 3 booking ends
Day +25: Car 3 booking starts (Confirmed)
Day +28: Car 5 booking starts (Confirmed)
Day +32: Car 3 booking ends
Day +35: Car 3 maintenance starts
         Car 5 booking ends
Day +37: Car 3 maintenance ends
```

---

## 🎯 Testing Scenarios

### **Scenario 1: View Active Bookings**
- Go to Fleet Calendar
- Look for green events (active)
- Should see 2 active bookings

### **Scenario 2: Check Car Availability**
- Go to a car detail page
- Try to select dates that overlap with bookings
- Should get error: "Dates unavailable"

### **Scenario 3: Filter by Car**
- Go to Fleet Calendar
- Click "Filter Cars"
- Uncheck some cars
- Calendar updates to show only selected cars

### **Scenario 4: View Maintenance**
- Go to Admin → Maintenance Blocks
- See 3 maintenance blocks
- Try to book a car during maintenance
- Should be blocked

### **Scenario 5: Event Details**
- Click any event on Fleet Calendar
- Modal shows:
  - Car identifier (EK-XXX)
  - Customer name
  - Dates
  - Amount
  - Status

---

## 🧹 Clean Up Demo Data

If you want to remove the demo bookings later:

```sql
-- Delete demo bookings (created in last hour)
DELETE FROM bookings 
WHERE created_at > NOW() - INTERVAL '1 hour'
AND user_email LIKE '%@example.com';

-- Delete demo maintenance blocks
DELETE FROM maintenance_blocks 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Verify deletion
SELECT COUNT(*) as remaining_bookings FROM bookings;
SELECT COUNT(*) as remaining_maintenance FROM maintenance_blocks;
```

---

## 📊 Verify Data

After running the script, verify it worked:

```sql
-- Check bookings
SELECT 
  c.car_number,
  b.user_name,
  b.start_date::date,
  b.end_date::date,
  b.status
FROM bookings b
JOIN cars c ON b.car_id = c.id
WHERE b.end_date >= CURRENT_DATE
ORDER BY c.car_number, b.start_date;

-- Check maintenance
SELECT 
  c.car_number,
  m.start_date::date,
  m.end_date::date,
  m.reason
FROM maintenance_blocks m
JOIN cars c ON m.car_id = c.id
WHERE m.end_date >= CURRENT_DATE
ORDER BY c.car_number, m.start_date;
```

---

## ⚠️ Important Notes

1. **Requires at least 5 cars** in your database
   - If you have fewer, the script will notify you
   - Add more cars first, then run the script

2. **Demo emails** use `@example.com`
   - Easy to identify and clean up later
   - Won't conflict with real customers

3. **Dates are relative** to current date
   - Always creates relevant bookings
   - No outdated data

4. **Safe to run multiple times**
   - Creates new bookings each time
   - Won't duplicate or conflict

---

## 🎉 What's Next?

After adding demo bookings:

1. ✅ Test Fleet Calendar view
2. ✅ Test individual car calendars
3. ✅ Try filtering by cars
4. ✅ Click events for details
5. ✅ Try adding maintenance blocks
6. ✅ Test booking conflicts
7. ✅ Check mobile view

---

## 🆘 Troubleshooting

### **Error: "Not enough cars"**
- You need at least 5 cars in your database
- Add more cars first
- Or modify the script to use fewer cars

### **No bookings showing on calendar**
- Check if migration ran successfully
- Verify bookings exist: `SELECT COUNT(*) FROM bookings;`
- Check date range (bookings are future-dated)
- Refresh the page

### **Can't see maintenance blocks**
- Run the maintenance_blocks migration first:
  ```
  supabase/migrations/20240126_create_maintenance_blocks.sql
  ```
- Then run the demo bookings script

---

## 📞 Quick Commands

```sql
-- Count demo bookings
SELECT COUNT(*) FROM bookings 
WHERE user_email LIKE '%@example.com';

-- Count maintenance blocks
SELECT COUNT(*) FROM maintenance_blocks;

-- See all demo data
SELECT 
  'Booking' as type,
  c.car_number,
  b.user_name as name,
  b.start_date::date,
  b.status
FROM bookings b
JOIN cars c ON b.car_id = c.id
WHERE b.user_email LIKE '%@example.com'
UNION ALL
SELECT 
  'Maintenance' as type,
  c.car_number,
  m.reason as name,
  m.start_date::date,
  'maintenance' as status
FROM maintenance_blocks m
JOIN cars c ON m.car_id = c.id
ORDER BY start_date;
```

---

**Ready to test your calendar features! 🎉📅**

Just run the automatic script and you'll have a fully populated calendar to explore!
