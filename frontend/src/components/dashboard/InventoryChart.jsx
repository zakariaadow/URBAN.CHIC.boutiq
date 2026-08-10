// src/components/dashboard/InventoryChart.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBox, FaExclamationTriangle, FaCheckCircle, FaChartPie } from 'react-icons/fa';

const InventoryChart = ({ 
  data = {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    inStock: 0,
    categories: []
  },
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Products', 
      value: data.total || 0, 
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: <FaBox className="w-5 h-5 text-blue-500" />
    },
    { 
      label: 'In Stock', 
      value: data.inStock || 0, 
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: <FaCheckCircle className="w-5 h-5 text-green-500" />
    },
    { 
      label: 'Low Stock', 
      value: data.lowStock || 0, 
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />
    },
    { 
      label: 'Out of Stock', 
      value: data.outOfStock || 0, 
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: <FaExclamationTriangle className="w-5 h-5 text-red-500" />
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaChartPie className="text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('dashboard.inventoryStatus')}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bg} rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {data.categories && data.categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Breakdown
          </p>
          <div className="space-y-2">
            {data.categories.map((category, index) => {
              const percentage = (category.count / (data.total || 1)) * 100;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{category.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{category.count}</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${colors[index % colors.length]} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryChart;