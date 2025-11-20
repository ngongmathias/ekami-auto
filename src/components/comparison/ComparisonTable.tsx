import { X, Check, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Car } from '../../lib/supabase';
import StarRating from '../reviews/StarRating';

interface ComparisonTableProps {
  cars: Car[];
  onRemove: (carId: string) => void;
}

interface ComparisonRow {
  label: string;
  getValue: (car: Car) => string | number | boolean | null | undefined;
  format?: (value: any) => React.ReactNode;
  highlight?: boolean;
}

export default function ComparisonTable({ cars, onRemove }: ComparisonTableProps) {
  const comparisonRows: ComparisonRow[] = [
    // Basic Info
    { label: 'Make', getValue: (car) => car.make, highlight: true },
    { label: 'Model', getValue: (car) => car.model, highlight: true },
    { label: 'Year', getValue: (car) => car.year },
    { label: 'Body Type', getValue: (car) => car.body_type },
    { label: 'Condition', getValue: (car) => car.condition },
    
    // Pricing
    { 
      label: 'Daily Rental', 
      getValue: (car) => car.price_rent_daily,
      format: (val) => val ? `${val.toLocaleString()} XAF` : 'N/A',
      highlight: true
    },
    { 
      label: 'Weekly Rental', 
      getValue: (car) => car.price_rent_weekly,
      format: (val) => val ? `${val.toLocaleString()} XAF` : 'N/A'
    },
    { 
      label: 'Monthly Rental', 
      getValue: (car) => car.price_rent_monthly,
      format: (val) => val ? `${val.toLocaleString()} XAF` : 'N/A'
    },
    { 
      label: 'Sale Price', 
      getValue: (car) => car.price_sale,
      format: (val) => val ? `${val.toLocaleString()} XAF` : 'N/A',
      highlight: true
    },
    
    // Specifications
    { label: 'Transmission', getValue: (car) => car.transmission },
    { label: 'Fuel Type', getValue: (car) => car.fuel_type },
    { label: 'Engine Size', getValue: (car) => car.engine_size },
    { 
      label: 'Mileage', 
      getValue: (car) => car.mileage,
      format: (val) => val ? `${val.toLocaleString()} km` : 'N/A'
    },
    { label: 'Seats', getValue: (car) => car.seats },
    { label: 'Doors', getValue: (car) => car.doors },
    { label: 'Color', getValue: (car) => car.color },
    
    // Availability
    { 
      label: 'Available for Rent', 
      getValue: (car) => car.available_for_rent,
      format: (val) => val ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <Minus className="w-5 h-5 text-gray-400 mx-auto" />
    },
    { 
      label: 'Available for Sale', 
      getValue: (car) => car.available_for_sale,
      format: (val) => val ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <Minus className="w-5 h-5 text-gray-400 mx-auto" />
    },
    { label: 'Status', getValue: (car) => car.status },
    { label: 'Location', getValue: (car) => car.city || car.location },
  ];

  const getHighlightClass = (values: any[]) => {
    // Check if values are different to highlight
    const uniqueValues = new Set(values.filter(v => v != null));
    if (uniqueValues.size <= 1) return '';
    
    // Find best value (lowest for prices, highest for features)
    const numericValues = values.filter(v => typeof v === 'number');
    if (numericValues.length > 0) {
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      return (val: any) => {
        if (typeof val !== 'number') return '';
        if (val === min) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
        if (val === max) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
        return '';
      };
    }
    return () => '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header with Car Images */}
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white dark:bg-ekami-charcoal-900 p-4 border-b-2 border-ekami-gold-400">
              <div className="w-32 text-left">
                <span className="text-sm font-semibold text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Specifications
                </span>
              </div>
            </th>
            {cars.map((car) => (
              <th key={car.id} className="p-4 border-b-2 border-ekami-gold-400 min-w-[280px]">
                <div className="relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(car.id)}
                    className="absolute -top-2 -right-2 z-10 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    aria-label="Remove car"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Car Image */}
                  <Link to={`/cars/${car.slug || car.id}`}>
                    <img
                      src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-40 object-cover rounded-xl mb-3 hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Car Name */}
                  <Link 
                    to={`/cars/${car.slug || car.id}`}
                    className="block font-bold text-lg text-ekami-charcoal-900 dark:text-white hover:text-ekami-gold-600 transition-colors"
                  >
                    {car.make} {car.model}
                  </Link>
                  <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    {car.year}
                  </p>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Comparison Rows */}
        <tbody>
          {comparisonRows.map((row, index) => {
            const values = cars.map(car => row.getValue(car));
            const highlightFn = row.highlight ? getHighlightClass(values) : () => '';

            return (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border-b border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800/50"
              >
                <td className="sticky left-0 z-10 bg-white dark:bg-ekami-charcoal-900 p-4 font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                  {row.label}
                </td>
                {values.map((value, idx) => (
                  <td 
                    key={idx} 
                    className={`p-4 text-center ${typeof highlightFn === 'function' ? highlightFn(value) : ''}`}
                  >
                    <div className="text-ekami-charcoal-900 dark:text-white">
                      {row.format ? row.format(value) : (value?.toString() || 'N/A')}
                    </div>
                  </td>
                ))}
              </motion.tr>
            );
          })}

          {/* Features Row */}
          <tr className="border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
            <td className="sticky left-0 z-10 bg-white dark:bg-ekami-charcoal-900 p-4 font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
              Features
            </td>
            {cars.map((car) => (
              <td key={car.id} className="p-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {car.features && Array.isArray(car.features) && car.features.length > 0 ? (
                    car.features.slice(0, 6).map((feature: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-700 dark:text-ekami-gold-400 rounded text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                      No features listed
                    </span>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Action Buttons */}
          <tr>
            <td className="sticky left-0 z-10 bg-white dark:bg-ekami-charcoal-900 p-4"></td>
            {cars.map((car) => (
              <td key={car.id} className="p-4">
                <div className="flex flex-col gap-2">
                  {car.available_for_rent && (
                    <Link
                      to={`/book/${car.slug || car.id}`}
                      className="px-4 py-2 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors text-center"
                    >
                      Book Now
                    </Link>
                  )}
                  <Link
                    to={`/cars/${car.slug || car.id}`}
                    className="px-4 py-2 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl font-semibold hover:bg-ekami-silver-200 dark:hover:bg-ekami-charcoal-700 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
