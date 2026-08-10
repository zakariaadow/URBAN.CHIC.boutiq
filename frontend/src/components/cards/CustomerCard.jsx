// src/components/cards/CustomerCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendarDay,
  FaStar, FaEye, FaUserCheck, FaUserTimes
} from 'react-icons/fa';

const CustomerCard = ({ 
  customer, 
  showActions = true,
  onToggleStatus = null,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-2xl font-bold text-purple-500">
            {getInitials(customer.name)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {customer.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <FaEnvelope className="mr-1 text-gray-400" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center">
                  <FaPhone className="mr-1 text-gray-400" />
                  {customer.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          customer.status === 'active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {customer.status || 'inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(customer.created_at)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {customer.appointments_count || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(customer.total_spent || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            {(customer.average_rating || 0).toFixed(1)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Last Visit</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {customer.last_visit ? formatDate(customer.last_visit) : 'N/A'}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => navigate(`/customers/${customer.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <FaEye className="mr-2" />
            View Details
          </button>
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(customer.id, customer.status)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center text-sm ${
                customer.status === 'active'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
              }`}
            >
              {customer.status === 'active' ? (
                <>
                  <FaUserTimes className="mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <FaUserCheck className="mr-2" />
                  Activate
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerCard;