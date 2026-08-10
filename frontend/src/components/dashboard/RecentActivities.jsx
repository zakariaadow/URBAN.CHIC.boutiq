// src/components/dashboard/RecentActivities.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaUser, FaCut, FaCreditCard, FaCalendarCheck,
  FaBox, FaCheckCircle, FaTimes, FaClock,
  FaUserPlus, FaEdit, FaTrash
} from 'react-icons/fa';

const RecentActivities = ({ 
  activities = [],
  limit = 5,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  const getActivityIcon = (type) => {
    const icons = {
      create: <FaCheckCircle className="text-green-500" />,
      update: <FaEdit className="text-blue-500" />,
      delete: <FaTrash className="text-red-500" />,
      login: <FaUser className="text-blue-500" />,
      logout: <FaUser className="text-gray-500" />,
      appointment: <FaCalendarCheck className="text-purple-500" />,
      payment: <FaCreditCard className="text-green-500" />,
      service: <FaCut className="text-pink-500" />,
      product: <FaBox className="text-yellow-500" />,
      user: <FaUserPlus className="text-indigo-500" />,
      status: <FaClock className="text-orange-500" />
    };
    return icons[type] || <FaClock className="text-gray-500" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      create: 'bg-green-50 dark:bg-green-900/20 border-green-500',
      update: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
      delete: 'bg-red-50 dark:bg-red-900/20 border-red-500',
      login: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
      logout: 'bg-gray-50 dark:bg-gray-700/50 border-gray-500',
      appointment: 'bg-purple-50 dark:bg-purple-900/20 border-purple-500',
      payment: 'bg-green-50 dark:bg-green-900/20 border-green-500',
      service: 'bg-pink-50 dark:bg-pink-900/20 border-pink-500',
      product: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500',
      user: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500',
      status: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
    };
    return colors[type] || 'bg-gray-50 dark:bg-gray-700/50 border-gray-500';
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const displayActivities = activities.slice(0, limit);

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('dashboard.recentActivities')}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {displayActivities.length} activities
        </span>
      </div>

      {displayActivities.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {displayActivities.map((activity, index) => (
            <div 
              key={activity.id || index} 
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)} bg-opacity-50 hover:shadow-sm transition-shadow`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {activity.description}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTime(activity.created_at)}</span>
                  {activity.user_name && (
                    <span className="flex items-center">
                      <FaUser className="w-3 h-3 mr-1" />
                      {activity.user_name}
                    </span>
                  )}
                  {activity.branch_name && (
                    <span>• {activity.branch_name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FaClock className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No recent activities</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;