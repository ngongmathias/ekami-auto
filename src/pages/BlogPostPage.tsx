import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft, Share2, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CommentSection from '../components/blog/CommentSection';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  published_at: string;
  created_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      
      // Fetch the post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (postError) throw postError;
      setPost(postData);

      // Fetch related posts from same category
      if (postData) {
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('category', postData.category)
          .eq('status', 'published')
          .neq('id', postData.id)
          .limit(3);

        setRelatedPosts(relatedData || []);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">Post Not Found</h1>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-8">The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="btn-primary">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blog
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {/* Category Badge */}
          <span className="inline-block px-4 py-2 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-700 dark:text-ekami-gold-300 rounded-full text-sm font-semibold mb-6">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
            <span className="flex items-center gap-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
              <Calendar className="w-5 h-5" />
              {format(new Date(post.published_at), 'MMMM dd, yyyy')}
            </span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-ekami-charcoal-600 dark:text-ekami-silver-400" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-2xl mb-8"
            />
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <div className="whitespace-pre-wrap text-ekami-charcoal-700 dark:text-ekami-silver-300 leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="pt-8 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
            <h3 className="text-lg font-semibold text-ekami-charcoal-900 dark:text-white mb-4">
              Share this post
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 hover:bg-ekami-silver-300 dark:hover:bg-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Copy Link
              </button>
            </div>
          </div>
        </motion.div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white mb-8">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                  <div className="card group hover:shadow-xl transition-all h-full">
                    {relatedPost.featured_image && (
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <h3 className="text-lg font-bold text-ekami-charcoal-900 dark:text-white mb-2 group-hover:text-ekami-gold-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </article>
    </div>
  );
}
