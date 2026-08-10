// src/components/dashboard/StaffPerformanceChart.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaStar, FaUser, FaChartBar } from 'react-icons/fa';

const StaffPerformanceChart = ({ 
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
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaChartBar className="text-pink-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('dashboard.staffPerformance')}
        </h3>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((staff, index) => {
            const percentage = (staff.rating / 5) * 100;
            const color = index % 2 === 0 ? 'bg-pink-500' : 'bg-purple-500';
            
            return (
              <div key={staff.id} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {staff.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {staff.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <FaStar className="text-yellow-400 mr-1 w-3 h-3" />
                        {staff.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-11">
                  <span>{staff.appointments || 0} appointments</span>
                  <span>${staff.revenue || 0} revenue</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FaUser className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No staff performance data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPerformanceChart;