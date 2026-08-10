import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaChartLine, FaSearch, FaFilter, FaCalendarDay,
  FaSpinner, FaTimes, FaChevronLeft, FaChevronRight,
  FaMoneyBillWave, FaWallet, FaBuilding,
  FaFileInvoice, FaDownload, FaPrint,
  FaArrowUp, FaArrowDown, FaPercent
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinanceProfitLoss = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('all');

  useEffect(() => {
    fetchProfitLoss();
    fetchBranches();
  }, [period, branchFilter]);

  const fetchProfitLoss = async () => {
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
      } else if (period === 'quarter') {
        start.setMonth(today.getMonth() - 3);
      } else if (period === 'year') {
        start.setFullYear(today.getFullYear() - 1);
      }

      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = today.toISOString().split('T')[0];
      
      const params = {
        start_date: startDateStr,
        end_date: endDateStr,
        branch_id: branchFilter !== 'all' ? branchFilter : undefined
      };

      const response = await axios.get('/api/finance/reports/profit-loss', { params });
      setReportData(response.data?.data || {});
      
    } catch (error) {
      console.error('Error fetching profit/loss:', error);
      toast.error('Failed to load profit/loss report');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/finance/branches');
      const data = response.data?.data || response.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
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

  const getProfitColor = (profit) => {
    if (profit > 0) return 'text-green-600 dark:text-green-400';
    if (profit < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
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
            Profit & Loss
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View profit and loss summary
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
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
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchProfitLoss}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaChartLine className="mr-2" /> Update
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(reportData.revenue || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {formatCurrency(reportData.expenses || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Payroll</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(reportData.payroll || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
          <p className={`text-2xl font-bold mt-1 ${getProfitColor(reportData.profit || 0)}`}>
            {formatCurrency(reportData.profit || 0)}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Income Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Services</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.service_revenue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Products</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.product_revenue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Other Income</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.other_income || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total Revenue</span>
              <span className="text-green-600 dark:text-green-400">
                {formatCurrency(reportData.revenue || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Salaries</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.salary_expense || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Rent</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.rent_expense || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Supplies</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.supply_expense || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Marketing</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.marketing_expense || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Utilities</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.utilities_expense || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Other Expenses</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(reportData.other_expense || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total Expenses</span>
              <span className="text-red-600 dark:text-red-400">
                {formatCurrency(reportData.expenses || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Summary */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Gross Profit</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency((reportData.revenue || 0) - (reportData.expenses || 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
            <p className={`text-2xl font-bold ${getProfitColor(reportData.profit || 0)}`}>
              {formatCurrency(reportData.profit || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FaPercent className="mr-2" />
              {((reportData.profit_margin || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          Period: {formatDate(reportData.start_date)} - {formatDate(reportData.end_date)}
        </div>
      </div>
    </div>
  );
};

export default FinanceProfitLoss;