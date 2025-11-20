# 🚀 Deployment Instructions

## Quick Deploy to Netlify

### Option 1: Via Netlify Dashboard (Easiest)

1. **Go to:** https://app.netlify.com/
2. **Click:** "Add new site" → "Import an existing project"
3. **Connect:** Your Git repository (GitHub/GitLab/Bitbucket)
4. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. **Environment Variables:** Add these in Site settings → Environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RESEND_API_KEY`
   - `VITE_MANAGER_EMAIL`
   - `VITE_ADMIN_EMAILS`
   - All other env vars from your `.env` file
6. **Deploy!**

### Option 2: Via CLI (Current Method)

In the terminal where it's asking:
1. Select: `+  Create & configure a new project`
2. Choose your team
3. Enter site name: `ekami-auto-cars` (or leave blank)
4. Confirm build settings

### After Deployment

1. **Test the site** at the provided URL
2. **Submit a service request** to test email functionality
3. **Check Resend dashboard** for sent emails

## 📧 Email Function

The email function at `netlify/functions/send-service-email.ts` will automatically work once deployed!

## ✅ What's Deployed

- ✅ Full Ekami Auto website
- ✅ Repairs & Services feature
- ✅ Service request form
- ✅ Customer dashboard
- ✅ Email notification function
- ✅ All environment variables

## 🔧 Troubleshooting

If emails don't work:
1. Check Netlify Functions logs
2. Verify `VITE_RESEND_API_KEY` is set
3. Check Resend dashboard for errors
