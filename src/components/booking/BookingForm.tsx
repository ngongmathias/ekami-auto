import { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Navigation, Baby, Users, CreditCard, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LocationPicker from '../maps/LocationPicker';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isSubmitting?: boolean;
}

export interface BookingFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  whatsapp: string;
  
  // License Information
  licenseNumber: string;
  licenseExpiry: string;
  
  // Pickup/Dropoff
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  dropoffTime: string;
  
  // Extras
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
  additionalDriver: boolean;
  
  // Additional Driver Info (if selected)
  additionalDriverName?: string;
  additionalDriverLicense?: string;
  
  // Special Requests
  specialRequests?: string;
  
  // Terms
  agreeToTerms: boolean;
}

export default function BookingForm({ onSubmit, isSubmitting = false }: BookingFormProps) {
  const [useMapPicker, setUseMapPicker] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    licenseNumber: '',
    licenseExpiry: '',
    pickupLocation: 'Douala Airport',
    dropoffLocation: 'Douala Airport',
    pickupTime: '09:00',
    dropoffTime: '09:00',
    insurance: false,
    gps: false,
    childSeat: false,
    additionalDriver: false,
    specialRequests: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Email is now optional
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // WhatsApp is required
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
    } else if (!/^\+237\s?6\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Invalid format. Use: +237 6 XX XX XX XX';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry is required';
    
    if (formData.additionalDriver) {
      if (!formData.additionalDriverName?.trim()) {
        newErrors.additionalDriverName = 'Additional driver name is required';
      }
      if (!formData.additionalDriverLicense?.trim()) {
        newErrors.additionalDriverLicense = 'Additional driver license is required';
      }
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const handleChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const locations = [
    'Douala Airport',
    'Douala City Center',
    'Yaoundé Airport',
    'Yaoundé City Center',
    'Bafoussam',
    'Garoua',
    'Bamenda',
  ];

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-ekami-gold-500 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={`w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                errors.firstName ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
              } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={`w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                errors.lastName ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
              } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              WhatsApp Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                  errors.whatsapp ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
                } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
                placeholder="+237 6 52 76 52 81"
              />
            </div>
            {errors.whatsapp && (
              <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              We'll send booking confirmations via WhatsApp
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                  errors.phone ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
                } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
                placeholder="+237 6 XX XX XX XX"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                  errors.email ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
                } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
                placeholder="john@example.com (optional)"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* License Information */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-ekami-gold-500 rounded-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Driver's License
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              License Number *
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              className={`w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                errors.licenseNumber ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
              } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
              placeholder="ABC123456"
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              License Expiry Date *
            </label>
            <input
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => handleChange('licenseExpiry', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                errors.licenseExpiry ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
              } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
            />
            {errors.licenseExpiry && (
              <p className="mt-1 text-sm text-red-600">{errors.licenseExpiry}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pickup & Dropoff */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-ekami-gold-500 rounded-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Pickup & Drop-off Details
          </h3>
        </div>

        <div className="space-y-4">
          {/* Pickup Location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                Pickup Location
              </label>
              <button
                type="button"
                onClick={() => setUseMapPicker(!useMapPicker)}
                className="text-sm text-ekami-gold-600 hover:text-ekami-gold-700 font-medium"
              >
                {useMapPicker ? '📍 Use Dropdown' : '🗺️ Use Map'}
              </button>
            </div>

            {useMapPicker ? (
              <LocationPicker
                onLocationSelect={(location) => handleChange('pickupLocation', location.address)}
                height="350px"
              />
            ) : (
              <select
                value={formData.pickupLocation}
                onChange={(e) => handleChange('pickupLocation', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            )}
          </div>

          {/* Time and Dropoff in grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              Pickup Time
            </label>
            <select
              value={formData.pickupTime}
              onChange={(e) => handleChange('pickupTime', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              Drop-off Location
            </label>
            <select
              value={formData.dropoffLocation}
              onChange={(e) => handleChange('dropoffLocation', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
              Drop-off Time
            </label>
            <select
              value={formData.dropoffTime}
              onChange={(e) => handleChange('dropoffTime', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          </div>
        </div>
      </div>

      {/* Extras */}
      <div className="card">
        <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
          Additional Services
        </h3>

        <div className="space-y-3">
          <label className="flex items-start space-x-3 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl cursor-pointer hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.insurance}
              onChange={(e) => handleChange('insurance', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-ekami-gold-600" />
                <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  Full Insurance Coverage
                </span>
              </div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
                Complete protection with zero deductible. 5,000 XAF/day
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl cursor-pointer hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.gps}
              onChange={(e) => handleChange('gps', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-ekami-gold-600" />
                <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  GPS Navigation System
                </span>
              </div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
                Never get lost with our premium GPS. 2,000 XAF/day
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl cursor-pointer hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.childSeat}
              onChange={(e) => handleChange('childSeat', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Baby className="w-5 h-5 text-ekami-gold-600" />
                <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  Child Safety Seat
                </span>
              </div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
                Keep your little ones safe. 1,500 XAF/day
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 rounded-xl cursor-pointer hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.additionalDriver}
              onChange={(e) => handleChange('additionalDriver', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-ekami-gold-600" />
                <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                  Additional Driver
                </span>
              </div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
                Add another authorized driver. 3,000 XAF/day
              </p>
            </div>
          </label>
        </div>

        {/* Additional Driver Details */}
        {formData.additionalDriver && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <h4 className="font-semibold text-ekami-charcoal-900 dark:text-white mb-3">
              Additional Driver Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.additionalDriverName || ''}
                  onChange={(e) => handleChange('additionalDriverName', e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                    errors.additionalDriverName ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
                  } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
                  placeholder="Jane Doe"
                />
                {errors.additionalDriverName && (
                  <p className="mt-1 text-sm text-red-600">{errors.additionalDriverName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  value={formData.additionalDriverLicense || ''}
                  onChange={(e) => handleChange('additionalDriverLicense', e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 ${
                    errors.additionalDriverLicense ? 'border-red-500' : 'border-ekami-silver-200 dark:border-ekami-charcoal-700'
                  } rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white`}
                  placeholder="XYZ789012"
                />
                {errors.additionalDriverLicense && (
                  <p className="mt-1 text-sm text-red-600">{errors.additionalDriverLicense}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Special Requests */}
      <div className="card">
        <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
          Special Requests (Optional)
        </h3>
        <textarea
          value={formData.specialRequests}
          onChange={(e) => handleChange('specialRequests', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white resize-none"
          placeholder="Any special requests or requirements?"
        />
      </div>

      {/* Terms & Conditions */}
      <div className="card">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
          />
          <div className="flex-1">
            <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
              I agree to the{' '}
              <a href="/terms" className="text-ekami-gold-600 hover:text-ekami-gold-700 font-semibold">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-ekami-gold-600 hover:text-ekami-gold-700 font-semibold">
                Privacy Policy
              </a>
            </p>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 text-white rounded-2xl font-bold text-lg hover:from-ekami-gold-600 hover:to-ekami-gold-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Check className="w-6 h-6" />
            <span>Proceed to Payment</span>
          </>
        )}
      </button>
    </form>
  );
}
