import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, Car, Wrench, DollarSign, Star, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getAvailableCarsForRent, type Car as CarType } from '../lib/supabase';
import toast from 'react-hot-toast';
import DynamicSearchBox from '../components/home/DynamicSearchBox';

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredCars, setFeaturedCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured cars from Supabase
  useEffect(() => {
    async function fetchCars() {
      try {
        const cars = await getAvailableCarsForRent();
        setFeaturedCars(cars.slice(0, 6)); // Get first 6 cars
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error('Failed to load cars');
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  const features = [
    {
      icon: <Car className="w-8 h-8" />,
      title: 'Wide Selection',
      description: 'Choose from hundreds of verified cars',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Trusted & Safe',
      description: 'All cars inspected and certified',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Best Prices',
      description: 'Competitive rates across Cameroon',
    },
  ];

  const categories = [
    { name: t('categories.suv'), image: '/images/suv.jpg', count: 45 },
    { name: t('categories.sedan'), image: '/images/sedan.jpg', count: 62 },
    { name: t('categories.pickup'), image: '/images/pickup.jpg', count: 28 },
    { name: t('categories.luxury'), image: '/images/luxury.jpg', count: 15 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-ekami-charcoal-900 via-ekami-charcoal-800 to-ekami-silver-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        {/* Luxury shine effect */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-ekami-silver-400/10 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-ekami-silver-200">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/rent"
                className="px-10 py-5 bg-gradient-to-r from-gray-100 to-gray-200 text-ekami-charcoal-900 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all shadow-2xl hover:shadow-ekami-silver-400/50 transform hover:-translate-y-1 hover:scale-105 border-2 border-white/50"
              >
                {t('hero.searchCars')}
              </Link>
              <button className="px-10 py-5 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 text-white rounded-2xl font-bold hover:from-ekami-gold-600 hover:to-ekami-gold-700 transition-all shadow-2xl hover:shadow-ekami-gold-500/50 transform hover:-translate-y-1 hover:scale-105">
                {t('hero.talkToAI')}
              </button>
            </div>
          </motion.div>

          {/* Dynamic Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 max-w-5xl mx-auto"
          >
            <DynamicSearchBox />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-ekami-silver-200 to-ekami-silver-300 dark:from-ekami-charcoal-700 dark:to-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-200 rounded-full mb-4 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-ekami-charcoal-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-white dark:bg-ekami-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
              Featured Cars
            </h2>
            <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
              Explore our premium selection of vehicles
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/cars/${car.slug || car.id}`} className="block card group">
                    {/* Car Image */}
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                      <img
                        src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-ekami-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {car.body_type}
                      </div>
                    </div>

                    {/* Car Info */}
                    <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 text-sm mb-3">
                      {car.year} • {car.transmission} • {car.fuel_type}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">From</p>
                        <p className="text-2xl font-bold text-ekami-gold-600">
                          {car.price_rent_daily?.toLocaleString()} XAF
                          <span className="text-sm font-normal text-ekami-charcoal-500 dark:text-ekami-silver-500">/day</span>
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-gradient-to-r from-ekami-charcoal-700 to-ekami-charcoal-800 text-white rounded-xl font-semibold text-sm group-hover:from-ekami-gold-500 group-hover:to-ekami-gold-600 transition-all">
                        View Details
                      </div>
                    </div>

                    {/* Features */}
                    {car.features && car.features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {car.features.slice(0, 3).map((feature, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400">No cars available at the moment</p>
            </div>
          )}

          {/* View All Button */}
          {featuredCars.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/rent"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-ekami-charcoal-700 to-ekami-charcoal-800 text-white rounded-2xl font-semibold hover:from-ekami-gold-500 hover:to-ekami-gold-600 transition-all shadow-xl transform hover:-translate-y-1"
              >
                View All Cars
                <TrendingUp className="ml-2 w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
              Find the perfect car for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-200">{category.count} cars available</p>
                  </div>
                  <div className="absolute inset-0 bg-ekami-blue-600/0 group-hover:bg-ekami-blue-600/20 transition-all duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-ekami-charcoal-900 via-ekami-silver-800 to-ekami-charcoal-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ekami-gold-500/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-ekami-silver-200">
            Join thousands of satisfied customers across Cameroon
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rent"
              className="px-10 py-5 bg-gradient-to-r from-gray-100 to-gray-200 text-ekami-charcoal-900 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all shadow-2xl transform hover:-translate-y-1 hover:scale-105 border-2 border-white/50"
            >
              Rent a Car
            </Link>
            <Link
              to="/sell"
              className="px-10 py-5 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 text-white rounded-2xl font-bold hover:from-ekami-gold-600 hover:to-ekami-gold-700 transition-all shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Sell Your Car
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
