export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  includes: string[];
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  years_experience: number;
  certifications: string[];
  rating: number;
  total_reviews: number;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RepairRequest {
  id: string;
  user_id: string;
  service_package_id?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year?: number;
  mileage?: number;
  license_plate?: string;
  vin?: string;
  problem_description?: string;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  status: RepairStatus;
  appointment_date?: string;
  appointment_time?: string;
  preferred_mechanic_id?: string;
  assigned_mechanic_id?: string;
  service_location: 'drop-off' | 'mobile';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  photo_urls: string[];
  estimated_cost?: number;
  final_cost?: number;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  completed_at?: string;
}

export type RepairStatus = 
  | 'received'
  | 'scheduled'
  | 'checked_in'
  | 'diagnosis'
  | 'quote_provided'
  | 'approved'
  | 'parts_ordered'
  | 'in_progress'
  | 'quality_check'
  | 'ready_pickup'
  | 'completed'
  | 'cancelled';

export interface ServiceHistory {
  id: string;
  repair_request_id: string;
  user_id: string;
  service_date: string;
  services_performed: string[];
  parts_replaced: string[];
  mechanic_id: string;
  cost: number;
  mileage_at_service?: number;
  next_service_due?: string;
  warranty_expires?: string;
  service_report_url?: string;
  created_at: string;
}

export interface ServiceReview {
  id: string;
  repair_request_id: string;
  user_id: string;
  mechanic_id?: string;
  overall_rating: number;
  mechanic_rating: number;
  communication_rating: number;
  timeliness_rating: number;
  review_text?: string;
  would_recommend: boolean;
  photo_urls: string[];
  is_approved: boolean;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}
