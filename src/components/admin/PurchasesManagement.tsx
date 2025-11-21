import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, DollarSign, Calendar, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Purchase {
  id: string;
  created_at: string;
  car_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  purchase_price: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes: string;
  cars?: {
    make: string;
    model: string;
    year: number;
  };
}

export default function PurchasesManagement() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          cars (make, model, year)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (purchaseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ status: newStatus })
        .eq('id', purchaseId);

      if (error) throw error;

      toast.success(`Purchase ${newStatus}`);
      fetchPurchases();
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast.error('Failed to update purchase');
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.buyer_phone?.includes(searchQuery) ||
      purchase.cars?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.cars?.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ? true : purchase.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pending' || p.status === 'pending_payment').length,
    processing: purchases.filter(p => p.status === 'processing').length,
    completed: purchases.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
          Purchase Requests
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
          Manage vehicle purchase requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Processing</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.processing}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-ekami-charcoal-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            >
              <option value="all">All Purchases</option>
              <option value="pending">Pending</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="py-12 text-center">
            <DollarSign className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No purchase requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ekami-silver-50 dark:bg-ekami-charcoal-800">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Vehicle
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Payment
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
                {filteredPurchases.map((purchase) => (
                  <motion.tr
                    key={purchase.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                          {purchase.buyer_name || 'N/A'}
                        </p>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                          {purchase.buyer_phone || ''}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-ekami-charcoal-900 dark:text-white">
                        {purchase.cars ? `${purchase.cars.make} ${purchase.cars.model} ${purchase.cars.year}` : 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                        {purchase.total_amount.toLocaleString()} XAF
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 capitalize">
                        {purchase.payment_method || 'N/A'}
                      </p>
                      <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
                        {purchase.payment_status}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(purchase.status)}`}>
                        {purchase.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {purchase.status === 'pending' || purchase.status === 'pending_payment' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(purchase.id, 'processing')}
                              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-colors"
                              title="Start Processing"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(purchase.id, 'cancelled')}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        ) : purchase.status === 'processing' ? (
                          <button
                            onClick={() => handleUpdateStatus(purchase.id, 'completed')}
                            className="px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium transition-colors"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            setSelectedPurchase(purchase);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
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

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    Purchase Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Name</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedPurchase.buyer_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Phone</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedPurchase.buyer_phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">Vehicle</h4>
                    <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                      {selectedPurchase.cars ? `${selectedPurchase.cars.make} ${selectedPurchase.cars.model} ${selectedPurchase.cars.year}` : 'N/A'}
                    </p>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">Payment Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Total Amount</p>
                        <p className="text-xl font-bold text-ekami-gold-600">
                          {selectedPurchase.total_amount.toLocaleString()} XAF
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Payment Method</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white capitalize">
                          {selectedPurchase.payment_method || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPurchase.notes && (
                    <div>
                      <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Notes</h4>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 whitespace-pre-wrap">
                        {selectedPurchase.notes}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Status</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPurchase.status)}`}>
                      {selectedPurchase.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
