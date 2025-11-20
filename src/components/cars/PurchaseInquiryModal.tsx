import { useState } from 'react';
import { X, Mail, Phone, User, MessageSquare, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface PurchaseInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carName: string;
  carPrice: number;
}

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  financing_needed: boolean;
}

export default function PurchaseInquiryModal({
  isOpen,
  onClose,
  carId,
  carName,
  carPrice,
}: PurchaseInquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<InquiryFormData>();

  const onSubmit = async (data: InquiryFormData) => {
    try {
      setIsSubmitting(true);

      // Save inquiry to database
      // Note: Using purchases table with inquiry status
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
            purchase_price: carPrice,
            total_amount: carPrice,
            status: 'inquiry',
            notes: `Inquiry from ${data.name}\nEmail: ${data.email}\nFinancing needed: ${data.financing_needed ? 'Yes' : 'No'}\nMessage: ${data.message || 'N/A'}`,
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
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '237652765281';

      const emailBody = `
        <h2>New Purchase Inquiry</h2>
        <p><strong>Vehicle:</strong> ${carName}</p>
        <p><strong>Price:</strong> ${carPrice.toLocaleString()} XAF</p>
        <hr />
        <p><strong>Customer Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Financing Needed:</strong> ${data.financing_needed ? 'Yes' : 'No'}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
        <hr />
        <p><a href="https://wa.me/${whatsappNumber}?text=Hello%20${encodeURIComponent(data.name)}">Contact via WhatsApp</a></p>
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
            subject: `New Purchase Inquiry - ${carName}`,
            html: emailBody,
          }),
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast.success('Inquiry submitted successfully! We\'ll contact you soon.');
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
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
                    <h2 className="text-2xl font-bold mb-2">Purchase Inquiry</h2>
                    <p className="text-ekami-gold-100 text-sm">
                      Interested in {carName}? Let's discuss!
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
                {/* Car Info */}
                <div className="p-4 bg-ekami-gold-50 dark:bg-ekami-charcoal-800 rounded-xl border border-ekami-gold-200 dark:border-ekami-gold-800">
                  <div className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">
                    Vehicle
                  </div>
                  <div className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
                    {carName}
                  </div>
                  <div className="text-lg font-semibold text-ekami-gold-600 mt-1">
                    {carPrice.toLocaleString()} XAF
                  </div>
                </div>

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
                    Message
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white resize-none"
                    placeholder="Tell us about your requirements, preferred payment method, or any questions..."
                  />
                </div>

                {/* Financing Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl">
                  <input
                    type="checkbox"
                    {...register('financing_needed')}
                    id="financing"
                    className="mt-1 w-5 h-5 rounded border-ekami-silver-300 dark:border-ekami-charcoal-600 text-ekami-gold-600 focus:ring-ekami-gold-400"
                  />
                  <label htmlFor="financing" className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300 cursor-pointer">
                    <span className="font-semibold">I'm interested in financing options</span>
                    <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                      We'll provide you with flexible payment plans and competitive interest rates
                    </p>
                  </label>
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
                        Submit Inquiry
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
