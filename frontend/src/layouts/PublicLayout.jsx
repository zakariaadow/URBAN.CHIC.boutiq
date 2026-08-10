import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaHome, FaInfoCircle, FaCut, FaImages, 
  FaTag, FaUsers, FaEnvelope, FaUserPlus,
  FaSignInAlt, FaBars, FaTimes,
  FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram,
  FaTwitter, FaYoutube, FaWhatsapp, FaClock,
  FaMoon, FaSun
} from 'react-icons/fa';
import LanguageSelector from '../components/common/LanguageSelector';
import logoImage from '../assets/logo.png';

const PublicLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const token = localStorage.getItem('token');

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
  }, [i18n]);

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

  // IMPORTANT: Use t() for ALL nav items
  const navItems = [
    { path: '/', icon: <FaHome />, label: t('nav.home') },
    { path: '/about', icon: <FaInfoCircle />, label: t('nav.about') },
    { path: '/services', icon: <FaCut />, label: t('nav.services') },
    { path: '/gallery', icon: <FaImages />, label: t('nav.gallery') },
    { path: '/pricing', icon: <FaTag />, label: t('nav.pricing') },
    { path: '/team', icon: <FaUsers />, label: t('nav.team') },
    { path: '/contact', icon: <FaEnvelope />, label: t('nav.contact') },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 transition-colors duration-200`}>
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              {!logoLoaded ? (
                <img 
                  src={logoImage}
                  alt="Urban Chic Boutique Logo" 
                  className="w-10 h-10 object-contain"
                  onLoad={() => setLogoLoaded(true)}
                  onError={(e) => {
                    e.target.src = '/logo.png';
                    e.target.onerror = () => {
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
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Urban Chic
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {t('nav.tagline')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm ${
                    location.pathname === item.path
                      ? 'text-purple-600 dark:text-purple-400 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                  } transition-colors flex items-center gap-1`}
                >
                  {item.icon}
                  {item.label}
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

              {token ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/customer/dashboard"
                    className="px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 transition-colors"
                  >
                    {t('nav.dashboard')}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-full text-sm hover:bg-purple-600 hover:text-white dark:hover:text-white transition-all"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
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
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {/* Mobile Theme Toggle */}
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                <span>{isDark ? t('nav.lightMode') : t('nav.darkMode')}</span>
              </button>

              {/* Mobile Language Selector */}
              <div className="px-4 py-2">
                <LanguageSelector />
              </div>

              {token ? (
                <Link
                  to="/customer/dashboard"
                  className="block px-4 py-2 bg-green-600 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={logoImage}
                  alt="Urban Chic Boutique Logo" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <h3 className="text-white font-bold text-lg">Urban Chic</h3>
              </div>
              <p className="text-sm">{t('footer.description')}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t('footer.quickLinks')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="hover:text-white transition-colors">{t('nav.services')}</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">{t('nav.pricing')}</Link></li>
                <li><Link to="/team" className="hover:text-white transition-colors">{t('nav.team')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t('footer.services')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="hover:text-white transition-colors">{t('services.hair')}</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">{t('services.nails')}</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">{t('services.makeup')}</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">{t('services.spa')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t('footer.contact')}</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-purple-500 flex-shrink-0" />
                  <span>{t('footer.address')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaPhone className="text-purple-500 flex-shrink-0" />
                  <span>+254 700 123 456</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-purple-500 flex-shrink-0" />
                  <span>info@urbanchicboutique.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaClock className="text-purple-500 flex-shrink-0" />
                  <span>{t('footer.hours')}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-6 text-center text-sm">
            &copy; 2024 Urban Chic Boutique. {t('footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;