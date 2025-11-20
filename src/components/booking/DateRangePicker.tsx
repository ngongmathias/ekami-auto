import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, X } from 'lucide-react';
import { addDays, differenceInDays } from 'date-fns';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  minDays?: number;
  maxDays?: number;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDays = 1,
  maxDays = 90,
}: DateRangePickerProps) {
  const [focusedInput, setFocusedInput] = useState<'start' | 'end' | null>(null);

  const handleStartDateChange = (date: Date | null) => {
    onStartDateChange(date);
    if (date && endDate && date > endDate) {
      onEndDateChange(null);
    }
    if (date && !endDate) {
      setFocusedInput('end');
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date && startDate) {
      const days = differenceInDays(date, startDate);
      if (days < minDays) {
        date = addDays(startDate, minDays);
      } else if (days > maxDays) {
        date = addDays(startDate, maxDays);
      }
    }
    onEndDateChange(date);
    setFocusedInput(null);
  };

  const clearDates = () => {
    onStartDateChange(null);
    onEndDateChange(null);
    setFocusedInput(null);
  };

  const rentalDays = startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  return (
    <div className="space-y-4">
      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pick-up Date */}
        <div className="relative">
          <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Pick-up Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400 pointer-events-none z-10" />
            <ReactDatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              maxDate={addDays(new Date(), 365)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select pick-up date"
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white"
              calendarClassName="custom-calendar"
              onFocus={() => setFocusedInput('start')}
            />
          </div>
        </div>

        {/* Drop-off Date */}
        <div className="relative">
          <label className="block text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
            Drop-off Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400 pointer-events-none z-10" />
            <ReactDatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ? addDays(startDate, minDays) : addDays(new Date(), minDays)}
              maxDate={startDate ? addDays(startDate, maxDays) : addDays(new Date(), maxDays)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select drop-off date"
              disabled={!startDate}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              calendarClassName="custom-calendar"
              onFocus={() => setFocusedInput('end')}
            />
          </div>
        </div>
      </div>

      {/* Rental Duration Display */}
      {startDate && endDate && rentalDays > 0 && (
        <div className="flex items-center justify-between p-4 bg-ekami-gold-50 dark:bg-ekami-gold-900/20 rounded-xl border-2 border-ekami-gold-200 dark:border-ekami-gold-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-ekami-gold-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                Rental Duration
              </p>
              <p className="text-xl font-bold text-ekami-gold-700 dark:text-ekami-gold-300">
                {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
              </p>
            </div>
          </div>
          <button
            onClick={clearDates}
            className="p-2 hover:bg-ekami-gold-100 dark:hover:bg-ekami-gold-800 rounded-lg transition-colors"
            aria-label="Clear dates"
          >
            <X className="w-5 h-5 text-ekami-charcoal-600 dark:text-ekami-silver-400" />
          </button>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
        <p>• Minimum rental: {minDays} {minDays === 1 ? 'day' : 'days'}</p>
        <p>• Maximum rental: {maxDays} days</p>
        <p>• Pick-up time: 9:00 AM - 6:00 PM</p>
      </div>
    </div>
  );
}
