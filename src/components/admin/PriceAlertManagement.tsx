import { useState, useEffect } from 'react';
import { Bell, TrendingDown, Mail, Calendar, Check, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface PriceAlert {
  id: string;
  car_id: string;
  user_email: string;
  user_name: string | null;
  target_price: number | null;
  current_price: number;
  alert_type: 'any_drop' | 'target_price' | 'percentage_drop';
  percentage_threshold: number;
  is_active: boolean;
  notified_at: string | null;
  created_at: string;
  car?: {
    make: string;
    model: string;
    year: number;
    car_number: string;
    price_rent_daily: number;
  };
}

interface AlertStats {
  total: number;
  active: number;
  triggered: number;
  by_type: {
    any_drop: number;
    target_price: number;
    percentage_drop: number;
  };
}

export default function PriceAlertManagement() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    active: 0,
    triggered: 0,
    by_type: { any_drop: 0, target_price: 0, percentage_drop: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      // Fetch alerts with car details
      const { data, error } = await supabase
        .from('price_alerts')
        .select(`
          *,
          car:cars(make, model, year, car_number, price_rent_daily)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAlerts(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(a => a.is_active).length || 0;
      const triggered = data?.filter(a => a.notified_at).length || 0;
      const by_type = {
        any_drop: data?.filter(a => a.alert_type === 'any_drop').length || 0,
        target_price: data?.filter(a => a.alert_type === 'target_price').length || 0,
        percentage_drop: data?.filter(a => a.alert_type === 'percentage_drop').length || 0,
      };

      setStats({ total, active, triggered, by_type });
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;

      toast.success(`Alert ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchAlerts();
    } catch (error: any) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alert deleted successfully');
      fetchAlerts();
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'any_drop': return 'Any Drop';
      case 'target_price': return 'Target Price';
      case 'percentage_drop': return 'Percentage Drop';
      default: return type;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'any_drop': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'target_price': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'percentage_drop': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return alert.is_active;
    if (filter === 'triggered') return alert.notified_at;
    return true;
  });

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Price Alert Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage user price drop subscriptions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</p>
              <p className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Triggered</p>
              <p className="text-3xl font-bold text-ekami-gold-600 mt-1">
                {stats.triggered}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-ekami-gold-100 dark:bg-ekami-gold-900/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-ekami-gold-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subscribers</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {new Set(alerts.map(a => a.user_email)).size}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-ekami-gold-600 text-white'
              : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'active'
              ? 'bg-ekami-gold-600 text-white'
              : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300'
          }`}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setFilter('triggered')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'triggered'
              ? 'bg-ekami-gold-600 text-white'
              : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300'
          }`}
        >
          Triggered ({stats.triggered})
        </button>
      </div>

      {/* Alerts List */}
      <div className="card overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No alerts found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ekami-silver-50 dark:bg-ekami-charcoal-800">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    User
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Car
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Alert Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Price Info
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
                {filteredAlerts.map((alert) => (
                  <motion.tr
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {alert.user_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {alert.user_email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-ekami-charcoal-900 dark:text-white">
                          {alert.car?.make} {alert.car?.model}
                        </p>
                        <p className="text-sm text-ekami-gold-600">
                          {alert.car?.car_number}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                        {getAlertTypeLabel(alert.alert_type)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          Current: {alert.car?.price_rent_daily?.toLocaleString()} XAF
                        </p>
                        {alert.target_price && (
                          <p className="text-gray-500 dark:text-gray-400">
                            Target: {alert.target_price.toLocaleString()} XAF
                          </p>
                        )}
                        {alert.alert_type === 'percentage_drop' && (
                          <p className="text-gray-500 dark:text-gray-400">
                            Threshold: {alert.percentage_threshold}%
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {alert.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {alert.notified_at && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Triggered
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            alert.is_active
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200'
                          }`}
                          title={alert.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {alert.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete alert"
                        >
                          <X className="w-4 h-4" />
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
    </div>
  );
}
