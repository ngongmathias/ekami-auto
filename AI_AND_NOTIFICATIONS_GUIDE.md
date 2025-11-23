# 🤖 AI Assistant & WhatsApp Notifications Guide

## 📋 Current Status:

### **AI Assistant** ⚠️
- ✅ OpenAI integration exists (`src/lib/openai.ts`)
- ✅ Mock responses work
- ❌ NOT connected to AIChat component
- ❌ NO search integration
- ❌ NO car recommendation logic

### **WhatsApp Notifications** ❌
- ❌ NO admin notifications on bookings
- ❌ NO WhatsApp API integration
- ✅ WhatsApp button exists (manual chat)
- ✅ Customer WhatsApp collected in forms

---

## 🎯 Issue 1: AI Not Redirecting to Search

### **Problem:**
The AI chat (`AIChat.tsx`) uses a placeholder response and doesn't:
1. Use the actual OpenAI API
2. Search the car database
3. Redirect users to search results
4. Recommend specific cars

### **What You Should Ask AI:**

Try these queries to test (once fixed):
```
"Show me SUVs under 50,000 XAF per day"
"I need a family car for 5 people"
"Find automatic transmission cars in Douala"
"Show me luxury cars available this weekend"
"I want to rent a Toyota"
```

### **Expected Behavior:**
AI should:
1. Understand your request
2. Search the database
3. Show you matching cars OR
4. Provide a link to filtered search results

---

## 🎯 Issue 2: No WhatsApp Notifications to Admin

### **Problem:**
When a customer:
- Makes a booking
- Requests a service
- Submits an inquiry
- Makes a purchase inquiry

**Admin does NOT receive:**
- WhatsApp notification
- SMS alert
- Any real-time notification

**Only gets:**
- Email (if Resend is configured)
- Database entry

### **What's Needed:**
WhatsApp Business API integration to send notifications like:
```
🚗 NEW BOOKING!

Customer: John Doe
Car: Toyota Camry 2023
Dates: Dec 1-5, 2024
Phone: +237 6 XX XX XX XX
Amount: 150,000 XAF

View: https://ekamiauto.com/admin/bookings
```

---

## ✅ Solutions:

### **Solution 1: Fix AI Assistant (RECOMMENDED)**

#### **Step 1: Connect AI to OpenAI API**

Update `src/components/ai/AIChat.tsx`:

```typescript
import { sendChatMessage, type ChatMessage } from '../../lib/openai';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Inside component:
const navigate = useNavigate();

const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage: ChatMessage = { role: 'user', content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput('');
  setIsLoading(true);

  try {
    // Get AI response with car search capability
    const response = await sendChatMessage([...messages, userMessage]);
    
    // Check if AI wants to search for cars
    if (response.includes('[SEARCH:')) {
      const searchQuery = response.match(/\[SEARCH:(.*?)\]/)?.[1];
      if (searchQuery) {
        // Redirect to search with filters
        navigate(`/rent?search=${encodeURIComponent(searchQuery)}`);
        return;
      }
    }
    
    const aiResponse: ChatMessage = {
      role: 'assistant',
      content: response
    };
    setMessages((prev) => [...prev, aiResponse]);
  } catch (error) {
    console.error('AI error:', error);
    toast.error('Failed to get response');
  } finally {
    setIsLoading(false);
  }
};
```

#### **Step 2: Enhance AI System Prompt**

Update `src/lib/openai.ts` system prompt to include search instructions:

```typescript
export const CHATBOT_SYSTEM_PROMPT = `You are Ekami Auto's helpful AI assistant...

**Search Integration:**
When a customer asks to see cars or wants recommendations, use this format:
[SEARCH:query] where query contains the filters.

Examples:
- "Show me SUVs" → [SEARCH:category=suv]
- "Cars under 50k per day" → [SEARCH:max_price=50000]
- "Toyota automatic" → [SEARCH:make=Toyota&transmission=automatic]
- "Family cars" → [SEARCH:category=suv,sedan&seats=5+]

After providing [SEARCH:], also give a friendly message like:
"I found some great options for you! Let me show you..."
`;
```

#### **Step 3: Add Car Search Function**

Create `src/lib/aiCarSearch.ts`:

```typescript
import { supabase } from './supabase';

export async function searchCarsForAI(query: string) {
  let dbQuery = supabase
    .from('cars')
    .select('*')
    .eq('status', 'available')
    .eq('availability_status', 'available');

  // Parse query parameters
  const params = new URLSearchParams(query);
  
  if (params.get('category')) {
    dbQuery = dbQuery.eq('category', params.get('category'));
  }
  
  if (params.get('make')) {
    dbQuery = dbQuery.ilike('make', `%${params.get('make')}%`);
  }
  
  if (params.get('transmission')) {
    dbQuery = dbQuery.eq('transmission', params.get('transmission'));
  }
  
  if (params.get('max_price')) {
    dbQuery = dbQuery.lte('price_rent_daily', parseInt(params.get('max_price')!));
  }
  
  const { data, error } = await dbQuery.limit(5);
  
  if (error) throw error;
  return data;
}
```

---

### **Solution 2: Add WhatsApp Notifications**

#### **Option A: WhatsApp Business API (Official)**

**Pros:**
- Official API
- Reliable
- Professional
- Can send templates

**Cons:**
- Requires Facebook Business verification
- Takes 1-2 weeks approval
- ~$0.005-0.01 per message
- Complex setup

**Setup:**
1. Create Facebook Business Account
2. Apply for WhatsApp Business API
3. Get verified
4. Create message templates
5. Integrate API

**Cost:** ~$5-20/month depending on volume

---

#### **Option B: Twilio WhatsApp (EASIEST)** ⭐

**Pros:**
- Quick setup (30 minutes)
- No verification needed for testing
- Good documentation
- Reliable

**Cons:**
- $0.005 per message
- Requires Twilio account

**Setup:**

1. **Sign up for Twilio:**
   https://www.twilio.com/try-twilio

2. **Get WhatsApp Sandbox:**
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to connect your WhatsApp

3. **Install Twilio SDK:**
```bash
npm install twilio
```

4. **Create notification service:**

`src/lib/whatsappNotifications.ts`:
```typescript
import twilio from 'twilio';

const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const whatsappFrom = import.meta.env.VITE_TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'
const adminWhatsApp = '+237652765281'; // Your WhatsApp number

const client = twilio(accountSid, authToken);

export async function sendBookingNotification(booking: any) {
  const message = `
🚗 *NEW BOOKING!*

*Customer:* ${booking.firstName} ${booking.lastName}
*Car:* ${booking.carName}
*Dates:* ${booking.startDate} - ${booking.endDate}
*Phone:* ${booking.phone}
*WhatsApp:* ${booking.whatsapp}
*Amount:* ${booking.totalAmount} XAF

View details: https://ekamiauto.com/admin/bookings
  `.trim();

  try {
    await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${adminWhatsApp}`,
      body: message
    });
    console.log('✅ WhatsApp notification sent');
  } catch (error) {
    console.error('❌ WhatsApp notification failed:', error);
  }
}

export async function sendServiceRequestNotification(request: any) {
  const message = `
🔧 *NEW SERVICE REQUEST!*

*Customer:* ${request.name}
*Service:* ${request.serviceType}
*Car:* ${request.carMake} ${request.carModel}
*Phone:* ${request.phone}
*Issue:* ${request.description}

View: https://ekamiauto.com/admin/services
  `.trim();

  try {
    await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${adminWhatsApp}`,
      body: message
    });
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
  }
}
```

5. **Add to .env:**
```env
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

6. **Use in BookingPage:**
```typescript
import { sendBookingNotification } from '../lib/whatsappNotifications';

const handleBookingSubmit = async (formData: BookingFormData) => {
  // ... existing booking logic ...
  
  // Send WhatsApp notification to admin
  await sendBookingNotification({
    firstName: formData.firstName,
    lastName: formData.lastName,
    carName: `${car.make} ${car.model}`,
    startDate: startDate.toLocaleDateString(),
    endDate: endDate.toLocaleDateString(),
    phone: formData.phone,
    whatsapp: formData.whatsapp,
    totalAmount: totalAmount
  });
};
```

---

#### **Option C: Simple HTTP API (FREE but limited)**

Use a free service like **CallMeBot** or **WA.me links**:

```typescript
export async function sendSimpleWhatsAppNotification(message: string) {
  const adminPhone = '237652765281'; // Without +
  const encodedMessage = encodeURIComponent(message);
  
  // This opens WhatsApp with pre-filled message
  // Admin still needs to click send
  window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');
}
```

**Pros:** Free, instant
**Cons:** Requires manual click to send

---

## 🎯 Recommended Implementation Order:

### **Phase 1: Quick Wins (1-2 hours)**
1. ✅ Fix AI to use OpenAI API
2. ✅ Add basic car search to AI
3. ✅ Test AI with sample queries

### **Phase 2: Notifications (2-3 hours)**
1. ✅ Sign up for Twilio
2. ✅ Set up WhatsApp sandbox
3. ✅ Add notification function
4. ✅ Integrate with booking flow
5. ✅ Test notifications

### **Phase 3: Polish (1 hour)**
1. ✅ Add notifications to all forms
2. ✅ Add notification preferences
3. ✅ Add notification history

---

## 📱 Testing AI Assistant:

Once fixed, try these queries:

**Basic Search:**
- "Show me available cars"
- "I want to rent a car"

**Filtered Search:**
- "Show me SUVs"
- "Find automatic cars"
- "Cars under 50,000 XAF"

**Specific Requests:**
- "I need a Toyota"
- "Show me luxury cars"
- "Family car for 7 people"

**Complex Queries:**
- "I need an automatic SUV under 60k per day"
- "Show me fuel-efficient cars available this weekend"

---

## 🎉 Expected Results:

### **AI Assistant:**
```
You: "Show me SUVs under 50k"
AI: "Great choice! I found 3 SUVs under 50,000 XAF per day. 
     Let me show you..."
     [Redirects to /rent?category=suv&max_price=50000]
```

### **WhatsApp Notifications:**
```
Admin receives on WhatsApp:
🚗 NEW BOOKING!
Customer: John Doe
Car: Toyota Camry 2023
...
```

---

## 💰 Costs:

**AI (OpenAI):**
- GPT-4o-mini: ~$0.15 per 1M input tokens
- ~$0.001 per conversation
- **~$5-10/month** for typical usage

**WhatsApp (Twilio):**
- $0.005 per message
- ~20 bookings/day = $3/month
- **~$5-10/month**

**Total: ~$10-20/month**

---

**Would you like me to implement either or both of these solutions?** 🚀
