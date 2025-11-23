import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CancellationPolicyProps {
  compact?: boolean;
}

export default function CancellationPolicy({ compact = false }: CancellationPolicyProps) {
  if (compact) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Cancellation Policy
            </h4>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>48+ hours before: <strong>100% refund</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>24-48 hours: <strong>50% refund</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Less than 24 hours: <strong>No refund</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Cancellation & Refund Policy
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We understand plans change. Here's our flexible policy.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* 48+ hours */}
        <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Cancel 48+ Hours Before Pickup
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong className="text-green-600 dark:text-green-400">100% Full Refund</strong>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Cancel anytime up to 48 hours before your scheduled pickup time and receive a complete refund.
              Refunds are processed within 5-7 business days.
            </p>
          </div>
        </div>

        {/* 24-48 hours */}
        <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Cancel 24-48 Hours Before Pickup
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong className="text-orange-600 dark:text-orange-400">50% Partial Refund</strong>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Cancellations made between 24-48 hours before pickup receive a 50% refund.
              A 50% cancellation fee applies to cover preparation costs.
            </p>
          </div>
        </div>

        {/* Less than 24 hours */}
        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Cancel Less Than 24 Hours or No-Show
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong className="text-red-600 dark:text-red-400">No Refund</strong>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Cancellations made less than 24 hours before pickup or no-shows are non-refundable.
              The vehicle has been prepared and reserved exclusively for you.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Important Information
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-ekami-gold-500 mt-1">•</span>
            <span>Refunds are processed within 5-7 business days via the original payment method</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-ekami-gold-500 mt-1">•</span>
            <span>Cancellation time is calculated from your scheduled pickup/delivery time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-ekami-gold-500 mt-1">•</span>
            <span>To cancel, contact us via WhatsApp: +237 6 52 76 52 81 or email: info@ekamiauto.com</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-ekami-gold-500 mt-1">•</span>
            <span>Weather-related or emergency cancellations may be eligible for special consideration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-ekami-gold-500 mt-1">•</span>
            <span>Modifications to booking dates may be available without cancellation fees (subject to availability)</span>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-ekami-charcoal-700 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Need to cancel or modify your booking?</strong><br />
          Contact us immediately: <a href="https://wa.me/237652765281" className="text-ekami-gold-600 hover:text-ekami-gold-700 font-medium">WhatsApp: +237 6 52 76 52 81</a>
        </p>
      </div>
    </div>
  );
}
