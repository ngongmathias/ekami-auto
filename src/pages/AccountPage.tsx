import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Heart, 
  User, 
  Award, 
  Settings,
  LogOut,
  Car as CarIcon,
  TrendingUp,
  Clock,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import BookingCard, { type Booking } from '../components/dashboard/BookingCard';
import FavoriteCard from '../components/dashboard/FavoriteCard';
import ReviewForm from '../components/reviews/ReviewForm';
import ServiceRequestCard from '../components/repairs/ServiceRequestCard';
import type { Car } from '../lib/supabase';
import type { RepairRequest } from '../types/repairs';
import { supabase } from '../lib/supabase';

type TabType = 'overview' | 'bookings' | 'services' | 'favorites' | 'profile' | 'loyalty';

export default function AccountPage() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded, user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [serviceRequests, setServiceRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<{ bookingId: string; carId: string; carName: string } | null>(null);

  useEffect(() => {
    // Fetch user data
    async function fetchUserData() {
      try {
        setLoading(true);
        
        // Fetch bookings from Supabase
        if (user?.id) {
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
              *,
              cars (
                id,
                make,
                model,
                year,
                images
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (!bookingsError && bookingsData) {
            // Transform the data to match the Booking interface
            const transformedBookings: Booking[] = bookingsData.map((booking: any) => ({
              id: booking.id,
              carId: booking.car_id,
              carName: booking.cars ? `${booking.cars.make} ${booking.cars.model} ${booking.cars.year}` : 'Unknown Car',
              carImage: booking.cars?.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
              startDate: booking.start_date,
              endDate: booking.end_date,
              pickupLocation: booking.pickup_location,
              dropoffLocation: booking.dropoff_location,
              totalAmount: booking.total_amount,
              status: booking.status,
              paymentStatus: booking.payment_status,
              bookingReference: booking.booking_reference,
              createdAt: booking.created_at,
            }));
            
            setBookings(transformedBookings);
          } else {
            setBookings([]);
          }
        }
        
        // Fetch service requests from Supabase
        if (user?.id) {
          const { data: servicesData, error: servicesError } = await supabase
            .from('repair_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (!servicesError && servicesData) {
            setServiceRequests(servicesData);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    }

    if (isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const handleCancelBooking = (bookingId: string) => {
    toast.success('Booking cancelled successfully');
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    ));
  };

  const handleRemoveFavorite = (carId: string) => {
    toast.success('Removed from favorites');
    setFavorites(prev => prev.filter(c => c.id !== carId));
  };

  const handleWriteReview = (bookingId: string, carId: string, carName: string) => {
    setSelectedReview({ bookingId, carId, carName });
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    // Mark booking as reviewed
    if (selectedReview) {
      setBookings(prev => prev.map(b => 
        b.id === selectedReview.bookingId ? { ...b, hasReview: true } : b
      ));
    }
  };

  const stats = {
    totalBookings: bookings.length,
    upcomingBookings: bookings.filter(b => b.status === 'upcoming').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    loyaltyPoints: 1250,
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
    { id: 'bookings' as TabType, label: 'My Bookings', icon: Calendar },
    { id: 'services' as TabType, label: 'My Services', icon: Wrench },
    { id: 'favorites' as TabType, label: 'Favorites', icon: Heart },
    { id: 'loyalty' as TabType, label: 'Loyalty Points', icon: Award },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            My Dashboard
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            Welcome back, {user?.firstName || 'Guest'}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalBookings}</p>
              </div>
              <CarIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.upcomingBookings}</p>
              </div>
              <Clock className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Completed</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.completedBookings}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-ekami-gold-50 to-ekami-gold-100 dark:from-ekami-gold-900/20 dark:to-ekami-gold-800/20 border-2 border-ekami-gold-200 dark:border-ekami-gold-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ekami-gold-700 dark:text-ekami-gold-300 mb-1">Loyalty Points</p>
                <p className="text-3xl font-bold text-ekami-gold-900 dark:text-ekami-gold-100">{stats.loyaltyPoints}</p>
              </div>
              <Award className="w-12 h-12 text-ekami-gold-600 dark:text-ekami-gold-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'text-ekami-gold-600 border-b-2 border-ekami-gold-600'
                      : 'text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
                    Recent Activity
                  </h2>
                  {loading ? (
                    <div className="card">
                      <div className="animate-pulse space-y-4">
                        <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map(booking => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onCancel={handleCancelBooking}
                          onWriteReview={handleWriteReview}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="card text-center py-12">
                      <Calendar className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
                      <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                        No bookings yet
                      </p>
                      <a href="/rent" className="btn-primary">
                        Browse Cars
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  All Bookings
                </h2>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="card animate-pulse">
                        <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map(booking => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        onWriteReview={handleWriteReview}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card text-center py-12">
                    <Calendar className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
                    <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                      No bookings found
                    </p>
                    <a href="/rent" className="btn-primary">
                      Browse Cars
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    My Service Requests
                  </h2>
                  <a
                    href="/repairs"
                    className="px-4 py-2 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 hover:from-ekami-gold-600 hover:to-ekami-gold-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Request New Service
                  </a>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="card animate-pulse">
                        <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : serviceRequests.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {serviceRequests.map(request => (
                      <ServiceRequestCard
                        key={request.id}
                        request={request}
                        onClick={() => {
                          // TODO: Open service request details modal
                          toast('Service request details coming soon!');
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card text-center py-12">
                    <Wrench className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
                    <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                      No service requests yet
                    </p>
                    <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-6">
                      Request a service to keep your vehicle in top condition
                    </p>
                    <a
                      href="/repairs"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 hover:from-ekami-gold-600 hover:to-ekami-gold-700 text-white font-semibold rounded-lg transition-all duration-300"
                    >
                      Browse Services
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Favorite Cars
                </h2>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(car => (
                      <FavoriteCard
                        key={car.id}
                        car={car}
                        onRemove={handleRemoveFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card text-center py-12">
                    <Heart className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
                    <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                      No favorites yet
                    </p>
                    <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-6">
                      Click the heart icon on any car to add it to your favorites
                    </p>
                    <a href="/rent" className="btn-primary">
                      Browse Cars
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                <div className="card bg-gradient-to-br from-ekami-gold-500 to-ekami-gold-600 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Loyalty Points</h3>
                      <p className="text-ekami-gold-100">Earn points with every booking!</p>
                    </div>
                    <Award className="w-16 h-16 text-ekami-gold-200" />
                  </div>
                  <div className="text-5xl font-bold mb-4">{stats.loyaltyPoints}</div>
                  <div className="bg-white/20 rounded-full h-3 mb-2">
                    <div className="bg-white rounded-full h-3" style={{ width: '62%' }}></div>
                  </div>
                  <p className="text-sm text-ekami-gold-100">
                    750 points until next reward tier
                  </p>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
                    How to Earn Points
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-ekami-charcoal-900 dark:text-white">Complete a booking</p>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Earn 100 points per booking</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-ekami-charcoal-900 dark:text-white">Refer a friend</p>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Earn 500 points per referral</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-ekami-charcoal-900 dark:text-white">Write a review</p>
                        <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Earn 50 points per review</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                      readOnly
                      className="w-full px-4 py-3 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl text-ekami-charcoal-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.emailAddresses?.[0]?.emailAddress || ''}
                      readOnly
                      className="w-full px-4 py-3 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl text-ekami-charcoal-900 dark:text-white"
                    />
                  </div>
                  <div className="pt-6 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                      Manage your account settings and preferences through Clerk
                    </p>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors">
                      <Settings className="w-5 h-5" />
                      <span>Manage Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Review Form Modal */}
      {selectedReview && (
        <ReviewForm
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReview(null);
          }}
          carId={selectedReview.carId}
          carName={selectedReview.carName}
          bookingId={selectedReview.bookingId}
        />
      )}
    </div>
  );
}
