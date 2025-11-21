import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Calendar,
  User,
  Car,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { RepairRequest, Mechanic } from '../../types/repairs';
import toast from 'react-hot-toast';

export default function RepairsManagement() {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch repair requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('repair_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRequests(requestsData || []);

      // Fetch mechanics
      const { data: mechanicsData, error: mechanicsError } = await supabase
        .from('mechanics')
        .select('*')
        .eq('is_active', true);

      if (mechanicsError) throw mechanicsError;
      setMechanics(mechanicsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load repair requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('repair_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const assignMechanic = async (requestId: string, mechanicId: string) => {
    try {
      const { error } = await supabase
        .from('repair_requests')
        .update({ 
          assigned_mechanic_id: mechanicId,
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Mechanic assigned successfully');
      fetchData();
    } catch (error) {
      console.error('Error assigning mechanic:', error);
      toast.error('Failed to assign mechanic');
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const { error } = await supabase
        .from('repair_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request deleted successfully');
      fetchData();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle_make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      received: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      emergency: 'text-red-600',
    };
    return colors[urgency] || 'text-gray-600';
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'received').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Repairs Management
          </h2>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Manage service requests and assignments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Total Requests</p>
              <p className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">{stats.total}</p>
            </div>
            <Wrench className="w-8 h-8 text-ekami-gold-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search by customer, email, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-800 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-ekami-charcoal-600 dark:text-ekami-silver-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="received">Received</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-600 mx-auto"></div>
            <p className="mt-4 text-ekami-charcoal-600 dark:text-ekami-silver-400">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Wrench className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No repair requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ekami-silver-50 dark:bg-ekami-charcoal-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-ekami-charcoal-800 divide-y divide-ekami-silver-200 dark:divide-ekami-charcoal-700">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
                          {request.customer_name}
                        </div>
                        <div className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                          {request.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-ekami-charcoal-900 dark:text-white">
                        {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-ekami-charcoal-900 dark:text-white">
                        {request.appointment_date}
                      </div>
                      <div className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                        {request.appointment_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getUrgencyColor(request.urgency_level)}`}>
                        {request.urgency_level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="text-ekami-gold-600 hover:text-ekami-gold-700"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
              className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    Request Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Name:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.customer_name}</p>
                      </div>
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Email:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.customer_email}</p>
                      </div>
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Phone:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Vehicle Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Vehicle:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.vehicle_year} {selectedRequest.vehicle_make} {selectedRequest.vehicle_model}
                        </p>
                      </div>
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Mileage:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.mileage || 'N/A'} km</p>
                      </div>
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">License Plate:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.license_plate || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Problem Description</h4>
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      {selectedRequest.problem_description || 'No description provided'}
                    </p>
                  </div>

                  {/* Appointment */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Appointment</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Date:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.appointment_date}</p>
                      </div>
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Time:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">{selectedRequest.appointment_time}</p>
                      </div>
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Location:</span>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedRequest.service_location === 'drop-off' ? 'Drop-off' : 'Mobile Service'}
                        </p>
                      </div>
                      <div>
                        <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Urgency:</span>
                        <p className={`font-medium ${getUrgencyColor(selectedRequest.urgency_level)}`}>
                          {selectedRequest.urgency_level.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedRequest.notes && (
                    <div>
                      <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Additional Notes</h4>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {selectedRequest.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg"
                  >
                    Edit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedRequest && (
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
                    Edit Request
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => {
                        updateRequestStatus(selectedRequest.id, e.target.value);
                        setSelectedRequest({ ...selectedRequest, status: e.target.value as any });
                      }}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="received">Received</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="checked_in">Checked In</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="quote_provided">Quote Provided</option>
                      <option value="approved">Approved</option>
                      <option value="parts_ordered">Parts Ordered</option>
                      <option value="in_progress">In Progress</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="ready_pickup">Ready for Pickup</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Assign Mechanic */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Assign Mechanic
                    </label>
                    <select
                      value={selectedRequest.assigned_mechanic_id || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignMechanic(selectedRequest.id, e.target.value);
                          setSelectedRequest({ ...selectedRequest, assigned_mechanic_id: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="">Select Mechanic</option>
                      {mechanics.map((mechanic) => (
                        <option key={mechanic.id} value={mechanic.id}>
                          {mechanic.name} - {mechanic.specialties.join(', ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Cost */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Estimated Cost (XAF)
                    </label>
                    <input
                      type="number"
                      value={selectedRequest.estimated_cost || ''}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, estimated_cost: parseFloat(e.target.value) || undefined })}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Enter estimated cost"
                    />
                  </div>

                  {/* Final Cost */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Final Cost (XAF)
                    </label>
                    <input
                      type="number"
                      value={selectedRequest.final_cost || ''}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, final_cost: parseFloat(e.target.value) || undefined })}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Enter final cost"
                    />
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={selectedRequest.admin_notes || ''}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, admin_notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Add internal notes..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('repair_requests')
                          .update({
                            estimated_cost: selectedRequest.estimated_cost,
                            final_cost: selectedRequest.final_cost,
                            admin_notes: selectedRequest.admin_notes,
                            updated_at: new Date().toISOString()
                          })
                          .eq('id', selectedRequest.id);

                        if (error) throw error;

                        toast.success('Request updated successfully');
                        setShowEditModal(false);
                        fetchData();
                      } catch (error) {
                        console.error('Error updating request:', error);
                        toast.error('Failed to update request');
                      }
                    }}
                    className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg"
                  >
                    Save Changes
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
