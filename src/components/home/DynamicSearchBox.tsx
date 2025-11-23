import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, DollarSign, Car, Wrench, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from '../maps/LocationPicker';

type SearchMode = 'rent' | 'buy' | 'repair';

const CITIES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Bamenda',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
];

const CAR_MAKES = [
  'Toyota',
  'Honda',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Ford',
  'Nissan',
  'Hyundai',
  'Kia',
  'Lexus',
];

const BODY_TYPES = [
  'SUV',
  'Sedan',
  'Pickup',
  'Hatchback',
  'Coupe',
  'Van',
  'Luxury',
];

const REPAIR_SERVICES = [
  'General Inspection',
  'Oil Change',
  'Brake Service',
  'Engine Repair',
  'Transmission',
  'AC Repair',
  'Tire Service',
  'Electrical',
  'Body Work',
  'Other',
];

export default function DynamicSearchBox() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SearchMode>('rent');
  
  // Rent filters
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [bodyType, setBodyType] = useState('');
  
  // Buy filters
  const [make, setMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [buyBodyType, setBuyBodyType] = useState('');
  
  // Repair filters
  const [repairService, setRepairService] = useState('');
  const [repairDescription, setRepairDescription] = useState('');

  const handleSearch = () => {
    if (mode === 'rent') {
      const params = new URLSearchParams();
      // Use custom location if provided, otherwise use dropdown selection
      const finalLocation = customLocation || location;
      if (finalLocation && finalLocation !== 'any') params.append('location', finalLocation);
      if (locationCoords) {
        params.append('lat', locationCoords.lat.toString());
        params.append('lng', locationCoords.lng.toString());
      }
      if (pickupDate) params.append('startDate', pickupDate);
      if (returnDate) params.append('endDate', returnDate);
      if (bodyType && bodyType !== 'any') params.append('bodyType', bodyType.toLowerCase());
      
      navigate(`/rent?${params.toString()}`);
    } else if (mode === 'buy') {
      const params = new URLSearchParams();
      if (make && make !== 'any') params.append('make', make);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (buyBodyType && buyBodyType !== 'any') params.append('bodyType', buyBodyType.toLowerCase());
      
      navigate(`/buy?${params.toString()}`);
    } else if (mode === 'repair') {
      const params = new URLSearchParams();
      if (repairService && repairService !== 'any') params.append('service', repairService);
      if (repairDescription) params.append('description', repairDescription);
      
      navigate(`/repairs?${params.toString()}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-ekami-charcoal-800 dark:to-ekami-charcoal-900 rounded-3xl shadow-2xl p-8 border-2 border-ekami-silver-300/50 dark:border-ekami-charcoal-700 backdrop-blur-sm">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={() => setMode('rent')}
          className={`px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all ${
            mode === 'rent'
              ? 'bg-gradient-to-r from-ekami-charcoal-700 to-ekami-charcoal-800 text-white'
              : 'text-ekami-charcoal-700 dark:text-ekami-silver-300 bg-gray-200/50 dark:bg-ekami-charcoal-700/50 hover:bg-gray-300 dark:hover:bg-ekami-charcoal-600'
          }`}
        >
          Rent
        </button>
        <button
          onClick={() => setMode('buy')}
          className={`px-8 py-3 rounded-2xl font-semibold transition-all transform hover:-translate-y-0.5 ${
            mode === 'buy'
              ? 'bg-gradient-to-r from-ekami-charcoal-700 to-ekami-charcoal-800 text-white shadow-lg hover:shadow-xl'
              : 'text-ekami-charcoal-700 dark:text-ekami-silver-300 bg-gray-200/50 dark:bg-ekami-charcoal-700/50 hover:bg-gray-300 dark:hover:bg-ekami-charcoal-600'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('repair')}
          className={`px-8 py-3 rounded-2xl font-semibold transition-all transform hover:-translate-y-0.5 ${
            mode === 'repair'
              ? 'bg-gradient-to-r from-ekami-charcoal-700 to-ekami-charcoal-800 text-white shadow-lg hover:shadow-xl'
              : 'text-ekami-charcoal-700 dark:text-ekami-silver-300 bg-gray-200/50 dark:bg-ekami-charcoal-700/50 hover:bg-gray-300 dark:hover:bg-ekami-charcoal-600'
          }`}
        >
          Repair
        </button>
      </div>

      {/* Dynamic Content */}
      <AnimatePresence mode="wait">
        {/* RENT MODE */}
        {mode === 'rent' && (
          <motion.div
            key="rent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location with Map Toggle */}
              <div className="relative">
                <select
                  value={showMapPicker ? 'map' : showCustomInput ? 'custom' : location}
                  onChange={(e) => {
                    if (e.target.value === 'map') {
                      setShowMapPicker(true);
                      setShowCustomInput(false);
                      setLocation('');
                    } else if (e.target.value === 'custom') {
                      setShowCustomInput(true);
                      setShowMapPicker(false);
                      setLocation('');
                    } else {
                      setLocation(e.target.value);
                      setShowMapPicker(false);
                      setShowCustomInput(false);
                    }
                  }}
                  className="form-input pr-12"
                >
                  <option value="" disabled hidden>Pick-up Location</option>
                  <option value="any">Any Location</option>
                  <option value="custom">✏️ Type Custom Location...</option>
                  <option value="map">📍 Choose on Map...</option>
                  <option disabled>──────────</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                    showMapPicker 
                      ? 'bg-ekami-gold-500 text-white' 
                      : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:bg-ekami-gold-100 dark:hover:bg-ekami-charcoal-600'
                  }`}
                  title="Choose on map"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              {/* Date Range - Compact */}
              <div className="relative">
                <input
                  type="text"
                  value={
                    pickupDate && returnDate
                      ? `${new Date(pickupDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${new Date(returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                      : ''
                  }
                  placeholder="Rental Period"
                  readOnly
                  onClick={(e) => {
                    // Show date inputs on click
                    const input = e.currentTarget.nextElementSibling as HTMLElement;
                    if (input) input.style.display = 'block';
                  }}
                  className="form-input cursor-pointer"
                />
                <div className="hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl p-4 shadow-2xl z-50">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1 block">Pick-up</label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="form-input w-full text-sm"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1 block">Return</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => {
                          setReturnDate(e.target.value);
                          // Hide popup after selection
                          const popup = e.currentTarget.closest('div.absolute') as HTMLElement;
                          if (popup && pickupDate) popup.style.display = 'none';
                        }}
                        className="form-input w-full text-sm"
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Type */}
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="form-input"
              >
                <option value="" disabled hidden>Car Type</option>
                <option value="any">Any Type</option>
                {BODY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Location Input */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Enter your pick-up location:
                    </label>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="e.g., Bonamoussadi, Douala or Near Total Station, Yaoundé"
                      className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      💡 Type any location, neighborhood, or landmark. We'll search for cars nearby.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Map Picker */}
            <AnimatePresence>
              {showMapPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-ekami-gold-50 dark:bg-ekami-gold-900/20 px-4 py-2 rounded-lg">
                      <p className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300">
                        Click on the map or search for a location
                      </p>
                      <button
                        onClick={() => setShowMapPicker(false)}
                        className="text-sm text-ekami-gold-600 hover:text-ekami-gold-700 font-medium"
                      >
                        Close Map
                      </button>
                    </div>
                    <LocationPicker
                      onLocationSelect={(loc) => {
                        setLocation(loc.address);
                        setLocationCoords({ lat: loc.lat, lng: loc.lng });
                      }}
                      height="350px"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* BUY MODE */}
        {mode === 'buy' && (
          <motion.div
            key="buy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Make */}
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="form-input"
              >
                <option value="" disabled hidden>Brand</option>
                <option value="any">Any Brand</option>
                {CAR_MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Body Type */}
              <select
                value={buyBodyType}
                onChange={(e) => setBuyBodyType(e.target.value)}
                className="form-input"
              >
                <option value="" disabled hidden>Style</option>
                <option value="any">Any Style</option>
                {BODY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Price Range - Compact */}
              <div className="relative">
                <input
                  type="text"
                  value={
                    minPrice || maxPrice
                      ? `${minPrice ? parseInt(minPrice).toLocaleString() : 'Any'} - ${maxPrice ? parseInt(maxPrice).toLocaleString() : 'Any'} XAF`
                      : ''
                  }
                  placeholder="Price Range"
                  readOnly
                  onClick={(e) => {
                    const input = e.currentTarget.nextElementSibling as HTMLElement;
                    if (input) input.style.display = 'block';
                  }}
                  className="form-input cursor-pointer"
                />
                <div className="hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl p-4 shadow-2xl z-50">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1 block">Min Price (XAF)</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="e.g., 5,000,000"
                        className="form-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1 block">Max Price (XAF)</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(e.target.value);
                          // Hide popup after selection
                          const popup = e.currentTarget.closest('div.absolute') as HTMLElement;
                          if (popup && minPrice) popup.style.display = 'none';
                        }}
                        placeholder="e.g., 20,000,000"
                        className="form-input w-full text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* REPAIR MODE */}
        {mode === 'repair' && (
          <motion.div
            key="repair"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Type */}
              <select
                value={repairService}
                onChange={(e) => setRepairService(e.target.value)}
                className="form-input"
              >
                <option value="" disabled hidden>Service Type</option>
                <option value="any">Any Service</option>
                {REPAIR_SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>

              {/* Description */}
              <input
                type="text"
                value={repairDescription}
                onChange={(e) => setRepairDescription(e.target.value)}
                placeholder="Details (optional)"
                className="form-input"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full mt-4 btn-primary flex items-center justify-center space-x-2"
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>
    </div>
  );
}
