import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Car as CarIcon, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface SellRequest {
  id: string;
  created_at: string;
  user_id: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin: string;
  body_type: string;
  transmission: string;
  fuel_type: string;
  color: string;
  seats: number;
  doors: number;
  condition: string;
  asking_price: number;
  location: string;
  images: string[];
  description: string;
  status: string;
  notes: string;
}

export default function SellRequestsManagement() {
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<SellRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sell_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching sell requests:', error);
      toast.error('Failed to load sell requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sell_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Request ${newStatus}`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.seller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.seller_phone?.includes(searchQuery) ||
      request.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.model?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ? true : request.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'sold':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
          Sell Requests
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
          Manage vehicle sell requests from customers
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
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Under Review</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.under_review}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.approved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search requests..."
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
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center">
            <CarIcon className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No sell requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ekami-silver-50 dark:bg-ekami-charcoal-800">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Seller
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Vehicle
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Asking Price
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Condition
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
                {filteredRequests.map((request) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                          {request.seller_name || 'N/A'}
                        </p>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                          {request.seller_phone || ''}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                        {request.make} {request.model}
                      </p>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {request.year} • {request.mileage?.toLocaleString()} km
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-ekami-gold-600">
                        {request.asking_price?.toLocaleString()} XAF
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm capitalize text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {request.condition || 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'under_review')}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            Review
                          </button>
                        )}
                        {request.status === 'under_review' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'approved')}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'rejected')}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
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
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    Sell Request Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white">Vehicle Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Make & Model:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.make} {selectedRequest.model}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Year:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Mileage:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.mileage?.toLocaleString()} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Condition:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white capitalize">
                          {selectedRequest.condition}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Color:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Transmission:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white capitalize">
                          {selectedRequest.transmission}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white">Seller Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Name:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.seller_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Phone:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.seller_phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Email:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.seller_email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Location:</span>
                        <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.location}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Asking Price:</span>
                        <span className="text-xl font-bold text-ekami-gold-600">
                          {selectedRequest.asking_price?.toLocaleString()} XAF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">Photos</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedRequest.images.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedRequest.notes && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Additional Notes</h4>
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 whitespace-pre-wrap">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}

                {/* Description */}
                {selectedRequest.description && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Description</h4>
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      {selectedRequest.description}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border-2 border-ekami-silver-300 dark:border-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-lg hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors"
                  >
                    Close
                  </button>
                  {selectedRequest.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedRequest.id, 'under_review');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Start Review
                    </button>
                  )}
                  {selectedRequest.status === 'under_review' && (
                    <>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedRequest.id, 'approved');
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedRequest.id, 'rejected');
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
