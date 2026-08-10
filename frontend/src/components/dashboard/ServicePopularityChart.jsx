// src/components/dashboard/ServicePopularityChart.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaStar, FaCut, FaChartPie } from 'react-icons/fa';

const ServicePopularityChart = ({ 
  data = [],
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.count)) : 100;

  const getColor = (index) => {
    const colors = [
      'bg-gradient-to-r from-purple-500 to-purple-400',
      'bg-gradient-to-r from-pink-500 to-pink-400',
      'bg-gradient-to-r from-blue-500 to-blue-400',
      'bg-gradient-to-r from-green-500 to-green-400',
      'bg-gradient-to-r from-yellow-500 to-yellow-400',
      'bg-gradient-to-r from-red-500 to-red-400',
      'bg-gradient-to-r from-indigo-500 to-indigo-400',
      'bg-gradient-to-r from-teal-500 to-teal-400'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaChartPie className="text-pink-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('dashboard.servicePopularity')}
        </h3>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((service, index) => {
            const percentage = (service.count / maxValue) * 100;
            
            return (
              <div key={service.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FaCut className="text-gray-400 w-3 h-3" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {service.count}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${getColor(index)} rounded-full transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FaStar className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No service popularity data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePopularityChart;