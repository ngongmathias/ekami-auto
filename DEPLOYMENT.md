# 🚀 Deployment Guide - Ekami Auto

## Vercel Deployment

### Prerequisites
- ✅ Code pushed to GitHub
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Environment variables ready

### Step 1: Import Project to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**
   - Click "Import Git Repository"
   - Select your GitHub repository: `ekami-auto`
   - Click "Import"

### Step 2: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `yarn build` or `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `yarn install` or `npm install`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add these:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

# Supabase Database
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Payments (optional for now)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Optional Services
VITE_OPENAI_API_KEY=sk-xxxxx
VITE_WHATSAPP_NUMBER=237XXXXXXXXX
VITE_GOOGLE_MAPS_API_KEY=xxxxx
```

**Important:**
- Use your **production** Clerk key (starts with `pk_live_`)
- Use your **production** Supabase keys
- All variables must start with `VITE_` to be exposed to the browser

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://ekami-auto.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `ekamiauto.cm`)
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

---

## 🔧 Post-Deployment Configuration

### Update Clerk Settings

1. Go to **Clerk Dashboard** → **Configure** → **Domains**
2. Add your Vercel domain:
   - Production: `https://ekami-auto.vercel.app`
   - Or your custom domain: `https://ekamiauto.cm`

3. Update redirect URLs:
   - **Sign-in URL**: `https://your-domain.com/sign-in`
   - **Sign-up URL**: `https://your-domain.com/sign-up`
   - **After sign-in**: `https://your-domain.com/`
   - **After sign-up**: `https://your-domain.com/`

### Update Supabase Settings

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `https://your-domain.com`
3. Add redirect URLs:
   - `https://your-domain.com/**`

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds and deploys!
```

### Branch Deployments

- **main branch** → Production deployment
- **Other branches** → Preview deployments

---

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: View traffic, performance
- **Logs**: Check build and runtime logs
- **Speed Insights**: Monitor page load times

### Supabase Dashboard
- **Database**: Monitor queries, connections
- **Auth**: Track user signups, logins
- **Storage**: Monitor file uploads

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check that all dependencies are in `package.json`
- Run `yarn install` locally to verify

**Error: "Environment variable not found"**
- Verify all `VITE_` variables are added in Vercel
- Redeploy after adding variables

### Runtime Errors

**"Clerk not initialized"**
- Check `VITE_CLERK_PUBLISHABLE_KEY` is set
- Verify it's the production key (pk_live_)

**"Supabase connection failed"**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify Supabase project is active (not paused)

**"CORS errors"**
- Add your Vercel domain to Supabase allowed origins
- Update Clerk allowed domains

### Performance Issues

**Slow page loads**
- Enable Vercel Edge Network
- Optimize images (use WebP format)
- Enable caching headers

---

## 🔐 Security Checklist

Before going live:

- ✅ Use production API keys (not test keys)
- ✅ Enable Supabase Row Level Security (RLS)
- ✅ Set up Clerk production instance
- ✅ Configure CORS properly
- ✅ Add custom domain with SSL
- ✅ Enable Vercel password protection (optional)
- ✅ Set up monitoring and alerts

---

## 🎯 Production Checklist

- ✅ All environment variables set
- ✅ Clerk configured with production domain
- ✅ Supabase RLS policies active
- ✅ Custom domain configured (optional)
- ✅ SSL certificate active
- ✅ Analytics enabled
- ✅ Error tracking set up
- ✅ Backup strategy in place

---

## 📱 Testing Production

After deployment, test:

1. **Homepage loads** with real cars from Supabase
2. **Sign up/Sign in** works with Clerk
3. **Dark mode** toggle works
4. **Language switch** EN/FR works
5. **Mobile responsive** design
6. **All pages** accessible
7. **Images** load correctly
8. **No console errors**

---

## 🔄 Rollback

If something goes wrong:

1. Go to **Vercel Dashboard** → **Deployments**
2. Find the last working deployment
3. Click **"..."** → **"Promote to Production"**
4. Instant rollback!

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Your app is now live! 🎉**

Share your URL: `https://ekami-auto.vercel.app`
