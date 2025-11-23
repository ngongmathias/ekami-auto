import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, isSameDay, isAfter, isBefore } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
  start_date: string;
  end_date: string;
  status: string;
  customer_name?: string;
}

interface MaintenanceBlock {
  id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'booked' | 'maintenance' | 'available';
  resource?: any;
}

interface CarAvailabilityCalendarProps {
  carId: string;
  onDateSelect?: (start: Date, end: Date) => void;
  showBookingButton?: boolean;
}

export default function CarAvailabilityCalendar({ 
  carId, 
  onDateSelect,
  showBookingButton = true 
}: CarAvailabilityCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<MaintenanceBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [view, setView] = useState<View>('month');

  useEffect(() => {
    fetchBookings();
  }, [carId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status, customer_name')
        .eq('car_id', carId)
        .in('status', ['pending', 'confirmed', 'active'])
        .gte('end_date', new Date().toISOString());

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Fetch maintenance blocks
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_blocks')
        .select('id, start_date, end_date, reason')
        .eq('car_id', carId)
        .gte('end_date', new Date().toISOString());

      if (maintenanceError) throw maintenanceError;
      setMaintenanceBlocks(maintenanceData || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  // Convert bookings and maintenance blocks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const bookingEvents = bookings.map((booking) => ({
      id: booking.id,
      title: booking.status === 'confirmed' || booking.status === 'active' ? 'Booked' : 'Pending',
      start: new Date(booking.start_date),
      end: new Date(booking.end_date),
      status: 'booked' as const,
      resource: booking,
    }));

    const maintenanceEvents = maintenanceBlocks.map((block) => ({
      id: block.id,
      title: block.reason || 'Maintenance',
      start: new Date(block.start_date),
      end: new Date(block.end_date),
      status: 'maintenance' as const,
      resource: block,
    }));

    return [...bookingEvents, ...maintenanceEvents];
  }, [bookings, maintenanceBlocks]);

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    // Check bookings
    const hasBooking = bookings.some((booking) => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      return (
        (isAfter(date, start) || isSameDay(date, start)) &&
        (isBefore(date, end) || isSameDay(date, end))
      );
    });

    // Check maintenance blocks
    const hasMaintenance = maintenanceBlocks.some((block) => {
      const start = new Date(block.start_date);
      const end = new Date(block.end_date);
      return (
        (isAfter(date, start) || isSameDay(date, start)) &&
        (isBefore(date, end) || isSameDay(date, end))
      );
    });

    return !hasBooking && !hasMaintenance;
  };

  // Handle date selection
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(start, today)) {
      toast.error('Cannot select dates in the past');
      return;
    }

    // Check if all dates in range are available
    let currentDate = new Date(start);
    const endDate = new Date(end);
    
    while (currentDate <= endDate) {
      if (!isDateAvailable(currentDate)) {
        toast.error('Selected dates include unavailable days');
        return;
      }
      currentDate = addDays(currentDate, 1);
    }

    setSelectedDates({ start, end });
    if (onDateSelect) {
      onDateSelect(start, end);
    }
  };

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#ef4444'; // red for booked
    let borderColor = '#dc2626';

    if (event.status === 'maintenance') {
      backgroundColor = '#f59e0b'; // orange for maintenance
      borderColor = '#d97706';
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
      },
    };
  };

  // Custom day styling
  const dayPropGetter = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isPast = isBefore(date, today);
    const available = isDateAvailable(date);
    const isSelected = selectedDates.start && selectedDates.end &&
      (isAfter(date, selectedDates.start) || isSameDay(date, selectedDates.start)) &&
      (isBefore(date, selectedDates.end) || isSameDay(date, selectedDates.end));

    let className = '';
    let style: any = {};

    if (isPast) {
      className = 'rbc-off-range-bg';
      style.opacity = 0.5;
    } else if (isSelected) {
      style.backgroundColor = '#fbbf24';
      style.color = '#000';
    } else if (available) {
      style.backgroundColor = '#d1fae5';
    } else {
      style.backgroundColor = '#fee2e2';
    }

    return { className, style };
  };

  const handleBookNow = () => {
    if (selectedDates.start && selectedDates.end) {
      // Navigate to booking page with selected dates
      const params = new URLSearchParams({
        start: selectedDates.start.toISOString(),
        end: selectedDates.end.toISOString(),
      });
      window.location.href = `/book/${carId}?${params.toString()}`;
    } else {
      toast.error('Please select dates first');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-ekami-gold-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Check Availability
          </h3>
        </div>
        {selectedDates.start && selectedDates.end && showBookingButton && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleBookNow}
            className="px-4 py-2 bg-ekami-gold-500 hover:bg-ekami-gold-600 text-white rounded-lg font-medium transition-colors"
          >
            Book Now
          </motion.button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Selected</span>
        </div>
      </div>

      {/* Selected Dates Info */}
      <AnimatePresence>
        {selectedDates.start && selectedDates.end && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-ekami-gold-50 dark:bg-ekami-gold-900/20 border border-ekami-gold-200 dark:border-ekami-gold-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-ekami-gold-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Dates Selected
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {format(selectedDates.start, 'MMM dd, yyyy')} - {format(selectedDates.end, 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {Math.ceil((selectedDates.end.getTime() - selectedDates.start.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDates({ start: null, end: null })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          view={view}
          onView={setView}
          views={['month', 'week']}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          popup
          tooltipAccessor={(event) => `${event.title} - ${event.resource?.user_name || 'Customer'}`}
        />
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p>
          Click and drag on the calendar to select your rental dates. Green dates are available, red dates are already booked.
        </p>
      </div>
    </div>
  );
}
