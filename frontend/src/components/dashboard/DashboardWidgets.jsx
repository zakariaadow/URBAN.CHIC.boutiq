// src/components/dashboard/DashboardWidgets.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBox,
  FaStar, FaClock, FaArrowRight, FaUserPlus
} from 'react-icons/fa';
import StatsCard from './StatsCard';

const DashboardWidgets = ({ 
  data = {},
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  const widgets = [
    {
      key: 'totalUsers',
      title: t('dashboard.totalUsers'),
      value: data.totalUsers || 0,
      icon: <FaUsers className="w-6 h-6" />,
      color: 'blue',
      trend: data.userGrowth || 5.2,
      subtitle: 'Active users'
    },
    {
      key: 'appointments',
      title: t('dashboard.totalAppointments'),
      value: data.totalAppointments || 0,
      icon: <FaCalendarCheck className="w-6 h-6" />,
      color: 'green',
      trend: data.appointmentGrowth || 3.8,
      subtitle: 'This month'
    },
    {
      key: 'revenue',
      title: t('dashboard.totalRevenue'),
      value: `$${(data.totalRevenue || 0).toLocaleString()}`,
      icon: <FaMoneyBillWave className="w-6 h-6" />,
      color: 'purple',
      trend: data.revenueGrowth || 7.1,
      subtitle: 'Total earnings'
    },
    {
      key: 'products',
      title: t('dashboard.totalProducts'),
      value: data.totalProducts || 0,
      icon: <FaBox className="w-6 h-6" />,
      color: 'yellow',
      trend: data.productGrowth || 2.3,
      subtitle: 'In stock'
    }
  ];

  // Additional widgets for the grid
  const extraWidgets = [
    {
      key: 'newCustomers',
      title: t('dashboard.newCustomers'),
      value: data.newCustomers || 0,
      icon: <FaUserPlus className="w-5 h-5" />,
      color: 'indigo',
      trend: 12.5,
    },
    {
      key: 'averageRating',
      title: t('dashboard.averageRating'),
      value: (data.averageRating || 0).toFixed(1),
      icon: <FaStar className="w-5 h-5" />,
      color: 'pink',
      subtitle: 'out of 5.0'
    },
    {
      key: 'pendingAppointments',
      title: t('dashboard.pendingAppointments'),
      value: data.pendingAppointments || 0,
      icon: <FaClock className="w-5 h-5" />,
      color: 'red',
      subtitle: 'Need attention'
    },
    {
      key: 'conversionRate',
      title: t('dashboard.conversionRate'),
      value: `${(data.conversionRate || 0)}%`,
      icon: <FaArrowRight className="w-5 h-5" />,
      color: 'green',
      trend: 1.8
    }
  ];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget) => (
          <StatsCard
            key={widget.key}
            title={widget.title}
            value={widget.value}
            icon={widget.icon}
            color={widget.color}
            trend={widget.trend}
            subtitle={widget.subtitle}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {extraWidgets.map((widget) => (
          <div key={widget.key} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${
              widget.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' :
              widget.color === 'pink' ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-500' :
              widget.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' :
              'bg-green-50 dark:bg-green-900/20 text-green-500'
            }`}>
              {widget.icon}
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{widget.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{widget.title}</p>
            {widget.trend !== undefined && (
              <p className={`text-xs mt-1 ${widget.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {widget.trend >= 0 ? '+' : ''}{widget.trend}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardWidgets;