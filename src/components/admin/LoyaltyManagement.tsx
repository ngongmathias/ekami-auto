import { useState, useEffect } from 'react';
import { Award, Users, Gift, TrendingUp, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  email: string;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  tier: string;
  total_bookings: number;
  total_spent: number;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  reward_type: string;
  discount_percentage: number;
  available: boolean;
  min_tier: string;
}

export default function LoyaltyManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'rewards' | 'stats'>('members');
  const [showAddReward, setShowAddReward] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    points_required: 0,
    reward_type: 'discount',
    discount_percentage: 0,
    min_tier: 'bronze',
    available: true,
  });

  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    averagePointsPerMember: 0,
    tierDistribution: {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch members
      const { data: membersData } = await supabase
        .from('loyalty_members')
        .select('*')
        .order('created_at', { ascending: false });

      setMembers(membersData || []);

      // Fetch rewards
      const { data: rewardsData } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .order('display_order');

      setRewards(rewardsData || []);

      // Calculate stats
      if (membersData) {
        const totalPointsIssued = membersData.reduce((sum, m) => sum + m.lifetime_points, 0);
        const totalPointsRedeemed = membersData.reduce(
          (sum, m) => sum + (m.lifetime_points - m.available_points),
          0
        );

        const tierDist = {
          bronze: membersData.filter(m => m.tier === 'bronze').length,
          silver: membersData.filter(m => m.tier === 'silver').length,
          gold: membersData.filter(m => m.tier === 'gold').length,
          platinum: membersData.filter(m => m.tier === 'platinum').length,
        };

        setStats({
          totalMembers: membersData.length,
          totalPointsIssued,
          totalPointsRedeemed,
          averagePointsPerMember: membersData.length > 0 ? totalPointsIssued / membersData.length : 0,
          tierDistribution: tierDist,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const adjustPoints = async (memberId: string, points: number, description: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      const newBalance = member.available_points + points;
      const newLifetime = member.lifetime_points + (points > 0 ? points : 0);

      await supabase
        .from('loyalty_members')
        .update({
          available_points: newBalance,
          lifetime_points: newLifetime,
        })
        .eq('id', memberId);

      await supabase.from('loyalty_transactions').insert([{
        member_id: memberId,
        type: points > 0 ? 'earn' : 'redeem',
        source: 'adjust',
        points,
        description,
        balance_after: newBalance,
        created_by: 'admin',
      }]);

      toast.success('Points adjusted successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveReward = async () => {
    try {
      if (editingReward) {
        // Update
        await supabase
          .from('loyalty_rewards')
          .update(rewardForm)
          .eq('id', editingReward.id);
        toast.success('Reward updated!');
      } else {
        // Create
        await supabase
          .from('loyalty_rewards')
          .insert([rewardForm]);
        toast.success('Reward created!');
      }

      setShowAddReward(false);
      setEditingReward(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteReward = async (id: string) => {
    if (!confirm('Delete this reward?')) return;

    try {
      await supabase.from('loyalty_rewards').delete().eq('id', id);
      toast.success('Reward deleted!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setRewardForm({
      name: '',
      description: '',
      points_required: 0,
      reward_type: 'discount',
      discount_percentage: 0,
      min_tier: 'bronze',
      available: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Loyalty Program Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage members, rewards, and program settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'members'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'rewards'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Rewards ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-ekami-charcoal-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Points
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full capitalize bg-ekami-gold-100 text-ekami-gold-700 dark:bg-ekami-gold-900/30 dark:text-ekami-gold-400">
                        {member.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {member.available_points.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {member.total_bookings}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {member.total_spent.toLocaleString()} XAF
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          const points = prompt('Enter points to add (negative to deduct):');
                          if (points) {
                            const description = prompt('Description:') || 'Manual adjustment';
                            adjustPoints(member.id, parseInt(points), description);
                          }
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Adjust Points
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <>
          <button
            onClick={() => {
              resetForm();
              setEditingReward(null);
              setShowAddReward(true);
            }}
            className="mb-6 px-6 py-3 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Reward
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    {reward.name}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingReward(reward);
                        setRewardForm(reward);
                        setShowAddReward(true);
                      }}
                      className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ekami-gold-600">
                    {reward.points_required} pts
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize text-xs">
                    {reward.min_tier}+
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      reward.available
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {reward.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-500" />
                <p className="text-gray-600 dark:text-gray-400">Total Members</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalMembers.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <p className="text-gray-600 dark:text-gray-400">Points Issued</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalPointsIssued.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-6 h-6 text-purple-500" />
                <p className="text-gray-600 dark:text-gray-400">Points Redeemed</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalPointsRedeemed.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-ekami-gold-500" />
                <p className="text-gray-600 dark:text-gray-400">Avg Points/Member</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.averagePointsPerMember).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Tier Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(stats.tierDistribution).map(([tier, count]) => (
                <div key={tier} className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {count}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{tier}</p>
                  <p className="text-sm text-gray-500">
                    {stats.totalMembers > 0
                      ? Math.round((count / stats.totalMembers) * 100)
                      : 0}
                    %
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Reward Modal */}
      <AnimatePresence>
        {showAddReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddReward(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingReward ? 'Edit Reward' : 'Add New Reward'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-ekami-charcoal-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-ekami-charcoal-700 dark:border-gray-600"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Points Required</label>
                    <input
                      type="number"
                      value={rewardForm.points_required}
                      onChange={(e) =>
                        setRewardForm({ ...rewardForm, points_required: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 border rounded-lg dark:bg-ekami-charcoal-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Discount %</label>
                    <input
                      type="number"
                      value={rewardForm.discount_percentage}
                      onChange={(e) =>
                        setRewardForm({
                          ...rewardForm,
                          discount_percentage: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border rounded-lg dark:bg-ekami-charcoal-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={rewardForm.reward_type}
                      onChange={(e) => setRewardForm({ ...rewardForm, reward_type: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-ekami-charcoal-700 dark:border-gray-600"
                    >
                      <option value="discount">Discount</option>
                      <option value="upgrade">Upgrade</option>
                      <option value="freebie">Freebie</option>
                      <option value="voucher">Voucher</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Min Tier</label>
                    <select
                      value={rewardForm.min_tier}
                      onChange={(e) => setRewardForm({ ...rewardForm, min_tier: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-ekami-charcoal-700 dark:border-gray-600"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveReward}
                    className="flex-1 px-6 py-3 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600"
                  >
                    {editingReward ? 'Update' : 'Create'} Reward
                  </button>
                  <button
                    onClick={() => setShowAddReward(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
