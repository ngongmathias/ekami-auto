import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Phone, Download, X, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  carImage: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalAmount: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingReference: string;
  createdAt: string;
  hasReview?: boolean;
}

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
  onWriteReview?: (bookingId: string, carId: string, carName: string) => void;
}

export default function BookingCard({ booking, onCancel, onWriteReview }: BookingCardProps) {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPaymentStatusIcon = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleDownloadReceipt = () => {
    toast.success('Receipt download would start here');
    // In production, generate and download PDF
  };

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      onCancel?.(booking.id);
    }
  };

  const canCancel = booking.status === 'upcoming' && booking.paymentStatus === 'paid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-xl transition-shadow"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Car Image */}
        <Link to={`/cars/${booking.carId}`} className="flex-shrink-0">
          <img
            src={booking.carImage}
            alt={booking.carName}
            className="w-full md:w-48 h-40 object-cover rounded-xl hover:scale-105 transition-transform"
          />
        </Link>

        {/* Booking Details */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <Link
                to={`/cars/${booking.carId}`}
                className="text-xl font-bold text-ekami-charcoal-900 dark:text-white hover:text-ekami-gold-600 transition-colors"
              >
                {booking.carName}
              </Link>
              <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                Booking #{booking.bookingReference}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Dates and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-ekami-gold-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  Rental Period
                </p>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-ekami-gold-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  Pickup Location
                </p>
                <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  {booking.pickupLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex items-center justify-between pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
            <div className="flex items-center space-x-2">
              {getPaymentStatusIcon(booking.paymentStatus)}
              <span className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
                Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-ekami-gold-600">
                {booking.totalAmount.toLocaleString()} XAF
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center space-x-2 px-4 py-2 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl font-semibold hover:bg-ekami-silver-200 dark:hover:bg-ekami-charcoal-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Receipt</span>
            </button>

            <a
              href={`https://wa.me/237652765281?text=${encodeURIComponent(`Hi, I have a question about booking #${booking.bookingReference}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Support</span>
            </a>

            {canCancel && (
              <button
                onClick={handleCancelBooking}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel Booking</span>
              </button>
            )}

            {booking.status === 'completed' && !booking.hasReview && onWriteReview && (
              <button
                onClick={() => onWriteReview(booking.id, booking.carId, booking.carName)}
                className="flex items-center space-x-2 px-4 py-2 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Write Review</span>
              </button>
            )}

            <Link
              to={`/cars/${booking.carId}`}
              className="flex items-center space-x-2 px-4 py-2 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl font-semibold hover:bg-ekami-silver-200 dark:hover:bg-ekami-charcoal-700 transition-colors"
            >
              <span>View Car Details</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
