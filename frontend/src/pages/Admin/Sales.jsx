import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaMoneyBillWave, FaChartLine, FaCalendarDay,
  FaSearch, FaFilter, FaDownload, FaPrint,
  FaSpinner, FaChevronLeft, FaChevronRight,
  FaArrowUp, FaArrowDown, FaBuilding, FaCut,
  FaUser, FaCreditCard, FaFileInvoice,
  FaStore, FaClock, FaTag
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Sales = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalTax: 0,
    growthRate: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('today');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [branches, setBranches] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchSales();
    fetchBranches();
  }, [period, branchFilter, statusFilter, currentPage]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = {
        period,
        branch_id: branchFilter !== 'all' ? branchFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 10
      };
      
      console.log('Fetching sales with params:', params);
      
      // Try to fetch from appointments first (since sales come from appointments)
      let response;
      try {
        response = await api.get('/api/admin/appointments', { ...config, params });
      } catch (error) {
        // Fallback to sales endpoint
        response = await api.get('/api/admin/reports/sales', { ...config, params });
      }
      
      // Handle different response structures
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      // Transform appointment data to sales format
      const transformedData = responseData.map(item => ({
        id: item.id,
        reference: item.reference || item.id,
        customer_name: item.customer?.user?.first_name && item.customer?.user?.last_name 
          ? `${item.customer.user.first_name} ${item.customer.user.last_name}`
          : item.customer_name || 'Guest',
        customer_email: item.customer?.user?.email || item.customer_email,
        service_name: item.service?.name || item.service_name || 'N/A',
        service_category: item.service?.category?.name || 'N/A',
        amount: item.total_amount || item.final_amount || item.amount || 0,
        price: item.service?.price || item.price || 0,
        payment_method: item.payment_method || 'Cash',
        payment_status: item.payment_status || 'completed',
        status: item.status,
        created_at: item.created_at || item.appointment_date,
        appointment_date: item.appointment_date,
        appointment_time: item.appointment_time,
        branch_name: item.branch?.name || item.branch_name || 'N/A',
        stylist_name: item.stylist?.user?.first_name && item.stylist?.user?.last_name
          ? `${item.stylist.user.first_name} ${item.stylist.user.last_name}`
          : item.stylist_name || 'Not assigned'
      }));
      
      setSalesData(transformedData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || transformedData.length);
      
      // Calculate summary from transformed data
      const totalRevenue = transformedData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalOrders = transformedData.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      setSummary({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalTax: totalRevenue * 0.16, // Assuming 16% VAT
        growthRate: 0 // Calculate based on previous period if needed
      });
      
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSalesData([]);
      toast.error(t('admin.sales.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/admin/branches', config);
      const branchesData = response.data?.data || response.data || [];
      setBranches(Array.isArray(branchesData) ? branchesData : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'in-progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'no-show': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || colors.pending;
  };

  // Filter sales by search term
  const filteredSales = Array.isArray(salesData) 
    ? salesData.filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          (item.customer_name || '').toLowerCase().includes(search) ||
          (item.service_name || '').toLowerCase().includes(search) ||
          (item.reference || '').toLowerCase().includes(search) ||
          (item.branch_name || '').toLowerCase().includes(search)
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.sales.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.sales.subtitle')} ({Array.isArray(salesData) ? salesData.length : 0} transactions)
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <FaPrint className="mr-2" /> {t('admin.sales.print')}
          </button>
          <button
            onClick={() => toast.info(t('admin.sales.exportComing'))}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaDownload className="mr-2" /> {t('admin.sales.export')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.sales.totalRevenue')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(summary.totalRevenue)}
          </p>
          {summary.growthRate !== 0 && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${summary.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.growthRate > 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(summary.growthRate)}%
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.sales.totalOrders')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {summary.totalOrders}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.sales.averageOrder')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(summary.averageOrderValue)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.sales.totalTax')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(summary.totalTax)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.sales.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="today">{t('admin.sales.today')}</option>
            <option value="week">{t('admin.sales.week')}</option>
            <option value="month">{t('admin.sales.month')}</option>
            <option value="year">{t('admin.sales.year')}</option>
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('admin.sales.allBranches')}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.invoice')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.branch')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.method')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.sales.status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaFileInvoice className="text-blue-500 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{sale.reference || sale.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <div>
                          <span className="text-gray-900 dark:text-white">
                            {sale.customer_name || 'Guest'}
                          </span>
                          {sale.customer_email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sale.customer_email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaCut className="text-purple-500 mr-2" />
                        <div>
                          <span className="text-gray-900 dark:text-white">
                            {sale.service_name}
                          </span>
                          {sale.service_category && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sale.service_category}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaStore className="text-green-500 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {sale.branch_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FaCalendarDay className="mr-2 text-blue-500" />
                        {formatDate(sale.created_at || sale.appointment_date)}
                      </div>
                      {sale.appointment_time && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {sale.appointment_time}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(sale.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaCreditCard className="text-green-500 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {sale.payment_method || 'Cash'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                        {sale.status || 'completed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <FaMoneyBillWave className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    {t('admin.sales.noSales')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.showing')} {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
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
  );
};

export default Sales;