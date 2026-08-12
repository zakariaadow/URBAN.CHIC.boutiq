import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaChartLine, FaDownload, FaPrint, FaSpinner,
  FaCalendarDay, FaMoneyBillWave, FaWallet,
  FaFileInvoice, FaChevronLeft, FaChevronRight,
  FaBuilding, FaCut, FaUsers, FaPercent,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinanceReports = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('profit-loss');
  const [period, setPeriod] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [dailySales, setDailySales] = useState(null);
  const [monthlySales, setMonthlySales] = useState(null);
  const [yearlySales, setYearlySales] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      let start = new Date();
      
      if (period === 'today') {
        // Today
      } else if (period === 'week') {
        start.setDate(today.getDate() - 7);
      } else if (period === 'month') {
        start.setMonth(today.getMonth() - 1);
      } else if (period === 'year') {
        start.setFullYear(today.getFullYear() - 1);
      }

      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = today.toISOString().split('T')[0];

      // Fetch all reports in parallel using correct endpoints
      const [
        profitLossRes,
        dailySalesRes,
        monthlySalesRes,
        yearlySalesRes,
        financialSummaryRes
      ] = await Promise.all([
        api.get('/api/finance/reports/profit-loss', {
          params: { start_date: startDateStr, end_date: endDateStr }
        }),
        api.get('/api/finance/sales/daily', {
          params: { date: endDateStr }
        }),
        api.get('/api/finance/sales/monthly', {
          params: { month: today.getMonth() + 1, year: today.getFullYear() }
        }),
        api.get('/api/finance/sales/yearly', {
          params: { year: today.getFullYear() }
        }),
        api.get('/api/finance/reports/summary')
      ]);

      setProfitLoss(profitLossRes.data?.data || {});
      setDailySales(dailySalesRes.data?.data || {});
      setMonthlySales(monthlySalesRes.data?.data || {});
      setYearlySales(yearlySalesRes.data?.data || {});
      setFinancialSummary(financialSummaryRes.data?.data || {});

      // Set the main report data based on selected type
      switch (reportType) {
        case 'profit-loss':
          setReportData(profitLossRes.data?.data || {});
          break;
        case 'daily-sales':
          setReportData(dailySalesRes.data?.data || {});
          break;
        case 'monthly-sales':
          setReportData(monthlySalesRes.data?.data || {});
          break;
        case 'yearly-sales':
          setReportData(yearlySalesRes.data?.data || {});
          break;
        case 'financial-summary':
          setReportData(financialSummaryRes.data?.data || {});
          break;
        default:
          setReportData({});
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
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
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderReportContent = () => {
    if (!reportData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      );
    }

    switch (reportType) {
      case 'profit-loss':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(reportData.revenue || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Expenses</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(reportData.expenses || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Payroll</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(reportData.payroll || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Profit</p>
                <p className={`text-xl font-bold ${(reportData.profit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(reportData.profit || 0)}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {((reportData.profit_margin || 0) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Period: {formatDate(reportData.start_date)} - {formatDate(reportData.end_date)}
              </p>
            </div>
          </div>
        );

      case 'daily-sales':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDate(reportData.date)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(reportData.total_sales || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {reportData.transaction_count || 0}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Transaction</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(reportData.average_transaction || 0)}
              </p>
            </div>
          </div>
        );

      case 'monthly-sales':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Month</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.month}/{reportData.year}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(reportData.total_sales || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {reportData.transaction_count || 0}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Transaction</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(reportData.average_transaction || 0)}
              </p>
            </div>
          </div>
        );

      case 'yearly-sales':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {reportData.year || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(reportData.total_sales || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {reportData.transaction_count || 0}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Transaction</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(reportData.average_transaction || 0)}
              </p>
            </div>
          </div>
        );

      case 'financial-summary':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(reportData.total_revenue || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(reportData.total_expenses || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
                <p className={`text-xl font-bold ${(reportData.net_profit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(reportData.net_profit || 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {reportData.pending_payments || 0}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(reportData.month_revenue || 0)}
              </p>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500 dark:text-gray-400">Select a report type</p>;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and analyze financial reports
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <FaPrint className="mr-2" /> Print
          </button>
          <button
            onClick={() => toast.info('Export feature coming soon')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaDownload className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="profit-loss">Profit & Loss</option>
              <option value="daily-sales">Daily Sales</option>
              <option value="monthly-sales">Monthly Sales</option>
              <option value="yearly-sales">Yearly Sales</option>
              <option value="financial-summary">Financial Summary</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReportData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaChartLine className="mr-2" /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {reportType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </h2>
        {renderReportContent()}
      </div>
    </div>
  );
};

export default FinanceReports;