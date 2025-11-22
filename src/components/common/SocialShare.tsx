import { Share2, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAnalytics } from '../../hooks/useAnalytics';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  hashtags?: string[];
}

export default function SocialShare({ url, title, description, imageUrl, hashtags }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useAnalytics();
  const fullUrl = url.startsWith('http') ? url : `https://ekamiauto.com${url}`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description || ''}\n\n${fullUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}${hashtags ? `&hashtags=${hashtags.join(',')}` : ''}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ''}\n\n${fullUrl}`)}`,
  };

  const handleShare = async (platform: string, shareUrl: string) => {
    // Track share event if analytics is available
    if (analytics?.trackEvent) {
      analytics.trackEvent('share', {
        platform,
        url: fullUrl,
        title,
      });
    }

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
      return;
    }

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
      return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      handleShare('native', '');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const socialButtons = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: shareLinks.whatsapp,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: shareLinks.facebook,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: shareLinks.twitter,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: shareLinks.linkedin,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: shareLinks.email,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-ekami-silver-100 dark:bg-ekami-charcoal-700 hover:bg-ekami-silver-200 dark:hover:bg-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg transition-colors"
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-medium">Share</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            />

            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-ekami-charcoal-800 rounded-xl shadow-2xl border border-ekami-silver-200 dark:border-ekami-charcoal-700 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
                <h3 className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  Share this
                </h3>
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1 truncate">
                  {title}
                </p>
              </div>

              {/* Social Buttons */}
              <div className="p-3 space-y-2">
                {socialButtons.map((social) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={social.name}
                      onClick={() => handleShare(social.name.toLowerCase(), social.url)}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${social.color} text-white rounded-lg transition-all transform hover:scale-105 shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">Share on {social.name}</span>
                    </button>
                  );
                })}

                {/* Copy Link */}
                <button
                  onClick={() => handleShare('copy', '')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-ekami-gold-500 hover:bg-ekami-gold-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span className="font-medium">Copy Link</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
