import { useState } from 'react';
import { Calendar, Phone, MessageCircle, ShoppingCart, CheckCircle, TrendingUp, Calculator, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Car } from '../../lib/supabase';
import PurchaseInquiryModal from './PurchaseInquiryModal';
import MakeOfferModal from './MakeOfferModal';
import FinancingCalculator from './FinancingCalculator';

interface PriceCardProps {
  car: Car;
}

export default function PriceCard({ car }: PriceCardProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);
  
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '237652765281';
  const whatsappMessage = encodeURIComponent(
    `Hello! I'm interested in the ${car.make} ${car.model} (${car.year}). Can you provide more information?`
  );

  return (
    <div className="sticky top-24">
      <div className="card bg-gradient-to-br from-white to-ekami-silver-50 dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800 border-2 border-ekami-gold-400/20">
        {/* Pricing */}
        <div className="mb-6">
          <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-2">
            Starting from
          </p>
          
          {car.available_for_rent && car.price_rent_daily && (
            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-ekami-gold-600">
                  {car.price_rent_daily.toLocaleString()}
                </span>
                <span className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  XAF
                </span>
                <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  / day
                </span>
              </div>
              
              {/* Additional Rates */}
              <div className="mt-3 space-y-1">
                {car.price_rent_weekly && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      Weekly rate:
                    </span>
                    <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                      {car.price_rent_weekly.toLocaleString()} XAF
                    </span>
                  </div>
                )}
                {car.price_rent_monthly && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                      Monthly rate:
                    </span>
                    <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                      {car.price_rent_monthly.toLocaleString()} XAF
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {car.available_for_sale && car.price_sale && (
            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-ekami-gold-600">
                  {car.price_sale.toLocaleString()}
                </span>
                <span className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  XAF
                </span>
              </div>
              <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                Purchase price
              </p>
            </div>
          )}
        </div>

        {/* Availability Status */}
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-300">
              {car.status === 'available' ? 'Available Now' : car.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {car.available_for_rent && (
            <Link
              to={`/book/${car.slug || car.id}`}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Now</span>
            </Link>
          )}

          {car.available_for_sale && car.price_sale && (
            <>
              <Link
                to={`/purchase/${car.slug || car.id}`}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Buy This Car</span>
              </Link>
              
              <button
                onClick={() => setShowOfferModal(true)}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Make an Offer</span>
              </button>

              <button
                onClick={() => setShowFinancing(!showFinancing)}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-ekami-gold-400 dark:border-ekami-gold-600 text-ekami-gold-600 dark:text-ekami-gold-400 hover:bg-ekami-gold-50 dark:hover:bg-ekami-gold-900/20 rounded-xl font-semibold transition-all"
              >
                <Calculator className="w-5 h-5" />
                <span>{showFinancing ? 'Hide' : 'Calculate'} Financing</span>
              </button>
            </>
          )}

          {/* Compare Button */}
          <Link
            to={`/compare?cars=${car.id}`}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-ekami-silver-300 dark:border-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-xl font-semibold transition-all"
          >
            <GitCompare className="w-5 h-5" />
            <span>Compare</span>
          </Link>

          {/* WhatsApp Contact */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp Us</span>
          </a>

          {/* Call Button */}
          <a
            href={`tel:+${whatsappNumber}`}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-ekami-charcoal-300 dark:border-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-xl font-semibold transition-all"
          >
            <Phone className="w-5 h-5" />
            <span>Call Us</span>
          </a>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
          <div className="space-y-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Free cancellation up to 24h</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant confirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>

        {/* Location */}
        {(car.city || car.location) && (
          <div className="mt-4 p-3 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 rounded-xl">
            <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mb-1">
              Pickup Location
            </p>
            <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
              {car.city || car.location}
            </p>
          </div>
        )}
      </div>

      {/* Financing Calculator */}
      {showFinancing && car.available_for_sale && car.price_sale && (
        <div className="mt-6">
          <FinancingCalculator 
            carPrice={car.price_sale} 
            carName={`${car.make} ${car.model}`}
          />
        </div>
      )}

      {/* Purchase Inquiry Modal */}
      {car.available_for_sale && car.price_sale && (
        <>
          <PurchaseInquiryModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            carId={car.id}
            carName={`${car.make} ${car.model} (${car.year})`}
            carPrice={car.price_sale}
          />

          <MakeOfferModal
            isOpen={showOfferModal}
            onClose={() => setShowOfferModal(false)}
            carId={car.id}
            carName={`${car.make} ${car.model} (${car.year})`}
            askingPrice={car.price_sale}
          />
        </>
      )}
    </div>
  );
}
