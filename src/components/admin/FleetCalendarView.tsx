import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Car, Filter, ChevronDown, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../calendar/calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Booking {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  status: string;
  customer_name?: string;
  customer_email?: string;
  total_amount?: number;
  car?: {
    make: string;
    model: string;
    year: number;
    car_number: string;
  };
}

interface MaintenanceBlock {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  car?: {
    make: string;
    model: string;
    year: number;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'maintenance';
  status?: string;
  resource: any;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  car_number: string;
}

export default function FleetCalendarView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<MaintenanceBlock[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('month');
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all cars
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('id, make, model, year, car_number')
        .order('car_number');

      if (carsError) throw carsError;
      setCars(carsData || []);
      setSelectedCars((carsData || []).map(c => c.id)); // Select all by default

      // Fetch all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          car_id,
          start_date,
          end_date,
          status,
          customer_name,
          customer_email,
          total_amount,
          cars:car_id (make, model, year, car_number)
        `)
        .gte('end_date', new Date().toISOString())
        .in('status', ['pending', 'confirmed', 'active']);

      if (bookingsError) throw bookingsError;
      
      const formattedBookings = (bookingsData || []).map(b => ({
        ...b,
        car: Array.isArray(b.cars) ? b.cars[0] : b.cars
      }));
      setBookings(formattedBookings);

      // Fetch all maintenance blocks
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_blocks')
        .select(`
          id,
          car_id,
          start_date,
          end_date,
          reason,
          cars:car_id (make, model, year, car_number)
        `)
        .gte('end_date', new Date().toISOString());

      if (maintenanceError) throw maintenanceError;
      
      const formattedMaintenance = (maintenanceData || []).map(m => ({
        ...m,
        car: Array.isArray(m.cars) ? m.cars[0] : m.cars
      }));
      setMaintenanceBlocks(formattedMaintenance);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Convert bookings and maintenance to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const filteredBookings = bookings.filter(b => selectedCars.includes(b.car_id));
    const filteredMaintenance = maintenanceBlocks.filter(m => selectedCars.includes(m.car_id));

    const bookingEvents = filteredBookings.map((booking) => ({
      id: booking.id,
      title: `${booking.car?.car_number} - ${booking.car?.year} ${booking.car?.make} ${booking.car?.model} - ${booking.customer_name || 'Customer'}`,
      start: new Date(booking.start_date),
      end: new Date(booking.end_date),
      type: 'booking' as const,
      status: booking.status,
      resource: booking,
    }));

    const maintenanceEvents = filteredMaintenance.map((block) => ({
      id: block.id,
      title: `${block.car?.car_number} - ${block.car?.year} ${block.car?.make} ${block.car?.model} - ${block.reason || 'Maintenance'}`,
      start: new Date(block.start_date),
      end: new Date(block.end_date),
      type: 'maintenance' as const,
      resource: block,
    }));

    return [...bookingEvents, ...maintenanceEvents];
  }, [bookings, maintenanceBlocks, selectedCars]);

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6'; // blue for confirmed bookings
    let borderColor = '#2563eb';

    if (event.type === 'maintenance') {
      backgroundColor = '#f59e0b'; // orange for maintenance
      borderColor = '#d97706';
    } else if (event.status === 'pending') {
      backgroundColor = '#8b5cf6'; // purple for pending
      borderColor = '#7c3aed';
    } else if (event.status === 'active') {
      backgroundColor = '#10b981'; // green for active
      borderColor = '#059669';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: `2px solid ${borderColor}`,
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  const toggleCarSelection = (carId: string) => {
    setSelectedCars(prev =>
      prev.includes(carId)
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  const selectAllCars = () => {
    setSelectedCars(cars.map(c => c.id));
  };

  const deselectAllCars = () => {
    setSelectedCars([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-ekami-gold-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fleet Calendar Overview
          </h2>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-primary flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter Cars ({selectedCars.length}/{cars.length})
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Active Bookings</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {bookings.filter(b => b.status === 'active').length}
              </p>
            </div>
            <Car className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300">Pending</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <CalendarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-300">Maintenance</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {maintenanceBlocks.length}
              </p>
            </div>
            <Car className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Total Events</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {events.length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filter by Cars
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllCars}
                    className="text-sm text-ekami-gold-600 hover:text-ekami-gold-700 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={deselectAllCars}
                    className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {cars.map((car) => (
                  <label
                    key={car.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCars.includes(car.id)
                        ? 'border-ekami-gold-500 bg-ekami-gold-50 dark:bg-ekami-gold-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCars.includes(car.id)}
                      onChange={() => toggleCarSelection(car.id)}
                      className="w-4 h-4 text-ekami-gold-600 rounded focus:ring-ekami-gold-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-ekami-gold-600 dark:text-ekami-gold-400">
                        {car.car_number}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {car.year} {car.make} {car.model}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Active Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Confirmed Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Pending Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Maintenance</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          view={view}
          onView={setView}
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          popup
          tooltipAccessor={(event) => event.title}
        />
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEvent.type === 'booking' ? 'Booking Details' : 'Maintenance Block'}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Car</p>
                  <p className="font-bold text-lg text-ekami-gold-600 dark:text-ekami-gold-400">
                    {selectedEvent.resource.car?.car_number}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedEvent.resource.car?.year} {selectedEvent.resource.car?.make} {selectedEvent.resource.car?.model}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(selectedEvent.start, 'MMM dd, yyyy')} - {format(selectedEvent.end, 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.ceil((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>

                {selectedEvent.type === 'booking' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedEvent.resource.customer_name || 'N/A'}
                      </p>
                      {selectedEvent.resource.customer_email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedEvent.resource.customer_email}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        selectedEvent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        selectedEvent.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {selectedEvent.status}
                      </span>
                    </div>

                    {selectedEvent.resource.total_amount && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="font-bold text-lg text-ekami-gold-600">
                          {selectedEvent.resource.total_amount.toLocaleString()} XAF
                        </p>
                      </div>
                    )}
                  </>
                )}

                {selectedEvent.type === 'maintenance' && selectedEvent.resource.reason && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedEvent.resource.reason}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="mt-6 w-full btn-primary"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
