import { Link } from 'react-router-dom';
import { Heart, Fuel, Gauge, Users, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Car } from '../../lib/supabase';

interface FavoriteCardProps {
  car: Car;
  onRemove: (carId: string) => void;
}

export default function FavoriteCard({ car, onRemove }: FavoriteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card group hover:shadow-xl transition-all"
    >
      <div className="relative">
        {/* Car Image */}
        <Link to={`/cars/${car.slug || car.id}`}>
          <div className="relative h-56 rounded-2xl overflow-hidden mb-4">
            <img
              src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Availability Badge */}
            {car.available_for_rent && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                Available
              </div>
            )}
          </div>
        </Link>

        {/* Remove from Favorites */}
        <button
          onClick={() => onRemove(car.id)}
          className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-ekami-charcoal-800/90 backdrop-blur-sm rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group/heart"
        >
          <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover/heart:scale-110 transition-transform" />
        </button>
      </div>

      {/* Car Details */}
      <Link to={`/cars/${car.slug || car.id}`}>
        <div className="space-y-3">
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white group-hover:text-ekami-gold-600 transition-colors">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              {car.year}
            </p>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              <Gauge className="w-4 h-4 text-ekami-gold-600" />
              <span>{car.transmission}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              <Fuel className="w-4 h-4 text-ekami-gold-600" />
              <span>{car.fuel_type}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              <Users className="w-4 h-4 text-ekami-gold-600" />
              <span>{car.seats} Seats</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              <MapPin className="w-4 h-4 text-ekami-gold-600" />
              <span>{car.city}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
            {car.available_for_rent && car.price_rent_daily && (
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                    From
                  </p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-ekami-gold-600">
                      {car.price_rent_daily.toLocaleString()}
                    </span>
                    <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                      XAF/day
                    </span>
                  </div>
                </div>
                <Link
                  to={`/book/${car.slug || car.id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </Link>
              </div>
            )}

            {car.available_for_sale && car.price_sale && !car.available_for_rent && (
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                    Sale Price
                  </p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-ekami-gold-600">
                      {car.price_sale.toLocaleString()}
                    </span>
                    <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                      XAF
                    </span>
                  </div>
                </div>
                <Link
                  to={`/cars/${car.slug || car.id}`}
                  className="px-4 py-2 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
