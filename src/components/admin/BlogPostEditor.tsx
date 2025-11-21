import { useState, useEffect } from 'react';
import { X, Save, Eye, Image as ImageIcon, Tag, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  status?: 'draft' | 'published' | 'archived';
}

interface BlogPostEditorProps {
  post?: BlogPost;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  'Car Reviews',
  'Buying Guide',
  'Maintenance Tips',
  'Industry News',
  'Electric Vehicles',
  'Luxury Cars',
  'SUVs & Trucks',
  'Car Technology',
  'Travel & Road Trips',
  'Car Care',
];

export default function BlogPostEditor({ post, onClose, onSave }: BlogPostEditorProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: CATEGORIES[0],
    tags: [],
    meta_title: '',
    meta_description: '',
    status: 'draft',
    ...post,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!post && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, post]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cars')
        .getPublicUrl(filePath);

      setFormData({ ...formData, featured_image: publicUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSaving(true);

      const postData = {
        ...formData,
        status,
        author_id: user?.id,
        published_at: status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (post?.id) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (error) throw error;
        toast.success('Blog post updated successfully');
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
        toast.success('Blog post created successfully');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            {post ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ekami-silver-200 dark:border-ekami-charcoal-700 px-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'content'
                ? 'text-ekami-gold-600 border-b-2 border-ekami-gold-600'
                : 'text-ekami-charcoal-600 dark:text-ekami-silver-400'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'seo'
                ? 'text-ekami-gold-600 border-b-2 border-ekami-gold-600'
                : 'text-ekami-charcoal-600 dark:text-ekami-silver-400'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            SEO
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'content' ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white text-lg font-semibold"
                  placeholder="Enter blog post title..."
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                  placeholder="blog-post-url-slug"
                  required
                />
                <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                  URL: /blog/{formData.slug}
                </p>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Add tag..."
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl transition-colors"
                    >
                      <Tag className="w-5 h-5" />
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-700 dark:text-ekami-gold-300 rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  Featured Image
                </label>
                {formData.featured_image ? (
                  <div className="relative">
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, featured_image: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-48 border-2 border-dashed border-ekami-silver-300 dark:border-ekami-charcoal-600 rounded-xl cursor-pointer hover:border-ekami-gold-500 transition-colors">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-ekami-charcoal-400" />
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {uploading ? 'Uploading...' : 'Click to upload featured image'}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                  placeholder="Brief summary of the post..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  Content * (Supports Markdown)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white font-mono text-sm"
                  placeholder="Write your blog post content here... You can use markdown formatting."
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                  placeholder="SEO optimized title (60 characters max)"
                  maxLength={60}
                />
                <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                  {formData.meta_title.length}/60 characters
                </p>
              </div>

              {/* SEO Description */}
              <div>
                <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                  placeholder="SEO meta description (160 characters max)"
                  maxLength={160}
                />
                <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-900 rounded-xl">
                <h4 className="text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
                  Search Engine Preview
                </h4>
                <div className="space-y-2">
                  <p className="text-blue-600 text-lg font-medium">
                    {formData.meta_title || formData.title || 'Your Blog Post Title'}
                  </p>
                  <p className="text-green-700 text-sm">
                    ekamiauto.com › blog › {formData.slug || 'post-slug'}
                  </p>
                  <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    {formData.meta_description || formData.excerpt || 'Your blog post description will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-ekami-silver-300 dark:border-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl font-semibold hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-6 py-3 border-2 border-ekami-gold-600 text-ekami-gold-600 rounded-xl font-semibold hover:bg-ekami-gold-50 dark:hover:bg-ekami-gold-900/20 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
