import { useMemo } from 'react';
import { DollarSign, Calendar, TrendingDown, Info } from 'lucide-react';
import type { Car } from '../../lib/supabase';

interface PriceCalculatorProps {
  car: Car;
  rentalDays: number;
  extras?: {
    insurance?: boolean;
    gps?: boolean;
    childSeat?: boolean;
    additionalDriver?: boolean;
  };
}

export default function PriceCalculator({ car, rentalDays, extras = {} }: PriceCalculatorProps) {
  const pricing = useMemo(() => {
    if (rentalDays === 0) {
      return {
        basePrice: 0,
        discount: 0,
        extrasTotal: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        dailyRate: car.price_rent_daily || 0,
      };
    }

    let dailyRate = car.price_rent_daily || 0;
    let discount = 0;

    // Apply weekly discount (7+ days)
    if (rentalDays >= 7 && car.price_rent_weekly) {
      const weeklyRate = car.price_rent_weekly / 7;
      if (weeklyRate < dailyRate) {
        discount = (dailyRate - weeklyRate) * rentalDays;
        dailyRate = weeklyRate;
      }
    }

    // Apply monthly discount (30+ days)
    if (rentalDays >= 30 && car.price_rent_monthly) {
      const monthlyRate = car.price_rent_monthly / 30;
      if (monthlyRate < dailyRate) {
        discount = (car.price_rent_daily! - monthlyRate) * rentalDays;
        dailyRate = monthlyRate;
      }
    }

    const basePrice = dailyRate * rentalDays;

    // Calculate extras
    const extrasCost = {
      insurance: extras.insurance ? 5000 * rentalDays : 0,
      gps: extras.gps ? 2000 * rentalDays : 0,
      childSeat: extras.childSeat ? 1500 * rentalDays : 0,
      additionalDriver: extras.additionalDriver ? 3000 * rentalDays : 0,
    };

    const extrasTotal = Object.values(extrasCost).reduce((sum, cost) => sum + cost, 0);
    const subtotal = basePrice + extrasTotal;
    const tax = subtotal * 0.0775; // 7.75% tax
    const total = subtotal + tax;

    return {
      basePrice,
      discount,
      extrasTotal,
      extrasCost,
      subtotal,
      tax,
      total,
      dailyRate,
    };
  }, [car, rentalDays, extras]);

  if (rentalDays === 0) {
    return (
      <div className="card bg-gradient-to-br from-ekami-silver-50 to-white dark:from-ekami-charcoal-800 dark:to-ekami-charcoal-900">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-3" />
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Select dates to see pricing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-white to-ekami-silver-50 dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800 border-2 border-ekami-gold-400/20">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-ekami-silver-200 dark:border-ekami-charcoal-700">
        <div className="p-2 bg-ekami-gold-500 rounded-lg">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
            Price Breakdown
          </h3>
          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            {rentalDays} {rentalDays === 1 ? 'day' : 'days'} rental
          </p>
        </div>
      </div>

      {/* Price Details */}
      <div className="space-y-3 mb-6">
        {/* Base Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
              Base rental
            </span>
            <span className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
              ({pricing.dailyRate.toLocaleString()} XAF/day)
            </span>
          </div>
          <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
            {pricing.basePrice.toLocaleString()} XAF
          </span>
        </div>

        {/* Discount */}
        {pricing.discount > 0 && (
          <div className="flex items-center justify-between text-green-600 dark:text-green-400">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4" />
              <span>
                {rentalDays >= 30 ? 'Monthly' : 'Weekly'} discount
              </span>
            </div>
            <span className="font-semibold">
              -{pricing.discount.toLocaleString()} XAF
            </span>
          </div>
        )}

        {/* Extras */}
        {pricing.extrasTotal > 0 && (
          <>
            <div className="pt-3 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
              <p className="text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                Additional Services
              </p>
            </div>
            {extras.insurance && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Full insurance
                </span>
                <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                  {pricing.extrasCost.insurance.toLocaleString()} XAF
                </span>
              </div>
            )}
            {extras.gps && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  GPS Navigation
                </span>
                <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                  {pricing.extrasCost.gps.toLocaleString()} XAF
                </span>
              </div>
            )}
            {extras.childSeat && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Child seat
                </span>
                <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                  {pricing.extrasCost.childSeat.toLocaleString()} XAF
                </span>
              </div>
            )}
            {extras.additionalDriver && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Additional driver
                </span>
                <span className="font-medium text-ekami-charcoal-900 dark:text-white">
                  {pricing.extrasCost.additionalDriver.toLocaleString()} XAF
                </span>
              </div>
            )}
          </>
        )}

        {/* Tax */}
        <div className="flex items-center justify-between text-sm pt-3 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
          <div className="flex items-center space-x-1">
            <span className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Tax (7.75%)
            </span>
            <Info className="w-3 h-3 text-ekami-charcoal-400" />
          </div>
          <span className="font-medium text-ekami-charcoal-900 dark:text-white">
            {pricing.tax.toLocaleString()} XAF
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t-2 border-ekami-gold-400">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-ekami-charcoal-900 dark:text-white">
            Total Amount
          </span>
          <div className="text-right">
            <div className="text-3xl font-bold text-ekami-gold-600">
              {pricing.total.toLocaleString()}
            </div>
            <div className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              XAF
            </div>
          </div>
        </div>
        <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 text-right">
          ≈ {(pricing.total / rentalDays).toLocaleString()} XAF per day
        </p>
      </div>

      {/* Savings Badge */}
      {pricing.discount > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                You're saving {pricing.discount.toLocaleString()} XAF!
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                {rentalDays >= 30 ? 'Monthly' : 'Weekly'} rate applied
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Final price includes all fees. Free cancellation up to 24 hours before pick-up.
          </p>
        </div>
      </div>
    </div>
  );
}
