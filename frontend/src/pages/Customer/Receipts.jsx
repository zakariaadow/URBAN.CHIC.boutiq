import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaFileInvoice, FaDownload, FaPrint, FaSearch,
  FaChevronLeft, FaChevronRight, FaEye, FaTimes,
  FaCalendarDay, FaMoneyBillWave, FaCheckCircle,
  FaBuilding, FaUser, FaPhone, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Receipts = () => {
  const { t } = useTranslation();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');
  
  // Create a consistent axios config with authorization header
  const getAuthConfig = () => {
    return {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    };
  };

  useEffect(() => {
    fetchReceipts();
  }, [currentPage]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/customer/receipts', {
        ...getAuthConfig(),
        params: { page: currentPage, limit: 10 }
      });
      
      let receiptsData = [];
      if (response.data?.data?.items) {
        receiptsData = response.data.data.items;
      } else if (response.data?.data) {
        receiptsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        receiptsData = response.data;
      }
      
      setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
      
      const total = response.data?.data?.total || response.data?.total || receiptsData.length;
      setTotalPages(Math.ceil(total / 10) || 1);
      
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error(t('receipts.loadError') || 'Failed to load receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Correctly add Authorization header and handle blob response
  const downloadReceipt = async (receiptId) => {
    try {
      // Ensure receiptId is an integer
      const id = parseInt(receiptId, 10);
      if (isNaN(id)) {
        toast.error('Invalid receipt ID');
        return;
      }

      const response = await api.get(`/api/customer/receipts/${id}/download`, {
        ...getAuthConfig(),
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('receipts.downloaded') || 'Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      // Handle 400 or 404 errors gracefully
      if (error.response && error.response.status === 404) {
        toast.error('Receipt download endpoint not found. Please contact support.');
      } else if (error.response && error.response.status === 400) {
        toast.error('Invalid request to download receipt.');
      } else {
        toast.error(error.response?.data?.message || t('receipts.downloadError') || 'Failed to download receipt');
      }
    }
  };

  // FIX: Open print in a new tab with Authorization header passed via URL param (workaround) or just open URL
  const printReceipt = (receiptId) => {
    const id = parseInt(receiptId, 10);
    if (isNaN(id)) {
      toast.error('Invalid receipt ID');
      return;
    }
    // Note: If print endpoint returns HTML, window.open works. 
    // If it returns JSON, we must handle it differently. 
    // We will try to open it.
    window.open(`/api/customer/receipts/${id}/print`, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    try {
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'KES 0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const filteredReceipts = Array.isArray(receipts) ? receipts.filter(receipt => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (receipt.receipt_number || '').toLowerCase().includes(search) ||
      (receipt.customer_name || receipt.customer?.name || '').toLowerCase().includes(search) ||
      (receipt.service_name || '').toLowerCase().includes(search)
    );
  }) : [];

  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('receipts.title') || 'My Receipts'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('receipts.subtitle') || 'View and download your payment receipts'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredReceipts.length} {t('receipts.total') || 'total receipts'}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('receipts.search') || 'Search receipts...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Receipts Grid */}
        {paginatedReceipts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <FaFileInvoice className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {receipt.receipt_number || `#${receipt.id}`}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(receipt.receipt_date || receipt.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {receipt.status || 'Paid'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('receipts.amount') || 'Amount'}</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(receipt.total || receipt.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('receipts.service') || 'Service'}</span>
                      <span className="text-gray-900 dark:text-white">
                        {receipt.service_name || receipt.service?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('receipts.method') || 'Method'}</span>
                      <span className="text-gray-900 dark:text-white">
                        {receipt.payment_method || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setSelectedReceipt(receipt);
                        setShowDetails(true);
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                    >
                      <FaEye className="mr-2" /> {t('common.view') || 'View'}
                    </button>
                    <button
                      onClick={() => downloadReceipt(receipt.id)}
                      className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      <FaDownload className="mr-2" /> {t('common.download') || 'Download'}
                    </button>
                    <button
                      onClick={() => printReceipt(receipt.id)}
                      className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <FaPrint />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaFileInvoice className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('receipts.noReceipts') || 'No receipts found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('receipts.noReceiptsDesc') || 'You don\'t have any receipts yet. Make a payment to generate a receipt.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.showing') || 'Showing'} {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, filteredReceipts.length)} of {filteredReceipts.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Details Modal */}
      {showDetails && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('receipts.details') || 'Receipt Details'}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Receipt Content */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('business.name') || 'Urban Chic Boutique'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('receipts.receipt') || 'Receipt'} #{selectedReceipt.receipt_number || selectedReceipt.id}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{t('receipts.date') || 'Date'}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedReceipt.receipt_date || selectedReceipt.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{t('receipts.status') || 'Status'}</p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {selectedReceipt.status || 'Paid'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">{t('receipts.customer') || 'Customer'}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedReceipt.customer_name || selectedReceipt.customer?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{t('receipts.service') || 'Service'}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedReceipt.service_name || selectedReceipt.service?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{t('receipts.paymentMethod') || 'Payment Method'}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedReceipt.payment_method || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('receipts.total') || 'Total'}
                      </span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(selectedReceipt.total || selectedReceipt.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => downloadReceipt(selectedReceipt.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> {t('receipts.download') || 'Download'}
                </button>
                <button
                  onClick={() => printReceipt(selectedReceipt.id)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <FaPrint className="mr-2" /> {t('receipts.print') || 'Print'}
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;