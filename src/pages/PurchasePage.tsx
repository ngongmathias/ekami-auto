import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, CreditCard, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getCarById, getCarBySlug, type Car } from '../lib/supabase';
import FinancingCalculator from '../components/buy/FinancingCalculator';

export default function PurchasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form data
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'financing'>('full');
  const [financingDetails, setFinancingDetails] = useState({
    monthlyPayment: 0,
    downPayment: 0,
    term: 60,
  });
  const [tradeInVehicle, setTradeInVehicle] = useState('');
  const [tradeInValue, setTradeInValue] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isSignedIn) {
      toast.error('Please sign in to purchase a vehicle');
      navigate('/sign-in');
      return;
    }

    if (user) {
      setBuyerName(user.fullName || '');
      setBuyerEmail(user.emailAddresses?.[0]?.emailAddress || '');
    }
  }, [isSignedIn, user, navigate]);

  useEffect(() => {
    async function fetchCar() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Try to fetch by slug first, then by ID
        let carData: Car | null = null;
        try {
          carData = await getCarBySlug(id);
        } catch (slugError) {
          // If slug fails, try by ID
          try {
            carData = await getCarById(id);
          } catch (idError) {
            console.error('Error fetching car:', idError);
          }
        }
        
        if (!carData) {
          toast.error('Vehicle not found');
          navigate('/buy');
          return;
        }
        
        // Log for debugging
        console.log('Car data:', carData);
        console.log('Available for sale:', carData.available_for_sale);
        
        if (!carData.available_for_sale) {
          toast.error('This vehicle is not available for purchase. Please contact us for more information.');
          // Don't navigate away - let them see the car details
        }
        
        setCar(carData);
      } catch (error) {
        console.error('Error fetching car:', error);
        toast.error('Failed to load vehicle details');
        navigate('/buy');
      } finally {
        setLoading(false);
      }
    }

    fetchCar();
  }, [id, navigate]);

  const handleFinanceSelect = (monthlyPayment: number, downPayment: number, term: number) => {
    setFinancingDetails({ monthlyPayment, downPayment, term });
    setPaymentMethod('financing');
  };

  const calculateTotalAmount = () => {
    if (!car) return 0;
    const basePrice = car.price_sale || 0;
    const tradeInDeduction = tradeInValue || 0;
    
    if (paymentMethod === 'financing') {
      return financingDetails.downPayment - tradeInDeduction;
    }
    
    return basePrice - tradeInDeduction;
  };

  const handlePurchase = async () => {
    if (!car || !user) return;

    if (!buyerName || !buyerEmail || !buyerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);

      const purchaseData = {
        car_id: car.id,
        buyer_id: user.id,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        purchase_price: car.price_sale,
        total_amount: calculateTotalAmount(),
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending_payment',
        notes: `Email: ${buyerEmail}\n${paymentMethod === 'financing' ? `Financing: ${financingDetails.term} months, Monthly: ${financingDetails.monthlyPayment.toLocaleString()} XAF, Down: ${financingDetails.downPayment.toLocaleString()} XAF\n` : ''}${tradeInVehicle ? `Trade-in: ${tradeInVehicle} (${tradeInValue.toLocaleString()} XAF)\n` : ''}${notes || ''}`,
      };

      const { data, error } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();

      if (error) throw error;

      // Send notification email to admin
      try {
        const managerEmail = 'kerryngong@ekamiauto.com';
        const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
        
        if (resendApiKey) {
          const emailBody = `
            <h2>New Vehicle Purchase Request</h2>
            <p><strong>Vehicle:</strong> ${car.make} ${car.model} ${car.year}</p>
            <p><strong>Price:</strong> ${car.price_sale?.toLocaleString()} XAF</p>
            <hr />
            <p><strong>Customer:</strong> ${buyerName}</p>
            <p><strong>Email:</strong> ${buyerEmail}</p>
            <p><strong>Phone:</strong> ${buyerPhone}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod === 'financing' ? 'Financing' : 'Full Payment'}</p>
            ${paymentMethod === 'financing' ? `
              <p><strong>Down Payment:</strong> ${financingDetails.downPayment.toLocaleString()} XAF</p>
              <p><strong>Monthly Payment:</strong> ${financingDetails.monthlyPayment.toLocaleString()} XAF</p>
              <p><strong>Term:</strong> ${financingDetails.term} months</p>
            ` : ''}
            ${tradeInVehicle ? `
              <p><strong>Trade-In:</strong> ${tradeInVehicle}</p>
              <p><strong>Trade-In Value:</strong> ${tradeInValue.toLocaleString()} XAF</p>
            ` : ''}
            <p><strong>Total Amount Due:</strong> ${calculateTotalAmount().toLocaleString()} XAF</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          `;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Ekami Auto <onboarding@resend.dev>',
              to: managerEmail,
              subject: `New Purchase Request - ${car.make} ${car.model}`,
              html: emailBody,
            }),
          });
        } else {
          console.log('Email not sent - VITE_RESEND_API_KEY not configured');
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the purchase if email fails
      }

      toast.success('Purchase request submitted successfully! We\'ll contact you within 24 hours.');
      navigate('/account');
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to submit purchase request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-ekami-gold-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-ekami-gold-600 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-ekami-charcoal-900 dark:text-white">
                Purchase Vehicle
              </h1>
              <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300 mt-1">
                {car.make} {car.model} {car.year}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="card">
              <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                Your Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    placeholder="+237 6 XX XX XX XX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('full')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'full'
                      ? 'border-ekami-gold-600 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                      : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-ekami-gold-600" />
                  <p className="font-semibold text-ekami-charcoal-900 dark:text-white">Full Payment</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('financing')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'financing'
                      ? 'border-ekami-gold-600 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                      : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
                  }`}
                >
                  <Check className="w-6 h-6 mx-auto mb-2 text-ekami-gold-600" />
                  <p className="font-semibold text-ekami-charcoal-900 dark:text-white">Financing</p>
                </button>
              </div>

              {paymentMethod === 'financing' && car.price_sale && (
                <FinancingCalculator
                  carPrice={car.price_sale}
                  onFinanceSelect={handleFinanceSelect}
                />
              )}
            </div>

            {/* Trade-In (Optional) */}
            <div className="card">
              <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                Trade-In Vehicle (Optional)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Vehicle Details
                  </label>
                  <input
                    type="text"
                    value={tradeInVehicle}
                    onChange={(e) => setTradeInVehicle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    placeholder="e.g., 2018 Toyota Camry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Estimated Value (XAF)
                  </label>
                  <input
                    type="number"
                    value={tradeInValue || ''}
                    onChange={(e) => setTradeInValue(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="card">
              <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                Additional Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                placeholder="Any special requests or questions..."
              />
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                Purchase Summary
              </h2>

              {/* Vehicle Info */}
              <div className="mb-6 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl">
                {car.images && car.images[0] && (
                  <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-ekami-charcoal-900 dark:text-white">
                  {car.make} {car.model}
                </h3>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  {car.year} • {car.body_type}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Vehicle Price</span>
                  <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                    {car.price_sale?.toLocaleString()} XAF
                  </span>
                </div>

                {paymentMethod === 'financing' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Down Payment</span>
                      <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                        {financingDetails.downPayment.toLocaleString()} XAF
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">Monthly Payment</span>
                      <span className="font-semibold text-ekami-gold-600">
                        {financingDetails.monthlyPayment.toLocaleString()} XAF × {financingDetails.term}mo
                      </span>
                    </div>
                  </>
                )}

                {tradeInValue > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Trade-In Credit</span>
                    <span className="font-semibold">-{tradeInValue.toLocaleString()} XAF</span>
                  </div>
                )}

                <div className="h-px bg-ekami-silver-200 dark:bg-ekami-charcoal-700"></div>

                <div className="flex justify-between text-lg">
                  <span className="font-bold text-ekami-charcoal-900 dark:text-white">
                    {paymentMethod === 'financing' ? 'Due Today' : 'Total Amount'}
                  </span>
                  <span className="font-bold text-ekami-gold-600">
                    {calculateTotalAmount().toLocaleString()} XAF
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePurchase}
                disabled={processing}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Submit Purchase Request
                  </>
                )}
              </button>

              {/* Info */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Your purchase request will be reviewed by our team. We'll contact you within 24 hours to finalize the details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
