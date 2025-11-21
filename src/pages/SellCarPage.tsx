import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Car, Upload, DollarSign, CheckCircle, ChevronRight, ChevronLeft, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface VehicleData {
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin: string;
  body_type: string;
  transmission: string;
  fuel_type: string;
  color: string;
  seats: number;
  doors: number;
  condition: string;
  service_history: string;
  accidents: string;
  modifications: string;
  asking_price: number;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  location: string;
  images: string[];
  description: string;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function SellCarPage() {
  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<VehicleData>({
    make: '',
    model: '',
    year: CURRENT_YEAR,
    mileage: 0,
    vin: '',
    body_type: 'sedan',
    transmission: 'automatic',
    fuel_type: 'gasoline',
    color: '',
    seats: 5,
    doors: 4,
    condition: 'good',
    service_history: 'regular',
    accidents: 'none',
    modifications: 'none',
    asking_price: 0,
    seller_name: user?.fullName || '',
    seller_email: user?.emailAddresses?.[0]?.emailAddress || '',
    seller_phone: '',
    location: '',
    images: [],
    description: '',
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: Car },
    { number: 2, title: 'Details', icon: Car },
    { number: 3, title: 'Condition', icon: CheckCircle },
    { number: 4, title: 'Photos', icon: Upload },
    { number: 5, title: 'Pricing', icon: DollarSign },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.make || !formData.model || !formData.year) {
          toast.error('Please fill in all basic information');
          return false;
        }
        break;
      case 2:
        if (!formData.color) {
          toast.error('Please fill in vehicle color');
          return false;
        }
        break;
      case 4:
        if (formData.images.length === 0) {
          toast.error('Please upload at least one photo');
          return false;
        }
        break;
      case 5:
        if (!formData.asking_price || !formData.seller_phone || !formData.location) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-ekami-gold-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Sell Your Car
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            Get the best price for your vehicle in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-ekami-gold-600 text-white'
                        : 'bg-ekami-silver-200 dark:bg-ekami-charcoal-700 text-ekami-charcoal-400'
                    }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs mt-2 text-center text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step.number
                        ? 'bg-ekami-gold-600'
                        : 'bg-ekami-silver-200 dark:bg-ekami-charcoal-700'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Make *
                    </label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Toyota"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Camry"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min={1990}
                      max={CURRENT_YEAR}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Mileage (km) *
                    </label>
                    <input
                      type="number"
                      value={formData.mileage || ''}
                      onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      VIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Vehicle Identification Number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Vehicle Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Body Type
                    </label>
                    <select
                      value={formData.body_type}
                      onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="coupe">Coupe</option>
                      <option value="convertible">Convertible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Transmission
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Fuel Type
                    </label>
                    <select
                      value={formData.fuel_type}
                      onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="gasoline">Gasoline</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Color *
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Seats
                    </label>
                    <input
                      type="number"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                      min={2}
                      max={9}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Doors
                    </label>
                    <input
                      type="number"
                      value={formData.doors}
                      onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                      min={2}
                      max={5}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Condition */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Vehicle Condition
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
                      Overall Condition
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['excellent', 'good', 'fair', 'poor'].map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setFormData({ ...formData, condition: cond })}
                          className={`p-4 rounded-xl border-2 transition-all capitalize ${
                            formData.condition === cond
                              ? 'border-ekami-gold-600 bg-ekami-gold-50 dark:bg-ekami-gold-900/20 text-ekami-gold-700 dark:text-ekami-gold-300'
                              : 'border-ekami-silver-200 dark:border-ekami-charcoal-700 text-ekami-charcoal-600 dark:text-ekami-silver-400'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Service History
                    </label>
                    <select
                      value={formData.service_history}
                      onChange={(e) => setFormData({ ...formData, service_history: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="regular">Regular Service Records</option>
                      <option value="partial">Partial Service History</option>
                      <option value="none">No Service History</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Accident History
                    </label>
                    <select
                      value={formData.accidents}
                      onChange={(e) => setFormData({ ...formData, accidents: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="none">No Accidents</option>
                      <option value="minor">Minor Accidents (Repaired)</option>
                      <option value="major">Major Accidents</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Modifications
                    </label>
                    <select
                      value={formData.modifications}
                      onChange={(e) => setFormData({ ...formData, modifications: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    >
                      <option value="none">No Modifications</option>
                      <option value="cosmetic">Cosmetic Only</option>
                      <option value="performance">Performance Modifications</option>
                      <option value="both">Both Cosmetic & Performance</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Upload Photos
                </h2>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-4">
                  Upload clear photos of your vehicle (up to 10 images). Include exterior, interior, and any damage.
                </p>
                
                {/* Upload Area */}
                <div>
                  <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-ekami-silver-300 dark:border-ekami-charcoal-600 rounded-xl cursor-pointer hover:border-ekami-gold-500 transition-colors bg-ekami-silver-50 dark:bg-ekami-charcoal-800">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-ekami-charcoal-400" />
                      <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">
                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
                        PNG, JPG, WEBP up to 10MB each (max 10 images)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const handleImageUpload = async (files: FileList) => {
                            try {
                              setUploading(true);
                              const uploadedUrls: string[] = [];

                              for (let i = 0; i < Math.min(files.length, 10 - formData.images.length); i++) {
                                const file = files[i];
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                                const filePath = `sell-requests/${fileName}`;

                                const { error: uploadError } = await supabase.storage
                                  .from('cars')
                                  .upload(filePath, file);

                                if (uploadError) {
                                  console.error('Upload error:', uploadError);
                                  toast.error(`Failed to upload ${file.name}`);
                                  continue;
                                }

                                const { data: { publicUrl } } = supabase.storage
                                  .from('cars')
                                  .getPublicUrl(filePath);

                                uploadedUrls.push(publicUrl);
                              }

                              setFormData({
                                ...formData,
                                images: [...formData.images, ...uploadedUrls]
                              });

                              toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
                            } catch (error) {
                              console.error('Error uploading images:', error);
                              toast.error('Failed to upload images');
                            } finally {
                              setUploading(false);
                            }
                          };
                          handleImageUpload(e.target.files);
                        }
                      }}
                      disabled={uploading || formData.images.length >= 10}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-3">
                      Uploaded Images ({formData.images.length}/10)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Vehicle ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                images: formData.images.filter((_, i) => i !== index)
                              });
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Pricing & Contact */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
                  Pricing & Contact Information
                </h2>
                
                {/* Price Estimator */}
                <div className="p-6 bg-gradient-to-br from-ekami-gold-50 to-ekami-gold-100 dark:from-ekami-gold-900/10 dark:to-ekami-charcoal-800 rounded-2xl border-2 border-ekami-gold-200 dark:border-ekami-gold-800">
                  <h3 className="text-lg font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                    Estimated Market Value
                  </h3>
                  <p className="text-3xl font-bold text-ekami-gold-600 mb-2">
                    {(() => {
                      const basePrice = 5000000;
                      const yearFactor = (CURRENT_YEAR - formData.year) * 200000;
                      const mileageFactor = (formData.mileage / 10000) * 100000;
                      let conditionMultiplier = 1;
                      if (formData.condition === 'excellent') conditionMultiplier = 1.2;
                      else if (formData.condition === 'good') conditionMultiplier = 1;
                      else if (formData.condition === 'fair') conditionMultiplier = 0.8;
                      else conditionMultiplier = 0.6;
                      const estimated = Math.max((basePrice - yearFactor - mileageFactor) * conditionMultiplier, 500000);
                      return Math.round(estimated / 100000) * 100000;
                    })().toLocaleString()} XAF
                  </p>
                  <p className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    Based on year, mileage, and condition. Final price determined after inspection.
                  </p>
                </div>

                {/* Asking Price */}
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Your Asking Price (XAF) *
                  </label>
                  <input
                    type="number"
                    value={formData.asking_price || ''}
                    onChange={(e) => setFormData({ ...formData, asking_price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white text-lg font-semibold"
                    placeholder="5000000"
                    required
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.seller_name}
                      onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
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
                      value={formData.seller_phone}
                      onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="+237 6 XX XX XX XX"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Douala, Akwa"
                      required
                    />
                  </div>
                </div>

                {/* Additional Description */}
                <div>
                  <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 dark:bg-ekami-charcoal-900 dark:text-white"
                    placeholder="Any additional details about your vehicle..."
                  />
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border-2 border-ekami-silver-300 dark:border-ekami-charcoal-600 text-ekami-charcoal-700 dark:text-ekami-silver-300 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl font-semibold transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (!isSignedIn) {
                    toast.error('Please sign in to sell your car');
                    navigate('/sign-in');
                    return;
                  }

                  if (!validateStep(5)) return;

                  try {
                    setSubmitting(true);

                    const sellRequestData = {
                      user_id: user?.id,
                      make: formData.make,
                      model: formData.model,
                      year: formData.year,
                      mileage: formData.mileage,
                      vin: formData.vin || null,
                      body_type: formData.body_type,
                      transmission: formData.transmission,
                      fuel_type: formData.fuel_type,
                      color: formData.color,
                      seats: formData.seats,
                      doors: formData.doors,
                      condition: formData.condition,
                      asking_price: formData.asking_price,
                      seller_name: formData.seller_name,
                      seller_phone: formData.seller_phone,
                      location: formData.location,
                      images: formData.images,
                      description: formData.description || null,
                      status: 'pending',
                      notes: `Service History: ${formData.service_history}\nAccidents: ${formData.accidents}\nModifications: ${formData.modifications}`,
                    };

                    const { error } = await supabase
                      .from('sell_requests')
                      .insert(sellRequestData);

                    if (error) throw error;

                    // Send email notification
                    try {
                      const managerEmail = 'kerryngong@ekamiauto.com';
                      const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
                      
                      if (resendApiKey) {
                        await fetch('https://api.resend.com/emails', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${resendApiKey}`,
                          },
                          body: JSON.stringify({
                            from: 'Ekami Auto <onboarding@resend.dev>',
                            to: managerEmail,
                            subject: `New Sell Request - ${formData.make} ${formData.model}`,
                            html: `
                              <h2>New Vehicle Sell Request</h2>
                              <p><strong>Vehicle:</strong> ${formData.make} ${formData.model} ${formData.year}</p>
                              <p><strong>Asking Price:</strong> ${formData.asking_price.toLocaleString()} XAF</p>
                              <hr />
                              <p><strong>Seller:</strong> ${formData.seller_name}</p>
                              <p><strong>Email:</strong> ${formData.seller_email}</p>
                              <p><strong>Phone:</strong> ${formData.seller_phone}</p>
                              <p><strong>Location:</strong> ${formData.location}</p>
                              <p><strong>Condition:</strong> ${formData.condition}</p>
                              <p><strong>Mileage:</strong> ${formData.mileage.toLocaleString()} km</p>
                              <p><strong>Images:</strong> ${formData.images.length} photos uploaded</p>
                            `,
                          }),
                        });
                      }
                    } catch (emailError) {
                      console.error('Email error:', emailError);
                    }

                    toast.success('Your sell request has been submitted! We\'ll contact you within 24 hours.');
                    navigate('/account');
                  } catch (error: any) {
                    console.error('Submit error:', error);
                    toast.error(error.message || 'Failed to submit sell request');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
