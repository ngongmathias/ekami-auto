/**
 * Email Service Configuration
 * 
 * This module handles all email notifications for the application.
 * In production, integrate with a service like Resend, SendGrid, or AWS SES.
 */

// Email configuration
const EMAIL_CONFIG = {
  from: {
    name: 'Ekami Auto',
    email: import.meta.env.VITE_COMPANY_EMAIL || 'info@ekamiauto.com',
  },
  adminEmail: import.meta.env.VITE_MANAGER_EMAIL || 'kerryngong@ekamiauto.com',
  replyTo: import.meta.env.VITE_COMPANY_EMAIL || 'info@ekamiauto.com',
};

// Email types
export interface BookingConfirmationEmail {
  to: string;
  customerName: string;
  bookingId: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface PaymentReceiptEmail {
  to: string;
  customerName: string;
  bookingId: string;
  paymentIntentId: string;
  amount: number;
  paymentMethod: string;
  carName: string;
  receiptUrl?: string;
}

export interface AdminNotificationEmail {
  subject: string;
  message: string;
  bookingId?: string;
  customerEmail?: string;
}

export interface PriceAlertEmail {
  to: string;
  userName: string;
  carMake: string;
  carModel: string;
  carYear: number;
  oldPrice: number;
  newPrice: number;
  priceDrop: number;
  percentageDrop: number;
  carUrl: string;
  unsubscribeUrl?: string;
}

/**
 * Send booking confirmation email to customer
 */
export async function sendBookingConfirmation(data: BookingConfirmationEmail): Promise<boolean> {
  try {
    // In production, call your email service API
    // Example with Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
    //     to: data.to,
    //     subject: `Booking Confirmation - ${data.bookingId}`,
    //     html: generateBookingConfirmationHTML(data),
    //   }),
    // });

    // For now, log to console (development mode)
    console.log('📧 Booking Confirmation Email:', {
      to: data.to,
      subject: `Booking Confirmation - ${data.bookingId}`,
      bookingId: data.bookingId,
      carName: data.carName,
      totalAmount: data.totalAmount,
    });

    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    return false;
  }
}

/**
 * Send payment receipt email to customer
 */
export async function sendPaymentReceipt(data: PaymentReceiptEmail): Promise<boolean> {
  try {
    console.log('📧 Payment Receipt Email:', {
      to: data.to,
      subject: `Payment Receipt - ${data.bookingId}`,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
    });

    return true;
  } catch (error) {
    console.error('Failed to send payment receipt email:', error);
    return false;
  }
}

/**
 * Send notification to admin
 */
export async function sendAdminNotification(data: AdminNotificationEmail): Promise<boolean> {
  try {
    console.log('📧 Admin Notification Email:', {
      to: EMAIL_CONFIG.adminEmail,
      subject: data.subject,
      message: data.message,
    });

    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

/**
 * Send price drop alert email to user
 */
export async function sendPriceAlert(data: PriceAlertEmail): Promise<boolean> {
  try {
    // In production with Resend API:
    // const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
    // if (!RESEND_API_KEY) {
    //   console.warn('Resend API key not configured');
    //   return false;
    // }
    //
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'Ekami Auto <alerts@resend.dev>', // or alerts@ekamiauto.com when DNS is ready
    //     to: data.to,
    //     subject: `🔔 Price Drop Alert: ${data.carMake} ${data.carModel}`,
    //     html: generatePriceAlertHTML(data),
    //   }),
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`Resend API error: ${response.statusText}`);
    // }

    // For now, log to console (development mode)
    console.log('📧 Price Alert Email:', {
      to: data.to,
      subject: `🔔 Price Drop Alert: ${data.carMake} ${data.carModel}`,
      oldPrice: data.oldPrice,
      newPrice: data.newPrice,
      priceDrop: data.priceDrop,
      percentageDrop: data.percentageDrop,
    });

    return true;
  } catch (error) {
    console.error('Failed to send price alert email:', error);
    return false;
  }
}

/**
 * Generate HTML for booking confirmation email
 */
function generateBookingConfirmationHTML(data: BookingConfirmationEmail): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; }
    .total { font-size: 24px; font-weight: bold; color: #D4AF37; text-align: right; margin-top: 20px; }
    .button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <p>Thank you for choosing Ekami Auto</p>
    </div>
    
    <div class="content">
      <p>Dear ${data.customerName},</p>
      
      <p>Your booking has been confirmed! Here are your reservation details:</p>
      
      <div class="booking-details">
        <div class="detail-row">
          <span class="detail-label">Booking Reference:</span>
          <span class="detail-value"><strong>#${data.bookingId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Vehicle:</span>
          <span class="detail-value">${data.carName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pick-up Date:</span>
          <span class="detail-value">${data.startDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Drop-off Date:</span>
          <span class="detail-value">${data.endDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pick-up Location:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Drop-off Location:</span>
          <span class="detail-value">${data.dropoffLocation}</span>
        </div>
        
        <div class="total">
          Total: ${data.totalAmount.toLocaleString()} XAF
        </div>
      </div>
      
      <h3>What's Next?</h3>
      <ol>
        <li>Check your email for the payment receipt</li>
        <li>Bring your driver's license and ID on pick-up day</li>
        <li>Arrive at the pick-up location during business hours (9 AM - 6 PM)</li>
      </ol>
      
      <center>
        <a href="https://wa.me/237652765281?text=Hi,%20I%20have%20a%20question%20about%20booking%20${data.bookingId}" class="button">
          Contact Support on WhatsApp
        </a>
      </center>
      
      <div class="footer">
        <p>Ekami Auto - Luxury Car Rental & Sales</p>
        <p>📞 +237 6 52 76 52 81 | 📧 info@ekamiauto.com</p>
        <p>Douala, Cameroon</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for payment receipt email
 */
function generatePaymentReceiptHTML(data: PaymentReceiptEmail): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 28px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Successful!</h1>
      <p>Your payment has been processed</p>
    </div>
    
    <div class="content">
      <p>Dear ${data.customerName},</p>
      
      <p>Thank you for your payment. Here is your receipt:</p>
      
      <div class="receipt">
        <div class="detail-row">
          <span>Booking Reference:</span>
          <span><strong>#${data.bookingId}</strong></span>
        </div>
        <div class="detail-row">
          <span>Payment ID:</span>
          <span>${data.paymentIntentId}</span>
        </div>
        <div class="detail-row">
          <span>Vehicle:</span>
          <span>${data.carName}</span>
        </div>
        <div class="detail-row">
          <span>Payment Method:</span>
          <span>${data.paymentMethod}</span>
        </div>
        
        <div class="total">
          ${data.amount.toLocaleString()} XAF
        </div>
      </div>
      
      <p>A copy of this receipt has been saved to your account.</p>
      
      <div class="footer">
        <p>Ekami Auto - Luxury Car Rental & Sales</p>
        <p>📞 +237 6 52 76 52 81 | 📧 info@ekamiauto.com</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for price alert email
 */
function generatePriceAlertHTML(data: PriceAlertEmail): string {
  const savings = data.priceDrop.toLocaleString();
  const percentOff = Math.round(data.percentageDrop);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Drop Alert</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .header p { margin: 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 40px 30px; }
    .alert-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
    .car-info { background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #D4AF37; }
    .car-name { font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0 0 15px 0; }
    .price-comparison { display: flex; justify-content: space-around; align-items: center; margin: 30px 0; padding: 25px; background: #f0fdf4; border-radius: 12px; }
    .price-box { text-align: center; flex: 1; }
    .price-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .old-price { font-size: 20px; color: #999; text-decoration: line-through; }
    .new-price { font-size: 32px; font-weight: bold; color: #10B981; }
    .arrow { font-size: 32px; color: #10B981; flex: 0 0 40px; }
    .savings-box { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; }
    .savings-amount { font-size: 36px; font-weight: bold; margin: 10px 0; }
    .savings-label { font-size: 14px; opacity: 0.95; }
    .cta-button { display: inline-block; background: #D4AF37; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; transition: background 0.3s; }
    .cta-button:hover { background: #C5A028; }
    .features { margin: 25px 0; }
    .feature { padding: 12px 0; border-bottom: 1px solid #eee; }
    .feature:last-child { border-bottom: none; }
    .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 13px; }
    .footer a { color: #D4AF37; text-decoration: none; }
    .unsubscribe { margin-top: 20px; font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🔔 Price Drop Alert!</h1>
      <p>The car you're watching just got cheaper</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="alert-badge">
        ⚡ ${percentOff}% OFF - Limited Time
      </div>
      
      <p>Hi ${data.userName},</p>
      
      <p>Great news! The price for the car you're interested in has dropped:</p>
      
      <!-- Car Info -->
      <div class="car-info">
        <h2 class="car-name">${data.carMake} ${data.carModel} (${data.carYear})</h2>
      </div>
      
      <!-- Price Comparison -->
      <div class="price-comparison">
        <div class="price-box">
          <div class="price-label">Was</div>
          <div class="old-price">${data.oldPrice.toLocaleString()} XAF</div>
        </div>
        <div class="arrow">→</div>
        <div class="price-box">
          <div class="price-label">Now</div>
          <div class="new-price">${data.newPrice.toLocaleString()} XAF</div>
        </div>
      </div>
      
      <!-- Savings -->
      <div class="savings-box">
        <div class="savings-label">YOU SAVE</div>
        <div class="savings-amount">${savings} XAF</div>
        <div class="savings-label">(${percentOff}% discount)</div>
      </div>
      
      <p style="font-size: 16px; text-align: center; margin: 30px 0;">
        <strong>Don't miss out!</strong> This price won't last forever.
      </p>
      
      <!-- CTA Button -->
      <center>
        <a href="${data.carUrl}" class="cta-button">
          🚗 View Car Details
        </a>
      </center>
      
      <div class="features">
        <div class="feature">✅ Verified and inspected</div>
        <div class="feature">✅ Flexible rental terms</div>
        <div class="feature">✅ 24/7 customer support</div>
        <div class="feature">✅ Free delivery in Douala</div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Ekami Auto</strong> - Luxury Car Rental & Sales</p>
      <p>📞 +237 6 52 76 52 81 | 📧 <a href="mailto:info@ekamiauto.com">info@ekamiauto.com</a></p>
      <p>Douala, Cameroon</p>
      
      <div class="unsubscribe">
        <p>You're receiving this because you subscribed to price alerts for this car.</p>
        ${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}">Unsubscribe from this alert</a></p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Export email templates for use in other modules
export const emailTemplates = {
  bookingConfirmation: generateBookingConfirmationHTML,
  paymentReceipt: generatePaymentReceiptHTML,
  priceAlert: generatePriceAlertHTML,
};
