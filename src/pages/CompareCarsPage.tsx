import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Plus, Share2, Save, Download, ArrowLeft, Check, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price_sale: number;
  price_rental_daily: number;
  images: string[];
  body_type: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  doors: number;
  engine_size: string;
  horsepower: number;
  mileage: number;
  color: string;
  features: string[];
  available_for_sale: boolean;
  available_for_rent: boolean;
}

const COMPARISON_FIELDS = [
  { key: 'price_sale', label: 'Sale Price', format: (val: any) => val ? `${val.toLocaleString()} XAF` : 'N/A' },
  { key: 'price_rental_daily', label: 'Daily Rental', format: (val: any) => val ? `${val.toLocaleString()} XAF/day` : 'N/A' },
  { key: 'year', label: 'Year', format: (val: any) => val },
  { key: 'body_type', label: 'Body Type', format: (val: any) => val },
  { key: 'transmission', label: 'Transmission', format: (val: any) => val },
  { key: 'fuel_type', label: 'Fuel Type', format: (val: any) => val },
  { key: 'engine_size', label: 'Engine', format: (val: any) => val || 'N/A' },
  { key: 'horsepower', label: 'Horsepower', format: (val: any) => val ? `${val} HP` : 'N/A' },
  { key: 'mileage', label: 'Mileage', format: (val: any) => val ? `${val.toLocaleString()} km` : 'N/A' },
  { key: 'seats', label: 'Seats', format: (val: any) => val },
  { key: 'doors', label: 'Doors', format: (val: any) => val },
  { key: 'color', label: 'Color', format: (val: any) => val },
];

export default function CompareCarsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSignedIn, user } = useAuth();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllCars();
    loadCarsFromParams();
  }, []);

  const fetchAllCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    }
  };

  const loadCarsFromParams = async () => {
    try {
      setLoading(true);
      const carIds = searchParams.get('cars')?.split(',').filter(Boolean) || [];
      
      if (carIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .in('id', carIds);

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const addCar = (car: Car) => {
    if (cars.length >= 3) {
      toast.error('You can only compare up to 3 cars');
      return;
    }

    if (cars.find(c => c.id === car.id)) {
      toast.error('This car is already in the comparison');
      return;
    }

    const newCars = [...cars, car];
    setCars(newCars);
    updateUrlParams(newCars);
    setShowCarSelector(false);
    toast.success('Car added to comparison');
  };

  const removeCar = (carId: string) => {
    const newCars = cars.filter(c => c.id !== carId);
    setCars(newCars);
    updateUrlParams(newCars);
  };

  const updateUrlParams = (carList: Car[]) => {
    const carIds = carList.map(c => c.id).join(',');
    if (carIds) {
      setSearchParams({ cars: carIds });
    } else {
      setSearchParams({});
    }
  };

  const handleSaveComparison = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to save comparisons');
      navigate('/sign-in');
      return;
    }

    if (cars.length < 2) {
      toast.error('Add at least 2 cars to save comparison');
      return;
    }

    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('car_comparisons')
        .insert({
          user_id: user?.id,
          car_ids: cars.map(c => c.id),
          title: `${cars.map(c => `${c.make} ${c.model}`).join(' vs ')}`,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Comparison saved!');
    } catch (error: any) {
      console.error('Error saving comparison:', error);
      toast.error(error.message || 'Failed to save comparison');
    } finally {
      setSaving(false);
    }
  };

  const handleShareComparison = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Comparison link copied to clipboard!');
  };

  const filteredCars = allCars.filter(car =>
    `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getComparisonValue = (car: Car, field: any) => {
    const value = (car as any)[field.key];
    return field.format(value);
  };

  const getBestValue = (field: any) => {
    if (cars.length === 0) return null;
    
    const values = cars.map(car => (car as any)[field.key]).filter(v => v != null);
    if (values.length === 0) return null;

    // For price fields, lower is better
    if (field.key.includes('price')) {
      return Math.min(...values);
    }
    // For performance fields, higher is better
    if (['horsepower', 'year'].includes(field.key)) {
      return Math.max(...values);
    }
    // For mileage, lower is better
    if (field.key === 'mileage') {
      return Math.min(...values);
    }
    
    return null;
  };

  const isBestValue = (car: Car, field: any) => {
    const bestValue = getBestValue(field);
    if (bestValue === null) return false;
    return (car as any)[field.key] === bestValue;
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cars')}
            className="flex items-center gap-2 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cars
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-ekami-charcoal-900 dark:text-white">
                Compare Cars
              </h1>
              <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-2">
                Compare up to 3 cars side-by-side
              </p>
            </div>
            
            {cars.length >= 2 && (
              <div className="flex gap-3">
                <button
                  onClick={handleShareComparison}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-ekami-silver-300 dark:border-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                <button
                  onClick={handleSaveComparison}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Car Selection Slots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[0, 1, 2].map(index => (
                <div key={index} className="card">
                  {cars[index] ? (
                    <div className="relative">
                      <button
                        onClick={() => removeCar(cars[index].id)}
                        className="absolute top-2 right-2 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={cars[index].images[0]}
                        alt={`${cars[index].make} ${cars[index].model}`}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                      <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
                        {cars[index].make} {cars[index].model}
                      </h3>
                      <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {cars[index].year}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCarSelector(true)}
                      className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-ekami-silver-300 dark:border-ekami-charcoal-600 rounded-xl hover:border-ekami-gold-500 hover:bg-ekami-gold-50 dark:hover:bg-ekami-gold-900/10 transition-all"
                    >
                      <Plus className="w-12 h-12 text-ekami-charcoal-400 mb-2" />
                      <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400 font-medium">
                        Add Car {index + 1}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            {cars.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-x-auto"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-ekami-silver-200 dark:border-ekami-charcoal-700">
                      <th className="text-left py-4 px-4 text-ekami-charcoal-700 dark:text-ekami-silver-300 font-semibold">
                        Specification
                      </th>
                      {cars.map(car => (
                        <th key={car.id} className="text-center py-4 px-4">
                          <div className="text-sm font-semibold text-ekami-charcoal-900 dark:text-white">
                            {car.make} {car.model}
                          </div>
                          <div className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
                            {car.year}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FIELDS.map((field, index) => (
                      <tr
                        key={field.key}
                        className={`border-b border-ekami-silver-200 dark:border-ekami-charcoal-700 ${
                          index % 2 === 0 ? 'bg-ekami-silver-50 dark:bg-ekami-charcoal-800' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          {field.label}
                        </td>
                        {cars.map(car => (
                          <td
                            key={car.id}
                            className={`py-4 px-4 text-center ${
                              isBestValue(car, field)
                                ? 'bg-ekami-gold-100 dark:bg-ekami-gold-900/20 font-semibold text-ekami-gold-700 dark:text-ekami-gold-300'
                                : 'text-ekami-charcoal-600 dark:text-ekami-silver-400'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isBestValue(car, field) && (
                                <Check className="w-4 h-4 text-ekami-gold-600" />
                              )}
                              {getComparisonValue(car, field)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                    
                    {/* Features Comparison */}
                    <tr className="border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
                      <td className="py-4 px-4 font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
                        Features
                      </td>
                      {cars.map(car => (
                        <td key={car.id} className="py-4 px-4">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {car.features?.slice(0, 5).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded text-xs"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Availability */}
                    <tr>
                      <td className="py-4 px-4 font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
                        Availability
                      </td>
                      {cars.map(car => (
                        <td key={car.id} className="py-4 px-4">
                          <div className="flex flex-col gap-2 items-center">
                            {car.available_for_sale && (
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                                For Sale
                              </span>
                            )}
                            {car.available_for_rent && (
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                                For Rent
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
                  {cars.map(car => (
                    <div key={car.id} className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/cars/${car.id}`)}
                        className="w-full px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                      {car.available_for_sale && (
                        <button
                          onClick={() => navigate(`/purchase/${car.id}`)}
                          className="w-full px-4 py-2 border-2 border-ekami-gold-600 text-ekami-gold-600 hover:bg-ekami-gold-50 dark:hover:bg-ekami-gold-900/20 rounded-lg transition-colors"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {cars.length === 0 && (
              <div className="card text-center py-20">
                <Plus className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                  Start Comparing Cars
                </h3>
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-6">
                  Add cars to compare their specs, features, and prices side-by-side
                </p>
                <button
                  onClick={() => setShowCarSelector(true)}
                  className="px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Add Your First Car
                </button>
              </div>
            )}

            {cars.length === 1 && (
              <div className="card text-center py-12">
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                  Add at least one more car to start comparing
                </p>
                <button
                  onClick={() => setShowCarSelector(true)}
                  className="px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Add Another Car
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Car Selector Modal */}
      <AnimatePresence>
        {showCarSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
                <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                  Select a Car
                </h3>
                <button
                  onClick={() => setShowCarSelector(false)}
                  className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCars.map(car => (
                    <button
                      key={car.id}
                      onClick={() => addCar(car)}
                      disabled={cars.find(c => c.id === car.id) !== undefined}
                      className="flex items-center gap-4 p-4 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl hover:border-ekami-gold-400 hover:bg-ekami-gold-50 dark:hover:bg-ekami-gold-900/10 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-ekami-charcoal-900 dark:text-white">
                          {car.make} {car.model}
                        </h4>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                          {car.year} • {car.transmission}
                        </p>
                        <p className="text-sm font-semibold text-ekami-gold-600 mt-1">
                          {car.price_sale?.toLocaleString()} XAF
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
