import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft, CheckCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { getCarBySlug, getCarById, type Car } from '../lib/supabase';
import DateRangePicker from '../components/booking/DateRangePicker';
import PriceCalculator from '../components/booking/PriceCalculator';
import BookingForm, { type BookingFormData } from '../components/booking/BookingForm';
import CancellationPolicy from '../components/common/CancellationPolicy';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date selection
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Extras for price calculation
  const [extras, setExtras] = useState({
    insurance: false,
    gps: false,
    childSeat: false,
    additionalDriver: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch car data
  useEffect(() => {
    async function fetchCar() {
      if (!id) {
        setError('Car ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let carData: Car | null = null;
        
        try {
          carData = await getCarBySlug(id);
        } catch {
          carData = await getCarById(id);
        }

        if (!carData) {
          setError('Car not found');
          setLoading(false);
          return;
        }

        if (!carData.available_for_rent) {
          setError('This car is not available for rent');
          setLoading(false);
          return;
        }

        setCar(carData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Failed to load car details');
        setLoading(false);
      }
    }

    fetchCar();
  }, [id]);

  const rentalDays = startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!car || !startDate || !endDate) {
      toast.error('Please select rental dates');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate saving booking data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate total amount (this should match PriceCalculator logic)
      let dailyRate = car.price_rent_daily || 0;
      
      // Apply discounts
      if (rentalDays >= 30 && car.price_rent_monthly) {
        dailyRate = car.price_rent_monthly / 30;
      } else if (rentalDays >= 7 && car.price_rent_weekly) {
        dailyRate = car.price_rent_weekly / 7;
      }

      const basePrice = dailyRate * rentalDays;
      const extrasTotal = (
        (extras.insurance ? 5000 * rentalDays : 0) +
        (extras.gps ? 2000 * rentalDays : 0) +
        (extras.childSeat ? 1500 * rentalDays : 0) +
        (extras.additionalDriver ? 3000 * rentalDays : 0)
      );
      const subtotal = basePrice + extrasTotal;
      const tax = subtotal * 0.0775;
      const totalAmount = Math.round(subtotal + tax);

      // Prepare payment page params
      const paymentParams = new URLSearchParams({
        amount: totalAmount.toString(),
        currency: 'XAF',
        car_id: car.id,
        car_name: `${car.make} ${car.model} ${car.year}`,
        email: formData.email,
        rental_days: rentalDays.toString(),
        start_date: startDate.toLocaleDateString(),
        end_date: endDate.toLocaleDateString(),
        pickup_location: formData.pickupLocation,
      });

      // Redirect to payment page
      navigate(`/payment?${paymentParams.toString()}`);
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to process booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
              </div>
              <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Car not found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Unable to load booking information.
            </p>
            <Link to="/rent" className="btn-primary">
              Browse Available Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to={`/cars/${car.slug || car.id}`}
          className="inline-flex items-center space-x-2 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to car details</span>
        </Link>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-ekami-charcoal-400" />
          <Link to="/rent" className="text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600">
            Rent
          </Link>
          <ChevronRight className="w-4 h-4 text-ekami-charcoal-400" />
          <Link
            to={`/cars/${car.slug || car.id}`}
            className="text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600"
          >
            {car.make} {car.model}
          </Link>
          <ChevronRight className="w-4 h-4 text-ekami-charcoal-400" />
          <span className="text-ekami-charcoal-900 dark:text-white font-medium">
            Book Now
          </span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Complete Your Booking
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            {car.make} {car.model} {car.year}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-ekami-gold-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-ekami-gold-600">Select Dates</p>
            </div>
            <div className="flex-1 h-1 bg-ekami-gold-500 -mx-4"></div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 ${
                rentalDays > 0
                  ? 'bg-ekami-gold-500 text-white'
                  : 'bg-ekami-silver-200 dark:bg-ekami-charcoal-700 text-ekami-charcoal-500 dark:text-ekami-silver-500'
              }`}>
                2
              </div>
              <p className={`text-sm font-semibold ${
                rentalDays > 0
                  ? 'text-ekami-gold-600'
                  : 'text-ekami-charcoal-500 dark:text-ekami-silver-500'
              }`}>
                Fill Details
              </p>
            </div>
            <div className={`flex-1 h-1 -mx-4 ${
              rentalDays > 0
                ? 'bg-ekami-gold-500'
                : 'bg-ekami-silver-200 dark:bg-ekami-charcoal-700'
            }`}></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 text-ekami-charcoal-500 dark:text-ekami-silver-500 rounded-full flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="text-sm font-semibold text-ekami-charcoal-500 dark:text-ekami-silver-500">
                Payment
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Car Summary Card */}
            <div className="card flex items-center space-x-4">
              <img
                src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                alt={`${car.make} ${car.model}`}
                className="w-32 h-24 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
                  {car.make} {car.model}
                </h3>
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  {car.year} • {car.transmission} • {car.fuel_type}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  From
                </p>
                <p className="text-2xl font-bold text-ekami-gold-600">
                  {car.price_rent_daily?.toLocaleString()}
                </p>
                <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  XAF/day
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div className="card">
              <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                Select Rental Period
              </h2>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>

            {/* Booking Form - Only show if dates are selected */}
            {rentalDays > 0 && (
              <>
                <BookingForm
                  onSubmit={(data) => {
                    setExtras({
                      insurance: data.insurance,
                      gps: data.gps,
                      childSeat: data.childSeat,
                      additionalDriver: data.additionalDriver,
                    });
                    handleBookingSubmit(data);
                  }}
                  isSubmitting={isSubmitting}
                />
                
                {/* Cancellation Policy */}
                <div className="mt-8">
                  <CancellationPolicy compact />
                </div>
              </>
            )}
          </div>

          {/* Right Column - Price Calculator (Sticky) */}
          <div>
            <div className="sticky top-24">
              <PriceCalculator
                car={car}
                rentalDays={rentalDays}
                extras={extras}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
