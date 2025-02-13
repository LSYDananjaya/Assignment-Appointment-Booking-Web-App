import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, setHours, setMinutes, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle, ChevronLeft, ChevronRight, Clock, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useInView } from 'react-intersection-observer';

type TimeSlot = {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

type FilterOption = 'all' | 'available' | 'booked';

const TimeSlotCard: React.FC<{
  slot: TimeSlot;
  onDelete: () => void;
}> = ({ slot, onDelete }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow duration-200"
    >
      <div className="space-y-2 mb-3 sm:mb-0">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-indigo-600" />
          <p className="font-medium text-gray-900 dark:text-white">
            {format(parseISO(slot.start_time), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(parseISO(slot.start_time), 'h:mm a')} - {format(parseISO(slot.end_time), 'h:mm a')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`px-3 py-1 text-sm rounded-full font-medium ${
            slot.is_available
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {slot.is_available ? 'Available' : 'Booked'}
        </motion.span>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const WeekNavigation: React.FC<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}> = ({ selectedDate, onDateChange }) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-6">
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onDateChange(addDays(selectedDate, -7))}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">Week of</p>
        <p className="font-medium text-gray-900 dark:text-white">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </p>
      </div>
      
      <motion.button
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onDateChange(addDays(selectedDate, 7))}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

const Admin = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [slots, setSlots] = React.useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [filter, setFilter] = React.useState<FilterOption>('all');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSlots(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSlots();
  }, []);

  const generateTimeSlots = async () => {
    setLoading(true);
    try {
      const slots = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(selectedDate, i);
        
        // Generate slots from 9 AM to 5 PM
        for (let hour = 9; hour < 17; hour++) {
          const startTime = setMinutes(setHours(currentDate, hour), 0);
          const endTime = setMinutes(setHours(currentDate, hour + 1), 0);
          
          slots.push({
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            is_available: true
          });
        }
      }

      const { error } = await supabase
        .from('time_slots')
        .insert(slots);

      if (error) throw error;
      await fetchSlots();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSlots();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredSlots = React.useMemo(() => {
    return slots.filter(slot => {
      if (filter === 'available') return slot.is_available;
      if (filter === 'booked') return !slot.is_available;
      return true;
    });
  }, [slots, filter]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
        >
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage time slots and appointments.
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Time Slots Manager
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <Button
              onClick={generateTimeSlots}
              loading={loading}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Week
            </Button>
          </div>
        </div>

        <WeekNavigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          </div>
          <div className="flex space-x-2">
            {(['all', 'available', 'booked'] as const).map((option) => (
              <Button
                key={option}
                variant={filter === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option)}
                className={filter === option ? '' : 'text-gray-600 dark:text-gray-400'}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading time slots...</p>
            </div>
          ) : filteredSlots.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No time slots found
              </p>
            </motion.div>
          ) : (
            filteredSlots.map((slot) => (
              <TimeSlotCard
                key={slot.id}
                slot={slot}
                onDelete={() => deleteSlot(slot.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;