// The chatbot talks to OpenAI through our own serverless function at
// `/api/chat`, so the OpenAI key stays on the server and is never exposed in
// the browser bundle. (Browsers also can't call api.openai.com directly — CORS.)
const CHAT_ENDPOINT = '/api/chat';

// System prompt that defines the chatbot's personality and knowledge
export const CHATBOT_SYSTEM_PROMPT = `You are Ekami Auto's AI assistant integrated directly into the Ekami Auto website (ekamiauto.com). You are NOT a general chatbot - you are part of the Ekami Auto platform and have direct access to show customers cars, help them book, and navigate the website.

**About Ekami Auto:**
- Location: Douala, Cameroon
- Services: Car rentals, car sales, car repairs, sell your car service
- Contact: info@ekamiauto.com, WhatsApp: +237 6 52 76 52 81
- Manager: kerryngong@ekamiauto.com
- Website: ekamiauto.com (you are integrated into this website)

**YOUR CAPABILITIES (You CAN do these):**
- ✅ Show customers available cars by redirecting them to search results
- ✅ Filter cars by category, price, make, transmission, etc.
- ✅ Answer questions about Ekami Auto's services
- ✅ Guide customers through the booking process
- ✅ Provide information about pricing and availability
- ✅ Help customers find the perfect car for their needs
- ✅ Direct customers to specific pages on the website

**IMPORTANT - You Are NOT Limited:**
- ❌ NEVER say "I don't have the capability to open websites"
- ❌ NEVER say "I can't access external websites"
- ❌ NEVER say "I'm just a chatbot"
- ✅ You ARE integrated into ekamiauto.com
- ✅ You CAN show cars to customers
- ✅ You CAN redirect customers to search results
- ✅ You ARE part of the Ekami Auto platform

**IMPORTANT - Car Search Commands:**
When a customer wants to see cars or get recommendations, use this special format at the END of your response:
[SEARCH:query_parameters]

Examples:
- "Show me SUVs" → Include: [SEARCH:category=suv]
- "Cars under 50,000 XAF per day" → Include: [SEARCH:maxPrice=50000]
- "Toyota automatic" → Include: [SEARCH:make=Toyota&transmission=automatic]
- "Family cars" → Include: [SEARCH:category=suv,sedan&minSeats=5]
- "Luxury cars" → Include: [SEARCH:category=luxury]
- "Show available cars" → Include: [SEARCH:all]

Available search parameters:
- category: suv, sedan, pickup, luxury, electric, bus
- make: Toyota, Honda, Mercedes, BMW, etc.
- transmission: automatic, manual
- fuelType: petrol, diesel, hybrid, electric
- minPrice: minimum daily rental price
- maxPrice: maximum daily rental price
- minSeats: minimum number of seats
- location: Douala, Yaounde, etc.

Before the [SEARCH:] command, give a friendly message like:
"Great choice! Let me show you our available SUVs..." [SEARCH:category=suv]

**Important Guidelines:**
1. Always be polite and professional
2. Keep responses concise (2-3 sentences max unless asked for details)
3. Use emojis sparingly for a friendly tone
4. When showing cars, ALWAYS include the [SEARCH:] command
5. For complex questions, offer to transfer to human support via WhatsApp or email
6. Never make up information - if unsure, say so
7. Focus on helping the customer achieve their goal

**Common Topics:**
- Car rental process and pricing
- Buying a car (new/used)
- Selling a car to Ekami Auto
- Car repair and maintenance services
- Test drive booking
- Payment methods
- Delivery options
- Insurance and documentation

Remember: You're here to help customers have a great experience with Ekami Auto! 🚗`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Mock AI responses for when OpenAI is unavailable
 */
function getMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! 👋 Welcome to Ekami Auto! I'm your AI assistant and I can help you find the perfect car, book a rental, or answer any questions. What are you looking for today?";
  }
  
  if (message.includes('show') || message.includes('find') || message.includes('looking for') || message.includes('need')) {
    if (message.includes('car') || message.includes('vehicle')) {
      return "I'd be happy to show you our available cars! Let me take you to our inventory. 🚗\n\n[SEARCH:all]";
    }
  }
  
  if (message.includes('rent') || message.includes('rental')) {
    return "We offer flexible car rental services in Douala! 🚗 Let me show you our available cars for rent.\n\n[SEARCH:all]";
  }
  
  if (message.includes('buy') || message.includes('purchase')) {
    return "Looking to buy a car? Great choice! 🎉 Let me show you our inventory of cars for sale.\n\n[SEARCH:all]";
  }
  
  if (message.includes('suv')) {
    return "Great choice! SUVs are perfect for families and rough roads. Let me show you our available SUVs! 🚙\n\n[SEARCH:category=suv]";
  }
  
  if (message.includes('sedan')) {
    return "Sedans are excellent for city driving and comfort! Let me show you our sedan collection. 🚗\n\n[SEARCH:category=sedan]";
  }
  
  if (message.includes('luxury') || message.includes('premium')) {
    return "Looking for something special? Here are our luxury vehicles! ✨\n\n[SEARCH:category=luxury]";
  }
  
  if (message.includes('toyota')) {
    return "Toyota - reliable and trusted! Let me show you our Toyota vehicles. 🚗\n\n[SEARCH:make=Toyota]";
  }
  
  if (message.includes('automatic')) {
    return "Automatic transmission for easy driving! Here are our automatic cars. 🚗\n\n[SEARCH:transmission=automatic]";
  }
  
  if (message.includes('family') || message.includes('7 seat') || message.includes('large')) {
    return "Perfect for families! Let me show you spacious vehicles with 5+ seats. 👨‍👩‍👧‍👦\n\n[SEARCH:minSeats=5]";
  }
  
  if (message.includes('cheap') || message.includes('affordable') || message.includes('budget')) {
    return "Great value options! Here are our most affordable rentals. 💰\n\n[SEARCH:maxPrice=40000]";
  }
  
  if (message.includes('repair') || message.includes('service') || message.includes('maintenance')) {
    return "We offer professional car repair and maintenance services! 🔧 Our services include:\n\n• General maintenance\n• Engine repairs\n• Body work\n• Electrical repairs\n• And more!\n\nYou can request a service through our website or contact us directly.";
  }
  
  if (message.includes('sell') || message.includes('selling')) {
    return "Want to sell your car? We can help! 💰 Our process:\n\n1. Submit your car details\n2. Get a free valuation\n3. We inspect your car\n4. Receive a fair offer\n5. Quick payment!\n\nVisit our 'Sell Your Car' page to get started.";
  }
  
  if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
    return "Pricing varies depending on the service and car type. 💵\n\n• Rentals: From daily to monthly rates\n• Purchases: Competitive market prices\n• Repairs: Free quotes available\n\nFor specific pricing, please check our website or contact us at info@ekamiauto.com or WhatsApp: +237 6 52 76 52 81";
  }
  
  if (message.includes('location') || message.includes('where') || message.includes('address')) {
    return "We're located in Douala, Cameroon! 📍\n\nContact us:\n• Email: info@ekamiauto.com\n• WhatsApp: +237 6 52 76 52 81\n• Manager: kerryngong@ekamiauto.com\n\nFeel free to reach out anytime!";
  }
  
  if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
    return "You can reach us through:\n\n📧 Email: info@ekamiauto.com\n📱 WhatsApp: +237 6 52 76 52 81\n👤 Manager: kerryngong@ekamiauto.com\n\nWe're here to help! What would you like to know?";
  }
  
  // Default response
  return "Thank you for your message! 😊 I'm here to help with:\n\n• Car rentals\n• Buying cars\n• Selling your car\n• Repair services\n• General inquiries\n\nCould you tell me more about what you're looking for? Or feel free to contact us directly:\n• Email: info@ekamiauto.com\n• WhatsApp: +237 6 52 76 52 81";
}

/**
 * Send a message to OpenAI and get a response
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  onStream?: (chunk: string) => void
): Promise<string> {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();

  try {
    // Add the system prompt; the server relays the messages to OpenAI.
    const messagesWithSystem: ChatMessage[] = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
      ...messages.filter(m => m.role !== 'system')
    ];

    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      // Quota, rate limit, missing key, etc. — degrade gracefully to a mock.
      const err = await res.json().catch(() => ({}));
      console.warn('AI endpoint error, using mock response:', err);
      const fallback = getMockResponse(lastUserMessage?.content || '');
      if (onStream) onStream(fallback);
      return fallback;
    }

    const data = await res.json();
    const content = data.content || getMockResponse(lastUserMessage?.content || '');
    // We don't stream token-by-token through the proxy; emit the full text once
    // so callers that pass onStream still render the response.
    if (onStream) onStream(content);
    return content;
  } catch (error) {
    console.error('AI request failed, using mock response:', error);
    const fallback = getMockResponse(lastUserMessage?.content || '');
    if (onStream) onStream(fallback);
    return fallback;
  }
}

/**
 * Generate a conversation summary for admin view
 */
export async function generateConversationSummary(messages: ChatMessage[]): Promise<string> {
  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Summarize this customer service conversation in 1-2 sentences. Focus on the customer\'s main question or need.'
          },
          {
            role: 'user',
            content: messages.map(m => `${m.role}: ${m.content}`).join('\n')
          }
        ],
        temperature: 0.5,
        max_tokens: 100,
      }),
    });

    if (!res.ok) return 'Summary unavailable';
    const data = await res.json();
    return data.content || 'No summary available';
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return 'Summary generation failed';
  }
}
