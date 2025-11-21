import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, Trash2, Pin, PinOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_email: string;
  status: string;
  post_id: string;
  parent_id: string | null;
  likes: number;
  is_pinned: boolean;
  blog_posts?: {
    title: string;
    slug: string;
  };
}

export default function CommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          blog_posts (
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (commentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({
          status: newStatus,
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', commentId);

      if (error) throw error;

      toast.success(`Comment ${newStatus}`);
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleTogglePin = async (commentId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_pinned: !currentPinned })
        .eq('id', commentId);

      if (error) throw error;

      toast.success(currentPinned ? 'Comment unpinned' : 'Comment pinned');
      fetchComments();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to toggle pin');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comment deleted');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.blog_posts?.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ? true : comment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'spam':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const stats = {
    total: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
          Comments Moderation
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
          Review and moderate blog post comments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.approved}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <p className="text-sm text-red-700 dark:text-red-300 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-ekami-charcoal-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            >
              <option value="all">All Comments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="spam">Spam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No comments found</p>
          </div>
        ) : (
          <div className="divide-y divide-ekami-silver-200 dark:divide-ekami-charcoal-700">
            {filteredComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                        {comment.user_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(comment.status)}`}>
                        {comment.status}
                      </span>
                      {comment.is_pinned && (
                        <span className="px-2 py-0.5 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-700 dark:text-ekami-gold-300 rounded-full text-xs font-semibold">
                          Pinned
                        </span>
                      )}
                      {comment.parent_id && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          Reply
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      {comment.user_email} • {format(new Date(comment.created_at), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>

                <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3 whitespace-pre-wrap">
                  {comment.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    <span className="font-medium">Post:</span>{' '}
                    <a
                      href={`/blog/${comment.blog_posts?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ekami-gold-600 hover:underline"
                    >
                      {comment.blog_posts?.title}
                    </a>
                    {' • '}
                    <span>{comment.likes} likes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {comment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(comment.id, 'approved')}
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </button>
                      </>
                    )}
                    {comment.status === 'approved' && (
                      <button
                        onClick={() => handleTogglePin(comment.id, comment.is_pinned)}
                        className="p-2 hover:bg-ekami-gold-100 dark:hover:bg-ekami-gold-900/30 rounded-lg transition-colors"
                        title={comment.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        {comment.is_pinned ? (
                          <PinOff className="w-5 h-5 text-ekami-gold-600" />
                        ) : (
                          <Pin className="w-5 h-5 text-ekami-gold-600" />
                        )}
                      </button>
                    )}
                    <a
                      href={`/blog/${comment.blog_posts?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="View Post"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </a>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
