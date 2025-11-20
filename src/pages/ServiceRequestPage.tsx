import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Check, Car, FileText, 
  Calendar, User, AlertCircle, Wrench
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Step1ServiceSelection,
  Step2VehicleInfo,
  Step3ProblemDescription,
  Step4PhotoUpload,
  Step5Appointment,
  Step6Contact
} from '../components/repairs/ServiceRequestSteps';
import type { ServicePackage } from '../types/repairs';
import toast from 'react-hot-toast';

interface FormData {
  // Service Selection
  servicePackageId: string | null;
  servicePackageIds?: string[];
  customService: string;
  
  // Vehicle Information
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  mileage: string;
  licensePlate: string;
  
  // Problem Description
  problemDescription: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  
  // Appointment
  appointmentDate: string;
  appointmentTime: string;
  serviceLocation: 'drop-off' | 'mobile';
  
  // Contact
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

const STEPS = [
  { id: 1, title: 'Service', icon: Wrench },
  { id: 2, title: 'Vehicle', icon: Car },
  { id: 3, title: 'Problem', icon: FileText },
  { id: 4, title: 'Photos', icon: AlertCircle },
  { id: 5, title: 'Appointment', icon: Calendar },
  { id: 6, title: 'Contact', icon: User },
];

export default function ServiceRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSignedIn } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedPackage = location.state?.selectedPackage as ServicePackage | undefined;

  const [formData, setFormData] = useState<FormData>({
    servicePackageId: selectedPackage?.id || null,
    servicePackageIds: selectedPackage?.id ? [selectedPackage.id] : [],
    customService: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    mileage: '',
    licensePlate: '',
    problemDescription: '',
    urgencyLevel: 'medium',
    appointmentDate: '',
    appointmentTime: '',
    serviceLocation: 'drop-off',
    customerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    customerEmail: user?.primaryEmailAddress?.emailAddress || '',
    customerPhone: '',
    notes: '',
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if ((!formData.servicePackageIds || formData.servicePackageIds.length === 0) && !formData.customService) {
          toast.error('Please select at least one service or describe your custom needs');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.vehicleMake || !formData.vehicleModel) {
          toast.error('Please provide vehicle make and model');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.problemDescription && !formData.servicePackageId) {
          toast.error('Please describe the problem');
          return false;
        }
        return true;
      
      case 5:
        if (!formData.appointmentDate || !formData.appointmentTime) {
          toast.error('Please select appointment date and time');
          return false;
        }
        return true;
      
      case 6:
        if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
          toast.error('Please fill in all contact information');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    if (!isSignedIn || !user) {
      toast.error('Please sign in to submit a service request');
      navigate('/sign-in', { state: { from: location.pathname } });
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting service request...', {
        userId: user.id,
        formData: {
          ...formData,
          servicePackageId: formData.servicePackageId,
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
        }
      });
      // Upload photos to Supabase Storage (simplified - in production use proper storage)
      const photoUrls: string[] = [];
      
      // Create repair request
      const { data: request, error: requestError } = await supabase
        .from('repair_requests')
        .insert({
          user_id: user?.id,
          service_package_id: formData.servicePackageId,
          vehicle_make: formData.vehicleMake,
          vehicle_model: formData.vehicleModel,
          vehicle_year: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          license_plate: formData.licensePlate,
          problem_description: formData.problemDescription || formData.customService,
          urgency_level: formData.urgencyLevel,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          service_location: formData.serviceLocation,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          notes: formData.notes,
          photo_urls: photoUrls,
          status: 'received',
        })
        .select()
        .single();

      if (requestError) {
        console.error('Supabase error:', requestError);
        throw new Error(requestError.message || 'Database error');
      }

      if (!request) {
        throw new Error('No data returned from database');
      }

      // Send email notification
      try {
        console.log('Attempting to send email notification...');
        await sendNotificationEmail(request);
        console.log('Email sent successfully!');
      } catch (emailError) {
        console.error('Email error (non-critical):', emailError);
        toast.error('Note: Email notification failed to send');
        // Don't fail the whole request if email fails
      }

      toast.success('Service request submitted successfully!');
      navigate('/account?tab=services');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      
      // Show specific error message
      if (error.message) {
        toast.error(`Failed: ${error.message}`);
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sendNotificationEmail = async (request: any) => {
    try {
      const selectedPkg = packages.find(p => p.id === formData.servicePackageId);
      const serviceName = selectedPkg?.name || 'Custom Service';

      console.log('Sending email via API...', {
        requestId: request.id,
        serviceName
      });

      // Call Vercel API route
      const response = await fetch('/api/send-service-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: {
            ...request,
            service_name: serviceName,
          }
        }),
      });

      const responseData = await response.json();
      console.log('Email function response:', {
        status: response.status,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(`Email function error: ${responseData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1ServiceSelection 
          formData={formData} 
          updateFormData={updateFormData}
          packages={packages}
          selectedPackage={selectedPackage}
        />;
      case 2:
        return <Step2VehicleInfo formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3ProblemDescription formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4PhotoUpload photos={photos} setPhotos={setPhotos} />;
      case 5:
        return <Step5Appointment formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6Contact formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/repairs')}
            className="flex items-center space-x-2 text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-gold-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Services</span>
          </button>
          
          <h1 className="text-4xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-2">
            Request Service
          </h1>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Fill out the form below and we'll get back to you shortly
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-ekami-gold-600 text-white'
                        : currentStep === step.id
                        ? 'bg-ekami-gold-600 text-white ring-4 ring-ekami-gold-200 dark:ring-ekami-gold-900'
                        : 'bg-ekami-silver-200 dark:bg-ekami-charcoal-700 text-ekami-charcoal-500 dark:text-ekami-silver-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs mt-2 font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 hidden md:block">
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-ekami-gold-600'
                        : 'bg-ekami-silver-200 dark:bg-ekami-charcoal-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 hover:from-ekami-gold-600 hover:to-ekami-gold-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components will be added in the next file...
