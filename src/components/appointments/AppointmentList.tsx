import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Button } from '../ui/Button';
import { useAppointmentStore } from '../../store/appointmentStore';
import type { Database } from '../../lib/supabase-types';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  time_slots: Database['public']['Tables']['time_slots']['Row'];
};

const statusConfig = {
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-600',
    label: 'Confirmed'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-600',
    label: 'Cancelled'
  },
  pending: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-600',
    label: 'Pending'
  }
};

interface CancelModalProps {
  appointment: Appointment;
  onClose: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ appointment, onClose }) => {
  const cancelAppointment = useAppointmentStore((state) => state.cancelAppointment);
  const [loading, setLoading] = React.useState(false);

  const handleCancel = async () => {
    setLoading(true);
    await cancelAppointment(appointment.id);
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h3 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Cancel Appointment
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
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(parseISO(appointment.time_slots.start_time), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(parseISO(appointment.time_slots.start_time), 'h:mm a')} - {format(parseISO(appointment.time_slots.end_time), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Keep Appointment
            </Button>
            <Button
              onClick={handleCancel}
              loading={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel Appointment
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const AppointmentCard: React.FC<{ appointment: Appointment; onCancel: () => void }> = ({ appointment, onCancel }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const status = appointment.status as keyof typeof statusConfig;
  const StatusIcon = statusConfig[status].icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={`
        p-6 rounded-xl border-2 transition-all duration-300
        ${statusConfig[status].borderColor}
        ${statusConfig[status].bgColor}
        hover:shadow-lg
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-5 h-5 ${statusConfig[status].color}`} />
            <span className={`text-sm font-medium ${statusConfig[status].color}`}>
              {statusConfig[status].label}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                {format(parseISO(appointment.time_slots.start_time), 'MMMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-600 dark:text-gray-400">
                {format(parseISO(appointment.time_slots.start_time), 'h:mm a')} - {format(parseISO(appointment.time_slots.end_time), 'h:mm a')}
              </span>
            </div>
          </div>

          {appointment.notes && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 p-3 rounded-lg"
            >
              {appointment.notes}
            </motion.p>
          )}
        </div>

        {appointment.status === 'confirmed' && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export const AppointmentList: React.FC = () => {
  const { appointments, loading, error, fetchAppointments } = useAppointmentStore();
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);

  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center py-8 rounded-xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        Error loading appointments: {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
          Your Appointments
        </h2>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-4"
        >
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No appointments found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Book a new appointment to get started
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={() => setSelectedAppointment(appointment)}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedAppointment && (
          <CancelModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};