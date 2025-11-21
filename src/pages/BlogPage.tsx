import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: string;
  tags: string[];
  published_at: string;
  created_at: string;
}

const CATEGORIES = [
  'All',
  'Car Reviews',
  'Buying Guide',
  'Maintenance Tips',
  'Industry News',
  'Electric Vehicles',
  'Luxury Cars',
  'SUVs & Trucks',
  'Car Technology',
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts[0];
  const regularPosts = filteredPosts.slice(selectedCategory === 'All' && !searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Ekami Auto Blog
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            Car tips, buying guides, and industry insights
          </p>
        </div>

        {/* Search & Categories */}
        <div className="mb-12 space-y-6">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all shadow-sm"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-ekami-gold-600 text-white shadow-lg'
                    : 'bg-white dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-gold-50 dark:hover:bg-ekami-charcoal-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 text-lg">
              No blog posts published yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && selectedCategory === 'All' && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Link to={`/blog/${featuredPost.slug}`}>
                  <div className="card group hover:shadow-2xl transition-all overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {featuredPost.featured_image && (
                        <img
                          src={featuredPost.featured_image}
                          alt={featuredPost.title}
                          className="w-full h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="flex flex-col justify-center">
                        <span className="inline-block px-4 py-1 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-700 dark:text-ekami-gold-300 rounded-full text-sm font-semibold mb-4 w-fit">
                          Featured
                        </span>
                        <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white mb-4 group-hover:text-ekami-gold-600 transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-6">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(featuredPost.published_at), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            {featuredPost.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-ekami-gold-600 font-semibold group-hover:gap-4 transition-all">
                          Read More
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Regular Posts Grid */}
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="card group hover:shadow-xl transition-all h-full flex flex-col">
                        {post.featured_image && (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="flex-1 flex flex-col">
                          <span className="inline-block px-3 py-1 bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-full text-xs font-semibold mb-3 w-fit">
                            {post.category}
                          </span>
                          <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-3 group-hover:text-ekami-gold-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
                            <span className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(post.published_at), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-ekami-gold-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 text-lg">
                  No posts found matching your criteria.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
