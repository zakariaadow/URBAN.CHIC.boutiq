import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCreditCard, FaMoneyBillWave, FaMobileAlt,
  FaUniversity, FaSearch, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaTimesCircle, FaClock, FaEye,
  FaDownload, FaSpinner,
  FaTimes, FaWallet
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Payments = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    amount: 0,
    payment_id: null
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPayments();
    fetchPaymentMethods();
  }, [currentPage, filterStatus]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/customer/payments', {
        ...config,
        params: { 
          page: currentPage, 
          limit: 10,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      
      let paymentsData = [];
      if (response.data?.data?.items) {
        paymentsData = response.data.data.items;
      } else if (response.data?.data) {
        paymentsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        paymentsData = response.data;
      }
      
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setTotalPages(response.data?.data?.pages || response.data?.pages || 1);
      setTotalCount(response.data?.data?.total || response.data?.total || 0);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      toast.error(t('payments.loadError') || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/api/customer/payments/methods', config);
      
      // Handle different response formats
      let methods = [];
      if (response.data?.data) {
        methods = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        methods = response.data;
      }
      
      // If methods is empty or not an array, use default methods as objects
      if (!Array.isArray(methods) || methods.length === 0) {
        methods = [
          { id: 'cash', name: 'Cash', icon: 'cash' },
          { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
          { id: 'mobile_money', name: 'Mobile Money', icon: 'mobile' },
          { id: 'bank_transfer', name: 'Bank Transfer', icon: 'bank' }
        ];
      }
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to default payment methods as objects
      setPaymentMethods([
        { id: 'cash', name: 'Cash', icon: 'cash' },
        { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
        { id: 'mobile_money', name: 'Mobile Money', icon: 'mobile' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: 'bank' }
      ]);
    }
  };

  const handlePayNow = (payment) => {
    setPaymentData({
      payment_method: '',
      amount: payment.amount || 0,
      payment_id: payment.id
    });
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!paymentData.payment_method) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessingPayment(paymentData.payment_id);
    try {
      const response = await api.post(
        `/api/customer/payments/${paymentData.payment_id}/pay`,
        {
          payment_method: paymentData.payment_method,
          amount: paymentData.amount
        },
        config
      );

      toast.success('Payment completed successfully!');
      setShowPaymentModal(false);
      setPaymentData({
        payment_method: '',
        amount: 0,
        payment_id: null
      });
      fetchPayments();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'paid': { icon: <FaCheckCircle className="text-green-500" />, label: 'Paid', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'completed': { icon: <FaCheckCircle className="text-green-500" />, label: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'pending': { icon: <FaClock className="text-yellow-500" />, label: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      'failed': { icon: <FaTimesCircle className="text-red-500" />, label: 'Failed', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      'refunded': { icon: <FaTimesCircle className="text-gray-500" />, label: 'Refunded', class: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const getPaymentMethodIcon = (method) => {
    const methodMap = {
      'cash': <FaMoneyBillWave className="text-green-500" />,
      'card': <FaCreditCard className="text-blue-500" />,
      'mobile_money': <FaMobileAlt className="text-purple-500" />,
      'bank_transfer': <FaUniversity className="text-indigo-500" />
    };
    return methodMap[method] || <FaCreditCard className="text-gray-500" />;
  };

  const getPaymentMethodName = (method) => {
    const nameMap = {
      'cash': 'Cash',
      'card': 'Card',
      'mobile_money': 'Mobile Money',
      'bank_transfer': 'Bank Transfer',
      'm-pesa': 'M-Pesa',
      'mpesa': 'M-Pesa'
    };
    return nameMap[method] || method?.replace('_', ' ') || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/api/customer/payments/${paymentId}/receipt`, {
        ...config,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const filteredPayments = Array.isArray(payments) ? payments.filter(payment => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (payment.reference_number || '').toLowerCase().includes(search) ||
      (payment.payment_method || '').toLowerCase().includes(search) ||
      (payment.status || '').toLowerCase().includes(search)
    );
  }) : [];

  const pendingPayments = filteredPayments.filter(p => 
    p.payment_status === 'pending' || p.status === 'pending'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your payment history
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {paymentMethods.map((method) => {
              // Handle both string and object payment methods
              const methodId = typeof method === 'string' ? method : method.id || method.name;
              const methodName = typeof method === 'string' ? method : method.name || method.id;
              
              return (
                <span 
                  key={methodId} 
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-2 border border-gray-200 dark:border-gray-700"
                >
                  {getPaymentMethodIcon(methodId)}
                  {getPaymentMethodName(methodId)}
                </span>
              );
            })}
          </div>
        )}

        {/* Pending Payments Alert */}
        {pendingPayments.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <FaClock className="text-yellow-600 dark:text-yellow-400 text-lg" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  You have {pendingPayments.length} pending payment(s)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payments Grid */}
        {filteredPayments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map((payment) => {
              const status = getStatusBadge(payment.payment_status || payment.status);
              const isPending = payment.payment_status === 'pending' || payment.status === 'pending';
              
              return (
                <div
                  key={payment.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {payment.reference_number || `#${payment.id}`}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(payment.payment_date || payment.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${status.class}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Amount</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Method</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {getPaymentMethodName(payment.payment_method)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetails(true);
                        }}
                        className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        <FaEye className="mr-2" /> View
                      </button>
                      {isPending ? (
                        <button
                          onClick={() => handlePayNow(payment)}
                          className="flex-1 px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
                        >
                          <FaWallet className="mr-2" /> Pay Now
                        </button>
                      ) : (
                        payment.payment_status === 'paid' && (
                          <button
                            onClick={() => downloadReceipt(payment.id)}
                            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <FaDownload className="mr-2" /> Receipt
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your payments will appear here
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCount)} of {totalCount}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {currentPage} / {totalPages}
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

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPayment.reference_number || `#${selectedPayment.id}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedPayment.payment_date || selectedPayment.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPayment.payment_status || selectedPayment.status || 'pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Method</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {getPaymentMethodName(selectedPayment.payment_method)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {(selectedPayment.payment_status === 'pending' || selectedPayment.status === 'pending') && (
                  <button
                    onClick={() => {
                      handlePayNow(selectedPayment);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
                  >
                    <FaWallet className="mr-2" /> Pay Now
                  </button>
                )}
                {selectedPayment.payment_status === 'paid' && (
                  <button
                    onClick={() => downloadReceipt(selectedPayment.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download Receipt
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Complete Payment
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedPayment.amount || 0)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const methodId = typeof method === 'string' ? method : method.id || method.name;
                      const methodName = typeof method === 'string' ? method : method.name || method.id;
                      
                      return (
                        <button
                          key={methodId}
                          onClick={() => setPaymentData({ ...paymentData, payment_method: methodId })}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            paymentData.payment_method === methodId
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {getPaymentMethodIcon(methodId)}
                            <span className="text-sm capitalize">{getPaymentMethodName(methodId)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={!paymentData.payment_method || processingPayment}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processingPayment ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaWallet className="mr-2" /> Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
