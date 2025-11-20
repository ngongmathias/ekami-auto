import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, Wrench } from 'lucide-react';
import type { RepairRequest, RepairStatus } from '../../types/repairs';

interface ServiceRequestCardProps {
  request: RepairRequest;
  onClick?: () => void;
}

export default function ServiceRequestCard({ request, onClick }: ServiceRequestCardProps) {
  const getStatusConfig = (status: RepairStatus) => {
    const configs: Record<RepairStatus, { label: string; color: string; icon: any }> = {
      received: { label: 'Received', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: CheckCircle },
      scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: Calendar },
      checked_in: { label: 'Checked In', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', icon: CheckCircle },
      diagnosis: { label: 'Diagnosis', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: AlertCircle },
      quote_provided: { label: 'Quote Provided', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: AlertCircle },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      parts_ordered: { label: 'Parts Ordered', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Clock },
      in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Wrench },
      quality_check: { label: 'Quality Check', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: CheckCircle },
      ready_pickup: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle },
    };
    return configs[status] || configs.received;
  };

  const getUrgencyColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-orange-600 dark:text-orange-400',
      emergency: 'text-red-600 dark:text-red-400',
    };
    return colors[level] || colors.medium;
  };

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      className="bg-white dark:bg-ekami-charcoal-800 rounded-xl p-6 border border-ekami-silver-200 dark:border-ekami-charcoal-700 cursor-pointer transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-ekami-charcoal-900 dark:text-white">
              {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
            </h3>
            <span className={`text-xs font-semibold uppercase ${getUrgencyColor(request.urgency_level)}`}>
              {request.urgency_level}
            </span>
          </div>
          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Request #{request.id.slice(0, 8)}
          </p>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.color}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{statusConfig.label}</span>
        </div>
      </div>

      {/* Problem Description */}
      {request.problem_description && (
        <p className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-4 line-clamp-2">
          {request.problem_description}
        </p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {request.appointment_date && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-ekami-gold-600" />
            <div>
              <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">Appointment</p>
              <p className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
                {new Date(request.appointment_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {request.appointment_time && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-ekami-gold-600" />
            <div>
              <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">Time</p>
              <p className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
                {request.appointment_time}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-ekami-gold-600" />
          <div>
            <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">Location</p>
            <p className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
              {request.service_location === 'drop-off' ? 'Drop-off' : 'Mobile Service'}
            </p>
          </div>
        </div>

        {request.mileage && (
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-ekami-gold-600" />
            <div>
              <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">Mileage</p>
              <p className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
                {request.mileage.toLocaleString()} km
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cost */}
      {(request.estimated_cost || request.final_cost) && (
        <div className="pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
              {request.final_cost ? 'Final Cost' : 'Estimated Cost'}
            </span>
            <span className="text-lg font-bold text-ekami-gold-600">
              {(request.final_cost || request.estimated_cost)?.toLocaleString()} XAF
            </span>
          </div>
        </div>
      )}

      {/* Created Date */}
      <div className="mt-4 pt-4 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
        <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
          Submitted {new Date(request.created_at).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}
