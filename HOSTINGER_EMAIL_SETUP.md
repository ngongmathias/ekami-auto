# 📧 Hostinger + Resend Email Setup Guide

## Current Status
- ✅ DKIM verified (resend._domainkey)
- ❌ SPF record failed
- ❌ MX record failed

---

## 🔧 Fix Instructions

### **Step 1: Add MX Record**

Go to **Hostinger DNS Zone Editor** and add:

```
Type: MX
Name: send (or send.ekamiauto.com)
Points to: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: Auto or 14400
```

**Important Notes:**
- Some DNS providers require the full subdomain: `send.ekamiauto.com`
- If "send" doesn't work, try `send.ekamiauto.com` in the Name field
- Make sure there's no trailing dot

---

### **Step 2: Add SPF Record**

Add this TXT record:

```
Type: TXT
Name: send (or send.ekamiauto.com)
Content: v=spf1 include:amazonses.com ~all
TTL: Auto or 14400
```

**Important Notes:**
- The content must be EXACTLY: `v=spf1 include:amazonses.com ~all`
- No quotes unless Hostinger requires them
- Some providers auto-add quotes, some don't

---

### **Step 3: Hostinger-Specific Instructions**

#### **Option A: Using Subdomain (Recommended)**

1. Go to Hostinger → Domains → ekamiauto.com → DNS Zone
2. Click "Add Record"
3. For MX Record:
   - Type: `MX`
   - Name: `send` (Hostinger will auto-append .ekamiauto.com)
   - Points to: `feedback-smtp.us-east-1.amazonses.com`
   - Priority: `10`
   - TTL: `14400` (4 hours)

4. For SPF TXT Record:
   - Type: `TXT`
   - Name: `send`
   - Content: `v=spf1 include:amazonses.com ~all`
   - TTL: `14400`

#### **Option B: If Subdomain Doesn't Work**

Try using the full domain path:
- Name: `send.ekamiauto.com` (with the full domain)

---

### **Step 4: Verify in Resend**

After adding records:
1. Wait 5-10 minutes for DNS propagation
2. Go to Resend Dashboard → Domains
3. Click "Verify" next to each record
4. All should show ✅ green checkmarks

---

## 🎯 Alternative: Use Root Domain (Simpler)

If subdomain is causing issues, you can send from the root domain:

### **Root Domain Setup:**

1. **MX Record:**
   ```
   Type: MX
   Name: @ (or leave empty for root)
   Points to: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   ```

2. **SPF Record:**
   ```
   Type: TXT
   Name: @ (or leave empty for root)
   Content: v=spf1 include:amazonses.com ~all
   ```

**⚠️ Warning:** This will affect your main domain's email. Only do this if:
- You don't use email@ekamiauto.com for other purposes
- OR you're okay with Resend handling all emails

---

## 🚀 Quick Fix: Use Resend's Default Domain (For Now)

**If DNS is too complicated right now:**

You can send emails from Resend's default domain while testing:
- From: `noreply@resend.dev` or `alerts@resend.dev`
- This works immediately, no DNS needed
- 100 emails/day free
- Good for testing

### **To Use Default Domain:**

In your email code, use:
```javascript
from: 'Ekami Auto <alerts@resend.dev>'
```

Later, once DNS is sorted, switch to:
```javascript
from: 'Ekami Auto <alerts@ekamiauto.com>'
```

---

## 🔍 Troubleshooting

### **DNS Not Propagating:**
- Wait 15-30 minutes
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Check with: https://mxtoolbox.com/SuperTool.aspx

### **Hostinger-Specific Issues:**

1. **"Name" field confusion:**
   - Try: `send`
   - If fails, try: `send.ekamiauto.com`
   - If fails, try: `send.ekamiauto.com.` (with trailing dot)

2. **Content field for TXT:**
   - Hostinger might auto-add quotes
   - Enter: `v=spf1 include:amazonses.com ~all`
   - NOT: `"v=spf1 include:amazonses.com ~all"`

3. **MX Priority:**
   - Must be a number: `10`
   - NOT: `10 feedback-smtp...`

---

## 📋 Current DNS Records Needed

| Type | Name | Content/Points To | Priority | Status |
|------|------|-------------------|----------|--------|
| TXT | resend._domainkey | (Resend provides) | - | ✅ Verified |
| MX | send | feedback-smtp.us-east-1.amazonses.com | 10 | ❌ Add this |
| TXT | send | v=spf1 include:amazonses.com ~all | - | ❌ Add this |

---

## 💡 Recommendation

**For immediate testing:**
1. Use Resend's default domain (`alerts@resend.dev`)
2. Test the price alert feature
3. Fix DNS later when you have time

**For production:**
1. Fix DNS records properly
2. Use your domain (`alerts@ekamiauto.com`)
3. Looks more professional

---

## 🎯 Next Steps

1. **Option 1 (Quick):** Use Resend default domain for now
2. **Option 2 (Proper):** Fix DNS records in Hostinger
3. Test price alerts
4. Deploy to production

---

**Need help with Hostinger DNS?** I can guide you through the exact steps! 🚀
