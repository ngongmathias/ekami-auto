import { useState } from 'react';
import { DollarSign, TrendingDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CarValueCalculator() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('good');
  const [accidents, setAccidents] = useState('no');
  const [owners, setOwners] = useState('1');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [valueRange, setValueRange] = useState<{ min: number; max: number } | null>(null);

  const calculateValue = () => {
    if (!year || !mileage) return;

    // Base value calculation (simplified algorithm)
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(year);
    const km = parseInt(mileage);

    // Starting base value (example for mid-range car)
    let baseValue = 15000000; // 15M XAF

    // Depreciation by age (15% per year for first 5 years, then 10%)
    for (let i = 0; i < carAge; i++) {
      if (i < 5) {
        baseValue *= 0.85; // 15% depreciation
      } else {
        baseValue *= 0.90; // 10% depreciation
      }
    }

    // Mileage adjustment (every 10,000 km reduces value by 2%)
    const mileageReduction = Math.floor(km / 10000) * 0.02;
    baseValue *= (1 - mileageReduction);

    // Condition adjustment
    const conditionMultipliers = {
      excellent: 1.15,
      good: 1.0,
      fair: 0.85,
      poor: 0.70,
    };
    baseValue *= conditionMultipliers[condition as keyof typeof conditionMultipliers];

    // Accident history
    if (accidents === 'yes') {
      baseValue *= 0.85; // 15% reduction
    } else if (accidents === 'minor') {
      baseValue *= 0.92; // 8% reduction
    }

    // Number of owners
    const ownerCount = parseInt(owners);
    if (ownerCount > 1) {
      baseValue *= (1 - (ownerCount - 1) * 0.05); // 5% per additional owner
    }

    // Calculate range (±10%)
    const min = Math.round(baseValue * 0.9);
    const max = Math.round(baseValue * 1.1);
    const estimated = Math.round(baseValue);

    setEstimatedValue(estimated);
    setValueRange({ min, max });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Car Value Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Estimate your car's current market value in Cameroon
        </p>
      </div>

      {/* Calculator Form */}
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Make */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Make
            </label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
              placeholder="Toyota, Mercedes, etc."
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
              placeholder="Camry, C-Class, etc."
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
              placeholder="2020"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mileage (km) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
              placeholder="50000"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
            >
              <option value="excellent">Excellent - Like new</option>
              <option value="good">Good - Minor wear</option>
              <option value="fair">Fair - Noticeable wear</option>
              <option value="poor">Poor - Needs repairs</option>
            </select>
          </div>

          {/* Accidents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accident History
            </label>
            <select
              value={accidents}
              onChange={(e) => setAccidents(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
            >
              <option value="no">No accidents</option>
              <option value="minor">Minor accidents</option>
              <option value="yes">Major accidents</option>
            </select>
          </div>

          {/* Number of Owners */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Previous Owners
            </label>
            <select
              value={owners}
              onChange={(e) => setOwners(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
            >
              <option value="1">1 owner (original)</option>
              <option value="2">2 owners</option>
              <option value="3">3 owners</option>
              <option value="4">4+ owners</option>
            </select>
          </div>
        </div>

        <button
          onClick={calculateValue}
          disabled={!year || !mileage}
          className="w-full mt-6 px-6 py-4 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Calculate Value
        </button>
      </div>

      {/* Results */}
      {estimatedValue && valueRange && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-ekami-gold-500 to-ekami-gold-600 rounded-lg p-8 shadow-2xl text-white mb-6"
        >
          <div className="text-center mb-6">
            <p className="text-sm font-medium mb-2 opacity-90">Estimated Market Value</p>
            <p className="text-5xl font-bold mb-4">{formatCurrency(estimatedValue)}</p>
            <div className="flex items-center justify-center gap-2 text-sm opacity-90">
              <TrendingDown className="w-4 h-4" />
              <span>Range: {formatCurrency(valueRange.min)} - {formatCurrency(valueRange.max)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Trade-In Value</p>
              <p className="text-2xl font-bold">{formatCurrency(Math.round(estimatedValue * 0.85))}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Private Sale</p>
              <p className="text-2xl font-bold">{formatCurrency(estimatedValue)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Dealer Price</p>
              <p className="text-2xl font-bold">{formatCurrency(Math.round(estimatedValue * 1.15))}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
              How We Calculate Value
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• <strong>Age:</strong> 15% depreciation per year (first 5 years), then 10%</li>
              <li>• <strong>Mileage:</strong> 2% reduction per 10,000 km</li>
              <li>• <strong>Condition:</strong> Excellent (+15%), Good (0%), Fair (-15%), Poor (-30%)</li>
              <li>• <strong>Accidents:</strong> Major (-15%), Minor (-8%)</li>
              <li>• <strong>Owners:</strong> 5% reduction per additional owner</li>
            </ul>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-3">
              <strong>Note:</strong> This is an estimate based on general market trends in Cameroon. 
              Actual value may vary based on specific features, maintenance history, and current market demand.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      {estimatedValue && (
        <div className="mt-6 bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Want to Sell Your Car?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get a professional appraisal and sell through Ekami Auto
          </p>
          <button className="px-8 py-3 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 transition-colors">
            Get Professional Appraisal
          </button>
        </div>
      )}
    </div>
  );
}
