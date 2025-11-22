import { useState } from 'react';
import { X, Bell, TrendingDown, Target, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Car } from '../../lib/supabase';

interface PriceAlertModalProps {
  car: Car;
  onClose: () => void;
}

type AlertType = 'any_drop' | 'target_price' | 'percentage_drop';

export default function PriceAlertModal({ car, onClose }: PriceAlertModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('any_drop');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentageThreshold, setPercentageThreshold] = useState('10');
  const [loading, setLoading] = useState(false);

  const currentPrice = car.price_rent_daily || car.price_sale || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate target price if needed
    if (alertType === 'target_price') {
      const target = parseFloat(targetPrice);
      if (!target || target >= currentPrice) {
        toast.error('Target price must be lower than current price');
        return;
      }
    }

    try {
      setLoading(true);

      const alertData = {
        car_id: car.id,
        user_email: email.toLowerCase().trim(),
        user_name: name.trim(),
        current_price: currentPrice,
        alert_type: alertType,
        target_price: alertType === 'target_price' ? parseFloat(targetPrice) : null,
        percentage_threshold: alertType === 'percentage_drop' ? parseInt(percentageThreshold) : 10,
        is_active: true,
      };

      const { error } = await supabase
        .from('price_alerts')
        .insert(alertData);

      if (error) throw error;

      toast.success('🔔 Price alert created! We\'ll notify you when the price drops.');
      onClose();
    } catch (error: any) {
      console.error('Error creating price alert:', error);
      toast.error(error.message || 'Failed to create price alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ekami-gold-100 dark:bg-ekami-gold-900/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-ekami-gold-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
                  Price Drop Alert
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when price drops
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Car Info */}
          <div className="mb-6 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                alt={`${car.make} ${car.model}`}
                className="w-20 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  {car.make} {car.model} {car.year}
                </p>
                <p className="text-lg font-bold text-ekami-gold-600">
                  {currentPrice.toLocaleString()} XAF/day
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                placeholder="john@example.com"
              />
            </div>

            {/* Alert Type */}
            <div>
              <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
                Alert Type
              </label>
              <div className="space-y-3">
                {/* Any Drop */}
                <label className="flex items-start gap-3 p-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg cursor-pointer hover:border-ekami-gold-500 transition-colors">
                  <input
                    type="radio"
                    name="alertType"
                    value="any_drop"
                    checked={alertType === 'any_drop'}
                    onChange={(e) => setAlertType(e.target.value as AlertType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-ekami-gold-600" />
                      <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                        Any Price Drop
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified whenever the price decreases
                    </p>
                  </div>
                </label>

                {/* Target Price */}
                <label className="flex items-start gap-3 p-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg cursor-pointer hover:border-ekami-gold-500 transition-colors">
                  <input
                    type="radio"
                    name="alertType"
                    value="target_price"
                    checked={alertType === 'target_price'}
                    onChange={(e) => setAlertType(e.target.value as AlertType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-ekami-gold-600" />
                      <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                        Target Price
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Get notified when price reaches your target
                    </p>
                    {alertType === 'target_price' && (
                      <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white text-sm"
                        placeholder={`Less than ${currentPrice.toLocaleString()} XAF`}
                        required
                      />
                    )}
                  </div>
                </label>

                {/* Percentage Drop */}
                <label className="flex items-start gap-3 p-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg cursor-pointer hover:border-ekami-gold-500 transition-colors">
                  <input
                    type="radio"
                    name="alertType"
                    value="percentage_drop"
                    checked={alertType === 'percentage_drop'}
                    onChange={(e) => setAlertType(e.target.value as AlertType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Percent className="w-4 h-4 text-ekami-gold-600" />
                      <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                        Percentage Drop
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Get notified when price drops by a percentage
                    </p>
                    {alertType === 'percentage_drop' && (
                      <select
                        value={percentageThreshold}
                        onChange={(e) => setPercentageThreshold(e.target.value)}
                        className="w-full px-3 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white text-sm"
                      >
                        <option value="5">5% or more</option>
                        <option value="10">10% or more</option>
                        <option value="15">15% or more</option>
                        <option value="20">20% or more</option>
                        <option value="25">25% or more</option>
                      </select>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-ekami-silver-300 dark:border-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-ekami-gold-600 to-ekami-gold-700 text-white rounded-lg hover:from-ekami-gold-700 hover:to-ekami-gold-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Creating Alert...' : '🔔 Create Alert'}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 You'll receive an email notification when the price drops. You can unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
