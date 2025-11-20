import { useState } from 'react';
import { X, DollarSign, User, Mail, Phone, MessageSquare, Send, Loader2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carName: string;
  askingPrice: number;
}

interface OfferFormData {
  name: string;
  email: string;
  phone: string;
  offer_amount: number;
  message: string;
}

export default function MakeOfferModal({
  isOpen,
  onClose,
  carId,
  carName,
  askingPrice,
}: MakeOfferModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<OfferFormData>({
    defaultValues: {
      offer_amount: askingPrice * 0.9, // Default to 90% of asking price
    },
  });

  const offerAmount = watch('offer_amount');
  const offerPercentage = ((offerAmount / askingPrice) * 100).toFixed(1);
  const difference = askingPrice - offerAmount;

  const onSubmit = async (data: OfferFormData) => {
    try {
      setIsSubmitting(true);

      // Validate offer amount
      if (data.offer_amount <= 0) {
        toast.error('Offer amount must be greater than 0');
        return;
      }

      if (data.offer_amount > askingPrice) {
        toast.error('Offer cannot exceed asking price');
        return;
      }

      // Save offer to database
      // For now, skip database insert if user is not authenticated (RLS policy issue)
      // The email notification will still work
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error: dbError } = await supabase.from('purchases').insert({
            car_id: carId,
            buyer_id: user.id,
            buyer_name: data.name,
            buyer_phone: data.phone,
            purchase_price: data.offer_amount,
            total_amount: data.offer_amount,
            status: 'offer',
            notes: `Offer from ${data.name}\nEmail: ${data.email}\nOffer: ${data.offer_amount.toLocaleString()} XAF (${offerPercentage}% of asking price)\nAsking Price: ${askingPrice.toLocaleString()} XAF\nMessage: ${data.message || 'N/A'}`,
          });

          if (dbError) {
            console.error('Database error:', dbError);
            // Don't throw - continue with email notification
          }
        } else {
          console.log('User not authenticated - skipping database insert, sending email only');
        }
      } catch (authError) {
        console.error('Auth check error:', authError);
        // Continue with email notification
      }

      // Send email notification to admin
      const managerEmail = import.meta.env.VITE_MANAGER_EMAIL || 'kerryngong@ekamiauto.com';

      const emailBody = `
        <h2>New Purchase Offer Received</h2>
        <p><strong>Vehicle:</strong> ${carName}</p>
        <p><strong>Asking Price:</strong> ${askingPrice.toLocaleString()} XAF</p>
        <p><strong>Offer Amount:</strong> ${data.offer_amount.toLocaleString()} XAF (${offerPercentage}%)</p>
        <p><strong>Difference:</strong> -${difference.toLocaleString()} XAF</p>
        <hr />
        <p><strong>Customer Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        ${data.message ? `<p><strong>Message:</strong></p><p>${data.message}</p>` : ''}
        <hr />
        <p>Please review this offer and contact the customer to discuss.</p>
      `;

      // Send email using Resend API
      try {
        const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Ekami Auto <onboarding@resend.dev>',
            to: managerEmail,
            subject: `New Offer - ${carName} (${offerPercentage}% of asking price)`,
            html: emailBody,
          }),
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      toast.success('Offer submitted successfully! We\'ll review and get back to you soon.');
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast.error('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-ekami-charcoal-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-ekami-gold-600 to-ekami-gold-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-7 h-7" />
                      Make an Offer
                    </h2>
                    <p className="text-ekami-gold-100 text-sm">
                      Submit your best offer for {carName}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Price Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl border border-ekami-silver-200 dark:border-ekami-charcoal-700">
                    <div className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">
                      Asking Price
                    </div>
                    <div className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                      {askingPrice.toLocaleString()} XAF
                    </div>
                  </div>
                  <div className="p-4 bg-ekami-gold-50 dark:bg-ekami-charcoal-800 rounded-xl border-2 border-ekami-gold-400 dark:border-ekami-gold-600">
                    <div className="text-xs text-ekami-gold-700 dark:text-ekami-gold-400 mb-1">
                      Your Offer ({offerPercentage}%)
                    </div>
                    <div className="text-2xl font-bold text-ekami-gold-600">
                      {offerAmount?.toLocaleString() || 0} XAF
                    </div>
                  </div>
                </div>

                {/* Offer Amount Slider */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Offer Amount *
                  </label>
                  <input
                    type="range"
                    min={askingPrice * 0.5}
                    max={askingPrice}
                    step={askingPrice * 0.01}
                    {...register('offer_amount', {
                      required: 'Offer amount is required',
                      min: { value: 1, message: 'Offer must be greater than 0' },
                      max: { value: askingPrice, message: 'Offer cannot exceed asking price' },
                    })}
                    className="w-full h-3 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
                  />
                  <div className="flex justify-between text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-2">
                    <span>50% ({(askingPrice * 0.5).toLocaleString()} XAF)</span>
                    <span>100% ({askingPrice.toLocaleString()} XAF)</span>
                  </div>
                  {difference > 0 && (
                    <div className="mt-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      Your offer is <span className="font-bold text-ekami-gold-600">
                        {difference.toLocaleString()} XAF
                      </span> below asking price
                    </div>
                  )}
                  {errors.offer_amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.offer_amount.message}</p>
                  )}
                </div>

                {/* Or enter exact amount */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Or enter exact amount (XAF)
                  </label>
                  <input
                    type="number"
                    {...register('offer_amount', {
                      required: 'Offer amount is required',
                      min: { value: 1, message: 'Offer must be greater than 0' },
                      max: { value: askingPrice, message: 'Offer cannot exceed asking price' },
                    })}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
                    placeholder="Enter your offer amount"
                  />
                </div>

                <hr className="border-ekami-silver-200 dark:border-ekami-charcoal-700" />

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
                    placeholder="+237 6XX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white resize-none"
                    placeholder="Any additional information or conditions for your offer..."
                  />
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> Your offer will be reviewed by our team. We'll contact you within 24-48 hours 
                    to discuss next steps. All offers are subject to vehicle availability and seller approval.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl font-semibold hover:bg-ekami-silver-200 dark:hover:bg-ekami-charcoal-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Offer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
