// src/components/dashboard/ProductSalesChart.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBox, FaChartBar, FaShoppingCart } from 'react-icons/fa';

const ProductSalesChart = ({ 
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

  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 100;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FaChartBar className="text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('dashboard.topProducts')}
        </h3>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((product, index) => {
            const percentage = (product.revenue / maxRevenue) * 100;
            const isTop = index < 3;
            
            return (
              <div key={product.id} className="group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isTop ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FaShoppingCart className="w-3 h-3 mr-1" />
                          {product.sold || 0}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${isTop ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-green-500 to-green-400'} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FaBox className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No product sales data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSalesChart;