// src/components/cards/AppointmentCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaCalendarDay, FaClock, FaUser, FaCut, 
  FaStore, FaEye, FaTimes, FaCheckCircle
} from 'react-icons/fa';

const AppointmentCard = ({ 
  appointment, 
  showActions = true,
  onCancel = null,
  onReschedule = null,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'in-progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'no-show': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaTimes className="text-red-500" />;
      case 'in-progress': return <FaClock className="text-purple-500" />;
      case 'confirmed': return <FaCheckCircle className="text-blue-500" />;
      default: return <FaClock className="text-yellow-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {appointment.service_name || appointment.service?.name}
            </h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Pending'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <FaCalendarDay className="mr-2 text-blue-500" />
              {formatDate(appointment.date_time)}
            </div>
            <div className="flex items-center">
              <FaStore className="mr-2 text-green-500" />
              {appointment.branch_name || appointment.branch?.name}
            </div>
            <div className="flex items-center">
              <FaUser className="mr-2 text-purple-500" />
              {appointment.stylist_name || appointment.stylist?.name || 'Not assigned'}
            </div>
            <div className="flex items-center">
              <FaCut className="mr-2 text-pink-500" />
              {appointment.duration || appointment.duration_minutes || 'N/A'} min
            </div>
          </div>
          
          {appointment.notes && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              📝 {appointment.notes}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => navigate(`/appointments/${appointment.id}`)}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            aria-label="View details"
          >
            <FaEye />
          </button>
          
          {(appointment.status === 'pending' || appointment.status === 'confirmed') && showActions && (
            <>
              {onCancel && (
                <button
                  onClick={() => onCancel(appointment.id)}
                  className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Cancel
                </button>
              )}
              {onReschedule && (
                <button
                  onClick={() => onReschedule(appointment.id)}
                  className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Reschedule
                </button>
              )}
            </>
          )}
          
          {appointment.status === 'completed' && (
            <button
              onClick={() => navigate(`/reviews/new?appointment=${appointment.id}`)}
              className="px-3 py-1.5 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
            >
              Write Review
            </button>
          )}
        </div>
      </div>
      
      {/* Price */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formatCurrency(appointment.price)}
        </span>
      </div>
    </div>
  );
};

export default AppointmentCard;