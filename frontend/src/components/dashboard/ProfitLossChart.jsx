// src/components/dashboard/ProfitLossChart.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaMoneyBillWave, FaCalendarDay, FaDownload } from 'react-icons/fa';

const ProfitLossChart = ({ 
  data = [],
  period = 'month',
  onPeriodChange = null,
  onExport = null,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [activePeriod, setActivePeriod] = useState(period);

  const periods = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' }
  ];

  const handlePeriodChange = (newPeriod) => {
    setActivePeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  const maxValue = data.length > 0 ? Math.max(...data.map(d => Math.abs(d.profit))) * 1.2 : 100;

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaMoneyBillWave className="text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.profitLoss')}
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  activePeriod === p.value
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Export data"
            >
              <FaDownload className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end">
            {data.map((item, index) => {
              const height = (Math.abs(item.profit) / maxValue) * 100;
              const isPositive = item.profit >= 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex justify-center">
                    <div
                      className={`w-8 max-w-full rounded-t transition-all duration-500 hover:opacity-80 ${
                        isPositive ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-gradient-to-t from-red-500 to-red-400'
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -mt-8 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none">
                        ${item.profit}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FaMoneyBillWave className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No profit/loss data available</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Profit</p>
            <p className={`text-lg font-bold ${data.reduce((sum, d) => sum + d.profit, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${data.reduce((sum, d) => sum + d.profit, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${(data.reduce((sum, d) => sum + d.profit, 0) / data.length).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best Month</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              ${Math.max(...data.map(d => d.profit))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Worst Month</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              ${Math.min(...data.map(d => d.profit))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLossChart;