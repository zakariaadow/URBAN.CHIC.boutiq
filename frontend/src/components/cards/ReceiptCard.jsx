// src/components/cards/ReceiptCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaFileInvoice, FaDownload, FaEye, FaPrint,
  FaCalendarDay, FaMoneyBillWave, FaCheckCircle
} from 'react-icons/fa';

const ReceiptCard = ({ 
  receipt, 
  showActions = true,
  onDownload = null,
  onPrint = null,
  className = ''
}) => {
  const { t } = useTranslation();

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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FaFileInvoice className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {receipt.receipt_number || `#${receipt.id}`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <FaCalendarDay className="mr-1" />
              {formatDate(receipt.created_at)}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {receipt.status || 'Paid'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(receipt.amount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Service</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {receipt.service_name || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {receipt.payment_method || 'N/A'}
          </p>
        </div>
        {receipt.customer_name && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {receipt.customer_name}
            </p>
          </div>
        )}
        {receipt.appointment?.service_name && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Appointment</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {receipt.appointment.service_name}
            </p>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onDownload && onDownload(receipt.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <FaDownload className="mr-2" />
            Download
          </button>
          <button
            onClick={() => onPrint && onPrint(receipt.id)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center text-sm"
          >
            <FaPrint className="mr-2" />
            Print
          </button>
          <button
            onClick={() => window.open(`/receipts/${receipt.id}`, '_blank')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm ml-auto"
          >
            <FaEye className="mr-2" />
            View
          </button>
        </div>
      )}
    </div>
  );
};

export default ReceiptCard;