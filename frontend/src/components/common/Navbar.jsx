// src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaHome, FaInfoCircle, FaCut, FaImages, 
  FaTag, FaUsers, FaEnvelope, FaUserPlus,
  FaSignInAlt, FaBars, FaTimes,
  FaUser, FaCog, FaSignOutAlt,
  FaMoon, FaSun
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import LanguageSelector from './LanguageSelector';

// Try importing the logo directly
import logoImage from '../../assets/logo.png';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const navItems = [
    { path: '/', icon: <FaHome />, label: t('nav.home') || 'Home' },
    { path: '/about', icon: <FaInfoCircle />, label: t('nav.about') || 'About' },
    { path: '/services', icon: <FaCut />, label: t('nav.services') || 'Services' },
    { path: '/gallery', icon: <FaImages />, label: t('nav.gallery') || 'Gallery' },
    { path: '/pricing', icon: <FaTag />, label: t('nav.pricing') || 'Pricing' },
    { path: '/team', icon: <FaUsers />, label: t('nav.team') || 'Team' },
    { path: '/contact', icon: <FaEnvelope />, label: t('nav.contact') || 'Contact' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success(t('auth.logoutSuccess') || 'Logged out successfully');
    setDropdownOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getDashboardPath = () => {
    const role = user?.role || 'customer';
    switch(role) {
      case 'admin': return '/admin/dashboard';
      case 'manager': return '/manager/dashboard';
      case 'stylist': return '/stylist/dashboard';
      case 'finance': return '/finance/dashboard';
      case 'inventory': return '/inventory/dashboard';
      case 'receptionist': return '/receptionist/dashboard';
      default: return '/customer/dashboard';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Try multiple sources */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            {!logoLoaded ? (
              <img 
                src={logoImage}
                alt="Urban Chic Boutique Logo" 
                className="w-10 h-10 object-contain"
                onLoad={() => setLogoLoaded(true)}
                onError={(e) => {
                  console.log('Logo from assets failed, trying public folder');
                  e.target.src = '/logo.png';
                  e.target.onerror = () => {
                    console.log('Logo from public failed, using fallback');
                    e.target.style.display = 'none';
                    const parent = e.target.parentNode;
                    const fallback = document.createElement('div');
                    fallback.className = 'w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg';
                    fallback.textContent = 'UC';
                    parent.appendChild(fallback);
                  };
                }}
              />
            ) : (
              <img 
                src={logoImage}
                alt="Urban Chic Boutique Logo" 
                className="w-10 h-10 object-contain"
              />
            )}
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
              Urban Chic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center space-x-1 text-sm ${
                  location.pathname === item.path ? 'text-purple-600 dark:text-purple-400 font-medium' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-lg"
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Menu */}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                    {user?.name || 'User'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUser className="mr-3" />
                      {t('nav.dashboard') || 'Dashboard'}
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUser className="mr-3" />
                      {t('nav.profile') || 'Profile'}
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaCog className="mr-3" />
                      {t('nav.settings') || 'Settings'}
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FaSignOutAlt className="mr-3" />
                      {t('nav.logout') || 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center space-x-1 text-sm"
                >
                  <FaSignInAlt />
                  <span>{t('nav.login') || 'Login'}</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-1 text-sm"
                >
                  <FaUserPlus />
                  <span>{t('nav.register') || 'Register'}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container mx-auto px-4 space-y-2">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-2 px-4 py-2 mb-2">
              <img 
                src={logoImage}
                alt="Urban Chic Boutique Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.src = '/logo.png';
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentNode;
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm';
                    fallback.textContent = 'UC';
                    parent.appendChild(fallback);
                  };
                }}
              />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Urban Chic
              </span>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors ${
                  location.pathname === item.path ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors w-full"
            >
              {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className="px-4 py-2">
              <LanguageSelector />
            </div>

            {token ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaUser className="w-5 h-5" />
                  <span>{t('nav.dashboard') || 'Dashboard'}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span>{t('nav.logout') || 'Logout'}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <FaSignInAlt />
                  <span>{t('nav.login') || 'Login'}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  <FaUserPlus />
                  <span>{t('nav.register') || 'Register'}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;