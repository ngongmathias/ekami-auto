import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  customerEmail: string;
  bookingDetails: {
    carName: string;
    rentalDays: number;
    startDate: string;
    endDate: string;
  };
}

export default function CheckoutForm({
  amount,
  currency,
  onSuccess,
  onError,
  customerEmail,
  bookingDetails,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // In a real application, you would:
      // 1. Create a payment intent on your backend
      // 2. Get the client secret
      // 3. Confirm the payment with Stripe

      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment confirmation
      const mockPaymentIntentId = 'pi_' + Math.random().toString(36).substring(7);
      
      toast.success('Payment successful!');
      onSuccess(mockPaymentIntentId);

      // In production, you would do:
      // const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: cardElement,
      //     billing_details: {
      //       email: customerEmail,
      //     },
      //   },
      // });
      //
      // if (error) {
      //   throw new Error(error.message);
      // }
      //
      // if (paymentIntent.status === 'succeeded') {
      //   onSuccess(paymentIntent.id);
      // }

    } catch (error: any) {
      const errorMessage = error.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#d4af37',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="card bg-gradient-to-br from-ekami-gold-50 to-ekami-silver-50 dark:from-ekami-gold-900/20 dark:to-ekami-charcoal-800 border-2 border-ekami-gold-400/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Total Amount
            </p>
            <p className="text-3xl font-bold text-ekami-gold-600">
              {amount.toLocaleString()} {currency}
            </p>
          </div>
          <div className="p-3 bg-ekami-gold-500 rounded-xl">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Vehicle:</span>
            <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
              {bookingDetails.carName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Duration:</span>
            <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
              {bookingDetails.rentalDays} {bookingDetails.rentalDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Email:</span>
            <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
              {customerEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-ekami-gold-500 rounded-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
              Payment Details
            </h3>
            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Enter your card information
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus-within:border-ekami-gold-400 focus-within:ring-4 focus-within:ring-ekami-gold-400/20 transition-all">
          <CardElement
            options={cardElementOptions}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (e.error) {
                setPaymentError(e.error.message);
              } else {
                setPaymentError(null);
              }
            }}
          />
        </div>

        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{paymentError}</p>
          </motion.div>
        )}

        {/* Test Card Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Test Mode - Use these test cards:
          </p>
          <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
            <p>• Success: 4242 4242 4242 4242</p>
            <p>• Decline: 4000 0000 0000 0002</p>
            <p>• Any future date, any CVC</p>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="flex items-center justify-center space-x-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
        <Lock className="w-4 h-4" />
        <span>Secured by Stripe • Your payment information is encrypted</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing}
        className="w-full py-4 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 text-white rounded-2xl font-bold text-lg hover:from-ekami-gold-600 hover:to-ekami-gold-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6" />
            <span>Pay {amount.toLocaleString()} {currency}</span>
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="flex items-center justify-center space-x-6 pt-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">Visa</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">MC</span>
          </div>
          <span className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">Mastercard</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">Stripe</span>
        </div>
      </div>
    </form>
  );
}
