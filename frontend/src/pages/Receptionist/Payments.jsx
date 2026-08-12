import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaMoneyBillWave, FaSearch, FaCreditCard,
  FaCalendarDay, FaUser, FaSpinner, FaCheck,
  FaTimes, FaEye, FaPrint, FaDownload,
  FaChevronLeft, FaChevronRight, FaPhone,
  FaEnvelope, FaBuilding, FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReceptionistPayments = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    total_payments: 0,
    total_revenue: 0,
    pending_amount: 0,
    completed_count: 0,
    pending_count: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter, currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        method: methodFilter !== 'all' ? methodFilter : undefined
      };
      
      const response = await api.get('/api/receptionist/payments', { params });
      
      // Handle different response structures
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      // Transform payment data
      const transformedData = responseData.map(item => ({
        id: item.id,
        reference: item.reference || item.transaction_id || `PAY-${item.id}`,
        customer_name: item.customer?.user?.first_name && item.customer?.user?.last_name 
          ? `${item.customer.user.first_name} ${item.customer.user.last_name}`
          : item.customer_name || 'Guest',
        customer_email: item.customer?.user?.email || item.customer_email || 'N/A',
        customer_phone: item.customer?.user?.phone || item.customer_phone || 'N/A',
        amount: item.amount || item.final_amount || item.total_amount || 0,
        method: item.method || item.payment_method || 'Cash',
        status: item.status || item.payment_status || 'pending',
        reference_number: item.reference_number || item.transaction_id || 'N/A',
        appointment_id: item.appointment_id,
        branch_name: item.branch?.name || item.branch_name || 'N/A',
        notes: item.notes || '',
        created_at: item.created_at || item.payment_date,
        updated_at: item.updated_at
      }));
      
      setPayments(transformedData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || transformedData.length);
      
      // Calculate summary
      const totalRevenue = transformedData.reduce((sum, p) => 
        p.status === 'completed' || p.status === 'paid' ? sum + p.amount : sum, 0
      );
      const pendingAmount = transformedData.reduce((sum, p) => 
        p.status === 'pending' ? sum + p.amount : sum, 0
      );
      
      setSummary({
        total_payments: transformedData.length,
        total_revenue: totalRevenue,
        pending_amount: pendingAmount,
        completed_count: transformedData.filter(p => p.status === 'completed' || p.status === 'paid').length,
        pending_count: transformedData.filter(p => p.status === 'pending').length
      });
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/api/receptionist/payments/${id}/status`, { status });
      toast.success(`Payment ${status} successfully`);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handlePrintReceipt = (paymentId) => {
    window.open(`/api/receptionist/payments/${paymentId}/receipt`, '_blank');
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
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || colors.pending;
  };

  const getMethodIcon = (method) => {
    switch(method?.toLowerCase()) {
      case 'cash': return <FaMoneyBillWave className="text-green-500" />;
      case 'card': return <FaCreditCard className="text-blue-500" />;
      case 'mpesa': return <FaMoneyBillWave className="text-purple-500" />;
      default: return <FaMoneyBillWave className="text-gray-500" />;
    }
  };

  const filteredPayments = Array.isArray(payments) 
    ? payments.filter(payment => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          payment.customer_name?.toLowerCase().includes(search) ||
          payment.reference?.toLowerCase().includes(search) ||
          payment.reference_number?.toLowerCase().includes(search)
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
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all payments ({totalItems} total)
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <FaPrint className="mr-2" /> Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.total_payments}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summary.total_revenue)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(summary.pending_amount)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.completed_count}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments by customer or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mpesa">M-Pesa</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {payment.customer_name}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <FaCreditCard className="mr-2 text-purple-500" />
                      {payment.method || 'Cash'}
                    </div>
                    <div className="flex items-center">
                      <FaCalendarDay className="mr-2 text-blue-500" />
                      {formatDate(payment.created_at)}
                    </div>
                    <div className="flex items-center">
                      <FaUser className="mr-2 text-gray-500" />
                      Ref: {payment.reference}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {payment.customer_email && payment.customer_email !== 'N/A' && (
                      <span className="flex items-center">
                        <FaEnvelope className="mr-1" /> {payment.customer_email}
                      </span>
                    )}
                    {payment.customer_phone && payment.customer_phone !== 'N/A' && (
                      <span className="flex items-center">
                        <FaPhone className="mr-1" /> {payment.customer_phone}
                      </span>
                    )}
                    <span className="flex items-center">
                      <FaBuilding className="mr-1" /> {payment.branch_name}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetails(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handlePrintReceipt(payment.id)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Print Receipt"
                    >
                      <FaPrint />
                    </button>
                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'completed')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                        >
                          <FaCheck className="mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'failed')}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                        >
                          <FaTimes className="mr-1" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaMoneyBillWave className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'No payments match the selected filters'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

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
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Payment Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <FaMoneyBillWave className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedPayment.reference}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Customer</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPayment.customer_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPayment.customer_email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPayment.customer_phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Amount</label>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Payment Method</label>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      {getMethodIcon(selectedPayment.method)}
                      <span className="ml-2">{selectedPayment.method || 'Cash'}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Reference Number</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPayment.reference_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Branch</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPayment.branch_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Date</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedPayment.created_at)}
                    </p>
                  </div>
                </div>

                {selectedPayment.notes && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Notes</label>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-1">
                      {selectedPayment.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrintReceipt(selectedPayment.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaPrint className="mr-2" /> Print Receipt
                </button>
                {selectedPayment.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedPayment.id, 'completed');
                      setShowDetails(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistPayments;