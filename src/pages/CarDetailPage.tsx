import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function CarDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">
          Car Details - ID: {id}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Car detail page with gallery, specs, booking, and 360° view coming soon.
        </p>
      </div>
    </div>
  );
}
