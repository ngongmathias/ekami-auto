# Supabase Database Setup Guide

## 📋 Prerequisites

- ✅ Supabase account created
- ✅ New project created on Supabase
- ✅ API URL and Anon Key added to `.env` file

## 🚀 Step-by-Step Setup

### Step 1: Run the Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste into the SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)

**Expected Result:** You should see "Success. No rows returned" - this is normal!

### Step 2: Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `cars`
   - ✅ `bookings`
   - ✅ `purchases`
   - ✅ `repair_requests`
   - ✅ `sell_requests`
   - ✅ `blog_posts`
   - ✅ `reviews`
   - ✅ `user_profiles`

### Step 3: Add Sample Data (Optional but Recommended)

1. Go back to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase/sample-data.sql`
4. Paste into the SQL Editor
5. Click **"Run"**

**Expected Result:** You should see:
- "Cars inserted: 12"
- "Blog posts inserted: 3"

### Step 4: Verify Sample Data

1. Go to **Table Editor**
2. Click on `cars` table
3. You should see 12 sample cars (Toyota, Mercedes, BMW, etc.)
4. Click on `blog_posts` table
5. You should see 3 sample blog posts

### Step 5: Check Row Level Security (RLS)

1. Go to **Authentication** > **Policies**
2. You should see policies for each table
3. This ensures data security (users can only access their own data)

## 📊 Database Schema Overview

### Main Tables:

#### 🚗 **cars**
- All vehicle listings (for rent and sale)
- Includes specs, pricing, images, features
- Public read access, authenticated write

#### 📅 **bookings**
- Rental reservations
- Tracks dates, pricing, payment status
- Users can only see their own bookings

#### 💰 **purchases**
- Car purchase records
- Payment tracking, delivery info
- Users can only see their own purchases

#### 🔧 **repair_requests**
- Service and repair appointments
- Customer info, vehicle details, status tracking
- Users can see their own requests

#### 🏷️ **sell_requests**
- Users selling their cars
- Admin review workflow
- Converts to car listing when approved

#### 📝 **blog_posts**
- Content marketing
- SEO-friendly with slugs
- Public read, admin write

#### ⭐ **reviews**
- Customer reviews for cars
- Rating system (1-5 stars)
- Moderation workflow

#### 👤 **user_profiles**
- Extended user information
- Driver license, loyalty points
- Private to each user

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies:

- **Public data**: Cars, blog posts (published only)
- **Private data**: Bookings, purchases, profiles (user's own data only)
- **Semi-private**: Reviews (approved reviews are public)

### Authentication
- Integrated with Clerk for user management
- User IDs linked via `auth.users`
- Automatic profile creation on signup

## 🎯 Next Steps

After setup, you can:

1. **Test the connection** in your app
2. **Create Supabase client** in your code
3. **Fetch cars** for the homepage
4. **Implement booking flow**
5. **Add real user data** as you test

## 📝 Sample Queries

### Get all available cars for rent:
```sql
SELECT * FROM cars 
WHERE available_for_rent = true 
AND status = 'available'
ORDER BY created_at DESC;
```

### Get user's bookings:
```sql
SELECT b.*, c.make, c.model, c.year 
FROM bookings b
JOIN cars c ON b.car_id = c.id
WHERE b.user_id = 'user-uuid-here'
ORDER BY b.created_at DESC;
```

### Get published blog posts:
```sql
SELECT * FROM blog_posts 
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;
```

## 🆘 Troubleshooting

### "Permission denied" errors
- Check that RLS policies are created
- Verify user is authenticated
- Check that user ID matches in queries

### "Table does not exist"
- Ensure schema.sql ran successfully
- Check for SQL errors in the output
- Verify you're in the correct project

### Sample data not showing
- Make sure schema.sql ran first
- Check for foreign key errors
- Verify sample-data.sql ran without errors

## 🔄 Resetting the Database

If you need to start over:

```sql
-- WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run schema.sql and sample-data.sql.

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Need help?** Check the Supabase dashboard logs or reach out for support!
