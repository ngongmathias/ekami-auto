# 🔧 Supabase Admin Setup Guide

This guide will help you set up Supabase to enable full admin functionality.

---

## 📋 What You Need to Do in Supabase

### 1. **Enable Row Level Security (RLS) Policies for Admins**

You need to create RLS policies that allow admin users to manage data.

#### Go to Supabase Dashboard → Authentication → Policies

**For `cars` table:**

```sql
-- Allow admins to view all cars
CREATE POLICY "Admins can view all cars"
ON cars FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to insert cars
CREATE POLICY "Admins can insert cars"
ON cars FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to update cars
CREATE POLICY "Admins can update cars"
ON cars FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to delete cars
CREATE POLICY "Admins can delete cars"
ON cars FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);
```

**For `bookings` table:**

```sql
-- Allow admins to view all bookings
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to update bookings
CREATE POLICY "Admins can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to delete bookings
CREATE POLICY "Admins can delete bookings"
ON bookings FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);
```

**For `blog_posts` table:**

```sql
-- Allow admins to view all blog posts
CREATE POLICY "Admins can view all blog posts"
ON blog_posts FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to insert blog posts
CREATE POLICY "Admins can insert blog posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to update blog posts
CREATE POLICY "Admins can update blog posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow admins to delete blog posts
CREATE POLICY "Admins can delete blog posts"
ON blog_posts FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);
```

**For `user_profiles` table:**

```sql
-- Allow admins to view all user profiles
CREATE POLICY "Admins can view all user profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);
```

---

### 2. **Create Admin Role Column (Optional but Recommended)**

Instead of hardcoding emails, you can add an `is_admin` column to `user_profiles`:

```sql
-- Add is_admin column
ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Set your accounts as admin
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Then update policies to use this column instead:
CREATE POLICY "Admins can manage cars"
ON cars FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

---

### 3. **Enable Storage for Car Images**

#### Go to Supabase Dashboard → Storage

1. **Create a bucket** called `car-images`
2. **Set it to public** (or create policies for authenticated users)
3. **Create policy** to allow admins to upload:

```sql
-- Allow admins to upload car images
CREATE POLICY "Admins can upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-images' AND
  auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
);

-- Allow public to view car images
CREATE POLICY "Anyone can view car images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');
```

---

### 4. **Create Database Functions for Admin Stats**

```sql
-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_cars', (SELECT COUNT(*) FROM cars),
    'available_cars', (SELECT COUNT(*) FROM cars WHERE available_for_rent = TRUE),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'active_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'active'),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE payment_status = 'paid'),
    'total_customers', (SELECT COUNT(DISTINCT user_id) FROM bookings),
    'pending_payments', (SELECT COUNT(*) FROM bookings WHERE payment_status = 'pending')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
```

---

## 🔐 Security Best Practices

### 1. **Never expose admin emails in frontend code**
   - Store them in environment variables
   - Or use the `is_admin` column approach

### 2. **Always verify admin status on the backend**
   - RLS policies are your first line of defense
   - Never trust frontend checks alone

### 3. **Use Supabase Auth with Clerk**
   - When a user signs in with Clerk, sync their data to Supabase
   - Store Clerk user ID in `user_profiles` table

---

## 📝 Step-by-Step Setup Instructions

### **Step 1: Go to Supabase Dashboard**
1. Open https://supabase.com/dashboard
2. Select your project: `qumjbdvaxckaktrjxndj`

### **Step 2: Run SQL Policies**
1. Click **SQL Editor** in left sidebar
2. Click **New Query**
3. Copy and paste the RLS policies above
4. Click **Run** for each policy

### **Step 3: Test Admin Access**
1. Sign in to your app with `mathiasngongngai@gmail.com`
2. Go to `/admin`
3. Try viewing cars, bookings, etc.

### **Step 4: Enable Storage (for car images)**
1. Click **Storage** in left sidebar
2. Click **New Bucket**
3. Name it `car-images`
4. Set to **Public**
5. Add the storage policies above

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Can view all cars in admin dashboard
- [ ] Can view all bookings
- [ ] Can view all customers
- [ ] Can view all blog posts
- [ ] Can upload car images (when implemented)
- [ ] Non-admin users cannot access admin features
- [ ] Stats are calculated correctly

---

## 🆘 Troubleshooting

### **Error: "new row violates row-level security policy"**
- Your RLS policies aren't set up correctly
- Make sure you're signed in with an admin email
- Check that the policy uses the correct email check

### **Error: "permission denied for table"**
- RLS is enabled but no policies exist
- Add the SELECT policy first

### **Can't see any data**
- Check if RLS is enabled on the table
- Verify your email matches the policy
- Try disabling RLS temporarily to test (NOT in production!)

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Verify you're signed in with Clerk
3. Check browser console for errors
4. Make sure environment variables are correct

---

**Last Updated:** November 20, 2024
**Your Supabase Project:** https://qumjbdvaxckaktrjxndj.supabase.co
