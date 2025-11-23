import { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllUserProfiles, type UserProfile } from '../../lib/userProfile';

export default function CustomerList() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const profiles = await getAllUserProfiles();
      setCustomers(profiles);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
          Customer Management
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
          View and manage customer profiles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{customers.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No customers found</p>
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
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Loyalty Points
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                        {customer.full_name || 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-ekami-charcoal-400" />
                            <span className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                              {customer.email}
                            </span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-ekami-charcoal-400" />
                            <span className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                              {customer.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 text-ekami-gold-800 dark:text-ekami-gold-300 rounded-full text-sm font-semibold">
                        {customer.loyalty_points} pts
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </p>
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
