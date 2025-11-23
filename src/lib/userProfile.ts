// User Profile Management - Sync Clerk users with Supabase
import { supabase } from './supabase';

export interface UserProfile {
  id: string; // Clerk user ID
  created_at: string;
  updated_at: string;
  full_name?: string;
  email?: string;
  phone?: string;
  loyalty_points: number;
  loyalty_tier: string;
  preferred_language: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  total_bookings: number;
  total_spent: number;
  metadata?: any;
}

/**
 * Create or update user profile in Supabase
 * Call this after user signs in with Clerk
 */
export async function syncUserProfile(clerkUser: {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumbers?: Array<{ phoneNumber: string }>;
}): Promise<UserProfile | null> {
  try {
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(' ') || undefined;
    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', clerkUser.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          email: email,
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clerkUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: clerkUser.id,
          full_name: fullName,
          email: email,
          phone: phone,
          loyalty_points: 0,
          loyalty_tier: 'bronze',
          preferred_language: 'en',
          notification_preferences: {
            email: true,
            sms: false,
            whatsapp: true,
          },
          total_bookings: 0,
          total_spent: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return null;
  }
}

/**
 * Get user profile by Clerk ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user loyalty points
 */
export async function updateLoyaltyPoints(
  userId: string,
  pointsToAdd: number
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('update_loyalty_points', {
      user_id_param: userId,
      points_to_add: pointsToAdd,
    });

    if (error) {
      console.error('Error updating loyalty points:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    return false;
  }
}

/**
 * Get all user profiles (admin only)
 */
export async function getAllUserProfiles(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all user profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting all user profiles:', error);
    return [];
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}
