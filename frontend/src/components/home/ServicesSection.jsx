// src/components/home/ServicesSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCut, FaSpa, FaPaintBrush, FaHands, FaClock, FaArrowRight, FaStar } from 'react-icons/fa';

const ServicesSection = ({ services }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getCategoryIcon = (category) => {
    const icons = {
      'Hair': <FaCut className="text-purple-500" />,
      'Nails': <FaHands className="text-pink-500" />,
      'Makeup': <FaPaintBrush className="text-yellow-500" />,
      'Spa': <FaSpa className="text-green-500" />,
      'Waxing': <FaHands className="text-orange-500" />
    };
    return icons[category] || <FaStar className="text-gray-500" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Display only first 4 services on home page
  const displayServices = services?.slice(0, 4) || [];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Our Services</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Premium <span className="text-purple-600 dark:text-purple-400">Beauty Services</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our range of professional beauty services tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group"
              onClick={() => navigate(`/services/${service.id}`)}
            >
              <div className="p-6">
                <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(service.category?.name || service.category)}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FaClock className="mr-1" /> 
                    {service.duration_minutes || service.duration || 30} min
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/services')}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 inline-flex items-center"
          >
            View All Services
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;