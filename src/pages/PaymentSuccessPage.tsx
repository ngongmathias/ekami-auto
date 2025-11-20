import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Car, MapPin, Mail, Phone, Download, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Get booking details from URL params (in production, fetch from backend)
  const bookingId = searchParams.get('booking_id') || 'BK' + Date.now();
  const carName = searchParams.get('car_name') || 'Your Vehicle';
  const amount = searchParams.get('amount') || '0';
  const email = searchParams.get('email') || '';

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    // Handle window resize for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Send confirmation emails
    sendConfirmationEmails();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sendConfirmationEmails = async () => {
    if (!email) return;

    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const pickupLocation = searchParams.get('pickup_location') || '';
    const paymentIntent = searchParams.get('payment_intent') || '';

    try {
      const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
      const managerEmail = import.meta.env.VITE_MANAGER_EMAIL || 'kerryngong@ekamiauto.com';

      // Customer confirmation email
      const customerEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Booking Confirmed!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Thank you for your booking!</h2>
            <p style="color: #666; font-size: 16px;">Your reservation has been confirmed. Here are your booking details:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Vehicle:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${carName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Pickup Date:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Return Date:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${endDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Pickup Location:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${pickupLocation}</td>
                </tr>
                <tr>
                  <td style="padding: 10px;"><strong>Total Amount:</strong></td>
                  <td style="padding: 10px; color: #D4AF37; font-size: 18px; font-weight: bold;">${parseInt(amount).toLocaleString()} XAF</td>
                </tr>
              </table>
            </div>

            <p style="color: #666;">We'll contact you shortly to confirm the pickup details.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 14px; margin: 5px 0;">Need help? Contact us:</p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">📧 info@ekamiauto.com</p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">📱 +237 6 52 76 52 81</p>
            </div>
          </div>
        </div>
      `;

      // Admin notification email
      const adminEmailBody = `
        <h2>🚗 New Booking Received</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Vehicle:</strong> ${carName}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <hr />
        <p><strong>Pickup Date:</strong> ${startDate}</p>
        <p><strong>Return Date:</strong> ${endDate}</p>
        <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
        <p><strong>Total Amount:</strong> ${parseInt(amount).toLocaleString()} XAF</p>
        <hr />
        <p><strong>Payment Intent:</strong> ${paymentIntent}</p>
        <p><em>Please prepare the vehicle and contact the customer to confirm pickup details.</em></p>
      `;

      // Send customer confirmation
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Ekami Auto <onboarding@resend.dev>',
          to: email,
          subject: `🎉 Booking Confirmed - ${bookingId}`,
          html: customerEmailBody,
        }),
      });

      // Send admin notification
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Ekami Auto <onboarding@resend.dev>',
          to: managerEmail,
          subject: `🚗 New Booking - ${carName} (${bookingId})`,
          html: adminEmailBody,
        }),
      });

      console.log('Confirmation emails sent successfully');
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
      // Don't show error to user since payment was successful
    }
  };

  const handleDownloadReceipt = () => {
    // In production, generate and download PDF receipt
    alert('Receipt download would start here. In production, this would generate a PDF.');
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-green-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 shadow-2xl">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            Your booking has been confirmed
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
            <div>
              <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-1">
                Booking Reference
              </p>
              <p className="text-2xl font-bold text-ekami-gold-600">
                #{bookingId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-1">
                Amount Paid
              </p>
              <p className="text-2xl font-bold text-green-600">
                {parseInt(amount).toLocaleString()} XAF
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Car className="w-6 h-6 text-ekami-gold-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  Vehicle
                </p>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  {decodeURIComponent(carName)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-6 h-6 text-ekami-gold-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  Rental Period
                </p>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  {searchParams.get('start_date') || 'TBD'} - {searchParams.get('end_date') || 'TBD'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-ekami-gold-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  Pickup Location
                </p>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  {searchParams.get('pickup_location') || 'Douala Airport'}
                </p>
              </div>
            </div>

            {email && (
              <div className="flex items-start space-x-3">
                <Mail className="w-6 h-6 text-ekami-gold-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                    Confirmation Email
                  </p>
                  <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                    {email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
            What's Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-ekami-gold-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white mb-1">
                  Check Your Email
                </p>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  We've sent a confirmation email with your booking details and receipt.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-ekami-gold-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white mb-1">
                  Prepare Your Documents
                </p>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Bring your driver's license, ID, and a copy of this confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-ekami-gold-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white mb-1">
                  Pick Up Your Car
                </p>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Arrive at the pickup location during business hours (9 AM - 6 PM).
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl font-semibold hover:border-ekami-gold-400 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-700 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download Receipt</span>
          </button>

          <Link
            to="/account"
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-all shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            <span>View My Bookings</span>
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-ekami-charcoal-700 text-white rounded-xl font-semibold hover:bg-ekami-charcoal-800 transition-all"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center"
        >
          <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <p className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">
            Need Help?
          </p>
          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-3">
            Our customer support team is available 24/7
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a
              href="tel:+237652765281"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              +237 6 52 76 52 81
            </a>
            <span className="text-ekami-charcoal-400">•</span>
            <a
              href={`https://wa.me/237652765281?text=${encodeURIComponent('Hi, I need help with booking #' + bookingId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:underline font-semibold"
            >
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
