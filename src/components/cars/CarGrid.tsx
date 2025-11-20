import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Fuel, 
  Settings, 
  Users,
  TrendingUp,
  Star
} from 'lucide-react';
import { useState } from 'react';
import type { Car } from '../../lib/supabase';

interface CarGridProps {
  cars: Car[];
  viewMode: 'grid' | 'list';
  mode?: 'rent' | 'sale';
}

export default function CarGrid({ cars, viewMode, mode = 'rent' }: CarGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (carId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(carId)) {
        newFavorites.delete(carId);
      } else {
        newFavorites.add(carId);
      }
      return newFavorites;
    });
  };

  if (cars.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 rounded-full mb-4">
          <TrendingUp className="w-10 h-10 text-ekami-charcoal-400 dark:text-ekami-silver-500" />
        </div>
        <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
          No cars found
        </h3>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {cars.map((car, index) => (
          <motion.div
            key={car.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              to={`/cars/${car.slug || car.id}`}
              className="card group hover:shadow-2xl transition-all flex flex-col md:flex-row overflow-hidden"
            >
              {/* Image */}
              <div className="relative w-full md:w-80 h-56 flex-shrink-0">
                <img
                  src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(car.id, e)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                    favorites.has(car.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-ekami-charcoal-600 hover:bg-white'
                  }`}
                  aria-label="Add to favorites"
                >
                  <Heart className={`w-5 h-5 ${favorites.has(car.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Body Type Badge */}
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-ekami-gold-500 text-white text-sm font-semibold rounded-full">
                  {car.body_type}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-1 group-hover:text-ekami-gold-600 transition-colors">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      {car.year}
                    </p>
                  </div>
                  
                  {/* Verified Badge */}
                  {car.is_verified && (
                    <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">{car.transmission}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    <Fuel className="w-4 h-4" />
                    <span className="text-sm">{car.fuel_type}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{car.seats} Seats</span>
                  </div>
                  {(car.city || car.location) && (
                    <div className="flex items-center space-x-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{car.city || car.location}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {car.features && car.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.features.slice(0, 4).map((feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                    {car.features.length > 4 && (
                      <span className="px-3 py-1 text-ekami-charcoal-500 dark:text-ekami-silver-500 text-xs">
                        +{car.features.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {car.description && (
                  <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 text-sm line-clamp-2 mb-4">
                    {car.description}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-1">
                      {mode === 'sale' ? 'Price' : 'Starting from'}
                    </p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-ekami-gold-600">
                        {mode === 'sale' ? car.price_sale?.toLocaleString() : car.price_rent_daily?.toLocaleString()}
                      </span>
                      <span className="text-lg text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        XAF
                      </span>
                      {mode === 'rent' && (
                        <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                          /day
                        </span>
                      )}
                    </div>
                  </div>

                  <button className="px-6 py-3 bg-gradient-to-r from-ekami-charcoal-700 to-ekami-charcoal-800 text-white rounded-xl font-semibold hover:from-ekami-gold-500 hover:to-ekami-gold-600 transition-all shadow-lg transform hover:-translate-y-0.5">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car, index) => (
        <motion.div
          key={car.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link
            to={`/cars/${car.slug || car.id}`}
            className="card group hover:shadow-2xl transition-all h-full flex flex-col"
          >
            {/* Image */}
            <div className="relative h-56 rounded-2xl overflow-hidden mb-4">
              <img
                src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Favorite Button */}
              <button
                onClick={(e) => toggleFavorite(car.id, e)}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                  favorites.has(car.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-ekami-charcoal-600 hover:bg-white'
                }`}
                aria-label="Add to favorites"
              >
                <Heart className={`w-5 h-5 ${favorites.has(car.id) ? 'fill-current' : ''}`} />
              </button>

              {/* Body Type Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-ekami-gold-500 text-white text-sm font-semibold rounded-full">
                {car.body_type}
              </div>

              {/* Verified Badge */}
              {car.is_verified && (
                <div className="absolute bottom-3 left-3 flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-1 group-hover:text-ekami-gold-600 transition-colors">
                {car.make} {car.model}
              </h3>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-3">
                {car.year} • {car.transmission} • {car.fuel_type}
              </p>

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {car.features.slice(0, 3).map((feature, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {/* Location */}
              {(car.city || car.location) && (
                <div className="flex items-center space-x-1 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{car.city || car.location}</span>
                </div>
              )}

              {/* Price */}
              <div className="mt-auto pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
                <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-1">
                  {mode === 'sale' ? 'Price' : 'From'}
                </p>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-ekami-gold-600">
                      {mode === 'sale' ? car.price_sale?.toLocaleString() : car.price_rent_daily?.toLocaleString()}
                    </span>
                    <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                      XAF{mode === 'rent' ? '/day' : ''}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-ekami-gold-600 group-hover:translate-x-1 transition-transform">
                    View →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
