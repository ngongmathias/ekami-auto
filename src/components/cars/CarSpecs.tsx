import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Users, 
  Palette,
  Car as CarIcon,
  Zap,
  MapPin
} from 'lucide-react';
import type { Car } from '../../lib/supabase';

interface CarSpecsProps {
  car: Car;
}

export default function CarSpecs({ car }: CarSpecsProps) {
  const specs = [
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Year',
      value: car.year,
    },
    {
      icon: <Gauge className="w-5 h-5" />,
      label: 'Mileage',
      value: car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A',
    },
    {
      icon: <Fuel className="w-5 h-5" />,
      label: 'Fuel Type',
      value: car.fuel_type || 'N/A',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Transmission',
      value: car.transmission || 'N/A',
    },
    {
      icon: <CarIcon className="w-5 h-5" />,
      label: 'Body Type',
      value: car.body_type || 'N/A',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Seats',
      value: car.seats || 'N/A',
    },
    {
      icon: <Palette className="w-5 h-5" />,
      label: 'Color',
      value: car.color || 'N/A',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Engine',
      value: car.engine_size || 'N/A',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Location',
      value: car.city || car.location || 'N/A',
    },
  ];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
        Specifications
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {specs.map((spec, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors"
          >
            <div className="flex-shrink-0 p-2 bg-white dark:bg-ekami-charcoal-900 rounded-lg text-ekami-gold-600">
              {spec.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                {spec.label}
              </p>
              <p className="font-semibold text-ekami-charcoal-900 dark:text-white truncate">
                {spec.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      {car.features && car.features.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Features & Equipment
          </h3>
          <div className="flex flex-wrap gap-2">
            {car.features.map((feature, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-ekami-silver-100 to-ekami-silver-200 dark:from-ekami-charcoal-700 dark:to-ekami-charcoal-600 text-ekami-charcoal-800 dark:text-ekami-silver-200 rounded-xl text-sm font-medium shadow-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {car.description && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Description
          </h3>
          <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300 leading-relaxed">
            {car.description}
          </p>
        </div>
      )}

      {/* Condition Badge */}
      {car.condition && (
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl font-semibold">
          Condition: {car.condition}
        </div>
      )}
    </div>
  );
}
