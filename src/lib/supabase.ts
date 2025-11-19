import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types for TypeScript
export interface Car {
  id: string;
  created_at: string;
  updated_at: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  price_sale?: number;
  price_rent_daily?: number;
  price_rent_weekly?: number;
  price_rent_monthly?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  seats?: number;
  doors?: number;
  color?: string;
  engine_size?: string;
  features?: string[];
  status: string;
  available_for_rent: boolean;
  available_for_sale: boolean;
  location?: string;
  city?: string;
  images?: string[];
  video_url?: string;
  description?: string;
  condition?: string;
  owner_id?: string;
  is_verified: boolean;
  slug?: string;
}

export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  car_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  pickup_location?: string;
  dropoff_location?: string;
  daily_rate: number;
  total_days: number;
  subtotal: number;
  tax: number;
  insurance: number;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  status: string;
  driver_name?: string;
  driver_license?: string;
  driver_phone?: string;
  special_requests?: string;
  admin_notes?: string;
}

export interface Purchase {
  id: string;
  created_at: string;
  updated_at: string;
  car_id: string;
  buyer_id: string;
  purchase_price: number;
  tax: number;
  fees: number;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  deposit_amount?: number;
  stripe_payment_intent_id?: string;
  status: string;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_address?: string;
  delivery_method?: string;
  delivery_address?: string;
  delivery_date?: string;
  notes?: string;
}

export interface RepairRequest {
  id: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  mileage?: number;
  service_type?: string;
  description: string;
  urgency?: string;
  preferred_date?: string;
  scheduled_date?: string;
  completion_date?: string;
  estimated_cost?: number;
  final_cost?: number;
  status: string;
  payment_status: string;
  images?: string[];
  mechanic_notes?: string;
  parts_needed?: string;
}

export interface SellRequest {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  color?: string;
  asking_price: number;
  negotiable: boolean;
  condition?: string;
  description?: string;
  service_history?: string;
  accident_history?: string;
  images?: string[];
  status: string;
  admin_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  car_id?: string;
}

export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id?: string;
  category?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  status: string;
  published_at?: string;
  views: number;
}

export interface Review {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  car_id: string;
  booking_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  status: string;
  helpful_count: number;
}

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  license_number?: string;
  license_expiry?: string;
  license_image?: string;
  preferred_language: string;
  currency: string;
  loyalty_points: number;
  loyalty_tier: string;
  avatar_url?: string;
}

// Helper functions for common queries

/**
 * Get all available cars for rent
 */
export async function getAvailableCarsForRent() {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('available_for_rent', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Car[];
}

/**
 * Get all available cars for sale
 */
export async function getAvailableCarsForSale() {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('available_for_sale', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Car[];
}

/**
 * Get car by slug
 */
export async function getCarBySlug(slug: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Car;
}

/**
 * Get car by ID
 */
export async function getCarById(id: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Car;
}

/**
 * Get published blog posts
 */
export async function getPublishedBlogPosts(limit = 10) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as BlogPost[];
}

/**
 * Get blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) throw error;
  return data as BlogPost;
}

/**
 * Create a booking
 */
export async function createBooking(booking: Partial<Booking>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

/**
 * Create a repair request
 */
export async function createRepairRequest(request: Partial<RepairRequest>) {
  const { data, error } = await supabase
    .from('repair_requests')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data as RepairRequest;
}

/**
 * Create a sell request
 */
export async function createSellRequest(request: Partial<SellRequest>) {
  const { data, error } = await supabase
    .from('sell_requests')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data as SellRequest;
}

/**
 * Get user's bookings
 */
export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      cars (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get user's profile
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as UserProfile;
}

/**
 * Update user's profile
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

/**
 * Search cars
 */
export async function searchCars(filters: {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  city?: string;
  availableForRent?: boolean;
  availableForSale?: boolean;
}) {
  let query = supabase
    .from('cars')
    .select('*')
    .eq('status', 'available');

  if (filters.make) query = query.ilike('make', `%${filters.make}%`);
  if (filters.model) query = query.ilike('model', `%${filters.model}%`);
  if (filters.bodyType) query = query.eq('body_type', filters.bodyType);
  if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType);
  if (filters.transmission) query = query.eq('transmission', filters.transmission);
  if (filters.city) query = query.eq('city', filters.city);
  if (filters.availableForRent !== undefined) query = query.eq('available_for_rent', filters.availableForRent);
  if (filters.availableForSale !== undefined) query = query.eq('available_for_sale', filters.availableForSale);

  if (filters.minPrice) {
    query = query.or(`price_sale.gte.${filters.minPrice},price_rent_daily.gte.${filters.minPrice}`);
  }
  if (filters.maxPrice) {
    query = query.or(`price_sale.lte.${filters.maxPrice},price_rent_daily.lte.${filters.maxPrice}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as Car[];
}
