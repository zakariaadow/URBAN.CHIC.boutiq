import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCreditCard, FaSearch, FaEye, FaSpinner, FaTimes, 
  FaChevronLeft, FaChevronRight, FaCalendarDay, FaUser, 
  FaMoneyBillWave, FaFileInvoice, FaDownload, FaPrint, 
  FaCheckCircle, FaEnvelope, FaSms, FaPrint as FaPrintIcon
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinancePayments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const [summary, setSummary] = useState({
    total_payments: 0,
    total_amount: 0,
    pending_count: 0,
    completed_count: 0
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, methodFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        payment_status: statusFilter !== 'all' ? statusFilter : undefined,
        payment_method: methodFilter !== 'all' ? methodFilter : undefined
      };
      
      const response = await api.get('/api/finance/payments', { ...config, params });
      
      let paymentsData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(paymentsData)) {
        paymentsData = [paymentsData];
      }
      
      setPayments(paymentsData);
      setTotalItems(response.data?.data?.total || response.data?.total || 0);
      setTotalPages(response.data?.data?.pages || response.data?.pages || 1);
      
      const totalAmount = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingCount = paymentsData.filter(p => p.payment_status === 'pending').length;
      const completedCount = paymentsData.filter(p => p.payment_status === 'paid' || p.payment_status === 'completed').length;
      
      setSummary({
        total_payments: paymentsData.length,
        total_amount: totalAmount,
        pending_count: pendingCount,
        completed_count: completedCount
      });
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (id) => {
    try {
      await api.post(`/api/finance/payments/${id}/verify`, {}, config);
      toast.success('Payment verified successfully');
      fetchPayments();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const handleGenerateReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/api/finance/payments/${paymentId}/receipt`, config);
      const receipt = response.data?.data || response.data;
      if (receipt && receipt.id) {
        setReceiptData(receipt);
        setShowReceiptModal(true);
        toast.success('Receipt generated successfully');
      } else {
        toast.error('Failed to generate receipt: Invalid response');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to generate receipt');
    }
  };

  // ✅ FINANCE SENDS EMAIL - Backend handles PDF generation & attachment
  const handleSendReceiptEmail = async (receiptId) => {
    if (!receiptId) {
      toast.error('No receipt ID found');
      return;
    }
    setSendingReceipt(true);
    try {
      const response = await api.post(`/api/receipts/${receiptId}/email`, {}, config);
      toast.success(response.data?.message || 'Receipt sent to customer via email!');
    } catch (error) {
      console.error('Error sending receipt email:', error);
      toast.error(error.response?.data?.message || 'Failed to send receipt via email');
    } finally {
      setSendingReceipt(false);
    }
  };

  // ✅ FINANCE SENDS SMS - Backend handles PDF generation & attachment if SMS supports it
  const handleSendReceiptSMS = async (receiptId) => {
    if (!receiptId) {
      toast.error('No receipt ID found');
      return;
    }
    setSendingReceipt(true);
    try {
      const response = await api.post(`/api/receipts/${receiptId}/sms`, {}, config);
      toast.success(response.data?.message || 'Receipt sent to customer via SMS!');
    } catch (error) {
      console.error('Error sending receipt SMS:', error);
      toast.error(error.response?.data?.message || 'Failed to send receipt via SMS');
    } finally {
      setSendingReceipt(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
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
      default: return <FaCreditCard className="text-gray-500" />;
    }
  };

  const filteredPayments = Array.isArray(payments)
    ? payments.filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          (item.customer_name || '').toLowerCase().includes(search) ||
          (item.reference_number || '').toLowerCase().includes(search) ||
          (item.transaction_id || '').toLowerCase().includes(search)
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all payments ({totalItems} records)</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary.total_payments}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(summary.total_amount)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{summary.completed_count}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{summary.pending_count}</p>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mpesa">M-Pesa</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{payment.reference_number || payment.id}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{payment.customer_name || 'Guest'}</td>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">{formatCurrency(payment.amount || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.payment_status)}`}>
                      {payment.payment_status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedPayment(payment); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800" title="View"><FaEye /></button>
                      {payment.payment_status === 'pending' && <button onClick={() => handleVerifyPayment(payment.id)} className="p-1 text-green-600 hover:text-green-800" title="Verify"><FaCheckCircle /></button>}
                      {payment.payment_status === 'paid' && <button onClick={() => handleGenerateReceipt(payment.id)} className="p-1 text-purple-600 hover:text-purple-800" title="Receipt"><FaFileInvoice /></button>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No payment records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL - NO DOWNLOAD BUTTON */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReceiptModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt</h2>
              <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><FaTimes className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Receipt No:</label><p className="font-medium text-gray-900 mt-1">{receiptData.receipt_number || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Customer:</label><p className="font-medium text-gray-900 mt-1">{receiptData.customer_name || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-500">Date:</label><p className="font-medium text-gray-900 mt-1">{formatDate(receiptData.receipt_date)}</p></div>
                <div><label className="text-sm text-gray-500">Amount:</label><p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(receiptData.amount_paid || receiptData.total || 0)}</p></div>
              </div>
            </div>

            {/* ✅ ACTIONS: ONLY SEND TO CUSTOMER & PRINT. NO DOWNLOAD! */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleSendReceiptEmail(receiptData.id)} disabled={sendingReceipt} className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center">
                {sendingReceipt ? <FaSpinner className="animate-spin mr-2" /> : <FaEnvelope className="mr-2" />}
                {sendingReceipt ? 'Sending...' : 'Send Email'}
              </button>
              <button onClick={() => handleSendReceiptSMS(receiptData.id)} disabled={sendingReceipt} className="flex-1 min-w-[120px] px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center">
                {sendingReceipt ? <FaSpinner className="animate-spin mr-2" /> : <FaSms className="mr-2" />}
                {sendingReceipt ? 'Sending...' : 'Send SMS'}
              </button>
              <button onClick={handlePrintReceipt} className="flex-1 min-w-[120px] px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center">
                <FaPrintIcon className="mr-2" /> Print
              </button>
            </div>

            <div className="mt-4 text-center">
              <button onClick={() => setShowReceiptModal(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePayments;