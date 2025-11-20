import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Share2, Printer, RefreshCw, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase, type Car } from '../lib/supabase';
import CarSelector from '../components/comparison/CarSelector';
import ComparisonTable from '../components/comparison/ComparisonTable';

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cars from URL params on mount
  useEffect(() => {
    const carIds = searchParams.get('cars')?.split(',').filter(Boolean) || [];
    if (carIds.length > 0) {
      loadCarsFromIds(carIds);
    } else {
      // Load from localStorage
      const saved = localStorage.getItem('comparison-cars');
      if (saved) {
        try {
          const savedIds = JSON.parse(saved);
          if (savedIds.length > 0) {
            loadCarsFromIds(savedIds);
            return;
          }
        } catch (error) {
          console.error('Error loading saved comparison:', error);
        }
      }
      setLoading(false);
    }
  }, []);

  // Update URL when cars change
  useEffect(() => {
    if (selectedCars.length > 0) {
      const carIds = selectedCars.map(car => car.id).join(',');
      setSearchParams({ cars: carIds });
      // Save to localStorage
      localStorage.setItem('comparison-cars', JSON.stringify(selectedCars.map(c => c.id)));
    } else {
      setSearchParams({});
      localStorage.removeItem('comparison-cars');
    }
  }, [selectedCars]);

  const loadCarsFromIds = async (carIds: string[]) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .in('id', carIds);

      if (error) throw error;
      if (data) {
        // Maintain order from carIds
        const orderedCars = carIds.map(id => data.find(car => car.id === id)).filter(Boolean) as Car[];
        setSelectedCars(orderedCars);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = (car: Car) => {
    if (selectedCars.length >= 3) {
      toast.error('Maximum 3 cars can be compared');
      return;
    }
    if (selectedCars.find(c => c.id === car.id)) {
      toast.error('Car already added');
      return;
    }
    setSelectedCars([...selectedCars, car]);
    toast.success(`${car.make} ${car.model} added to comparison`);
  };

  const handleRemoveCar = (carId: string) => {
    setSelectedCars(selectedCars.filter(car => car.id !== carId));
    toast.success('Car removed from comparison');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the comparison?')) {
      setSelectedCars([]);
      toast.success('Comparison cleared');
    }
  };

  const handleSave = () => {
    const carIds = selectedCars.map(c => c.id);
    localStorage.setItem('comparison-cars', JSON.stringify(carIds));
    toast.success('Comparison saved!');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Comparison link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Compare Cars
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            Select up to 3 cars to compare side-by-side
          </p>
        </div>

        {/* Info Banner */}
        {selectedCars.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>How it works:</strong> Add cars to compare their specifications, pricing, and features. 
                You can save your comparison or share it with others using the link.
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {selectedCars.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Comparison
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors print:hidden"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}

        {/* Car Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {selectedCars.map((car) => (
            <div key={car.id} className="relative">
              <div className="card">
                <img
                  src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="font-bold text-lg text-ekami-charcoal-900 dark:text-white mb-1">
                  {car.make} {car.model}
                </h3>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  {car.year} • {car.transmission}
                </p>
              </div>
            </div>
          ))}
          
          {/* Add Car Slots */}
          {Array.from({ length: 3 - selectedCars.length }).map((_, idx) => (
            <CarSelector
              key={`selector-${idx}`}
              onSelect={handleAddCar}
              excludeIds={selectedCars.map(c => c.id)}
              maxReached={selectedCars.length >= 3}
            />
          ))}
        </div>

        {/* Comparison Table */}
        {selectedCars.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-ekami-gold-600 to-ekami-gold-700 text-white">
              <h2 className="text-2xl font-bold">Detailed Comparison</h2>
              <p className="text-ekami-gold-100 text-sm mt-1">
                Green highlights indicate better values, red indicates higher costs
              </p>
            </div>
            <ComparisonTable cars={selectedCars} onRemove={handleRemoveCar} />
          </motion.div>
        )}

        {/* Empty State */}
        {selectedCars.length === 0 && (
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Share2 className="w-10 h-10 text-ekami-gold-600" />
            </div>
            <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
              Start Comparing Cars
            </h3>
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-6 max-w-md mx-auto">
              Add at least 2 cars to see a detailed side-by-side comparison of their specifications, pricing, and features.
            </p>
          </div>
        )}

        {/* Need More Cars Message */}
        {selectedCars.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <p className="text-lg text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Add at least one more car to start comparing
            </p>
          </motion.div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
