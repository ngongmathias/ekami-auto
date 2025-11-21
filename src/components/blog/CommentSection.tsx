import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Reply, Edit2, Trash2, Flag, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
  parent_id: string | null;
  likes: number;
  is_edited: boolean;
  is_pinned: boolean;
  status: string;
  replies?: Comment[];
  user_liked?: boolean;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { isSignedIn, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // Fetch all approved comments
      const { data: commentsData, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // If user is signed in, fetch their likes
      let userLikes: string[] = [];
      if (isSignedIn && user) {
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);
        
        userLikes = likesData?.map(l => l.comment_id) || [];
      }

      // Organize comments into tree structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      commentsData?.forEach(comment => {
        commentMap.set(comment.id, {
          ...comment,
          replies: [],
          user_liked: userLikes.includes(comment.id)
        });
      });

      commentMap.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      // Sort pinned comments first
      rootComments.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          user_id: user?.id,
          user_name: user?.fullName || user?.firstName || 'Anonymous',
          user_email: user?.primaryEmailAddress?.emailAddress,
          content: newComment.trim(),
          status: 'approved', // Auto-approve comments
          approved_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Comment posted successfully!');
      setNewComment('');
      fetchComments(); // Refresh to show new comment immediately
      
      // Send email notification to admin
      try {
        const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
        if (resendApiKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Ekami Auto <onboarding@resend.dev>',
              to: 'kerryngong@ekamiauto.com',
              subject: 'New Blog Comment Posted',
              html: `
                <h2>New Comment on Blog Post</h2>
                <p><strong>From:</strong> ${user?.fullName || 'Anonymous'}</p>
                <p><strong>Email:</strong> ${user?.primaryEmailAddress?.emailAddress}</p>
                <p><strong>Comment:</strong></p>
                <p>${newComment}</p>
                <p><strong>Status:</strong> Auto-approved and published</p>
                <p><a href="${window.location.href}">View Comment</a> | <a href="${window.location.origin}/admin">Admin Dashboard</a></p>
              `,
            }),
          });
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast.error(error.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          user_id: user?.id,
          user_name: user?.fullName || user?.firstName || 'Anonymous',
          user_email: user?.primaryEmailAddress?.emailAddress,
          content: replyContent.trim(),
          parent_id: parentId,
          status: 'approved', // Auto-approve replies
          approved_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Reply posted successfully!');
      setReplyContent('');
      setReplyingTo(null);
      fetchComments(); // Refresh to show new reply immediately
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      toast.error(error.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({
          content: editContent.trim(),
          is_edited: true,
        })
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comment updated');
      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (error: any) {
      console.error('Error editing comment:', error);
      toast.error(error.message || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comment deleted');
      fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId: string, currentlyLiked: boolean) => {
    if (!isSignedIn) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      if (currentlyLiked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user?.id,
          });

        if (error) throw error;
      }

      fetchComments();
    } catch (error: any) {
      console.error('Error liking comment:', error);
      toast.error(error.message || 'Failed to like comment');
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isOwner = user?.id === comment.user_id;
    const isEditing = editingId === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${depth > 0 ? 'ml-8 md:ml-12' : ''} mb-4`}
      >
        <div className={`p-4 rounded-xl ${
          comment.is_pinned
            ? 'bg-ekami-gold-50 dark:bg-ekami-gold-900/10 border-2 border-ekami-gold-300 dark:border-ekami-gold-700'
            : 'bg-ekami-silver-50 dark:bg-ekami-charcoal-800'
        }`}>
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  {comment.user_name}
                </span>
                {comment.is_pinned && (
                  <span className="px-2 py-0.5 bg-ekami-gold-600 text-white text-xs rounded-full">
                    Pinned
                  </span>
                )}
              </div>
              <span className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
                {format(new Date(comment.created_at), 'MMM dd, yyyy • h:mm a')}
                {comment.is_edited && ' (edited)'}
              </span>
            </div>
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-3 py-1 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 hover:bg-ekami-silver-300 dark:hover:bg-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => handleLikeComment(comment.id, comment.user_liked || false)}
              className={`flex items-center gap-1 transition-colors ${
                comment.user_liked
                  ? 'text-ekami-gold-600'
                  : 'text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${comment.user_liked ? 'fill-current' : ''}`} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {depth < 2 && (
              <button
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyContent('');
                }}
                className="flex items-center gap-1 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}

            {isOwner && !isEditing && (
              <>
                <button
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="flex items-center gap-1 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full px-3 py-2 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white mb-2"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting}
                  className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Reply'}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 hover:bg-ekami-silver-300 dark:hover:bg-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Render Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Comments ({comments.length})
      </h2>

      {/* New Comment Form */}
      {isSignedIn ? (
        <div className="mb-8 card">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white mb-3"
            rows={4}
          />
          <button
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <div className="mb-8 card text-center">
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
            Please sign in to leave a comment
          </p>
          <a
            href="/sign-in"
            className="inline-block px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl font-semibold transition-colors"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center card">
          <MessageSquare className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
