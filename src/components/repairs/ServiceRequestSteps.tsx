import { Check, MapPin, Home } from 'lucide-react';
import type { ServicePackage } from '../../types/repairs';
import PhotoUpload from './PhotoUpload';

interface StepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

// Step 1: Service Selection
export function Step1ServiceSelection({ 
  formData, 
  updateFormData, 
  packages,
  selectedPackage 
}: StepProps & { packages: ServicePackage[], selectedPackage?: ServicePackage }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
          Select Service
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
          Choose a service package or describe your custom needs
        </p>
      </div>

      {/* Service Packages */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
          Service Packages (Select one or more)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {packages.map((pkg) => {
            const selectedIds = formData.servicePackageIds || [];
            const isSelected = selectedIds.includes(pkg.id);
            
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  const currentIds = formData.servicePackageIds || [];
                  const newIds = isSelected
                    ? currentIds.filter((id: string) => id !== pkg.id)
                    : [...currentIds, pkg.id];
                  updateFormData('servicePackageIds', newIds);
                  if (newIds.length > 0) {
                    updateFormData('customService', '');
                  }
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-ekami-gold-600 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                    : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-ekami-gold-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-1">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-2">
                      {pkg.description}
                    </p>
                    <p className="text-lg font-bold text-ekami-gold-600">
                      {pkg.price.toLocaleString()} XAF
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-6 h-6 text-ekami-gold-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {formData.servicePackageIds?.length > 0 && (
          <p className="text-sm text-ekami-gold-600 font-medium">
            {formData.servicePackageIds.length} service{formData.servicePackageIds.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Custom Service */}
      <div>
        <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
          Or describe your custom service needs
        </label>
        <textarea
          value={formData.customService}
          onChange={(e) => {
            updateFormData('customService', e.target.value);
            if (e.target.value) {
              updateFormData('servicePackageId', null);
            }
          }}
          rows={4}
          placeholder="Describe what service you need..."
          className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

// Step 2: Vehicle Information
export function Step2VehicleInfo({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
          Vehicle Information
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
          Tell us about your vehicle
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Make *
          </label>
          <input
            type="text"
            value={formData.vehicleMake}
            onChange={(e) => updateFormData('vehicleMake', e.target.value)}
            placeholder="e.g., Toyota"
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Model *
          </label>
          <input
            type="text"
            value={formData.vehicleModel}
            onChange={(e) => updateFormData('vehicleModel', e.target.value)}
            placeholder="e.g., Camry"
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Year
          </label>
          <input
            type="number"
            value={formData.vehicleYear}
            onChange={(e) => updateFormData('vehicleYear', e.target.value)}
            placeholder="e.g., 2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Mileage (km)
          </label>
          <input
            type="number"
            value={formData.mileage}
            onChange={(e) => updateFormData('mileage', e.target.value)}
            placeholder="e.g., 50000"
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            License Plate
          </label>
          <input
            type="text"
            value={formData.licensePlate}
            onChange={(e) => updateFormData('licensePlate', e.target.value)}
            placeholder="e.g., ABC-1234"
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Problem Description
export function Step3ProblemDescription({ formData, updateFormData }: StepProps) {
  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
          Problem Description
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
          Describe the issue you're experiencing
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
          What's the problem? *
        </label>
        <textarea
          value={formData.problemDescription}
          onChange={(e) => updateFormData('problemDescription', e.target.value)}
          rows={6}
          placeholder="Please describe the problem in detail. Include any symptoms, when it started, and any other relevant information..."
          className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
          Urgency Level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {urgencyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => updateFormData('urgencyLevel', level.value)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                formData.urgencyLevel === level.value
                  ? level.color + ' ring-2 ring-offset-2 ring-ekami-gold-500'
                  : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 4: Photo Upload
export function Step4PhotoUpload({ photos, setPhotos }: { photos: File[], setPhotos: (photos: File[]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
          Upload Photos
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
          Photos help us better understand the issue (optional but recommended)
        </p>
      </div>

      <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
    </div>
  );
}

// Step 5: Appointment
export function Step5Appointment({ formData, updateFormData }: StepProps) {
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
          Schedule Appointment
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
          Choose your preferred date and time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Preferred Date *
          </label>
          <input
            type="date"
            value={formData.appointmentDate}
            onChange={(e) => updateFormData('appointmentDate', e.target.value)}
            min={minDate}
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Preferred Time *
          </label>
          <select
            value={formData.appointmentTime}
            onChange={(e) => updateFormData('appointmentTime', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          >
            <option value="">Select time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
          Service Location
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateFormData('serviceLocation', 'drop-off')}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.serviceLocation === 'drop-off'
                ? 'border-ekami-gold-600 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-ekami-gold-400'
            }`}
          >
            <Home className="w-8 h-8 text-ekami-gold-600 mx-auto mb-2" />
            <h3 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-1">
              Drop-off
            </h3>
            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Bring your vehicle to our service center
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateFormData('serviceLocation', 'mobile')}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.serviceLocation === 'mobile'
                ? 'border-ekami-gold-600 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:border-ekami-gold-400'
            }`}
          >
            <MapPin className="w-8 h-8 text-ekami-gold-600 mx-auto mb-2" />
            <h3 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-1">
              Mobile Service
            </h3>
            <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              We come to your location
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 6: Contact Information
export function Step6Contact({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
          Contact Information
        </h2>
        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
          How can we reach you?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => updateFormData('customerName', e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => updateFormData('customerEmail', e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => updateFormData('customerPhone', e.target.value)}
            placeholder="+237 6 XX XX XX XX"
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            rows={4}
            placeholder="Any additional information we should know..."
            className="w-full px-4 py-3 rounded-lg border border-ekami-silver-300 dark:border-ekami-charcoal-600 bg-white dark:bg-ekami-charcoal-700 text-ekami-charcoal-900 dark:text-white focus:ring-2 focus:ring-ekami-gold-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-ekami-gold-50 dark:bg-ekami-gold-900/20 rounded-lg p-6 border border-ekami-gold-200 dark:border-ekami-gold-800">
        <h3 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">
          Review Your Request
        </h3>
        <div className="space-y-2 text-sm">
          <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
            <strong>Vehicle:</strong> {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
          </p>
          <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
            <strong>Appointment:</strong> {formData.appointmentDate} at {formData.appointmentTime}
          </p>
          <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
            <strong>Location:</strong> {formData.serviceLocation === 'drop-off' ? 'Drop-off' : 'Mobile Service'}
          </p>
        </div>
      </div>
    </div>
  );
}
