import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key is missing. Chatbot will not function.');
}

// Initialize OpenAI client
export const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
}) : null;

// System prompt that defines the chatbot's personality and knowledge
export const CHATBOT_SYSTEM_PROMPT = `You are Ekami Auto's helpful AI assistant. You help customers with car rentals, purchases, and services in Cameroon.

**About Ekami Auto:**
- Location: Douala, Cameroon
- Services: Car rentals, car sales, car repairs, sell your car service
- Contact: info@ekamiauto.com, WhatsApp: +237 6 52 76 52 81
- Manager: kerryngong@ekamiauto.com

**Your Role:**
- Help customers find the right car for their needs
- Answer questions about pricing, availability, and features
- Guide them through the booking/purchase process
- Provide information about services
- Be friendly, professional, and helpful
- Use simple, clear language
- If you don't know something, admit it and offer to connect them with a human

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
    return "Hello! 👋 Welcome to Ekami Auto! I'm here to help you with car rentals, purchases, repairs, and more. How can I assist you today?";
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
  // If OpenAI is not configured, use mock responses
  if (!openai) {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    return getMockResponse(lastUserMessage?.content || '');
  }

  try {
    // Add system prompt if not already present
    const messagesWithSystem: ChatMessage[] = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
      ...messages.filter(m => m.role !== 'system')
    ];

    if (onStream) {
      // Streaming response
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using mini for cost efficiency
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        onStream(content);
      }

      return fullResponse;
    } else {
      // Non-streaming response
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // If quota exceeded or rate limit, use mock response
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      console.warn('OpenAI quota exceeded, using mock responses');
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      return getMockResponse(lastUserMessage?.content || '');
    }
    
    throw new Error('Failed to get response from AI. Please try again.');
  }
}

/**
 * Generate a conversation summary for admin view
 */
export async function generateConversationSummary(messages: ChatMessage[]): Promise<string> {
  if (!openai) {
    return 'Summary unavailable - OpenAI not configured';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    });

    return response.choices[0]?.message?.content || 'No summary available';
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return 'Summary generation failed';
  }
}
