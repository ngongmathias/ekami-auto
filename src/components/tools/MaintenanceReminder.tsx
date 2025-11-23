import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Bell, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface MaintenanceItem {
  id: string;
  type: string;
  lastDone: Date;
  intervalKm: number;
  intervalMonths: number;
  currentKm: number;
  dueKm: number;
  dueDate: Date;
  status: 'overdue' | 'due-soon' | 'ok';
}

const MAINTENANCE_TYPES = [
  { type: 'Oil Change', intervalKm: 5000, intervalMonths: 6 },
  { type: 'Tire Rotation', intervalKm: 10000, intervalMonths: 6 },
  { type: 'Brake Inspection', intervalKm: 15000, intervalMonths: 12 },
  { type: 'Air Filter', intervalKm: 20000, intervalMonths: 12 },
  { type: 'Transmission Fluid', intervalKm: 50000, intervalMonths: 24 },
  { type: 'Coolant Flush', intervalKm: 50000, intervalMonths: 24 },
  { type: 'Spark Plugs', intervalKm: 50000, intervalMonths: 36 },
  { type: 'Battery Check', intervalKm: 0, intervalMonths: 12 },
];

export default function MaintenanceReminder() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [currentKm, setCurrentKm] = useState(50000);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [lastDoneKm, setLastDoneKm] = useState('');
  const [lastDoneDate, setLastDoneDate] = useState('');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('maintenance-reminders');
    if (saved) {
      const parsed = JSON.parse(saved);
      setItems(parsed.map((item: any) => ({
        ...item,
        lastDone: new Date(item.lastDone),
        dueDate: new Date(item.dueDate),
      })));
      setCurrentKm(parsed[0]?.currentKm || 50000);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    if (items.length > 0) {
      localStorage.setItem('maintenance-reminders', JSON.stringify(items));
    }
  }, [items]);

  const calculateStatus = (dueKm: number, dueDate: Date): 'overdue' | 'due-soon' | 'ok' => {
    const kmDiff = dueKm - currentKm;
    const daysDiff = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (kmDiff < 0 || daysDiff < 0) return 'overdue';
    if (kmDiff < 1000 || daysDiff < 30) return 'due-soon';
    return 'ok';
  };

  const addMaintenanceItem = () => {
    if (!selectedType || !lastDoneKm || !lastDoneDate) {
      toast.error('Please fill all fields');
      return;
    }

    const typeInfo = MAINTENANCE_TYPES.find(t => t.type === selectedType);
    if (!typeInfo) return;

    const lastDone = new Date(lastDoneDate);
    const lastKm = parseInt(lastDoneKm);
    const dueKm = lastKm + typeInfo.intervalKm;
    const dueDate = new Date(lastDone);
    dueDate.setMonth(dueDate.getMonth() + typeInfo.intervalMonths);

    const newItem: MaintenanceItem = {
      id: Date.now().toString(),
      type: selectedType,
      lastDone,
      intervalKm: typeInfo.intervalKm,
      intervalMonths: typeInfo.intervalMonths,
      currentKm,
      dueKm,
      dueDate,
      status: calculateStatus(dueKm, dueDate),
    };

    setItems([...items, newItem]);
    setShowAddModal(false);
    setSelectedType('');
    setLastDoneKm('');
    setLastDoneDate('');
    toast.success('Maintenance reminder added!');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Reminder removed');
  };

  const markAsDone = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newLastDone = new Date();
    const newDueKm = currentKm + item.intervalKm;
    const newDueDate = new Date();
    newDueDate.setMonth(newDueDate.getMonth() + item.intervalMonths);

    setItems(items.map(i => i.id === id ? {
      ...i,
      lastDone: newLastDone,
      currentKm,
      dueKm: newDueKm,
      dueDate: newDueDate,
      status: calculateStatus(newDueKm, newDueDate),
    } : i));

    toast.success('Maintenance marked as complete!');
  };

  const overdueCount = items.filter(i => i.status === 'overdue').length;
  const dueSoonCount = items.filter(i => i.status === 'due-soon').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Maintenance Reminders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Never miss important car maintenance again
        </p>
      </div>

      {/* Current Mileage */}
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 mb-6 shadow-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Mileage (km)
        </label>
        <input
          type="number"
          value={currentKm}
          onChange={(e) => setCurrentKm(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
          placeholder="50000"
        />
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
                <p className="text-sm text-red-700 dark:text-red-300">Overdue</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dueSoonCount}</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Due Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {items.length - overdueCount - dueSoonCount}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Up to Date</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full mb-6 px-6 py-4 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Maintenance Reminder
      </button>

      {/* Maintenance List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-ekami-charcoal-800 rounded-lg">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No maintenance reminders yet. Add one to get started!
            </p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg border-l-4 ${
                item.status === 'overdue'
                  ? 'border-red-500'
                  : item.status === 'due-soon'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.type}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'overdue'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : item.status === 'due-soon'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {item.status === 'overdue' ? 'OVERDUE' : item.status === 'due-soon' ? 'DUE SOON' : 'OK'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <p className="font-medium">Last Done:</p>
                      <p>{item.lastDone.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Due Date:</p>
                      <p>{item.dueDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Due at:</p>
                      <p>{item.dueKm.toLocaleString()} km</p>
                    </div>
                    <div>
                      <p className="font-medium">Remaining:</p>
                      <p>{Math.max(0, item.dueKm - currentKm).toLocaleString()} km</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => markAsDone(item.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Modal */}
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
              className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Add Maintenance Reminder
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maintenance Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                  >
                    <option value="">Select type...</option>
                    {MAINTENANCE_TYPES.map((type) => (
                      <option key={type.type} value={type.type}>
                        {type.type} (Every {type.intervalKm > 0 ? `${type.intervalKm.toLocaleString()} km` : ''}{type.intervalKm > 0 && type.intervalMonths > 0 ? ' or ' : ''}{type.intervalMonths > 0 ? `${type.intervalMonths} months` : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Done (km)
                  </label>
                  <input
                    type="number"
                    value={lastDoneKm}
                    onChange={(e) => setLastDoneKm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                    placeholder="45000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Done (date)
                  </label>
                  <input
                    type="date"
                    value={lastDoneDate}
                    onChange={(e) => setLastDoneDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addMaintenanceItem}
                  className="flex-1 px-6 py-3 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 transition-colors"
                >
                  Add Reminder
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
