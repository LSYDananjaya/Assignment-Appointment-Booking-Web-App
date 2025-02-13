import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isFuture, addDays, isSameDay, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, Calendar as CalendarDaysIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Button } from '../ui/Button';
import { useAppointmentStore } from '../../store/appointmentStore';
import type { Database } from '../../lib/supabase-types';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'];

interface BookingModalProps {
  slot: TimeSlot;
  onClose: () => void;
}

const WeekPicker: React.FC<{
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}> = ({ selectedDate, onDateSelect }) => {
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-6">
      {weekDays.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isCurrentDay = isToday(date);
        return (
          <motion.button
            key={date.toISOString()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateSelect(date)}
            className={`
              p-2 rounded-lg text-center transition-colors duration-200
              ${isSelected 
                ? 'bg-indigo-600 text-white' 
                : isCurrentDay
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <div className="text-xs font-medium mb-1">
              {format(date, 'EEE')}
            </div>
            <div className="text-sm font-semibold">
              {format(date, 'd')}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

const BookingModal: React.FC<BookingModalProps> = ({ slot, onClose }) => {
  const bookAppointment = useAppointmentStore((state) => state.bookAppointment);
  const [notes, setNotes] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleBook = async () => {
    setLoading(true);
    await bookAppointment(slot.id, notes);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h3 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Book Appointment
          </motion.h3>
          <motion.button
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring", stiffness: 200 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(parseISO(slot.start_time), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(parseISO(slot.start_time), 'h:mm a')} - {format(parseISO(slot.end_time), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-shadow duration-200"
              rows={3}
              placeholder="Add any special requests or notes..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleBook}
              loading={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white order-2 sm:order-1"
            >
              Confirm Booking
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 order-1 sm:order-2"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const TimeSlotCard: React.FC<{
  slot: TimeSlot;
  onClick: () => void;
}> = ({ slot, onClick }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const isAvailable = slot.is_available && isFuture(parseISO(slot.start_time));
  const startTime = parseISO(slot.start_time);
  const endTime = parseISO(slot.end_time);

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      whileHover={isAvailable ? { scale: 1.02 } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={!isAvailable}
      className={`
        w-full p-4 rounded-xl border-2 transition-all duration-200
        ${isAvailable
          ? 'border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:shadow-md'
          : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <span className="font-medium text-gray-900 dark:text-white">
              {format(startTime, 'h:mm a')}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
            to
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-7 sm:ml-0">
            {format(endTime, 'h:mm a')}
          </span>
        </div>
        {!isAvailable && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            Unavailable
          </span>
        )}
      </div>
    </motion.button>
  );
};

export const Calendar: React.FC = () => {
  const { slots, loading, error, fetchSlots } = useAppointmentStore();
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [showWeekPicker, setShowWeekPicker] = React.useState(false);

  React.useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const groupedSlots = React.useMemo(() => {
    const groups: { [key: string]: TimeSlot[] } = {};
    slots.forEach((slot) => {
      const date = format(parseISO(slot.start_time), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
    });
    return groups;
  }, [slots]);

  const handlePrevWeek = () => setSelectedDate(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setSelectedDate(prev => addWeeks(prev, 1));

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center py-8 rounded-xl">
        <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2" />
        Error loading time slots: {error}
      </div>
    );
  }

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const daySlots = groupedSlots[dateStr] || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2 text-indigo-600" />
          Available Time Slots
        </h2>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading time slots...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <button
              onClick={() => setShowWeekPicker(!showWeekPicker)}
              className="flex-1 flex items-center justify-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {format(selectedDate, 'MMMM d')}
              </span>
              {isToday(selectedDate) && (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </button>
            
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          <AnimatePresence>
            {showWeekPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <WeekPicker
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setShowWeekPicker(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {daySlots.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No available time slots for this day
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {daySlots.map((slot) => (
                <TimeSlotCard
                  key={slot.id}
                  slot={slot}
                  onClick={() => setSelectedSlot(slot)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedSlot && (
          <BookingModal
            slot={selectedSlot}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};