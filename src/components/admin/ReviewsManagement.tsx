import { useState, useEffect } from 'react';
import { 
  Star, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import StarRating from '../reviews/StarRating';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  car_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  user_name?: string;
  car_name?: string;
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          cars(make, model, year),
          users(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format the data
      const formattedReviews = (data || []).map((review: any) => ({
        ...review,
        car_name: review.cars 
          ? `${review.cars.year} ${review.cars.make} ${review.cars.model}`
          : 'Unknown Car',
        user_name: review.users
          ? `${review.users.first_name} ${review.users.last_name}`
          : 'Anonymous',
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Review approved');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const rejectReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Review rejected');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Review deleted');
      setShowDetailsModal(false);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const saveAdminResponse = async () => {
    if (!selectedReview) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_response: adminResponse })
        .eq('id', selectedReview.id);

      if (error) throw error;

      toast.success('Response saved');
      setShowDetailsModal(false);
      setAdminResponse('');
      fetchReviews();
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save response');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.car_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'approved' && review.status === 'approved') ||
      (statusFilter === 'pending' && review.status === 'pending');

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Reviews Management
          </h2>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Moderate and respond to customer reviews
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Total Reviews</p>
              <p className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-ekami-gold-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Avg Rating</p>
              <p className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">{stats.avgRating}</p>
            </div>
            <Star className="w-8 h-8 text-ekami-gold-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search by customer, car, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-800 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-ekami-charcoal-600 dark:text-ekami-silver-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-800 dark:text-white"
            >
              <option value="all">All Reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-ekami-charcoal-900 dark:text-white">
                          {review.user_name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          review.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {review.status === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {review.car_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <StarRating rating={review.rating} readonly size="sm" />
                      <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
                    {review.comment}
                  </p>

                  {/* Admin Response */}
                  {review.admin_response && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                        Admin Response:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {review.admin_response}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setAdminResponse(review.admin_response || '');
                      setShowDetailsModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {review.status !== 'approved' ? (
                    <button
                      onClick={() => approveReview(review.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => rejectReview(review.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                      title="Unapprove"
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    Review Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Review Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white">
                        {selectedReview.user_name}
                      </h4>
                      <StarRating rating={selectedReview.rating} readonly />
                    </div>
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-2">
                      {selectedReview.car_name}
                    </p>
                    <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                      {selectedReview.comment}
                    </p>
                  </div>

                  {/* Admin Response */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Admin Response
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Write a response to this review..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAdminResponse}
                    className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg"
                  >
                    Save Response
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
