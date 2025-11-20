import { motion } from 'framer-motion';
import { Check, Clock, ArrowRight } from 'lucide-react';
import type { ServicePackage } from '../../types/repairs';

interface ServicePackageCardProps {
  package: ServicePackage;
  onSelect: (pkg: ServicePackage) => void;
}

export default function ServicePackageCard({ package: pkg, onSelect }: ServicePackageCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Maintenance': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'Brakes': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'Engine': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'Electrical': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'Transmission': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'Tires': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'Inspection': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.15)' }}
      className="bg-white dark:bg-ekami-charcoal-800 rounded-xl overflow-hidden border border-ekami-silver-200 dark:border-ekami-charcoal-700 transition-all duration-300"
    >
      {/* Header */}
      <div className="p-6 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
            {pkg.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(pkg.category)}`}>
            {pkg.category}
          </span>
        </div>
        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
          {pkg.description}
        </p>
        
        {/* Price */}
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-ekami-gold-600">
            {pkg.price.toLocaleString()}
          </span>
          <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
            XAF
          </span>
        </div>
      </div>

      {/* What's Included */}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-4 h-4 text-ekami-gold-600" />
          <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            {pkg.duration_minutes} minutes
          </span>
        </div>

        <h4 className="text-sm font-semibold text-ekami-charcoal-900 dark:text-white mb-3">
          What's Included:
        </h4>
        <ul className="space-y-2 mb-6">
          {pkg.includes.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-ekami-gold-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                {item}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(pkg)}
          className="w-full bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 hover:from-ekami-gold-600 hover:to-ekami-gold-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
        >
          <span>Book This Service</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
}
