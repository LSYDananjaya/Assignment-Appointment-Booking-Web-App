import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { GradientButton } from '../components/ui/GradientButton';
import { Card } from '../components/ui/Card';
import { ParallaxText } from '../components/ui/ParallaxText';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Link } from 'react-router-dom';

const Home = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Intelligent calendar management with real-time availability updates.',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Clock,
      title: 'Time Zone Smart',
      description: 'Automatic time zone detection and conversion for global scheduling.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Team Friendly',
      description: 'Perfect for teams of all sizes with role-based access control.',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 -z-10" />
      
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-30 dark:opacity-10 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Schedule Meetings
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                with Ease
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Streamline your appointment booking process with our intuitive and powerful scheduling platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/register">
              <GradientButton size="lg" className="group">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
            </Link>
            <Link to="/login">
              <GradientButton variant="secondary" size="lg">
                Sign In
              </GradientButton>
            </Link>
          </motion.div>
        </div>

        <ParallaxText className="py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-16">
            Why Choose AppointFlow?
          </h2>
        </ParallaxText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.2}>
              <Card className="p-8 text-center h-full" hover>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;