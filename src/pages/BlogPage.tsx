import { useTranslation } from 'react-i18next';

export default function BlogPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">
          {t('blog.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Blog posts, car tips, and buying guides coming soon.
        </p>
      </div>
    </div>
  );
}
