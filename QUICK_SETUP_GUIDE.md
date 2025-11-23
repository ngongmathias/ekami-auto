# ⚡ Quick Setup Guide - ONE SCRIPT TO RULE THEM ALL!

## 🎯 Goal
Enable admin features in 3 minutes!

---

## Step 1: Open Supabase SQL Editor (30 seconds)

1. Go to: https://supabase.com/dashboard
2. Click on your project: **qumjbdvaxckaktrjxndj**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

---

## Step 2: Copy & Paste the Script (30 seconds)

1. Open the file: **`supabase-admin-setup.sql`** (in this folder)
2. **Select ALL** the text (Ctrl+A)
3. **Copy** it (Ctrl+C)
4. **Paste** into the Supabase SQL Editor (Ctrl+V)

---

## Step 3: Run the Script (10 seconds)

1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for it to finish (you'll see "Success" messages)
3. **Done!** ✅

---

## 🧪 Test It Works

1. Go to your app: http://localhost:8080
2. Sign in with: **mathiasngongngai@gmail.com**
3. Go to: http://localhost:8080/admin
4. Click **"Cars"** tab
5. You should see all your cars! ✅

---

## ❓ Troubleshooting

### "Policy already exists" error?
- **Solution:** Some policies might already exist. That's OK! Just ignore those errors.
- The script will still work for the policies that don't exist yet.

### "Permission denied" error?
- **Solution:** Make sure you're signed in to Supabase with the account that owns the project.

### Still not working?
- **Check:** Are you signed in to the app with one of the admin emails?
  - ✅ kerryngong@ekamiauto.com
  - ✅ mathiasngongngai@gmail.com
- **Check:** Did the SQL script run without errors?

---

## 🎉 That's It!

**Total time:** ~3 minutes

Now your admin dashboard has full access to:
- ✅ View all cars
- ✅ Add/edit/delete cars
- ✅ View all bookings
- ✅ View all customers
- ✅ Manage blog posts
- ✅ Upload car images

---

## 📝 Optional: Create Storage Bucket for Car Images

If you want to upload car images:

1. In Supabase Dashboard, click **"Storage"**
2. Click **"New Bucket"**
3. Name it: **car-images**
4. Set to **Public**
5. Click **"Create"**

The script already set up the permissions for this bucket!

---

**Need help?** Just ask! 🚀
