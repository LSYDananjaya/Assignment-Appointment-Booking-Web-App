import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Moon, Sun, User, Settings, Menu, X, Bell, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton } from '../ui/GradientButton';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => (prev + 1) % 10);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: User },
    { name: 'Admin', path: '/admin', icon: Settings, adminOnly: true },
  ];

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const menuVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' }
  };

  const searchVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navVariants}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg' 
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <Calendar className="w-7 h-7 text-indigo-600" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-indigo-400/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AppointFlow
                </span>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-6">
              <AnimatePresence mode="wait">
                {showSearch ? (
                  <motion.form
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={searchVariants}
                    className="relative"
                    onSubmit={handleSearch}
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      placeholder="Search..."
                      className={`w-64 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${
                        isSearchFocused ? 'w-80' : 'w-64'
                      }`}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.button
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={searchVariants}
                    onClick={() => setShowSearch(true)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                )}
              </AnimatePresence>

              {user && navItems.map((item) => (
                (!item.adminOnly || user.role === 'admin') && (
                  <motion.div
                    key={item.name}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Link to={item.path}>
                      <GradientButton 
                        variant={location.pathname === item.path ? "primary" : "secondary"} 
                        size="sm"
                        className="flex items-center space-x-2 group"
                      >
                        <item.icon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                        <span>{item.name}</span>
                      </GradientButton>
                    </Link>
                  </motion.div>
                )
              ))}
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              >
                <motion.div
                  animate={{ rotate: darkMode ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-gray-400/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <AnimatePresence>
                      {notifications > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {notifications}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <GradientButton 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="group"
                  >
                    <span>Sign Out</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </GradientButton>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <GradientButton variant="secondary" size="sm" className="group">
                      <span>Sign In</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </GradientButton>
                  </Link>
                  <Link to="/register">
                    <GradientButton variant="primary" size="sm" className="group">
                      <span>Register</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </GradientButton>
                  </Link>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={menuVariants}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl md:hidden"
            >
              <div className="h-full flex flex-col">
                <div className="px-4 py-6 border-b dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                      <Calendar className="w-6 h-6 text-indigo-600" />
                      <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        AppointFlow
                      </span>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                  <form onSubmit={handleSearch} className="mt-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                  <nav className="flex flex-col space-y-4">
                    {user && navItems.map((item) => (
                      (!item.adminOnly || user.role === 'admin') && (
                        <motion.div
                          key={item.name}
                          whileHover={{ x: 4 }}
                          whileTap={{ x: 0 }}
                        >
                          <Link
                            to={item.path}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <item.icon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                            <span>{item.name}</span>
                            <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </motion.div>
                      )
                    ))}
                  </nav>
                </div>

                <div className="px-4 py-6 border-t dark:border-gray-800">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {darkMode ? (
                          <Sun className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </motion.button>
                    </div>
                    {user ? (
                      <GradientButton variant="outline" onClick={handleSignOut} className="w-full group">
                        <span>Sign Out</span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </GradientButton>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <GradientButton variant="secondary" className="w-full group">
                            <span>Sign In</span>
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </GradientButton>
                        </Link>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                          <GradientButton variant="primary" className="w-full group">
                            <span>Register</span>
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </GradientButton>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 md:hidden z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};