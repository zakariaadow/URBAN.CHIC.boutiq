// src/components/cards/NotificationCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaBell, FaCalendarDay, FaClock, FaCreditCard,
  FaGift, FaCut, FaInfoCircle, FaCheckCircle,
  FaTimes, FaTrash
} from 'react-icons/fa';

const NotificationCard = ({ 
  notification, 
  showActions = true,
  onMarkRead = null,
  onDelete = null,
  className = ''
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
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

  const getIcon = (type) => {
    const icons = {
      appointment: <FaCalendarDay className="text-blue-500" />,
      reminder: <FaClock className="text-yellow-500" />,
      payment: <FaCreditCard className="text-green-500" />,
      promotion: <FaGift className="text-purple-500" />,
      review: <FaCut className="text-pink-500" />,
      system: <FaInfoCircle className="text-gray-500" />,
      success: <FaCheckCircle className="text-green-500" />
    };
    return icons[type] || <FaBell className="text-gray-500" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      appointment: 'border-l-blue-500',
      reminder: 'border-l-yellow-500',
      payment: 'border-l-green-500',
      promotion: 'border-l-purple-500',
      review: 'border-l-pink-500',
      system: 'border-l-gray-500',
      success: 'border-l-green-500'
    };
    return colors[type] || 'border-l-gray-300';
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${getTypeColor(notification.type)} p-4 transition-all hover:shadow-md ${
        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      } ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.is_read && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
              {showActions && (
                <>
                  {onMarkRead && !notification.is_read && (
                    <button
                      onClick={() => onMarkRead(notification.id)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      aria-label="Mark as read"
                    >
                      <FaCheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(notification.id)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      aria-label="Delete notification"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(notification.created_at)}
            </span>
            {!notification.is_read && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                New
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;