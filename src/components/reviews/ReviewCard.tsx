import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import StarRating from './StarRating';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  helpful_count: number;
  status: string;
  user_name?: string;
  verified_purchase?: boolean;
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onReport?: (reviewId: string) => void;
}

export default function ReviewCard({ review, onHelpful, onReport }: ReviewCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(review.helpful_count);

  const handleHelpful = (isHelpful: boolean) => {
    if (hasVoted) return;
    
    setHasVoted(true);
    setLocalHelpfulCount(prev => prev + (isHelpful ? 1 : 0));
    
    if (onHelpful) {
      onHelpful(review.id, isHelpful);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ekami-gold-400 to-ekami-gold-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white">
                {review.user_name || 'Anonymous User'}
              </h4>
              {review.verified_purchase && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Report Button */}
        {onReport && (
          <button
            onClick={() => onReport(review.id)}
            className="p-2 text-ekami-charcoal-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Report review"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="font-semibold text-lg text-ekami-charcoal-900 dark:text-white mb-2">
          {review.title}
        </h5>
      )}

      {/* Review Comment */}
      <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300 leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Footer - Helpful Votes */}
      <div className="flex items-center justify-between pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Was this helpful?
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleHelpful(true)}
              disabled={hasVoted}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                hasVoted
                  ? 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 cursor-not-allowed opacity-60'
                  : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 hover:bg-ekami-gold-100 dark:hover:bg-ekami-gold-900/20 hover:text-ekami-gold-600'
              }`}
              aria-label="Mark as helpful"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{localHelpfulCount}</span>
            </button>

            <button
              onClick={() => handleHelpful(false)}
              disabled={hasVoted}
              className={`p-1.5 rounded-lg transition-all ${
                hasVoted
                  ? 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 cursor-not-allowed opacity-60'
                  : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600'
              }`}
              aria-label="Mark as not helpful"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasVoted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-green-600 dark:text-green-400 font-medium"
          >
            Thanks for your feedback!
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
