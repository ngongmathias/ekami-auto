import { useState, useEffect } from 'react';
import { 
  FileText, 
  Wrench, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  Calendar,
  MapPin,
  DollarSign,
  Download,
  Shield,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface HistoryEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  mileage: number;
  location: string;
  cost: number;
  service_provider: string;
  severity: string;
  status: string;
  verified: boolean;
}

interface OwnershipRecord {
  id: string;
  owner_number: number;
  owner_name: string;
  ownership_start: string;
  ownership_end: string;
  purchase_mileage: number;
  sale_mileage: number;
}

interface InspectionReport {
  id: string;
  inspection_date: string;
  inspector_name: string;
  mileage: number;
  overall_condition: string;
  engine_condition: number;
  transmission_condition: number;
  brake_condition: number;
  passed: boolean;
}

interface CarHistoryProps {
  carId: string;
}

export default function CarHistory({ carId }: CarHistoryProps) {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [ownership, setOwnership] = useState<OwnershipRecord[]>([]);
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'ownership' | 'inspections'>('timeline');

  useEffect(() => {
    fetchCarHistory();
  }, [carId]);

  const fetchCarHistory = async () => {
    try {
      setLoading(true);

      // Fetch history events
      const { data: historyData } = await supabase
        .from('car_history')
        .select('*')
        .eq('car_id', carId)
        .order('date', { ascending: false });

      // Fetch ownership history
      const { data: ownershipData } = await supabase
        .from('ownership_history')
        .select('*')
        .eq('car_id', carId)
        .order('owner_number', { ascending: true });

      // Fetch inspection reports
      const { data: inspectionData } = await supabase
        .from('inspection_reports')
        .select('*')
        .eq('car_id', carId)
        .order('inspection_date', { ascending: false });

      setHistory(historyData || []);
      setOwnership(ownershipData || []);
      setInspections(inspectionData || []);
    } catch (error) {
      console.error('Error fetching car history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'accident':
        return <AlertTriangle className="w-5 h-5" />;
      case 'ownership':
        return <Users className="w-5 h-5" />;
      case 'inspection':
        return <Shield className="w-5 h-5" />;
      case 'repair':
        return <Wrench className="w-5 h-5" />;
      case 'upgrade':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string, severity?: string) => {
    if (type === 'accident') {
      if (severity === 'major') return 'bg-red-500';
      if (severity === 'moderate') return 'bg-orange-500';
      return 'bg-yellow-500';
    }
    if (type === 'maintenance') return 'bg-blue-500';
    if (type === 'inspection') return 'bg-green-500';
    if (type === 'upgrade') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vehicle History Report
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete history and maintenance records
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Timeline ({history.length})
        </button>
        <button
          onClick={() => setActiveTab('ownership')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'ownership'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Ownership ({ownership.length})
        </button>
        <button
          onClick={() => setActiveTab('inspections')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'inspections'
              ? 'text-ekami-gold-500 border-b-2 border-ekami-gold-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Inspections ({inspections.length})
        </button>
      </div>

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No history records available
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

              {history.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-16 pb-8"
                >
                  {/* Icon */}
                  <div
                    className={`absolute left-3 w-6 h-6 rounded-full ${getEventColor(
                      event.type,
                      event.severity
                    )} flex items-center justify-center text-white`}
                  >
                    {getEventIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div className="bg-gray-50 dark:bg-ekami-charcoal-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {event.title}
                          {event.verified && (
                            <CheckCircle className="inline-block w-4 h-4 text-green-500 ml-2" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {event.type}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(event.date), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {event.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {event.mileage && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>{event.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.cost && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(event.cost)}</span>
                        </div>
                      )}
                      {event.service_provider && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Wrench className="w-4 h-4" />
                          <span>{event.service_provider}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ownership Tab */}
      {activeTab === 'ownership' && (
        <div className="space-y-4">
          {ownership.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No ownership records available
              </p>
            </div>
          ) : (
            ownership.map((owner) => (
              <div
                key={owner.id}
                className="bg-gray-50 dark:bg-ekami-charcoal-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Owner #{owner.owner_number}
                    {owner.owner_name && ` - ${owner.owner_name}`}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(owner.ownership_start), 'MMM yyyy')} -{' '}
                    {owner.ownership_end
                      ? format(new Date(owner.ownership_end), 'MMM yyyy')
                      : 'Present'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                  {owner.purchase_mileage && (
                    <div>
                      <span className="font-medium">Purchase Mileage:</span>{' '}
                      {owner.purchase_mileage.toLocaleString()} km
                    </div>
                  )}
                  {owner.sale_mileage && (
                    <div>
                      <span className="font-medium">Sale Mileage:</span>{' '}
                      {owner.sale_mileage.toLocaleString()} km
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          {inspections.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No inspection reports available
              </p>
            </div>
          ) : (
            inspections.map((inspection) => (
              <div
                key={inspection.id}
                className="bg-gray-50 dark:bg-ekami-charcoal-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Inspection Report
                    {inspection.passed && (
                      <CheckCircle className="inline-block w-4 h-4 text-green-500 ml-2" />
                    )}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Inspector:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {inspection.inspector_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {inspection.mileage?.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {inspection.overall_condition}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <p
                      className={`font-medium ${
                        inspection.passed ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {inspection.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>

                {/* Component Ratings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {inspection.engine_condition && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Engine:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-ekami-gold-500 h-2 rounded-full"
                            style={{ width: `${inspection.engine_condition * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {inspection.engine_condition}/10
                        </span>
                      </div>
                    </div>
                  )}
                  {inspection.transmission_condition && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Transmission:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-ekami-gold-500 h-2 rounded-full"
                            style={{ width: `${inspection.transmission_condition * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {inspection.transmission_condition}/10
                        </span>
                      </div>
                    </div>
                  )}
                  {inspection.brake_condition && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Brakes:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-ekami-gold-500 h-2 rounded-full"
                            style={{ width: `${inspection.brake_condition * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {inspection.brake_condition}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Download Report Button */}
      {(history.length > 0 || ownership.length > 0 || inspections.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full px-6 py-3 bg-ekami-gold-500 text-white rounded-lg font-semibold hover:bg-ekami-gold-600 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Download Full Report (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
