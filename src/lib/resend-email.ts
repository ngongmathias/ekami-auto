/**
 * Resend Email Integration
 * Production-ready email service using Resend API
 */

import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

const FROM_EMAIL = 'Ekami Auto <onboarding@resend.dev>'; // Change to your verified domain
const ADMIN_EMAIL = 'kerryngong@ekamiauto.com';

export interface SendBookingConfirmationParams {
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

export interface SendPaymentReceiptParams {
  to: string;
  customerName: string;
  bookingId: string;
  paymentIntentId: string;
  amount: number;
  paymentMethod: string;
  carName: string;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(params: SendBookingConfirmationParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `🎉 Booking Confirmed - ${params.bookingId}`,
      html: generateBookingConfirmationHTML(params),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('✅ Booking confirmation sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(params: SendPaymentReceiptParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `✅ Payment Receipt - ${params.bookingId}`,
      html: generatePaymentReceiptHTML(params),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('✅ Payment receipt sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send payment receipt:', error);
    return { success: false, error };
  }
}

/**
 * Send admin notification
 */
export async function sendAdminNotification(subject: string, message: string, bookingId?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔔 Admin Alert: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #D4AF37;">Admin Notification</h2>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong> ${message}</p>
          ${bookingId ? `<p><strong>Booking ID:</strong> ${bookingId}</p>` : ''}
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Ekami Auto Admin Dashboard<br>
            <a href="http://localhost:8080/admin">View Dashboard</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('✅ Admin notification sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
}

/**
 * Generate booking confirmation HTML
 */
function generateBookingConfirmationHTML(params: SendBookingConfirmationParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Booking Confirmed!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Ekami Auto</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Dear ${params.customerName},</p>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Your booking has been confirmed! Here are your reservation details:
              </p>
              
              <!-- Booking Details -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Booking Reference:</strong>
                    <span style="float: right; color: #333; font-weight: bold;">#${params.bookingId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Vehicle:</strong>
                    <span style="float: right; color: #333;">${params.carName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Pick-up Date:</strong>
                    <span style="float: right; color: #333;">${params.startDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Drop-off Date:</strong>
                    <span style="float: right; color: #333;">${params.endDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Pick-up Location:</strong>
                    <span style="float: right; color: #333;">${params.pickupLocation}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px;">
                    <strong style="color: #666;">Drop-off Location:</strong>
                    <span style="float: right; color: #333;">${params.dropoffLocation}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Total -->
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Total Amount</p>
                <p style="color: #D4AF37; margin: 0; font-size: 32px; font-weight: bold;">${params.totalAmount.toLocaleString()} XAF</p>
              </div>
              
              <!-- What's Next -->
              <h3 style="color: #333; margin: 0 0 15px 0;">What's Next?</h3>
              <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li>Check your email for the payment receipt</li>
                <li>Bring your driver's license and ID on pick-up day</li>
                <li>Arrive at the pick-up location during business hours (9 AM - 6 PM)</li>
              </ol>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://wa.me/237652765281?text=Hi,%20I%20have%20a%20question%20about%20booking%20${params.bookingId}" 
                   style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Contact Support on WhatsApp
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #333; margin: 0 0 10px 0; font-weight: bold;">Ekami Auto - Luxury Car Rental & Sales</p>
              <p style="color: #666; margin: 0; font-size: 14px;">
                📞 +237 6 52 76 52 81 | 📧 info@ekamiauto.com<br>
                Douala, Cameroon
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate payment receipt HTML
 */
function generatePaymentReceiptHTML(params: SendPaymentReceiptParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">✅ Payment Successful!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your payment has been processed</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Dear ${params.customerName},</p>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for your payment. Here is your receipt:
              </p>
              
              <!-- Receipt Details -->
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Booking Reference:</strong>
                    <span style="float: right; color: #333; font-weight: bold;">#${params.bookingId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Payment ID:</strong>
                    <span style="float: right; color: #333; font-family: monospace; font-size: 12px;">${params.paymentIntentId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #eee; padding: 15px;">
                    <strong style="color: #666;">Vehicle:</strong>
                    <span style="float: right; color: #333;">${params.carName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px;">
                    <strong style="color: #666;">Payment Method:</strong>
                    <span style="float: right; color: #333;">${params.paymentMethod}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Total -->
              <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <p style="color: #10B981; margin: 0; font-size: 40px; font-weight: bold;">${params.amount.toLocaleString()} XAF</p>
              </div>
              
              <p style="color: #666; font-size: 14px; text-align: center;">
                A copy of this receipt has been saved to your account.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #333; margin: 0 0 10px 0; font-weight: bold;">Ekami Auto - Luxury Car Rental & Sales</p>
              <p style="color: #666; margin: 0; font-size: 14px;">
                📞 +237 6 52 76 52 81 | 📧 info@ekamiauto.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
