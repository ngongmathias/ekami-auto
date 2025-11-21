import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Calendar, Download, Edit, Play, Flag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Booking {
  id: string;
  created_at: string;
  car_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
  driver_name?: string;
  driver_phone?: string;
  driver_license?: string;
  pickup_location?: string;
  dropoff_location?: string;
  booking_reference?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  special_requests?: string;
  admin_notes?: string;
  payment_method?: string;
  // Joined data
  cars?: { make: string; model: string; year: number };
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Partial<Booking>>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          cars (make, model, year)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      toast.success(`Booking ${newStatus}`);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.cars?.make.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ? true : booking.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
          Booking Management
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
          View and manage all reservations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">Confirmed</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.confirmed}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Active</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.active}</p>
        </div>
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search bookings..."
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
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ekami-silver-50 dark:bg-ekami-charcoal-800">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Booking ID
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Car
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Dates
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Amount
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
                {filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-mono text-sm text-ekami-charcoal-900 dark:text-white">
                        #{booking.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                          {booking.driver_name || 'N/A'}
                        </p>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                          {booking.driver_phone || ''}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-ekami-charcoal-900 dark:text-white">
                        {booking.cars ? `${booking.cars.make} ${booking.cars.model} ${booking.cars.year}` : 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-ekami-charcoal-900 dark:text-white">
                          {new Date(booking.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                          to {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                        {booking.total_amount.toLocaleString()} XAF
                      </p>
                      <p className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {booking.payment_status}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Status workflow buttons */}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium transition-colors"
                            title="Confirm Booking"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'active')}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            title="Start Rental"
                          >
                            <Play className="w-3 h-3" />
                            Start
                          </button>
                        )}
                        {booking.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            title="Complete Rental"
                          >
                            <Flag className="w-3 h-3" />
                            Complete
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setAdminNotes(booking.admin_notes || '');
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
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    {isEditing ? 'Edit Booking' : 'Booking Details'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditedBooking(selectedBooking || {});
                        }}
                        className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                        title="Edit Booking"
                      >
                        <Edit className="w-5 h-5 text-ekami-gold-600" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setIsEditing(false);
                      }}
                      className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Booking Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Booking Reference</p>
                      <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                        {selectedBooking.booking_reference || `#${selectedBooking.id.slice(0, 8)}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">Name</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedBooking.customer_name || editedBooking.driver_name || ''}
                            onChange={(e) => setEditedBooking({ ...editedBooking, customer_name: e.target.value, driver_name: e.target.value })}
                            className="w-full px-3 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                          />
                        ) : (
                          <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                            {selectedBooking.customer_name || selectedBooking.driver_name || 'N/A'}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">Email</p>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedBooking.customer_email || ''}
                            onChange={(e) => setEditedBooking({ ...editedBooking, customer_email: e.target.value })}
                            className="w-full px-3 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                          />
                        ) : (
                          <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                            {selectedBooking.customer_email || 'N/A'}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">Phone</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedBooking.customer_phone || editedBooking.driver_phone || ''}
                            onChange={(e) => setEditedBooking({ ...editedBooking, customer_phone: e.target.value, driver_phone: e.target.value })}
                            className="w-full px-3 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                          />
                        ) : (
                          <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                            {selectedBooking.customer_phone || selectedBooking.driver_phone || 'N/A'}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">Driver License</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedBooking.driver_license || ''}
                            onChange={(e) => setEditedBooking({ ...editedBooking, driver_license: e.target.value })}
                            className="w-full px-3 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                          />
                        ) : (
                          <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                            {selectedBooking.driver_license || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Car & Dates */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">Rental Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Vehicle</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedBooking.cars ? `${selectedBooking.cars.make} ${selectedBooking.cars.model} ${selectedBooking.cars.year}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Duration</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {new Date(selectedBooking.start_date).toLocaleDateString()} - {new Date(selectedBooking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Pickup Location</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedBooking.pickup_location || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Dropoff Location</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {selectedBooking.dropoff_location || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">Payment Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Total Amount</p>
                        <p className="text-xl font-bold text-ekami-gold-600">
                          {selectedBooking.total_amount.toLocaleString()} XAF
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Payment Status</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white capitalize">
                          {selectedBooking.payment_status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Payment Method</p>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white capitalize">
                          {selectedBooking.payment_method || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedBooking.special_requests && (
                    <div>
                      <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Special Requests</h4>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {selectedBooking.special_requests}
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-2">Admin Notes</h4>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Add internal notes about this booking..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedBooking({});
                      }}
                      className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const updateData = isEditing ? {
                          ...editedBooking,
                          admin_notes: adminNotes
                        } : {
                          admin_notes: adminNotes
                        };

                        const { error } = await supabase
                          .from('bookings')
                          .update(updateData)
                          .eq('id', selectedBooking.id);

                        if (error) throw error;

                        toast.success(isEditing ? 'Booking updated' : 'Notes saved');
                        setShowDetailsModal(false);
                        setIsEditing(false);
                        setEditedBooking({});
                        fetchBookings();
                      } catch (error) {
                        toast.error('Failed to save changes');
                      }
                    }}
                    className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg"
                  >
                    {isEditing ? 'Save Changes' : 'Save Notes'}
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
