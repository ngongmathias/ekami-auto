import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will not work.');
}

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Payment intent types
export interface PaymentIntentData {
  amount: number; // Amount in XAF (smallest currency unit)
  currency: string;
  description: string;
  metadata: {
    carId: string;
    carName: string;
    customerId: string;
    customerEmail: string;
    rentalDays: number;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    dropoffLocation: string;
  };
}

// Create payment intent (this would normally be done on your backend)
export async function createPaymentIntent(data: PaymentIntentData): Promise<{ clientSecret: string }> {
  // In a real application, you would call your backend API here
  // Example:
  // const response = await fetch('/api/create-payment-intent', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  // For now, we'll simulate this with a mock response
  // In production, NEVER expose your Stripe secret key on the frontend!
  
  console.log('Payment Intent Data:', data);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock client secret
  // In production, this would come from your backend after creating a real payment intent
  return {
    clientSecret: 'mock_client_secret_' + Math.random().toString(36).substring(7),
  };
}

// Format amount for display
export function formatAmount(amount: number, currency: string = 'XAF'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Convert amount to smallest currency unit (cents for USD, same for XAF)
export function toSmallestUnit(amount: number): number {
  return Math.round(amount);
}

// Convert from smallest currency unit to regular amount
export function fromSmallestUnit(amount: number): number {
  return amount;
}

// Payment status types
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

// Booking with payment info
export interface BookingWithPayment {
  id: string;
  carId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  createdAt: string;
}
