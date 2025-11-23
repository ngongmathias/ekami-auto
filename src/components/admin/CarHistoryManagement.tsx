import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  car_number: string;
}

interface HistoryEvent {
  id?: string;
  car_id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  mileage: number;
  location: string;
  cost: number;
  service_provider: string;
  severity: string;
  status: string;
  notes: string;
}

export default function CarHistoryManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HistoryEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<HistoryEvent>>({
    type: 'maintenance',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    location: '',
    cost: 0,
    service_provider: '',
    severity: '',
    status: 'completed',
    notes: '',
  });

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (selectedCar) {
      fetchHistory();
    }
  }, [selectedCar]);

  const fetchCars = async () => {
    const { data } = await supabase
      .from('cars')
      .select('id, make, model, year, car_number')
      .order('car_number');
    setCars(data || []);
  };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('car_history')
      .select('*')
      .eq('car_id', selectedCar)
      .order('date', { ascending: false });
    setHistory(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        car_id: selectedCar,
        added_by: 'kerryngong@ekamiauto.com', // Replace with actual user email
      };

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('car_history')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('History event updated!');
      } else {
        // Create new event
        const { error } = await supabase
          .from('car_history')
          .insert([eventData]);

        if (error) throw error;
        toast.success('History event added!');
      }

      setShowAddModal(false);
      setEditingEvent(null);
      resetForm();
      fetchHistory();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this history event?')) return;

    try {
      const { error } = await supabase
        .from('car_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('History event deleted!');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (event: HistoryEvent) => {
    setEditingEvent(event);
    setFormData(event);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'maintenance',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      mileage: 0,
      location: '',
      cost: 0,
      service_provider: '',
      severity: '',
      status: 'completed',
      notes: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Car History Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage vehicle history, maintenance records, and inspections
        </p>
      </div>

      {/* Car Selection */}
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Vehicle
        </label>
        <select
          value={selectedCar}
          onChange={(e) => setSelectedCar(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
        >
          <option value="">Choose a vehicle...</option>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.car_number} - {car.year} {car.make} {car.model}
            </option>
          ))}
        </select>
      </div>

      {selectedCar && (
        <>
          {/* Add Event Button */}
          <button
            onClick={() => {
              resetForm();
              setEditingEvent(null);
              setShowAddModal(true);
            }}
            className="mb-6 px-6 py-3 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add History Event
          </button>

          {/* History List */}
          <div className="space-y-4">
            {history.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold capitalize">
                        {event.type}
                      </span>
                      {event.severity && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            event.severity === 'major'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : event.severity === 'moderate'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {event.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {event.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Date:</span> {event.date}
                      </div>
                      {event.mileage > 0 && (
                        <div>
                          <span className="font-medium">Mileage:</span>{' '}
                          {event.mileage.toLocaleString()} km
                        </div>
                      )}
                      {event.location && (
                        <div>
                          <span className="font-medium">Location:</span> {event.location}
                        </div>
                      )}
                      {event.cost > 0 && (
                        <div>
                          <span className="font-medium">Cost:</span>{' '}
                          {event.cost.toLocaleString()} XAF
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id!)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-ekami-charcoal-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  No history records yet. Add the first event!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingEvent ? 'Edit History Event' : 'Add History Event'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                      required
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="repair">Repair</option>
                      <option value="accident">Accident</option>
                      <option value="inspection">Inspection</option>
                      <option value="upgrade">Upgrade</option>
                      <option value="ownership">Ownership Change</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                    placeholder="e.g., Oil Change Service"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                    rows={3}
                    placeholder="Detailed description of the event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mileage (km)
                    </label>
                    <input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) =>
                        setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cost (XAF)
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                      placeholder="e.g., Douala"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Provider
                    </label>
                    <input
                      type="text"
                      value={formData.service_provider}
                      onChange={(e) =>
                        setFormData({ ...formData, service_provider: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                      placeholder="e.g., Toyota Service Center"
                    />
                  </div>
                </div>

                {formData.type === 'accident' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                    >
                      <option value="">Select severity...</option>
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="major">Major</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
