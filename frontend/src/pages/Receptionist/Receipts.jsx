import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaFileInvoice, FaSearch, FaDownload, FaPrint,
  FaCalendarDay, FaUser, FaMoneyBillWave,
  FaSpinner, FaEye
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReceptionistReceipts = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/receptionist/receipts', config);
      const data = response.data?.data || response.data || [];
      setReceipts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setReceipts([]);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredReceipts = Array.isArray(receipts) 
    ? receipts.filter(receipt => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          receipt.customer_name?.toLowerCase().includes(search) ||
          receipt.receipt_number?.toLowerCase().includes(search)
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Receipts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all receipts
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReceipts.length > 0 ? (
          filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <FaFileInvoice className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {receipt.receipt_number || `#${receipt.id}`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {receipt.customer_name || 'Customer'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Paid
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(receipt.amount)}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCalendarDay className="mr-2 text-gray-400" />
                  {formatDate(receipt.created_at)}
                </div>
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-2 text-gray-400" />
                  {receipt.payment_method || 'Cash'}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => window.open(`/receipts/${receipt.id}/download`, '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={() => window.open(`/receipts/${receipt.id}`, '_blank')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-sm"
                >
                  <FaEye />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaFileInvoice className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No receipts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No receipts have been generated yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistReceipts;
