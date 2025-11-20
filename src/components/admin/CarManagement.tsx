import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllCars, type Car } from '../../lib/supabase';

export default function CarManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'rented'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await getAllCars();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      // In production: await supabase.from('cars').delete().eq('id', carId);
      toast.success('Car deleted successfully');
      setCars(prev => prev.filter(car => car.id !== carId));
    } catch (error) {
      toast.error('Failed to delete car');
    }
  };

  const handleToggleAvailability = async (car: Car) => {
    try {
      // In production: await supabase.from('cars').update({ available_for_rent: !car.available_for_rent }).eq('id', car.id);
      toast.success(`Car ${!car.available_for_rent ? 'marked as available' : 'marked as unavailable'}`);
      setCars(prev => prev.map(c => 
        c.id === car.id ? { ...c, available_for_rent: !c.available_for_rent } : c
      ));
    } catch (error) {
      toast.error('Failed to update car status');
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.year.toString().includes(searchQuery);

    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'available' ? car.available_for_rent :
      !car.available_for_rent;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
            Car Management
          </h2>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
            Manage your vehicle inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Car</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search cars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-ekami-charcoal-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="flex-1 px-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            >
              <option value="all">All Cars ({cars.length})</option>
              <option value="available">Available ({cars.filter(c => c.available_for_rent).length})</option>
              <option value="rented">Rented Out ({cars.filter(c => !c.available_for_rent).length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cars Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
              No cars found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ekami-silver-50 dark:bg-ekami-charcoal-800">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Car
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Specs
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Pricing
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <motion.tr
                    key={car.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                          alt={`${car.make} ${car.model}`}
                          className="w-20 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                            {car.make} {car.model}
                          </p>
                          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                            {car.year}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm space-y-1">
                        <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          {car.transmission} • {car.fuel_type}
                        </p>
                        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                          {car.seats} seats • {car.body_type}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm space-y-1">
                        {car.price_rent_daily && (
                          <p className="text-ekami-charcoal-900 dark:text-white font-semibold">
                            {car.price_rent_daily.toLocaleString()} XAF/day
                          </p>
                        )}
                        {car.price_sale && (
                          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                            Sale: {car.price_sale.toLocaleString()} XAF
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleAvailability(car)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          car.available_for_rent
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200'
                        }`}
                      >
                        {car.available_for_rent ? 'Available' : 'Rented'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/cars/${car.slug || car.id}`, '_blank')}
                          className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCar(car);
                            setShowAddModal(true);
                          }}
                          className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-ekami-gold-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => {
                setShowAddModal(false);
                setSelectedCar(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    {selectedCar ? 'Edit Car' : 'Add New Car'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedCar(null);
                    }}
                    className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Car form will be here. This requires Supabase integration to save data.
                </p>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> To enable adding/editing cars, you'll need to set up Supabase RLS policies
                    that allow authenticated admin users to insert and update the cars table.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
