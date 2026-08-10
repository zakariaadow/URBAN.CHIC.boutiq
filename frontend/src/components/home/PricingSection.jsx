// src/components/home/PricingSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaArrowRight, FaClock } from 'react-icons/fa';

const PricingSection = ({ pricingData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Show top 3 most popular or first 3 services
  const displayServices = pricingData?.slice(0, 3) || [];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">Pricing</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Transparent <span className="text-green-600 dark:text-green-400">Pricing</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No hidden fees. Just quality service at fair prices.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayServices.map((service, index) => (
            <div
              key={service.id || index}
              className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all transform hover:-translate-y-2 ${
                index === 1 ? 'border-2 border-purple-500 dark:border-purple-400 relative' : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {service.description}
                </p>
                
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                    / session
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <FaClock className="mr-2" />
                  {service.duration_minutes || service.duration || 30} minutes
                </div>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Professional service
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Premium products
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Expert stylists
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/book-appointment', { state: { serviceId: service.id } })}
                  className={`w-full py-2.5 rounded-lg transition-all transform hover:scale-105 ${
                    index === 1
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 inline-flex items-center"
          >
            View All Pricing
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;