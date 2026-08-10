// src/components/cards/PaymentCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaCreditCard, FaWallet, FaCheckCircle, FaTimes,
  FaEye, FaDownload, FaCalendarDay, FaMoneyBillWave,
  FaCcVisa, FaCcMastercard, FaPaypal, FaMobileAlt
} from 'react-icons/fa';

const PaymentCard = ({ 
  payment, 
  showActions = true,
  onDownloadReceipt = null,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[status] || colors.pending;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      visa: <FaCcVisa className="text-blue-600" />,
      mastercard: <FaCcMastercard className="text-orange-600" />,
      paypal: <FaPaypal className="text-blue-500" />,
      mpesa: <FaMobileAlt className="text-green-500" />,
      cash: <FaMoneyBillWave className="text-green-600" />
    };
    return icons[method?.toLowerCase()] || <FaWallet />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {payment.appointment?.service_name || payment.service_name || 'Payment'}
            </h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
              {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Pending'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <FaCalendarDay className="mr-2 text-blue-500" />
              {formatDate(payment.created_at)}
            </div>
            <div className="flex items-center">
              {getPaymentMethodIcon(payment.method)}
              <span className="ml-2">{payment.method || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <FaCreditCard className="mr-2 text-purple-500" />
              Ref: {payment.reference || payment.id}
            </div>
            {payment.appointment?.branch_name && (
              <div className="flex items-center">
                <FaWallet className="mr-2 text-green-500" />
                {payment.appointment.branch_name}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(payment.amount)}
            </p>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/payments/${payment.id}`)}
                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                aria-label="View payment"
              >
                <FaEye />
              </button>
              {payment.status === 'completed' && onDownloadReceipt && (
                <button
                  onClick={() => onDownloadReceipt(payment.id)}
                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  aria-label="Download receipt"
                >
                  <FaDownload />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;