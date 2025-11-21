import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import StarRating from './StarRating';

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carName: string;
  bookingId?: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export default function ReviewForm({ isOpen, onClose, carId, carName, bookingId }: ReviewFormProps) {
  const { user, isSignedIn } = useAuth();
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReviewFormData>();

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!isSignedIn || !user) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    try {
      setIsSubmitting(true);

      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.primaryEmailAddress?.emailAddress || 'Anonymous';

      // Insert review
      const { error: reviewError } = await supabase.from('reviews').insert({
        user_id: user.id,
        car_id: carId,
        booking_id: bookingId || null,
        rating: rating,
        comment: data.comment,
        status: 'pending', // Requires admin approval
      });

      if (reviewError) {
        console.error('Review submission error:', reviewError);
        throw reviewError;
      }

      // Send email notification to admin
      try {
        const managerEmail = import.meta.env.VITE_MANAGER_EMAIL || 'kerryngong@ekamiauto.com';
        const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

        const emailBody = `
          <h2>New Review Submitted</h2>
          <p><strong>Vehicle:</strong> ${carName}</p>
          <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
          <hr />
          <p><strong>Customer:</strong> ${userName}</p>
          <p><strong>Review:</strong></p>
          <p>${data.comment}</p>
          <hr />
          <p><em>This review is pending approval. Please review it in the admin dashboard.</em></p>
        `;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Ekami Auto <onboarding@resend.dev>',
            to: managerEmail,
            subject: `New Review - ${carName} (${rating} stars)`,
            html: emailBody,
          }),
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      toast.success('Review submitted! It will be visible after admin approval.');
      reset();
      setRating(0);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
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
                    <h2 className="text-2xl font-bold mb-2">Write a Review</h2>
                    <p className="text-ekami-gold-100 text-sm">
                      Share your experience with {carName}
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
                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-4">
                    <StarRating 
                      rating={rating} 
                      onRatingChange={setRating}
                      size="lg"
                    />
                    {rating > 0 && (
                      <span className="text-lg font-semibold text-ekami-gold-600">
                        {rating} out of 5
                      </span>
                    )}
                  </div>
                  {rating === 0 && (
                    <p className="mt-2 text-sm text-red-600">Please select a rating</p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { 
                      required: 'Title is required',
                      minLength: { value: 5, message: 'Title must be at least 5 characters' },
                      maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                    })}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
                    placeholder="Sum up your experience in one line"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    {...register('comment', { 
                      required: 'Review comment is required',
                      minLength: { value: 20, message: 'Review must be at least 20 characters' },
                      maxLength: { value: 1000, message: 'Review must be less than 1000 characters' }
                    })}
                    rows={6}
                    className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white resize-none"
                    placeholder="Tell us about your experience with this car. What did you like? What could be improved?"
                  />
                  {errors.comment && (
                    <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                  )}
                  <p className="mt-2 text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
                    Minimum 20 characters, maximum 1000 characters
                  </p>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> Your review will be visible after admin approval. 
                    We review all submissions to ensure quality and authenticity.
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
                    disabled={isSubmitting || rating === 0}
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
                        Submit Review
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
