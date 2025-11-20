import { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type Car } from '../../lib/supabase';

interface CarSelectorProps {
  onSelect: (car: Car) => void;
  excludeIds: string[];
  maxReached: boolean;
}

export default function CarSelector({ onSelect, excludeIds, maxReached }: CarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCars();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = cars.filter(car => 
        !excludeIds.includes(car.id) && (
          car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.year.toString().includes(searchQuery)
        )
      );
      setFilteredCars(filtered);
    } else {
      setFilteredCars(cars.filter(car => !excludeIds.includes(car.id)));
    }
  }, [searchQuery, cars, excludeIds]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .or('available_for_rent.eq.true,available_for_sale.eq.true')
        .order('make', { ascending: true });

      if (error) throw error;
      setCars(data || []);
      setFilteredCars((data || []).filter(car => !excludeIds.includes(car.id)));
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (car: Car) => {
    onSelect(car);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (maxReached) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-ekami-silver-300 dark:border-ekami-charcoal-600 rounded-2xl bg-ekami-silver-50 dark:bg-ekami-charcoal-800/50">
        <p className="text-ekami-charcoal-500 dark:text-ekami-silver-500 text-center">
          Maximum 3 cars can be compared
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 p-8 border-2 border-dashed border-ekami-gold-400 dark:border-ekami-gold-600 rounded-2xl bg-ekami-gold-50 dark:bg-ekami-gold-900/20 hover:bg-ekami-gold-100 dark:hover:bg-ekami-gold-900/30 transition-colors group"
      >
        <Plus className="w-6 h-6 text-ekami-gold-600 group-hover:scale-110 transition-transform" />
        <span className="text-lg font-semibold text-ekami-gold-700 dark:text-ekami-gold-400">
          Add Car to Compare
        </span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-ekami-charcoal-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-ekami-gold-600 to-ekami-gold-700 text-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Select a Car</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by make, model, or year..."
                      className="w-full pl-12 pr-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/70 focus:bg-white/30 focus:border-white transition-all"
                    />
                  </div>
                </div>

                {/* Cars List */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredCars.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
                      <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {searchQuery ? 'No cars found matching your search' : 'No cars available'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredCars.map((car) => (
                        <motion.button
                          key={car.id}
                          onClick={() => handleSelect(car)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-4 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 hover:bg-ekami-gold-50 dark:hover:bg-ekami-gold-900/20 rounded-xl transition-colors text-left border-2 border-transparent hover:border-ekami-gold-400"
                        >
                          <img
                            src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                            alt={`${car.make} ${car.model}`}
                            className="w-24 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-ekami-charcoal-900 dark:text-white">
                              {car.make} {car.model}
                            </h3>
                            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                              {car.year} • {car.transmission}
                            </p>
                            {car.price_rent_daily && (
                              <p className="text-sm font-semibold text-ekami-gold-600 mt-1">
                                {car.price_rent_daily.toLocaleString()} XAF/day
                              </p>
                            )}
                            {car.price_sale && (
                              <p className="text-sm font-semibold text-ekami-gold-600 mt-1">
                                {car.price_sale.toLocaleString()} XAF
                              </p>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
