# 🚀 Ekami Auto - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **1. Environment Variables**
Make sure you have all these set up:

- [ ] `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe payments
- [ ] `VITE_RESEND_API_KEY` - Email notifications
- [ ] `VITE_GOOGLE_MAPS_API_KEY` - Google Maps integration
- [ ] `VITE_WHATSAPP_NUMBER` - WhatsApp contact (237652765281)
- [ ] `VITE_COMPANY_EMAIL` - info@ekamiauto.com
- [ ] `VITE_MANAGER_EMAIL` - kerryngong@ekamiauto.com
- [ ] `VITE_ADMIN_EMAILS` - Admin access emails
- [ ] `VITE_GA4_MEASUREMENT_ID` - Google Analytics 4 (optional)

### ✅ **2. Database Setup**
- [ ] All migrations run in Supabase
- [ ] RLS policies configured
- [ ] Storage bucket created (`cars`)
- [ ] Storage policies set up
- [ ] Test data added (cars, blog posts)

### ✅ **3. Third-Party Services**
- [ ] Clerk project created (production)
- [ ] Stripe account set up (production keys)
- [ ] Resend API configured
- [ ] Supabase project (production)

---

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended)** ⭐

**Why Vercel?**
- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Built-in CDN
- ✅ Easy environment variables
- ✅ Custom domain support

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Phase 2 complete"
   git branch -M main
   git remote add origin https://github.com/yourusername/ekami-auto.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - Framework Preset: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env`
   - Make sure to use **production** keys for:
     - Clerk (production publishable key)
     - Stripe (production publishable key)
     - Supabase (production URL & anon key)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at `your-project.vercel.app`

5. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your domain (e.g., `ekamiauto.com`)
   - Follow DNS configuration instructions

---

### **Option 2: Netlify**

**Steps:**

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Environment Variables**
   - Site settings → Environment variables
   - Add all variables from `.env`

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `your-project.netlify.app`

---

### **Option 3: Self-Hosted (VPS)**

**Requirements:**
- Ubuntu 20.04+ server
- Node.js 18+
- Nginx
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload to Server**
   ```bash
   scp -r dist/* user@your-server:/var/www/ekamiauto
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name ekamiauto.com;
       root /var/www/ekamiauto;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d ekamiauto.com
   ```

---

## 🔧 Post-Deployment Configuration

### **1. Clerk Production Setup**
- Go to Clerk Dashboard
- Create production instance
- Update allowed domains:
  - Add your production domain
  - Add Vercel/Netlify domain
- Copy production publishable key
- Update `VITE_CLERK_PUBLISHABLE_KEY` in Vercel/Netlify

### **2. Supabase Production**
- Go to Supabase Dashboard
- Create production project (or use existing)
- Run all migrations:
  - Copy SQL from `supabase/migrations/` folder
  - Run in SQL Editor
- Set up storage:
  - Create `cars` bucket
  - Set public access policies
- Update environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### **3. Stripe Production**
- Go to Stripe Dashboard
- Switch to "Live mode"
- Get production publishable key
- Update `VITE_STRIPE_PUBLISHABLE_KEY`
- Set up webhooks (if using)

### **4. Domain Configuration**
If using custom domain (ekamiauto.com):

**DNS Records:**
```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

**SSL Certificate:**
- Automatically handled by Vercel/Netlify
- Or use Let's Encrypt for self-hosted

---

## ✅ Testing Checklist

After deployment, test these features:

### **Core Features:**
- [ ] Homepage loads correctly
- [ ] Car listings display
- [ ] Car detail pages work
- [ ] Search and filters work
- [ ] Sign in/Sign up works
- [ ] User dashboard accessible

### **Booking & Payments:**
- [ ] Book a car (rental)
- [ ] Payment flow works
- [ ] Booking confirmation email received
- [ ] Booking appears in user dashboard
- [ ] Admin sees booking in dashboard

### **Purchase Flow:**
- [ ] Buy a car flow
- [ ] Financing calculator works
- [ ] Purchase request submitted
- [ ] Admin receives notification
- [ ] Request appears in admin dashboard

### **Sell Your Car:**
- [ ] Multi-step wizard works
- [ ] Image upload works
- [ ] Price estimator calculates
- [ ] Request submitted successfully
- [ ] Admin sees sell request

### **Repairs Service:**
- [ ] Service request form works
- [ ] Request submitted
- [ ] Admin receives notification
- [ ] Request appears in admin panel

### **Blog & Comments:**
- [ ] Blog posts display
- [ ] Blog post detail page works
- [ ] Comments can be posted
- [ ] Comments appear immediately
- [ ] Likes work
- [ ] Replies work

### **Admin Dashboard:**
- [ ] Admin can access dashboard
- [ ] All tabs work (Cars, Bookings, Purchases, etc.)
- [ ] Can manage bookings
- [ ] Can moderate comments
- [ ] Can view sell requests

### **Comparison:**
- [ ] Can add cars to compare
- [ ] Comparison table displays
- [ ] Can share comparison
- [ ] Compare button works on car pages

---

## 📊 Monitoring & Analytics

### **1. Set Up Analytics**
Add Google Analytics 4:
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### **2. Error Tracking**
Consider adding Sentry:
```bash
npm install @sentry/react
```

### **3. Performance Monitoring**
- Use Vercel Analytics (built-in)
- Or Google PageSpeed Insights
- Monitor Core Web Vitals

---

## 🔒 Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] Supabase RLS policies enabled
- [ ] Admin emails configured correctly
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured properly
- [ ] Rate limiting on API endpoints (if applicable)

---

## 🚨 Troubleshooting

### **Issue: Environment variables not working**
- Make sure to redeploy after adding env vars
- Check variable names match exactly (case-sensitive)
- Restart build if needed

### **Issue: Clerk authentication fails**
- Check allowed domains in Clerk dashboard
- Verify production publishable key
- Clear browser cache

### **Issue: Supabase connection fails**
- Verify URL and anon key
- Check if project is paused (free tier)
- Verify RLS policies allow access

### **Issue: Images not loading**
- Check Supabase storage bucket is public
- Verify storage policies
- Check CORS configuration

### **Issue: Payments not working**
- Verify using production Stripe keys
- Check webhook configuration
- Test in Stripe test mode first

---

## 📞 Support

**Need Help?**
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Clerk: https://clerk.com/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs

---

## 🎉 Launch Checklist

Before announcing your launch:

- [ ] All features tested in production
- [ ] Admin accounts created
- [ ] Sample cars added
- [ ] Blog posts published
- [ ] Contact information verified
- [ ] Social media links added
- [ ] Analytics configured
- [ ] Error tracking set up
- [ ] Backup strategy in place
- [ ] Domain configured (if custom)
- [ ] SSL certificate active
- [ ] Mobile responsive verified
- [ ] Performance optimized
- [ ] SEO meta tags added

---

## 🚀 Ready to Deploy!

**Recommended Deployment Path:**
1. ✅ Push code to GitHub
2. ✅ Deploy to Vercel (easiest)
3. ✅ Configure environment variables
4. ✅ Test all features
5. ✅ Add custom domain (optional)
6. ✅ Set up analytics
7. ✅ Launch! 🎉

**Estimated Time:** 30-60 minutes

Good luck with your launch! 🚀
