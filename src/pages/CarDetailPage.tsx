import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChevronRight, 
  Home, 
  Share2, 
  Heart,
  Facebook,
  Twitter,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCarBySlug, getCarById, searchCars, type Car } from '../lib/supabase';
import ImageGallery from '../components/cars/ImageGallery';
import CarSpecs from '../components/cars/CarSpecs';
import PriceCard from '../components/cars/PriceCard';
import ReviewList from '../components/reviews/ReviewList';
import SocialShare from '../components/common/SocialShare';
import MapDisplay from '../components/maps/MapDisplay';
import CarAvailabilityCalendar from '../components/calendar/CarAvailabilityCalendar';
import Car360Viewer from '../components/cars/Car360Viewer';
import '../components/calendar/calendar.css';

export default function CarDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [car, setCar] = useState<Car | null>(null);
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCarData() {
      if (!id) {
        setError('Car ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch by slug first, then by ID
        let carData: Car | null = null;
        try {
          carData = await getCarBySlug(id);
        } catch {
          // If slug fails, try ID
          carData = await getCarById(id);
        }

        if (!carData) {
          setError('Car not found');
          setLoading(false);
          return;
        }

        setCar(carData);

        // Fetch similar cars (same body type)
        if (carData.body_type) {
          const similar = await searchCars({
            bodyType: carData.body_type,
            availableForRent: carData.available_for_rent,
            availableForSale: carData.available_for_sale,
          });
          
          // Filter out current car and limit to 4
          const filtered = similar
            .filter(c => c.id !== carData.id)
            .slice(0, 4);
          setSimilarCars(filtered);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Failed to load car details');
        setLoading(false);
      }
    }

    fetchCarData();
  }, [id]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this ${car?.make} ${car?.model} on Ekami Auto!`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
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
              The car you're looking for doesn't exist or has been removed.
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-ekami-charcoal-400" />
          <Link to="/rent" className="text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600">
            {car.available_for_rent ? 'Rent' : 'Buy'}
          </Link>
          <ChevronRight className="w-4 h-4 text-ekami-charcoal-400" />
          <span className="text-ekami-charcoal-900 dark:text-white font-medium">
            {car.make} {car.model}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-2">
              {car.make} {car.model}
            </h1>
            <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-400">
              {car.year} • {car.transmission} • {car.fuel_type}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-xl transition-all ${
                isFavorite
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                  : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-600 dark:text-ekami-silver-400'
              } hover:scale-110`}
              aria-label="Add to favorites"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <SocialShare
              url={`/car/${car.slug || car.id}`}
              title={`${car.make} ${car.model} (${car.year})`}
              description={`${car.description || ''} - Available for ${car.available_for_rent ? 'rent' : 'sale'} at Ekami Auto`}
              imageUrl={car.images?.[0]}
              hashtags={['EkamiAuto', 'CarRental', 'Cameroon']}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Specs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery 
              images={car.images || []} 
              carName={`${car.make} ${car.model}`} 
            />

            {/* 360° View */}
            {car.images_360 && car.images_360.length > 0 && (
              <div>
                <h2 className="text-2xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
                  🔄 360° View
                </h2>
                <Car360Viewer 
                  images={car.images_360} 
                  carName={`${car.make} ${car.model}`}
                />
              </div>
            )}

            {/* Specifications */}
            <CarSpecs car={car} />
          </div>

          {/* Right Column - Price Card */}
          <div>
            <PriceCard car={car} />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-ekami-charcoal-900 dark:text-white">
              Customer Reviews
            </h2>
          </div>
          <ReviewList carId={car.id} />
        </div>

        {/* Availability Calendar */}
        <div className="mt-16">
          <CarAvailabilityCalendar carId={car.id} />
        </div>

        {/* Car Location */}
        {car.location && (
          <div className="mt-16">
            <h2 className="text-3xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-6">
              Pickup Location
            </h2>
            <div className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-lg p-6">
              <MapDisplay
                lat={4.0511}
                lng={9.7679}
                address={car.location}
                height="400px"
                zoom={14}
              />
              <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  📍 <strong>Pickup Location:</strong> This is where you'll collect the vehicle.
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(car.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg font-medium transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-8">
              Similar Cars You Might Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarCars.map((similarCar) => (
                <Link
                  key={similarCar.id}
                  to={`/cars/${similarCar.slug || similarCar.id}`}
                  className="card group hover:shadow-2xl transition-all"
                >
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <img
                      src={similarCar.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
                      alt={`${similarCar.make} ${similarCar.model}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-ekami-charcoal-900 dark:text-white mb-1">
                    {similarCar.make} {similarCar.model}
                  </h3>
                  <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-2">
                    {similarCar.year} • {similarCar.transmission}
                  </p>
                  <p className="text-xl font-bold text-ekami-gold-600">
                    {similarCar.price_rent_daily?.toLocaleString()} XAF
                    <span className="text-sm font-normal text-ekami-charcoal-500 dark:text-ekami-silver-500">/day</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
