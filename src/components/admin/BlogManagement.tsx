import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import BlogPostEditor from './BlogPostEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status: string;
  published_at?: string;
  created_at: string;
  author_name?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast.success('Blog post deleted');
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      toast.error('Failed to delete blog post');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
            Blog Management
          </h2>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
            Create and manage blog posts
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPost(undefined);
            setShowEditor(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Post</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total Posts</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">Published</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.published}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Drafts</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.draft}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No blog posts found</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card group hover:shadow-xl transition-all"
            >
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-ekami-charcoal-900 dark:text-white line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 line-clamp-2 mt-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {post.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setShowEditor(true);
                      }}
                      className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-ekami-gold-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Blog Post Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <BlogPostEditor
            post={editingPost}
            onClose={() => {
              setShowEditor(false);
              setEditingPost(undefined);
            }}
            onSave={() => {
              fetchPosts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
