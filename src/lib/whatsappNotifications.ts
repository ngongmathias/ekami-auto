// WhatsApp Notifications using Twilio
// Setup: https://www.twilio.com/docs/whatsapp/quickstart

const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = import.meta.env.VITE_TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const ADMIN_WHATSAPP = '+237652765281'; // Admin WhatsApp number

// Check if Twilio is configured
const isTwilioConfigured = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN;

if (!isTwilioConfigured) {
  console.warn('⚠️  Twilio WhatsApp not configured. Notifications will be logged only.');
  console.warn('Add VITE_TWILIO_ACCOUNT_SID and VITE_TWILIO_AUTH_TOKEN to .env');
}

/**
 * Send WhatsApp notification via Twilio API
 * Note: This is a client-side implementation for development.
 * For production, move this to a serverless function or backend API.
 */
async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  if (!isTwilioConfigured) {
    console.log('📱 WhatsApp Notification (Mock):', { to, body });
    return false;
  }

  try {
    // Create Basic Auth header
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    // Send message
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_FROM,
        To: `whatsapp:${to}`,
        Body: body,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Twilio API error:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ WhatsApp notification sent:', data.sid);
    return true;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp notification:', error);
    return false;
  }
}

/**
 * Send booking notification to admin
 */
export async function sendBookingNotification(booking: {
  firstName: string;
  lastName: string;
  carName: string;
  startDate: string;
  endDate: string;
  phone: string;
  whatsapp: string;
  totalAmount: number;
  pickupLocation?: string;
}): Promise<void> {
  const message = `
🚗 *NEW BOOKING!*

*Customer:* ${booking.firstName} ${booking.lastName}
*Car:* ${booking.carName}
*Dates:* ${booking.startDate} - ${booking.endDate}
*Pickup:* ${booking.pickupLocation || 'Not specified'}

*Contact:*
📞 Phone: ${booking.phone}
📱 WhatsApp: ${booking.whatsapp}

*Amount:* ${booking.totalAmount.toLocaleString()} XAF

View details: https://ekamiauto.com/admin/bookings
  `.trim();

  await sendTwilioMessage(ADMIN_WHATSAPP, message);
}

/**
 * Send service request notification to admin
 */
export async function sendServiceRequestNotification(request: {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  carMake?: string;
  carModel?: string;
  description: string;
}): Promise<void> {
  const message = `
🔧 *NEW SERVICE REQUEST!*

*Customer:* ${request.name}
*Service:* ${request.serviceType}
${request.carMake ? `*Car:* ${request.carMake} ${request.carModel || ''}` : ''}

*Contact:*
📧 ${request.email}
📞 ${request.phone}

*Issue:*
${request.description}

View: https://ekamiauto.com/admin/services
  `.trim();

  await sendTwilioMessage(ADMIN_WHATSAPP, message);
}

/**
 * Send purchase inquiry notification to admin
 */
export async function sendPurchaseInquiryNotification(inquiry: {
  name: string;
  email: string;
  phone: string;
  carName: string;
  message: string;
}): Promise<void> {
  const message = `
💰 *NEW PURCHASE INQUIRY!*

*Customer:* ${inquiry.name}
*Interested in:* ${inquiry.carName}

*Contact:*
📧 ${inquiry.email}
📞 ${inquiry.phone}

*Message:*
${inquiry.message}

View: https://ekamiauto.com/admin/inquiries
  `.trim();

  await sendTwilioMessage(ADMIN_WHATSAPP, message);
}

/**
 * Send sell car request notification to admin
 */
export async function sendSellCarNotification(request: {
  name: string;
  email: string;
  phone: string;
  carMake: string;
  carModel: string;
  year: number;
  mileage: number;
  condition: string;
  askingPrice: number;
}): Promise<void> {
  const message = `
🚙 *NEW CAR FOR SALE!*

*Seller:* ${request.name}
*Car:* ${request.year} ${request.carMake} ${request.carModel}
*Mileage:* ${request.mileage.toLocaleString()} km
*Condition:* ${request.condition}
*Asking Price:* ${request.askingPrice.toLocaleString()} XAF

*Contact:*
📧 ${request.email}
📞 ${request.phone}

View: https://ekamiauto.com/admin/sell-requests
  `.trim();

  await sendTwilioMessage(ADMIN_WHATSAPP, message);
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormNotification(contact: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const message = `
📧 *NEW CONTACT MESSAGE!*

*From:* ${contact.name}
*Subject:* ${contact.subject}

*Contact:*
📧 ${contact.email}
${contact.phone ? `📞 ${contact.phone}` : ''}

*Message:*
${contact.message}

Reply via email or phone.
  `.trim();

  await sendTwilioMessage(ADMIN_WHATSAPP, message);
}

/**
 * Send test notification (for setup verification)
 */
export async function sendTestNotification(): Promise<boolean> {
  const message = `
✅ *TEST NOTIFICATION*

Ekami Auto WhatsApp notifications are working!

This is a test message from your website.
  `.trim();

  return await sendTwilioMessage(ADMIN_WHATSAPP, message);
}
