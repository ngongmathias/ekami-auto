import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { ArrowLeft, Home, ChevronRight, CreditCard, Smartphone } from 'lucide-react';
import { getStripe } from '../lib/stripe';
import CheckoutForm from '../components/payment/CheckoutForm';
import MoMoPayment from '../components/payment/MoMoPayment';

type PaymentMethod = 'card' | 'momo';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stripePromise] = useState(() => getStripe());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo'); // Default to MoMo for Cameroon

  // Get payment details from URL params
  const amount = parseInt(searchParams.get('amount') || '0');
  const currency = searchParams.get('currency') || 'XAF';
  const carName = searchParams.get('car_name') || '';
  const carId = searchParams.get('car_id') || '';
  const email = searchParams.get('email') || '';
  const rentalDays = parseInt(searchParams.get('rental_days') || '0');
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';
  const pickupLocation = searchParams.get('pickup_location') || '';

  useEffect(() => {
    // Validate required params
    if (!amount || !carName || !email) {
      navigate('/rent');
    }
  }, [amount, carName, email, navigate]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Redirect to success page with booking details
    const successParams = new URLSearchParams({
      booking_id: 'BK' + Date.now(),
      payment_intent: paymentIntentId,
      amount: amount.toString(),
      car_name: carName,
      email,
      start_date: startDate,
      end_date: endDate,
      pickup_location: pickupLocation,
    });

    navigate(`/payment/success?${successParams.toString()}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Error is already shown in the CheckoutForm via toast
  };

  if (!stripePromise) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
              Payment System Unavailable
            </h2>
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-8">
              Stripe is not configured. Please add your Stripe publishable key to the environment variables.
            </p>
            <Link to="/rent" className="btn-primary">
              Back to Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-ekami-charcoal-400" />
          <Link to="/rent" className="text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600">
            Rent
          </Link>
          <ChevronRight className="w-4 h-4 text-ekami-charcoal-400" />
          <span className="text-ekami-charcoal-900 dark:text-white font-medium">
            Payment
          </span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Complete Your Payment
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            Choose your preferred payment method
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                ✓
              </div>
              <p className="text-sm font-semibold text-green-600">Dates</p>
            </div>
            <div className="flex-1 h-1 bg-green-500 -mx-4"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                ✓
              </div>
              <p className="text-sm font-semibold text-green-600">Details</p>
            </div>
            <div className="flex-1 h-1 bg-ekami-gold-500 -mx-4"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-ekami-gold-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="text-sm font-semibold text-ekami-gold-600">Payment</p>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-4 text-center">
            Select Payment Method
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => setPaymentMethod('momo')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                paymentMethod === 'momo'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                  : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-green-400'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <Smartphone className={`w-12 h-12 ${
                  paymentMethod === 'momo' ? 'text-green-600' : 'text-ekami-charcoal-400'
                }`} />
                <div className="text-center">
                  <p className="font-bold text-lg text-ekami-charcoal-900 dark:text-white">
                    Mobile Money
                  </p>
                  <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    MTN MoMo • Orange Money
                  </p>
                  <div className="mt-2 inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                    Most Popular 🇨🇲
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <CreditCard className={`w-12 h-12 ${
                  paymentMethod === 'card' ? 'text-blue-600' : 'text-ekami-charcoal-400'
                }`} />
                <div className="text-center">
                  <p className="font-bold text-lg text-ekami-charcoal-900 dark:text-white">
                    Card Payment
                  </p>
                  <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    Visa • Mastercard
                  </p>
                  <div className="mt-2 inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                    International
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Forms */}
        {paymentMethod === 'momo' ? (
          <MoMoPayment
            amount={amount}
            currency={currency}
            customerEmail={email}
            bookingDetails={{
              carName: decodeURIComponent(carName),
              rentalDays,
              startDate,
              endDate,
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        ) : (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={amount}
              currency={currency}
              customerEmail={email}
              bookingDetails={{
                carName: decodeURIComponent(carName),
                rentalDays,
                startDate,
                endDate,
              }}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
