import { useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface MoMoPaymentProps {
  amount: number;
  currency: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  customerEmail: string;
  bookingDetails: {
    carName: string;
    rentalDays: number;
    startDate: string;
    endDate: string;
  };
}

type MoMoProvider = 'mtn' | 'orange';

export default function MoMoPayment({
  amount,
  currency,
  onSuccess,
  onError,
  customerEmail,
  bookingDetails,
}: MoMoPaymentProps) {
  const [provider, setProvider] = useState<MoMoProvider>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    // Cameroon phone number validation
    // MTN: 67X XXX XXX or 650-659
    // Orange: 69X XXX XXX or 655-656
    const cleaned = phone.replace(/\s+/g, '');
    
    if (provider === 'mtn') {
      return /^(237)?(67[0-9]|65[0-9])[0-9]{6}$/.test(cleaned);
    } else {
      return /^(237)?(69[0-9]|655|656)[0-9]{6}$/.test(cleaned);
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format as: 6XX XXX XXX
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setPaymentError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      setPaymentError(`Invalid ${provider === 'mtn' ? 'MTN' : 'Orange'} Mobile Money number`);
      toast.error('Invalid phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setShowInstructions(true);

    try {
      // In production, you would:
      // 1. Call your backend API
      // 2. Backend initiates MoMo payment request
      // 3. User receives USSD prompt on their phone
      // 4. User enters PIN to confirm
      // 5. Backend receives webhook confirmation
      // 6. Update booking status

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate successful payment
      const mockTransactionId = `MOMO_${provider.toUpperCase()}_${Date.now()}`;
      
      toast.success('Payment successful!');
      onSuccess(mockTransactionId);

      // In production:
      // const response = await fetch('/api/momo/initiate-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     provider,
      //     phoneNumber: phoneNumber.replace(/\s+/g, ''),
      //     amount,
      //     currency,
      //     customerEmail,
      //     bookingDetails,
      //   }),
      // });
      //
      // const data = await response.json();
      // if (data.success) {
      //   // Poll for payment status or wait for webhook
      //   onSuccess(data.transactionId);
      // } else {
      //   throw new Error(data.message);
      // }

    } catch (error: any) {
      const errorMessage = error.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
      setShowInstructions(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="card bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-400/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Total Amount
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {amount.toLocaleString()} {currency}
            </p>
          </div>
          <div className="p-3 bg-green-500 rounded-xl">
            <Smartphone className="w-8 h-8 text-white" />
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
        </div>
      </div>

      {/* Provider Selection */}
      <div className="card">
        <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
          Select Mobile Money Provider
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setProvider('mtn');
              setPhoneNumber('');
              setPaymentError(null);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              provider === 'mtn'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-yellow-400'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                provider === 'mtn' ? 'bg-yellow-500' : 'bg-yellow-400'
              }`}>
                <span className="text-2xl font-bold text-white">MTN</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-ekami-charcoal-900 dark:text-white">
                  MTN MoMo
                </p>
                <p className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  67X XXX XXX
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setProvider('orange');
              setPhoneNumber('');
              setPaymentError(null);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              provider === 'orange'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-orange-400'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                provider === 'orange' ? 'bg-orange-500' : 'bg-orange-400'
              }`}>
                <span className="text-2xl font-bold text-white">OM</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-ekami-charcoal-900 dark:text-white">
                  Orange Money
                </p>
                <p className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  69X XXX XXX
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-lg ${
            provider === 'mtn' ? 'bg-yellow-500' : 'bg-orange-500'
          }`}>
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
              {provider === 'mtn' ? 'MTN' : 'Orange'} Mobile Money Number
            </h3>
            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Enter your {provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'} number
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ekami-charcoal-600 dark:text-ekami-silver-400 font-semibold">
            +237
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={provider === 'mtn' ? '6XX XXX XXX' : '69X XXX XXX'}
            maxLength={11}
            className={`w-full pl-20 pr-4 py-4 bg-white dark:bg-ekami-charcoal-800 border-2 ${
              paymentError ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
            } rounded-xl focus:border-${provider === 'mtn' ? 'yellow' : 'orange'}-400 focus:ring-4 focus:ring-${provider === 'mtn' ? 'yellow' : 'orange'}-400/20 transition-all text-ekami-charcoal-900 dark:text-white text-lg font-semibold`}
          />
        </div>

        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mt-4"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{paymentError}</p>
          </motion.div>
        )}

        {/* Instructions */}
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
          >
            <div className="flex items-start space-x-2">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-2">Check your phone!</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>You'll receive a USSD prompt on {phoneNumber}</li>
                  <li>Enter your {provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'} PIN</li>
                  <li>Confirm the payment of {amount.toLocaleString()} {currency}</li>
                  <li>Wait for confirmation...</li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Mode Info */}
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Test Mode - Demo Only
          </p>
          <div className="space-y-1 text-xs text-yellow-700 dark:text-yellow-400">
            <p>• Use any valid {provider === 'mtn' ? 'MTN' : 'Orange'} number format</p>
            <p>• Payment will be simulated (no real charge)</p>
            <p>• In production, you'll receive a real USSD prompt</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!phoneNumber || isProcessing}
        className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
          provider === 'mtn'
            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6" />
            <span>Pay {amount.toLocaleString()} {currency} with {provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'}</span>
          </>
        )}
      </button>

      {/* Info */}
      <div className="text-center text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
        <p>Secure payment powered by {provider === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}</p>
        <p className="mt-1">You will receive a payment confirmation SMS</p>
      </div>
    </form>
  );
}
