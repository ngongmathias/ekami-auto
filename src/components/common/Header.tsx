import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Moon, Sun, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import CurrencySelector from './CurrencySelector';

export default function Header() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { isSignedIn, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/rent', label: t('nav.rent') },
    { path: '/buy', label: t('nav.buy') },
    { path: '/compare', label: 'Compare' },
    { path: '/repairs', label: t('nav.repairs') },
    { path: '/sell', label: t('nav.sell') },
    { path: '/blog', label: t('nav.blog') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-ekami-charcoal-900 shadow-lg border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white dark:bg-ekami-charcoal-800 shadow-md ring-2 ring-ekami-silver-300 dark:ring-ekami-charcoal-600 transition-all group-hover:ring-ekami-gold-400 group-hover:shadow-lg">
              <img 
                src="/logo.jpg" 
                alt="Ekami Auto" 
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-ekami-silver-400 to-ekami-silver-600 bg-clip-text text-transparent dark:from-ekami-silver-200 dark:to-ekami-silver-400">
              EKAMI AUTO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:text-ekami-gold-600 dark:hover:text-ekami-gold-400 font-medium transition-colors hover-underline-animation"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
              className="px-3 py-1 text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-800 rounded-md transition-colors"
            >
              {language === 'en' ? 'FR' : 'EN'}
            </button>

            {/* Currency Selector */}
            <div className="hidden md:block">
              <CurrencySelector />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth */}
            {isSignedIn ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/account"
                  className="flex items-center space-x-2 px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-800 rounded-md transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.firstName || t('nav.account')}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-800 rounded-md transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/sign-in"
                  className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-800 rounded-md transition-colors font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/sign-up"
                  className="px-4 py-2 bg-gradient-to-r from-ekami-silver-600 to-ekami-charcoal-700 text-white rounded-md hover:from-ekami-silver-700 hover:to-ekami-charcoal-800 transition-all shadow-lg font-medium"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ekami-charcoal-700 dark:text-ekami-silver-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {t('nav.account')}
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-ekami-blue-600 text-white rounded-md hover:bg-ekami-blue-700 transition-colors text-center"
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
