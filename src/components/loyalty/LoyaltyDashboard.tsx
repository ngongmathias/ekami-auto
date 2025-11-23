import { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  Gift, 
  Star, 
  Users, 
  Calendar,
  Check,
  Lock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoyaltyMember {
  id: string;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  tier: string;
  tier_progress: number;
  total_bookings: number;
  total_spent: number;
  referrals_count: number;
  reviews_count: number;
}

interface Transaction {
  id: string;
  created_at: string;
  type: string;
  source: string;
  points: number;
  description: string;
  balance_after: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  reward_type: string;
  discount_percentage: number;
  min_tier: string;
  featured: boolean;
}

interface Tier {
  tier_name: string;
  display_name: string;
  points_required: number;
  points_multiplier: number;
  discount_percentage: number;
  perks: string[];
  color: string;
}

export default function LoyaltyDashboard() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [member, setMember] = useState<LoyaltyMember | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview');

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchLoyaltyData();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [user, isSignedIn, isLoaded]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);

      // Fetch or create member profile
      let { data: memberData } = await supabase
        .from('loyalty_members')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!memberData) {
        // Create new member
        const userEmail = user?.emailAddresses?.[0]?.emailAddress || 
                         user?.primaryEmailAddress?.emailAddress || 
                         user?.email || 
                         'no-email@example.com';
        
        const { data: newMember } = await supabase
          .from('loyalty_members')
          .insert([{
            user_id: user?.id,
            email: userEmail,
            total_points: 100, // Welcome bonus
            available_points: 100,
            lifetime_points: 100,
          }])
          .select()
          .single();

        // Add welcome transaction
        await supabase.from('loyalty_transactions').insert([{
          member_id: newMember.id,
          type: 'earn',
          source: 'bonus',
          points: 100,
          description: 'Welcome bonus',
          balance_after: 100,
        }]);

        memberData = newMember;
        toast.success('Welcome! You earned 100 bonus points!');
      }

      setMember(memberData);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('member_id', memberData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setTransactions(transactionsData || []);

      // Fetch available rewards
      const { data: rewardsData } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('available', true)
        .order('display_order');

      setRewards(rewardsData || []);

      // Fetch tiers
      const { data: tiersData } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('display_order');

      setTiers(tiersData || []);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (!member) return;

    if (member.available_points < reward.points_required) {
      toast.error('Not enough points!');
      return;
    }

    // Check tier requirement
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const userTierIndex = tierOrder.indexOf(member.tier);
    const requiredTierIndex = tierOrder.indexOf(reward.min_tier);

    if (userTierIndex < requiredTierIndex) {
      toast.error(`This reward requires ${reward.min_tier} tier or higher!`);
      return;
    }

    try {
      // Create redemption
      const { data: redemption, error } = await supabase
        .from('loyalty_redemptions')
        .insert([{
          member_id: member.id,
          reward_id: reward.id,
          points_used: reward.points_required,
          status: 'pending',
          redemption_code: `EK-${Date.now()}`,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        }])
        .select()
        .single();

      if (error) throw error;

      // Deduct points
      const newBalance = member.available_points - reward.points_required;
      await supabase
        .from('loyalty_members')
        .update({ available_points: newBalance })
        .eq('id', member.id);

      // Add transaction
      await supabase.from('loyalty_transactions').insert([{
        member_id: member.id,
        type: 'redeem',
        source: 'redemption',
        points: -reward.points_required,
        description: `Redeemed: ${reward.name}`,
        balance_after: newBalance,
        reference_type: 'redemption',
        reference_id: redemption.id,
      }]);

      toast.success(`Reward redeemed! Code: ${redemption.redemption_code}`);
      fetchLoyaltyData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'from-orange-600 to-orange-800',
      silver: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-400 to-purple-600',
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getNextTier = () => {
    if (!member || !tiers.length) return null;
    const currentTierIndex = tiers.findIndex(t => t.tier_name === member.tier);
    return tiers[currentTierIndex + 1] || null;
  };

  const getProgressToNextTier = () => {
    if (!member) return 0;
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    
    const currentTier = tiers.find(t => t.tier_name === member.tier);
    const currentPoints = member.lifetime_points;
    const currentTierPoints = currentTier?.points_required || 0;
    const nextTierPoints = nextTier.points_required;
    
    const progress = ((currentPoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="bg-gradient-to-br from-ekami-gold-500 to-ekami-gold-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Join Our Loyalty Program
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Sign in to start earning points, unlock exclusive rewards, and enjoy special benefits with every booking!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/sign-in"
            className="px-8 py-3 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Sign In
          </a>
          <a
            href="/sign-up"
            className="px-8 py-3 border-2 border-ekami-gold-500 text-ekami-gold-600 dark:text-ekami-gold-400 rounded-xl font-semibold hover:bg-ekami-gold-50 dark:hover:bg-ekami-gold-900/20 transition-all"
          >
            Create Account
          </a>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Sparkles className="w-8 h-8 text-ekami-gold-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Earn Points</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get points on every booking and purchase</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Gift className="w-8 h-8 text-ekami-gold-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Unlock Rewards</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Redeem points for discounts and perks</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <TrendingUp className="w-8 h-8 text-ekami-gold-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Level Up</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Progress through tiers for better benefits</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!member) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Setting up your loyalty account...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Loyalty Rewards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Earn points, unlock rewards, and enjoy exclusive benefits
        </p>
      </div>

      {/* Tier Card */}
      <div className={`bg-gradient-to-r ${getTierColor(member.tier)} rounded-2xl p-8 text-white mb-8 shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8" />
              <h2 className="text-3xl font-bold capitalize">{member.tier} Member</h2>
            </div>
            <p className="text-white/90">
              {tiers.find(t => t.tier_name === member.tier)?.discount_percentage}% discount on all bookings
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold">{member.available_points.toLocaleString()}</p>
            <p className="text-white/90">Available Points</p>
          </div>
        </div>

        {/* Progress to next tier */}
        {getNextTier() && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress to {getNextTier()?.display_name}</span>
              <span>{Math.round(getProgressToNextTier())}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressToNextTier()}%` }}
              ></div>
            </div>
            <p className="text-sm text-white/80 mt-2">
              {(getNextTier()!.points_required - member.lifetime_points).toLocaleString()} more points needed
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-ekami-gold-500" />
            <p className="text-gray-600 dark:text-gray-400">Lifetime Points</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {member.lifetime_points.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400">Total Bookings</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {member.total_bookings}
          </p>
        </div>

        <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-green-500" />
            <p className="text-gray-600 dark:text-gray-400">Referrals</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {member.referrals_count}
          </p>
        </div>

        <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <p className="text-gray-600 dark:text-gray-400">Reviews</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {member.reviews_count}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'rewards'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Rewards ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Tier Benefits */}
          <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)} Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tiers.find(t => t.tier_name === member.tier)?.perks.map((perk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All Tiers */}
          <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Loyalty Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.tier_name}
                  className={`rounded-lg p-4 ${
                    tier.tier_name === member.tier
                      ? 'ring-2 ring-ekami-gold-500 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                      : 'bg-gray-50 dark:bg-ekami-charcoal-700'
                  }`}
                >
                  <h4 className="font-bold text-lg mb-2 capitalize">{tier.display_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {tier.points_required.toLocaleString()} points
                  </p>
                  <p className="text-sm font-medium text-ekami-gold-600 dark:text-ekami-gold-400">
                    {tier.discount_percentage}% discount
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const canRedeem = member.available_points >= reward.points_required;
            const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
            const hasRequiredTier = tierOrder.indexOf(member.tier) >= tierOrder.indexOf(reward.min_tier);

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg ${
                  reward.featured ? 'ring-2 ring-ekami-gold-500' : ''
                }`}
              >
                {reward.featured && (
                  <div className="flex items-center gap-2 text-ekami-gold-500 mb-3">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">Featured</span>
                  </div>
                )}
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {reward.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-ekami-gold-500" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      {reward.points_required.toLocaleString()} pts
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                    {reward.min_tier}+
                  </span>
                </div>
                <button
                  onClick={() => redeemReward(reward)}
                  disabled={!canRedeem || !hasRequiredTier}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    canRedeem && hasRequiredTier
                      ? 'bg-ekami-gold-500 text-white hover:bg-ekami-gold-600'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!hasRequiredTier ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Requires {reward.min_tier}
                    </>
                  ) : !canRedeem ? (
                    <>Not enough points</>
                  ) : (
                    <>Redeem Now</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-ekami-charcoal-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Points
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'earn'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        transaction.points > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.points > 0 ? '+' : ''}
                      {transaction.points.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {transaction.balance_after.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
