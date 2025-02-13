import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Settings } from 'lucide-react';
import { Calendar } from '../components/calendar/Calendar';
import { AppointmentList } from '../components/appointments/AppointmentList';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useInView } from 'react-intersection-observer';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { Card } from '../components/ui/Card';
import { ScrollReveal } from '../components/ui/ScrollReveal';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const appointments = useAppointmentStore((state) => state.appointments);
  const [isLoaded, setIsLoaded] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  useEffect(() => {
    if (appointments.length) {
      setIsLoaded(true);
    }
  }, [appointments]);

  const stats = [
    {
      icon: CalendarIcon,
      label: 'Upcoming Appointments',
      value: appointments.filter(a => a.status === 'confirmed').length,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Clock,
      label: 'Total Hours Booked',
      value: 12,
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      label: 'Team Members',
      value: 5,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Settings,
      label: 'Settings Updated',
      value: 2,
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ScrollReveal>
        <div className="mb-8 text-center backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 p-8 rounded-xl shadow-lg">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Welcome back, {user?.full_name || 'User'}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            Here's what's happening with your appointments today.
          </motion.p>
        </div>
      </ScrollReveal>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden"
          >
            <Card className="p-6">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r opacity-10 dark:opacity-20" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScrollReveal delay={0.2}>
          <Card className="p-6">
            <Calendar />
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={0.4}>
          <Card className="p-6">
            <AppointmentList />
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Dashboard;