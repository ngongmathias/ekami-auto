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

// Export email templates for use in other modules
export const emailTemplates = {
  bookingConfirmation: generateBookingConfirmationHTML,
  paymentReceipt: generatePaymentReceiptHTML,
};
