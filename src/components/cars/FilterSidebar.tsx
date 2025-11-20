import { useState } from 'react';
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  filters: {
    priceRange: [number, number];
    bodyTypes: string[];
    transmissions: string[];
    fuelTypes: string[];
    seats: string[];
    cities: string[];
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  mode?: 'rent' | 'sale';
}

export default function FilterSidebar({ filters, onFilterChange, onReset, mode = 'rent' }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    bodyType: true,
    transmission: true,
    fuelType: true,
    seats: true,
    location: true,
  });

  const [localFilters, setLocalFilters] = useState(filters);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...localFilters.priceRange] as [number, number];
    newRange[index] = value;
    const updated = { ...localFilters, priceRange: newRange };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const toggleArrayFilter = (key: keyof typeof localFilters, value: string) => {
    const currentArray = localFilters[key] as string[];
    const updated = {
      ...localFilters,
      [key]: currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value],
    };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const maxPrice = mode === 'sale' ? 100000000 : 50000000;

  const handleReset = () => {
    const resetFilters = {
      priceRange: [0, maxPrice] as [number, number],
      bodyTypes: [],
      transmissions: [],
      fuelTypes: [],
      seats: [],
      cities: [],
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  const bodyTypeOptions = [
    { value: 'SUV', label: 'SUV', icon: '🚙' },
    { value: 'Sedan', label: 'Sedan', icon: '🚗' },
    { value: 'Pickup', label: 'Pickup', icon: '🛻' },
    { value: 'Luxury', label: 'Luxury', icon: '✨' },
    { value: 'Van', label: 'Van', icon: '🚐' },
    { value: 'Coupe', label: 'Coupe', icon: '🏎️' },
  ];

  const transmissionOptions = [
    { value: 'Automatic', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' },
  ];

  const fuelTypeOptions = [
    { value: 'Petrol', label: 'Petrol', icon: '⛽' },
    { value: 'Diesel', label: 'Diesel', icon: '🛢️' },
    { value: 'Electric', label: 'Electric', icon: '⚡' },
    { value: 'Hybrid', label: 'Hybrid', icon: '🔋' },
  ];

  const seatOptions = [
    { value: '2', label: '2 Seats' },
    { value: '4', label: '4 Seats' },
    { value: '5', label: '5 Seats' },
    { value: '7', label: '7+ Seats' },
  ];

  const cityOptions = [
    { value: 'Douala', label: 'Douala' },
    { value: 'Yaoundé', label: 'Yaoundé' },
    { value: 'Bafoussam', label: 'Bafoussam' },
    { value: 'Garoua', label: 'Garoua' },
    { value: 'Bamenda', label: 'Bamenda' },
  ];

  const FilterSection = ({ 
    title, 
    section, 
    children 
  }: { 
    title: string; 
    section: keyof typeof expandedSections; 
    children: React.ReactNode 
  }) => (
    <div className="border-b border-ekami-silver-200 dark:border-ekami-charcoal-700 pb-4">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
          {title}
        </span>
        {expandedSections[section] ? (
          <ChevronUp className="w-5 h-5 text-ekami-charcoal-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ekami-charcoal-500" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="card sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-ekami-gold-600" />
          <h2 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
            Filters
          </h2>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-ekami-gold-600 hover:text-ekami-gold-700 font-medium transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Min: {localFilters.priceRange[0].toLocaleString()} XAF
            </span>
            <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Max: {localFilters.priceRange[1].toLocaleString()} XAF
            </span>
          </div>
          
          {/* Min Price Slider */}
          <div>
            <label className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-1 block">
              Minimum Price
            </label>
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="1000000"
              value={localFilters.priceRange[0]}
              onChange={(e) => handlePriceChange(0, parseInt(e.target.value))}
              className="w-full h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
            />
          </div>

          {/* Max Price Slider */}
          <div>
            <label className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-1 block">
              Maximum Price
            </label>
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="1000000"
              value={localFilters.priceRange[1]}
              onChange={(e) => handlePriceChange(1, parseInt(e.target.value))}
              className="w-full h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
            />
          </div>
        </div>
      </FilterSection>

      {/* Body Type */}
      <FilterSection title="Body Type" section="bodyType">
        <div className="grid grid-cols-2 gap-2">
          {bodyTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleArrayFilter('bodyTypes', option.value)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                localFilters.bodyTypes.includes(option.value)
                  ? 'border-ekami-gold-500 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                  : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-ekami-gold-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmission" section="transmission">
        <div className="space-y-2">
          {transmissionOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={localFilters.transmissions.includes(option.value)}
                onChange={() => toggleArrayFilter('transmissions', option.value)}
                className="w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
              />
              <span className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="Fuel Type" section="fuelType">
        <div className="space-y-2">
          {fuelTypeOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={localFilters.fuelTypes.includes(option.value)}
                onChange={() => toggleArrayFilter('fuelTypes', option.value)}
                className="w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
              />
              <span className="text-xl mr-2">{option.icon}</span>
              <span className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Seats */}
      <FilterSection title="Number of Seats" section="seats">
        <div className="grid grid-cols-2 gap-2">
          {seatOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleArrayFilter('seats', option.value)}
              className={`p-3 rounded-xl border-2 transition-all ${
                localFilters.seats.includes(option.value)
                  ? 'border-ekami-gold-500 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                  : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-ekami-gold-300'
              }`}
            >
              <div className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location" section="location">
        <div className="space-y-2">
          {cityOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={localFilters.cities.includes(option.value)}
                onChange={() => toggleArrayFilter('cities', option.value)}
                className="w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
              />
              <span className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Active Filters Count */}
      {(localFilters.bodyTypes.length > 0 ||
        localFilters.transmissions.length > 0 ||
        localFilters.fuelTypes.length > 0 ||
        localFilters.seats.length > 0 ||
        localFilters.cities.length > 0) && (
        <div className="mt-6 p-4 bg-ekami-gold-50 dark:bg-ekami-gold-900/20 rounded-xl">
          <p className="text-sm text-ekami-gold-800 dark:text-ekami-gold-300 font-medium">
            {localFilters.bodyTypes.length +
              localFilters.transmissions.length +
              localFilters.fuelTypes.length +
              localFilters.seats.length +
              localFilters.cities.length}{' '}
            filter(s) active
          </p>
        </div>
      )}
    </div>
  );
}
