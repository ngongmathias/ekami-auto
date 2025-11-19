import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  const companyLinks = [
    { label: t('footer.about'), path: '/about' },
    { label: t('footer.contact'), path: '/contact' },
    { label: t('footer.careers'), path: '/careers' },
  ];

  const helpLinks = [
    { label: t('footer.faqs'), path: '/faqs' },
    { label: t('footer.support'), path: '/support' },
    { label: t('footer.terms'), path: '/terms' },
    { label: t('footer.privacy'), path: '/privacy' },
  ];

  const serviceLinks = [
    { label: t('nav.rent'), path: '/rent' },
    { label: t('nav.buy'), path: '/buy' },
    { label: t('nav.repairs'), path: '/repairs' },
    { label: t('nav.sell'), path: '/sell' },
  ];

  return (
    <footer className="bg-gradient-to-b from-ekami-charcoal-900 to-black text-ekami-silver-300 border-t border-ekami-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.jpg" alt="Ekami Auto" className="h-10 w-auto" />
              <h3 className="text-white font-display font-bold text-xl bg-gradient-to-r from-ekami-silver-200 to-ekami-silver-400 bg-clip-text text-transparent">EKAMI AUTO</h3>
            </div>
            <p className="text-sm mb-4 text-ekami-silver-400">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-ekami-gold-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-ekami-gold-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-ekami-gold-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-ekami-gold-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ekami-silver-400 hover:text-ekami-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.help')}</h3>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ekami-silver-400 hover:text-ekami-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ekami-silver-400 hover:text-ekami-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ekami-charcoal-800 mt-8 pt-8 text-center text-sm text-ekami-silver-500">
          <p>&copy; {new Date().getFullYear()} Ekami Auto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
