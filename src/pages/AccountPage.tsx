import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AccountPage() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="spinner"></div>
    </div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">
          {t('account.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          User account dashboard with bookings, favorites, and loyalty points coming soon.
        </p>
      </div>
    </div>
  );
}
