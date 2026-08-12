import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaMoneyBillWave, FaChartLine, FaWallet, FaCreditCard,
  FaSpinner, FaArrowUp, FaArrowDown, FaCalendarDay,
  FaUsers, FaCut, FaStore, FaFileInvoice,
  FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinanceDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    month_revenue: 0,
    month_expenses: 0,
    month_profit: 0,
    pending_payments: 0,
    pending_payroll: 0,
    today_revenue: 0,
    total_expenses: 0,
    net_profit: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recentPayroll, setRecentPayroll] = useState([]);
  const [recentCommissions, setRecentCommissions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data from finance endpoint
      const response = await api.get('/api/finance/dashboard');
      const data = response.data?.data || {};
      
      // Fetch financial summary
      let summaryData = {};
      try {
        const summaryRes = await api.get('/api/finance/reports/summary');
        summaryData = summaryRes.data?.data || {};
      } catch (e) {
        console.log('Summary endpoint not available');
      }
      
      // Fetch recent expenses
      let expensesData = [];
      try {
        const expensesRes = await api.get('/api/finance/expenses', {
          params: { limit: 5 }
        });
        expensesData = expensesRes.data?.data?.items || expensesRes.data?.data || [];
      } catch (e) {
        console.log('Expenses endpoint not available');
      }
      
      // Fetch recent payroll
      let payrollData = [];
      try {
        const payrollRes = await api.get('/api/finance/payroll', {
          params: { limit: 5 }
        });
        payrollData = payrollRes.data?.data?.items || payrollRes.data?.data || [];
      } catch (e) {
        console.log('Payroll endpoint not available');
      }
      
      // Fetch recent commissions
      let commissionsData = [];
      try {
        const commissionsRes = await api.get('/api/finance/commissions', {
          params: { limit: 5 }
        });
        commissionsData = commissionsRes.data?.data?.items || commissionsRes.data?.data || [];
      } catch (e) {
        console.log('Commissions endpoint not available');
      }

      setStats({
        month_revenue: data.month_revenue || summaryData.month_revenue || 0,
        month_expenses: data.month_expenses || summaryData.total_expenses || 0,
        month_profit: data.month_profit || summaryData.net_profit || 0,
        pending_payments: data.pending_payments || summaryData.pending_payments || 0,
        pending_payroll: data.pending_payroll || 0,
        today_revenue: data.today_revenue || 0,
        total_expenses: summaryData.total_expenses || 0,
        net_profit: summaryData.net_profit || 0
      });

      setRecentExpenses(Array.isArray(expensesData) ? expensesData.slice(0, 5) : []);
      setRecentPayroll(Array.isArray(payrollData) ? payrollData.slice(0, 5) : []);
      setRecentCommissions(Array.isArray(commissionsData) ? commissionsData.slice(0, 5) : []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isProfit = stats.month_profit > 0;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Finance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of financial performance
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/finance/expenses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaFileInvoice className="mr-2" /> View Expenses
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(stats.month_revenue)}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <FaMoneyBillWave className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(stats.month_expenses)}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <FaWallet className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Profit</p>
              <p className={`text-2xl font-bold mt-1 ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(stats.month_profit)}
              </p>
            </div>
            <div className={`p-3 ${isProfit ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} rounded-xl`}>
              <FaChartLine className={`w-6 h-6 ${isProfit ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payroll</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {stats.pending_payroll}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <FaUsers className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Expenses
            </h2>
            <button
              onClick={() => navigate('/finance/expenses')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.category || 'Expense'}
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${expense.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {expense.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {expense.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(expense.expense_date)} • {expense.branch?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(expense.amount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recent expenses</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payroll */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Payroll
            </h2>
            <button
              onClick={() => navigate('/finance/payroll')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {recentPayroll.length > 0 ? (
              recentPayroll.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {record.employee?.full_name || 'Employee'}
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${record.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {record.payment_status || 'pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {record.employee_type || 'Staff'} • {formatDate(record.pay_period_start)} - {formatDate(record.pay_period_end)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(record.net_pay || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No payroll records</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <button
          onClick={() => navigate('/finance/expenses')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaWallet className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expenses</span>
        </button>
        <button
          onClick={() => navigate('/finance/payroll')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaUsers className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payroll</span>
        </button>
        <button
          onClick={() => navigate('/finance/commissions')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaCut className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Commissions</span>
        </button>
        <button
          onClick={() => navigate('/finance/reports')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaChartLine className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reports</span>
        </button>
      </div>
    </div>
  );
};

export default FinanceDashboard;