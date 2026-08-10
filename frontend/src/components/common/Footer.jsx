// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock,
  FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaWhatsapp,
  FaArrowUp
} from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </button>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Urban Chic Boutique
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Premium salon and spa services in Nairobi. Where beauty meets excellence.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="Facebook">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="Instagram">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="Twitter">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="YouTube">
                <FaYoutube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" aria-label="WhatsApp">
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Services</Link></li>
              <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</Link></li>
              <li><Link to="/team" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Team</Link></li>
              <li><Link to="/gallery" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-2">
                <FaMapMarkerAlt className="mt-0.5 text-purple-500 flex-shrink-0" />
                <span>123 Fashion Avenue, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaPhone className="text-purple-500 flex-shrink-0" />
                <span>+254 700 123 456</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-purple-500 flex-shrink-0" />
                <span>info@urbanchicboutique.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Opening Hours</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span>9:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>9:00 - 17:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-red-500">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {currentYear} Urban Chic Boutique. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;