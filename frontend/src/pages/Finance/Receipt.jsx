// src/pages/finance/Receipt.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FaFileInvoice, FaDownload, FaPrint, FaEnvelope, 
  FaSearch, FaEye, FaSpinner, FaCalendarAlt,
  FaUser, FaPhone, FaMoneyBillWave, FaCheckCircle,
  FaTimes, FaCreditCard, FaMobile, FaBank, FaArrowLeft
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';

const FinanceReceipt = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [stats, setStats] = useState({
    total_receipts: 0,
    total_amount: 0,
    today_receipts: 0,
    today_amount: 0,
    emailed_count: 0
  });
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    fetchReceipts();
    fetchStats();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/receipts');
      const data = response.data?.data?.items || response.data?.data || [];
      setReceipts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/receipts/stats');
      const data = response.data?.data || {};
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const handleDownloadReceipt = async (receiptId) => {
    try {
      const response = await api.get(`/receipts/${receiptId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open('', '_blank');
    const content = generateReceiptHTML(receipt);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleEmailReceipt = async (receiptId) => {
    setEmailing(true);
    try {
      await api.post(`/receipts/${receiptId}/email`);
      toast.success('Receipt emailed successfully');
      fetchReceipts();
    } catch (error) {
      console.error('Error emailing receipt:', error);
      toast.error('Failed to email receipt');
    } finally {
      setEmailing(false);
    }
  };

  const generateReceiptHTML = (receipt) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${receipt.receipt_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #8B4513; padding-bottom: 20px; }
          .business-name { font-size: 24px; font-weight: bold; color: #8B4513; }
          .receipt-title { font-size: 20px; margin: 20px 0; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .table th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
          .table td { padding: 10px; border: 1px solid #ddd; }
          .total-row { font-weight: bold; background: #f9f9f9; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #8B4513; font-size: 12px; color: #666; }
          .status-paid { color: green; font-weight: bold; }
          .amount { font-size: 18px; font-weight: bold; color: #8B4513; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-name">URBAN.CHIC.BOUTIQUE</div>
          <div>Beauty Salon & Spa</div>
          <div style="font-size: 12px; color: #666;">${receipt.business_details?.address || 'Moi Avenue, Nairobi, Kenya'}</div>
          <div style="font-size: 12px; color: #666;">${receipt.business_details?.phone || '+254 700 123 456'}</div>
        </div>
        
        <div class="receipt-title">PAYMENT RECEIPT</div>
        
        <div class="section">
          <div class="row"><span><strong>Receipt No:</strong></span><span>${receipt.receipt_number}</span></div>
          <div class="row"><span><strong>Date:</strong></span><span>${moment(receipt.receipt_date).format('DD MMM YYYY, HH:mm')}</span></div>
          <div class="row"><span><strong>Payment ID:</strong></span><span>${receipt.payment_id || 'N/A'}</span></div>
        </div>
        
        <div class="section">
          <div class="section-title">CUSTOMER DETAILS</div>
          <div class="row"><span>Name:</span><span>${receipt.customer_details?.name || 'N/A'}</span></div>
          <div class="row"><span>Customer ID:</span><span>${receipt.customer_details?.customer_id || 'N/A'}</span></div>
          <div class="row"><span>Phone:</span><span>${receipt.customer_details?.phone || 'N/A'}</span></div>
          <div class="row"><span>Email:</span><span>${receipt.customer_details?.email || 'N/A'}</span></div>
        </div>
        
        <div class="section">
          <div class="section-title">SERVICES</div>
          <table class="table">
            <thead>
              <tr><th>#</th><th>Service</th><th>Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th></tr>
            </thead>
            <tbody>
              ${receipt.items?.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name || 'Service'}</td>
                  <td>${item.quantity || 1}</td>
                  <td style="text-align:right;">KES ${(item.unit_price || 0).toFixed(2)}</td>
                  <td style="text-align:right;">KES ${(item.total || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"></td>
                <td style="text-align:right;"><strong>Subtotal</strong></td>
                <td style="text-align:right;">KES ${(receipt.subtotal || 0).toFixed(2)}</td>
              </tr>
              ${receipt.discount > 0 ? `
                <tr>
                  <td colspan="3"></td>
                  <td style="text-align:right;"><strong>Discount</strong></td>
                  <td style="text-align:right;">-KES ${(receipt.discount || 0).toFixed(2)}</td>
                </tr>
              ` : ''}
              ${receipt.tax > 0 ? `
                <tr>
                  <td colspan="3"></td>
                  <td style="text-align:right;"><strong>Tax (16%)</strong></td>
                  <td style="text-align:right;">KES ${(receipt.tax || 0).toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr style="font-size: 16px;">
                <td colspan="3"></td>
                <td style="text-align:right;"><strong>TOTAL PAID</strong></td>
                <td style="text-align:right;"><strong>KES ${(receipt.total || 0).toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">PAYMENT INFORMATION</div>
          <div class="row"><span>Payment Method:</span><span>${receipt.payment_method || 'N/A'}</span></div>
          <div class="row"><span>Transaction ID:</span><span>${receipt.transaction_id || 'N/A'}</span></div>
          <div class="row"><span>Status:</span><span class="status-paid">PAID</span></div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for choosing URBAN.CHIC.BOUTIQUE!</strong></p>
          <p>We appreciate your visit and look forward to serving you again.</p>
          <p style="margin-top: 10px;">
            ${receipt.business_details?.phone || '+254 700 123 456'} | 
            ${receipt.business_details?.email || 'info@urbanchicboutique.com'} | 
            ${receipt.business_details?.website || 'www.urbanchicboutique.com'}
          </p>
        </div>
      </body>
      </html>
    `;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'cash': <FaMoneyBillWave className="text-green-500" />,
      'card': <FaCreditCard className="text-blue-500" />,
      'mobile_money': <FaMobile className="text-purple-500" />,
      'bank_transfer': <FaBank className="text-orange-500" />
    };
    return icons[method] || <FaMoneyBillWave className="text-gray-500" />;
  };

  const formatCurrency = (amount) => {
    return `KES ${(amount || 0).toFixed(2)}`;
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      (receipt.receipt_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.customer_details?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.customer_details?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'emailed' && receipt.is_emailed) ||
      (filterStatus === 'printed' && receipt.is_printed);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Receipts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all payment receipts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => navigate('/finance')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Receipts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_receipts || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_amount)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Today's Receipts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.today_receipts || 0}</p>
          <p className="text-sm text-gray-500">{formatCurrency(stats.today_amount)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Emailed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.emailed_count || 0}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search receipts by number, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Receipts</option>
            <option value="emailed">Emailed</option>
            <option value="printed">Printed</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Receipt No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {receipt.receipt_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {receipt.customer_details?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {receipt.customer_details?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {moment(receipt.receipt_date).format('DD MMM YYYY, HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(receipt.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(receipt.payment_method)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {receipt.payment_method?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {receipt.is_emailed && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            Emailed
                          </span>
                        )}
                        {receipt.is_printed && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Printed
                          </span>
                        )}
                        {!receipt.is_emailed && !receipt.is_printed && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(receipt.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(receipt)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Print"
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => handleEmailReceipt(receipt.id)}
                          disabled={emailing}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Email Receipt"
                        >
                          {emailing ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FaFileInvoice className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No receipts found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Receipt Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {/* Receipt Content */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center border-b-2 border-purple-600 pb-4">
                  <h2 className="text-2xl font-bold text-purple-600">URBAN.CHIC.BOUTIQUE</h2>
                  <p className="text-gray-500">Beauty Salon & Spa</p>
                  <p className="text-sm text-gray-400">Moi Avenue, Nairobi, Kenya</p>
                  <p className="text-sm text-gray-400">+254 700 123 456</p>
                </div>
                
                <div className="my-6">
                  <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-white">PAYMENT RECEIPT</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p><strong>Receipt No:</strong> {selectedReceipt.receipt_number}</p>
                    <p><strong>Date:</strong> {moment(selectedReceipt.receipt_date).format('DD MMM YYYY, HH:mm')}</p>
                  </div>
                  <div>
                    <p><strong>Payment ID:</strong> {selectedReceipt.payment_id || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className="text-green-600 font-semibold">PAID</span></p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1">CUSTOMER DETAILS</h4>
                  <p><strong>Name:</strong> {selectedReceipt.customer_details?.name || 'N/A'}</p>
                  <p><strong>Customer ID:</strong> {selectedReceipt.customer_details?.customer_id || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedReceipt.customer_details?.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedReceipt.customer_details?.email || 'N/A'}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1">SERVICES</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left text-sm">#</th>
                        <th className="px-4 py-2 text-left text-sm">Service</th>
                        <th className="px-4 py-2 text-center text-sm">Qty</th>
                        <th className="px-4 py-2 text-right text-sm">Unit Price</th>
                        <th className="px-4 py-2 text-right text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReceipt.items?.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-4 py-2 text-sm">{index + 1}</td>
                          <td className="px-4 py-2 text-sm">{item.name || 'Service'}</td>
                          <td className="px-4 py-2 text-sm text-center">{item.quantity || 1}</td>
                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.total || 0)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                        <td colSpan="3"></td>
                        <td className="px-4 py-2 text-sm font-semibold text-right">Subtotal</td>
                        <td className="px-4 py-2 text-sm font-semibold text-right">{formatCurrency(selectedReceipt.subtotal)}</td>
                      </tr>
                      {selectedReceipt.discount > 0 && (
                        <tr>
                          <td colSpan="3"></td>
                          <td className="px-4 py-2 text-sm text-right">Discount</td>
                          <td className="px-4 py-2 text-sm text-right text-red-600">-{formatCurrency(selectedReceipt.discount)}</td>
                        </tr>
                      )}
                      {selectedReceipt.tax > 0 && (
                        <tr>
                          <td colSpan="3"></td>
                          <td className="px-4 py-2 text-sm text-right">Tax (16%)</td>
                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(selectedReceipt.tax)}</td>
                        </tr>
                      )}
                      <tr className="bg-purple-50 dark:bg-purple-900/20">
                        <td colSpan="3"></td>
                        <td className="px-4 py-3 text-sm font-bold text-right">TOTAL PAID</td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-purple-600">
                          {formatCurrency(selectedReceipt.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1">PAYMENT INFORMATION</h4>
                  <p><strong>Payment Method:</strong> {selectedReceipt.payment_method || 'N/A'}</p>
                  <p><strong>Transaction ID:</strong> {selectedReceipt.transaction_id || 'N/A'}</p>
                </div>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t-2 border-purple-600 pt-4 mt-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Thank you for choosing URBAN.CHIC.BOUTIQUE!</p>
                  <p>We appreciate your visit and look forward to serving you again.</p>
                  <p className="mt-2">
                    {selectedReceipt.business_details?.phone || '+254 700 123 456'} | 
                    {selectedReceipt.business_details?.email || 'info@urbanchicboutique.com'} | 
                    {selectedReceipt.business_details?.website || 'www.urbanchicboutique.com'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => handleDownloadReceipt(selectedReceipt.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <FaDownload className="mr-2" /> Download PDF
              </button>
              <button
                onClick={() => handlePrintReceipt(selectedReceipt)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <FaPrint className="mr-2" /> Print
              </button>
              <button
                onClick={() => handleEmailReceipt(selectedReceipt.id)}
                disabled={emailing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
              >
                {emailing ? <FaSpinner className="animate-spin mr-2" /> : <FaEnvelope className="mr-2" />}
                Email
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReceipt;