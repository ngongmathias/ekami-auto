# 🗺️ Car Locations Guide

## 📍 How Car Locations Work

### **What is a Car Location?**
Each car in your inventory can have a pickup location. This shows customers:
- Where to pick up the car
- Interactive map on car detail page
- "Get Directions" button to Google Maps

---

## 🎯 **Setting Car Locations**

### **Method 1: Via Database (Current)**

Run this SQL in Supabase to add locations to your cars:

```sql
-- Update cars with Douala locations
UPDATE cars 
SET location = 'Douala Airport, Cameroon'
WHERE id IN (SELECT id FROM cars LIMIT 5);

UPDATE cars 
SET location = 'Bonapriso, Douala, Cameroon'
WHERE id IN (SELECT id FROM cars OFFSET 5 LIMIT 5);

UPDATE cars 
SET location = 'Akwa, Douala, Cameroon'
WHERE id IN (SELECT id FROM cars OFFSET 10 LIMIT 5);
```

### **Method 2: Via Admin Dashboard (Coming Soon)**
We'll add a feature where admins can:
- Click on map to set car location
- Search for address
- Save location to car

---

## 📊 **Location Examples**

Good location formats:
- ✅ "Douala Airport, Cameroon"
- ✅ "Bonapriso, Douala"
- ✅ "Akwa Business District, Douala"
- ✅ "Bonanjo, Douala, Cameroon"

Bad formats:
- ❌ Just "Douala" (too vague)
- ❌ Empty string
- ❌ "N/A"

---

## 🔍 **Where Locations Appear**

### **1. Car Detail Page**
- Shows map with marker
- "Get Directions" button
- Only appears if car has location set

### **2. Booking Page**
- User selects their pickup location
- Can use map or dropdown
- For delivery to their address

### **3. Contact Page**
- Shows office location
- Fixed location (not per car)

---

## 🛠️ **Database Schema**

```sql
-- Cars table has location field
cars (
  id UUID PRIMARY KEY,
  make TEXT,
  model TEXT,
  location TEXT,  -- ← This field!
  ...
)
```

---

## 🎨 **Customizing Locations**

### **Change Office Location (Contact Page)**
Edit: `src/pages/ContactPage.tsx`

```tsx
<MapDisplay
  lat={4.0511}        // ← Your latitude
  lng={9.7679}        // ← Your longitude
  address="Your Address"
  height="450px"
  zoom={15}
/>
```

### **Get Coordinates for Any Address**
1. Go to: https://www.google.com/maps
2. Search for your address
3. Right-click on the location
4. Click coordinates to copy (e.g., "4.0511, 9.7679")

---

## 🚀 **Quick Test**

1. **Add location to a car:**
   ```sql
   UPDATE cars 
   SET location = 'Douala Airport, Cameroon'
   WHERE id = 'your-car-id';
   ```

2. **View that car's detail page**
3. **Scroll down** - you'll see the map!

---

## 📝 **Next Steps**

- [ ] Add locations to all cars in database
- [ ] Test map on car detail pages
- [ ] Add admin interface to manage locations
- [ ] Add distance-based delivery pricing

---

## 💡 **Pro Tips**

1. **Use specific locations** - "Douala Airport" is better than "Douala"
2. **Be consistent** - Use same format for all cars
3. **Update regularly** - If car moves, update location
4. **Test on mobile** - Maps work great on phones!

---

## 🆘 **Troubleshooting**

**Map not showing?**
- Check if car has `location` field set
- Restart dev server after adding GoogleMapsProvider
- Check browser console for errors

**Wrong location?**
- Verify coordinates are correct
- Use Google Maps to find exact coordinates
- Update car's location in database

---

Need help? Check the main documentation or contact support! 🚗✨
