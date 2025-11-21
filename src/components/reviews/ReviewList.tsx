import { useState, useEffect } from 'react';
import { Star, Filter, TrendingUp, TrendingDown, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

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

interface ReviewListProps {
  carId: string;
}

type SortOption = 'recent' | 'helpful' | 'rating-high' | 'rating-low';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1';

export default function ReviewList({ carId }: ReviewListProps) {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasCompletedBooking, setHasCompletedBooking] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [carId, sortBy, filterBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Fetch approved reviews
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user_profiles!reviews_user_id_fkey (
            full_name
          )
        `)
        .eq('car_id', carId)
        .eq('status', 'approved');

      // Apply filter
      if (filterBy !== 'all') {
        query = query.eq('rating', parseInt(filterBy));
      }

      // Apply sort
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        case 'rating-high':
          query = query.order('rating', { ascending: false });
          break;
        case 'rating-low':
          query = query.order('rating', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      const transformedReviews = data?.map((review: any) => ({
        ...review,
        user_name: review.user_profiles?.full_name || 'Anonymous User',
        verified_purchase: !!review.booking_id,
      })) || [];

      setReviews(transformedReviews);

      // Calculate statistics
      if (transformedReviews.length > 0) {
        const avg = transformedReviews.reduce((sum, r) => sum + r.rating, 0) / transformedReviews.length;
        setAverageRating(avg);

        const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        transformedReviews.forEach(r => {
          dist[r.rating] = (dist[r.rating] || 0) + 1;
        });
        setRatingDistribution(dist);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (!isHelpful) return; // Only count helpful votes

    try {
      // Get current review
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      // Update with incremented count
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', reviewId);

      if (error) throw error;

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      ));
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  const totalReviews = reviews.length;
  const ratingPercentages = Object.entries(ratingDistribution).map(([rating, count]) => ({
    rating: parseInt(rating),
    count,
    percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
  })).reverse();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {totalReviews > 0 && (
        <div className="card bg-gradient-to-br from-ekami-gold-50 to-white dark:from-ekami-charcoal-800 dark:to-ekami-charcoal-900 border-2 border-ekami-gold-200 dark:border-ekami-gold-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="text-6xl font-bold text-ekami-gold-600">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <StarRating rating={averageRating} readonly size="lg" />
                  <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingPercentages.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
                      {rating}
                    </span>
                    <Star className="w-4 h-4 text-ekami-gold-500 fill-ekami-gold-500" />
                  </div>
                  <div className="flex-1 h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: rating * 0.1 }}
                      className="h-full bg-ekami-gold-500"
                    />
                  </div>
                  <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 w-12 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {totalReviews > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Write Review Button */}
          {isSignedIn && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Write a Review
            </button>
          )}

          {/* Filter by Rating */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-ekami-charcoal-600 dark:text-ekami-silver-400" />
            <span className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
              Filter:
            </span>
            {(['all', '5', '4', '3', '2', '1'] as FilterOption[]).map((option) => (
              <button
                key={option}
                onClick={() => setFilterBy(option)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterBy === option
                    ? 'bg-ekami-gold-600 text-white shadow-md'
                    : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-gold-100 dark:hover:bg-ekami-gold-900/20'
                }`}
              >
                {option === 'all' ? 'All' : `${option} ⭐`}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 focus:border-ekami-gold-400 focus:ring-2 focus:ring-ekami-gold-400/20 transition-all cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
            No reviews yet
          </h3>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-6">
            Be the first to review this car!
          </p>
          {isSignedIn ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Write a Review
            </button>
          ) : (
            <button
              onClick={() => navigate('/sign-in')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white font-semibold rounded-lg transition-colors"
            >
              Sign in to Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={handleHelpful}
            />
          ))}
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => {
          setShowReviewForm(false);
          fetchReviews();
        }}
        carId={carId}
        bookingId="" // Can be empty for direct reviews
        carName="" // Will be fetched in the form
      />
    </div>
  );
}
