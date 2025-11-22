import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Settings,
  BarChart3,
  Wrench,
  Star,
  Upload,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import CarManagement from '../../components/admin/CarManagement';
import BookingManagement from '../../components/admin/BookingManagement';
import PurchasesManagement from '../../components/admin/PurchasesManagement';
import SellRequestsManagement from '../../components/admin/SellRequestsManagement';
import CustomerList from '../../components/admin/CustomerList';
import BlogManagement from '../../components/admin/BlogManagement';
import CommentsModeration from '../../components/admin/CommentsModeration';
import RepairsManagement from '../../components/admin/RepairsManagement';
import MechanicsManagement from '../../components/admin/MechanicsManagement';
import ReviewsManagement from '../../components/admin/ReviewsManagement';
import CarLocationManager from '../../components/admin/CarLocationManager';

type TabType = 'overview' | 'cars' | 'bookings' | 'purchases' | 'sell-requests' | 'repairs' | 'mechanics' | 'reviews' | 'customers' | 'analytics' | 'blog' | 'comments' | 'locations';

export default function AdminDashboard() {
  const { isSignedIn, isLoaded, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalCars: 0,
    totalCustomers: 0,
    activeBookings: 0,
    pendingPayments: 0,
    availableCars: 0,
    recentBookings: [] as any[],
  });

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        
        // Fetch real data from Supabase
        const [bookingsRes, carsRes] = await Promise.all([
          supabase.from('bookings').select('*, cars(make, model, year)'),
          supabase.from('cars').select('*')
        ]);

        const bookings = bookingsRes.data || [];
        const cars = carsRes.data || [];

        // Calculate stats
        const totalRevenue = bookings
          .filter(b => b.payment_status === 'paid')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);

        const recentBookings = bookings
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(b => ({
            id: b.id,
            customer: b.customer_name || b.driver_name || 'Unknown',
            car: b.cars ? `${b.cars.make} ${b.cars.model} ${b.cars.year}` : 'Unknown Car',
            amount: b.total_amount,
            status: b.status,
            date: b.created_at,
          }));

        const calculatedStats = {
          totalRevenue,
          totalBookings: bookings.length,
          totalCars: cars.length,
          totalCustomers: new Set(bookings.map(b => b.user_id).filter(Boolean)).size,
          activeBookings: bookings.filter(b => b.status === 'active').length,
          pendingPayments: bookings.filter(b => b.payment_status === 'pending').length,
          availableCars: cars.filter(c => c.available_for_rent && c.status === 'available').length,
          recentBookings,
        };

        setStats(calculatedStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
        setLoading(false);
      }
    }

    if (isSignedIn) {
      fetchAdminData();
    }
  }, [isSignedIn]);

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

  // Simple admin check (in production, check user role from database)
  const adminEmails = ['kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'];
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <a href="/" className="btn-primary">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'cars' as TabType, label: 'Cars', icon: Car },
    { id: 'locations' as TabType, label: 'Locations', icon: MapPin },
    { id: 'bookings' as TabType, label: 'Bookings', icon: Calendar },
    { id: 'purchases' as TabType, label: 'Purchases', icon: DollarSign },
    { id: 'sell-requests' as TabType, label: 'Sell Requests', icon: Upload },
    { id: 'repairs' as TabType, label: 'Repairs', icon: Settings },
    { id: 'mechanics' as TabType, label: 'Mechanics', icon: Wrench },
    { id: 'reviews' as TabType, label: 'Reviews', icon: Star },
    { id: 'customers' as TabType, label: 'Customers', icon: Users },
    { id: 'blog' as TabType, label: 'Blog', icon: Package },
    { id: 'comments' as TabType, label: 'Comments', icon: MessageSquare },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
                Manage your car rental business
              </p>
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">XAF</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-700 dark:text-green-300">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% from last month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalBookings}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {stats.activeBookings} active
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4" />
              <span>{stats.pendingPayments} pending payments</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Total Cars</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.totalCars}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {stats.availableCars} available
                </p>
              </div>
              <Car className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-purple-700 dark:text-purple-300">
              <Package className="w-4 h-4" />
              <span>{stats.totalCars - stats.availableCars} rented out</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {stats.totalCustomers}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Registered users</p>
              </div>
              <Users className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-orange-700 dark:text-orange-300">
              <TrendingUp className="w-4 h-4" />
              <span>+8 new this week</span>
            </div>
          </motion.div>
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
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Bookings */}
              <div className="card">
                <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Recent Bookings
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          Car
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBookings.map(booking => (
                        <tr
                          key={booking.id}
                          className="border-b border-ekami-silver-100 dark:border-ekami-charcoal-800 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                        >
                          <td className="py-4 px-4 text-ekami-charcoal-900 dark:text-white font-medium">
                            {booking.customer}
                          </td>
                          <td className="py-4 px-4 text-ekami-charcoal-700 dark:text-ekami-silver-300">
                            {booking.car}
                          </td>
                          <td className="py-4 px-4 text-ekami-charcoal-900 dark:text-white font-semibold">
                            {booking.amount.toLocaleString()} XAF
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                            {new Date(booking.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="card hover:shadow-xl transition-all text-left group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Car className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-ekami-charcoal-900 dark:text-white">Add New Car</p>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        Add a vehicle to inventory
                      </p>
                    </div>
                  </div>
                </button>

                <button className="card hover:shadow-xl transition-all text-left group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                      <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-ekami-charcoal-900 dark:text-white">View All Bookings</p>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        Manage reservations
                      </p>
                    </div>
                  </div>
                </button>

                <button className="card hover:shadow-xl transition-all text-left group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                      <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-ekami-charcoal-900 dark:text-white">Customer List</p>
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        View all customers
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cars' && <CarManagement />}

          {activeTab === 'locations' && <CarLocationManager />}

          {activeTab === 'bookings' && <BookingManagement />}

          {activeTab === 'purchases' && <PurchasesManagement />}

          {activeTab === 'sell-requests' && <SellRequestsManagement />}

          {activeTab === 'repairs' && <RepairsManagement />}

          {activeTab === 'mechanics' && <MechanicsManagement />}

          {activeTab === 'reviews' && <ReviewsManagement />}

          {activeTab === 'customers' && <CustomerList />}

          {activeTab === 'blog' && <BlogManagement />}

          {activeTab === 'comments' && <CommentsModeration />}

          {activeTab === 'analytics' && (
            <div className="card text-center py-12">
              <BarChart3 className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                Analytics & Reports
              </h3>
              <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                View detailed analytics, revenue reports, and business insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
