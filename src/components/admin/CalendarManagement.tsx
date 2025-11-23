import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MaintenanceBlock {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  car_number: string;
}

export default function CalendarManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<MaintenanceBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    car_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch cars
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('id, make, model, year, car_number')
        .order('car_number');

      if (carsError) throw carsError;
      setCars(carsData || []);

      // Fetch maintenance blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('maintenance_blocks')
        .select('*')
        .gte('end_date', new Date().toISOString())
        .order('start_date');

      if (blocksError) throw blocksError;
      setMaintenanceBlocks(blocksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.car_id || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const { error } = await supabase
        .from('maintenance_blocks')
        .insert([formData]);

      if (error) throw error;

      toast.success('Maintenance block added successfully');
      setShowAddForm(false);
      setFormData({ car_id: '', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding maintenance block:', error);
      toast.error('Failed to add maintenance block');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance block?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('maintenance_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Maintenance block deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting maintenance block:', error);
      toast.error('Failed to delete maintenance block');
    }
  };

  const getCarName = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.car_number} - ${car.year} ${car.make} ${car.model}` : 'Unknown Car';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-ekami-gold-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar Management
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Block Dates
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Maintenance Blocks</p>
            <p>Block specific dates when cars are unavailable for rental (maintenance, repairs, etc.). These dates will appear as unavailable in the customer calendar.</p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white dark:bg-ekami-charcoal-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Maintenance Block
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Car Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Car *
                  </label>
                  <select
                    value={formData.car_id}
                    onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select a car</option>
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.car_number} - {car.year} {car.make} {car.model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g., Scheduled maintenance"
                    className="form-input"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ car_id: '', start_date: '', end_date: '', reason: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Block
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Blocks List */}
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Maintenance Blocks ({maintenanceBlocks.length})
          </h3>
        </div>

        {maintenanceBlocks.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No maintenance blocks scheduled</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Block dates when cars are unavailable for rental
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {maintenanceBlocks.map((block) => (
              <div
                key={block.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {getCarName(block.car_id)}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(block.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {' → '}
                        {new Date(block.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">
                        {Math.ceil(
                          (new Date(block.end_date).getTime() - new Date(block.start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </span>
                    </div>
                    {block.reason && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {block.reason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete block"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
