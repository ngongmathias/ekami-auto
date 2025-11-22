# 🔄 How to Add 360° Images to Cars

## Step 1: Find Your Car ID

### Option A: In Admin Dashboard (EASIEST)
1. Go to `/admin` in your browser
2. Click the **"Cars"** tab
3. Look at any car in the list
4. You'll see **"ID: xxxxxxxx..."** under the year
5. Click **Edit** on that car
6. The full ID will show at the top: **"ID: full-uuid-here"**
7. Copy that ID

### Option B: In Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor** → **cars**
4. Copy the ID from the first column

---

## Step 2: Add 360° Images

### Using Supabase SQL Editor:

```sql
-- Replace 'YOUR-CAR-ID-HERE' with the actual car ID you copied
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  'https://images.unsplash.com/photo-1542362567-b07e54a88620?w=800',
  'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'
]
WHERE id = 'YOUR-CAR-ID-HERE';
```

**Example with real ID:**
```sql
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  'https://images.unsplash.com/photo-1542362567-b07e54a88620?w=800'
]
WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

---

## Step 3: Test the 360° Viewer

1. Go to that car's detail page
2. Scroll down past the image gallery
3. You should see **"🔄 360° View"**
4. Drag to rotate!

---

## 📸 Tips for Real 360° Photos:

### For Production Use:
1. **Take photos** around the car (every 10-15 degrees)
2. **24-36 photos** total for smooth rotation
3. **Keep consistent:**
   - Same height
   - Same distance from car
   - Same lighting
4. **Upload to Supabase Storage** or image hosting
5. **Get URLs** and add them to the array

### Quick Test Images:
Use the Unsplash URLs above for testing - they're free stock photos!

---

## 🔧 Troubleshooting:

**Error: "invalid input syntax for type uuid"**
- Make sure you replaced `'YOUR-CAR-ID-HERE'` with the actual UUID
- UUIDs look like: `123e4567-e89b-12d3-a456-426614174000`
- Don't use quotes around the placeholder text

**360° View not showing:**
- Make sure the migration ran successfully
- Check that `images_360` has at least 3-4 images
- Refresh the page

**Images not loading:**
- Make sure URLs are valid and accessible
- Test URLs in browser first
- Use HTTPS URLs

---

## ✅ You're Done!

Once you add 360° images to a car, the viewer will automatically appear on that car's detail page!
