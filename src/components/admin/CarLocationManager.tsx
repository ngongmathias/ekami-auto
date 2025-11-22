import { useState, useEffect } from 'react';
import { MapPin, Save, X, Search, Grid, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import LocationPicker from '../maps/LocationPicker';
import CarsMapView from './CarsMapView';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  car_number?: string;
  location?: string;
  images?: string[];
}

export default function CarLocationManager() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLocation, setNewLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('id, make, model, year, car_number, location, images')
        .order('car_number', { ascending: true });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedCar || !newLocation) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('cars')
        .update({ location: newLocation.address })
        .eq('id', selectedCar.id);

      if (error) throw error;

      toast.success('Location saved successfully!');
      setSelectedCar(null);
      setNewLocation(null);
      fetchCars();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const filteredCars = cars.filter(car =>
    `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Manage Pickup Locations
          </h2>
          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
            Set where customers can pick up each car
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            {cars.filter(c => c.location).length} / {cars.length} cars have locations
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-ekami-gold-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-gray-700 text-ekami-gold-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' ? (
        <CarsMapView onEditLocation={setSelectedCar} />
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCars.map((car) => (
          <motion.div
            key={car.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-ekami-charcoal-800 rounded-xl shadow-md overflow-hidden cursor-pointer"
            onClick={() => setSelectedCar(car)}
          >
            <div className="relative h-40">
              <img
                src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
              {car.location && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Set
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg text-ekami-charcoal-900 dark:text-white">
                  {car.make} {car.model}
                </h3>
                {car.car_number && (
                  <span className="text-xs font-mono bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-700 dark:text-ekami-gold-400 px-2 py-1 rounded">
                    {car.car_number}
                  </span>
                )}
              </div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-2">
                {car.year}
              </p>
              {car.location ? (
                <div className="flex items-start gap-2 text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-ekami-gold-600" />
                  <span className="line-clamp-2">{car.location}</span>
                </div>
              ) : (
                <p className="text-xs text-red-500">No location set</p>
              )}
            </div>
          </motion.div>
        ))}
          </div>
        </>
      )}

      {/* Location Editor Modal */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                      Set Pickup Location
                    </h3>
                    {selectedCar.car_number && (
                      <span className="text-sm font-mono bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-700 dark:text-ekami-gold-400 px-3 py-1 rounded">
                        {selectedCar.car_number}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
                    {selectedCar.make} {selectedCar.model} ({selectedCar.year})
                  </p>
                  {selectedCar.location && (
                    <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                      Current: {selectedCar.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCar(null);
                    setNewLocation(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <LocationPicker
                onLocationSelect={setNewLocation}
                height="400px"
              />

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSaveLocation}
                  disabled={!newLocation || saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Location
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedCar(null);
                    setNewLocation(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
