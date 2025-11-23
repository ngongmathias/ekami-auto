# 🔧 Loyalty Admin Dashboard Troubleshooting Guide

## Issue: Admin Dashboard Shows Blank/No Data

### ✅ **Quick Fix Applied:**

Added better error handling and debugging to help identify the issue.

---

## 🔍 **How to Debug:**

### **Step 1: Check Browser Console**

1. Open the admin dashboard: `/admin`
2. Click on the "Loyalty" tab
3. Open browser console (F12 or Right-click → Inspect → Console)
4. Look for these messages:

```
Fetched members: [number] [data]
Fetched rewards: [number]
```

### **Step 2: Check for Errors**

Look for error messages in console:
- ❌ "Error fetching members: ..."
- ❌ "Failed to load members: ..."
- ❌ Any red error messages

---

## 🐛 **Common Issues & Solutions:**

### **Issue 1: RLS (Row Level Security) Policies**

**Problem:** Admin can't see data due to database permissions

**Solution:** Check if RLS policies allow admin access

```sql
-- In Supabase SQL Editor, check policies:
SELECT * FROM pg_policies WHERE tablename = 'loyalty_members';

-- If policies are too restrictive, update them:
DROP POLICY IF EXISTS "Admins can view all members" ON loyalty_members;

CREATE POLICY "Admins can view all members"
  ON loyalty_members FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'kerryngong@gmail.com', 'mathiasngongngai@gmail.com')
  );
```

### **Issue 2: Table Doesn't Exist**

**Problem:** loyalty_members table not created

**Solution:** Run the loyalty program migration

```sql
-- Check if table exists:
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'loyalty_members'
);

-- If false, run migration:
-- See: supabase/migrations/20240129_create_loyalty_program.sql
```

### **Issue 3: No Data in Table**

**Problem:** User has points but they're not in loyalty_members table

**Solution:** Check if your user account is in the table

```sql
-- Check your user's loyalty record:
SELECT * FROM loyalty_members 
WHERE email = 'your-email@example.com';

-- If no record, create one manually:
INSERT INTO loyalty_members (
  user_id,
  email,
  total_points,
  available_points,
  lifetime_points,
  tier
) VALUES (
  'your-user-id',
  'your-email@example.com',
  100,
  100,
  100,
  'bronze'
);
```

### **Issue 4: User ID Mismatch**

**Problem:** loyalty_members.user_id doesn't match your actual user ID

**Solution:** Check and update user_id

```sql
-- Find your actual user ID from Clerk/Auth:
-- (Check in browser console: console.log(user.id))

-- Update loyalty member record:
UPDATE loyalty_members 
SET user_id = 'correct-user-id'
WHERE email = 'your-email@example.com';
```

---

## 📊 **Verify Data Manually:**

### **Check if you have loyalty data:**

```sql
-- 1. Check members table:
SELECT COUNT(*) as member_count FROM loyalty_members;
SELECT * FROM loyalty_members LIMIT 5;

-- 2. Check transactions:
SELECT COUNT(*) as transaction_count FROM loyalty_transactions;
SELECT * FROM loyalty_transactions ORDER BY created_at DESC LIMIT 5;

-- 3. Check rewards:
SELECT COUNT(*) as reward_count FROM loyalty_rewards;
SELECT * FROM loyalty_rewards;

-- 4. Check tiers:
SELECT * FROM loyalty_tiers ORDER BY display_order;
```

---

## 🔧 **Quick Fixes:**

### **Fix 1: Reset Your Loyalty Account**

If you have points but they're not showing:

```sql
-- Delete old record:
DELETE FROM loyalty_members WHERE email = 'your-email@example.com';

-- Then visit /loyalty page to auto-create new account
```

### **Fix 2: Manually Add Points**

```sql
-- Add points to your account:
UPDATE loyalty_members 
SET 
  total_points = 1000,
  available_points = 1000,
  lifetime_points = 1000
WHERE email = 'your-email@example.com';
```

### **Fix 3: Create Test Data**

```sql
-- Create test member:
INSERT INTO loyalty_members (
  user_id, email, total_points, available_points, 
  lifetime_points, tier, total_bookings, total_spent
) VALUES (
  'test-user-1',
  'test@example.com',
  500,
  500,
  500,
  'silver',
  5,
  250000
);
```

---

## 🎯 **Expected Behavior:**

### **When Working Correctly:**

1. **Admin Dashboard → Loyalty Tab**
   - Shows list of all members
   - Shows member count in tab: "Members (X)"
   - Displays stats cards at top
   - Table shows: email, tier, points, bookings, spent

2. **Console Logs:**
   ```
   Fetched members: 1 [{...}]
   Fetched rewards: 5
   ```

3. **Stats Cards:**
   - Total Members: X
   - Total Points Issued: X
   - Total Points Redeemed: X
   - Average Points: X

---

## 🚨 **Still Not Working?**

### **Collect This Information:**

1. **Browser Console Output:**
   - Copy all console messages
   - Copy any error messages

2. **Database Check:**
   ```sql
   -- Run these and share results:
   SELECT COUNT(*) FROM loyalty_members;
   SELECT * FROM loyalty_members WHERE email = 'your-email';
   SELECT COUNT(*) FROM loyalty_transactions;
   ```

3. **User Info:**
   - Your email address
   - Are you signed in?
   - Can you access other admin features?

---

## 📝 **Checklist:**

Before reporting issue, verify:

- [ ] Loyalty program migration has been run
- [ ] You're signed in as admin
- [ ] You can access other admin tabs
- [ ] Browser console shows no errors
- [ ] loyalty_members table exists
- [ ] Your user has a record in loyalty_members
- [ ] RLS policies allow admin access

---

## 💡 **Most Likely Cause:**

Based on "I have many points but admin shows blank":

**The issue is probably:**
1. ✅ RLS policies blocking admin view
2. ✅ User ID mismatch between auth and loyalty_members
3. ✅ Migration not run completely

**Quick Test:**
```sql
-- Check if you can see the data directly:
SELECT * FROM loyalty_members;

-- If you get "permission denied" → RLS issue
-- If you get empty result → No data issue
-- If you see data → Frontend display issue
```

---

## 🎉 **After Fix:**

Once working, you should see:
- ✅ Member list with your account
- ✅ Your points displayed
- ✅ Stats showing correct numbers
- ✅ Ability to adjust points
- ✅ Rewards list

---

**Need more help? Check the browser console and run the SQL queries above to identify the exact issue!**
