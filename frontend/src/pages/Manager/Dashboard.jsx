import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCalendarCheck, FaCalendarWeek, FaUsers, FaMoneyBillWave, 
  FaClock, FaExclamationTriangle, FaSpinner, FaUserClock, FaBoxOpen
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    today_appointments: 0,
    week_appointments: 0,
    staff_count: 0,
    today_revenue: 0,
    pending_leave_requests: 0,
    low_stock_alerts: 0
  });

  // ✅ EXACT CONFIG BACKEND EXPECTS (Same as Admin/Inventory)
  const config = { 
    withCredentials: true // <--- THIS IS THE ONLY SECRET
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/manager/dashboard', config);
      
      // Handle nested data structure (APIResponse.data.data or just data)
      const data = response.data?.data || response.data || {};
      
      setDashboardData({
        today_appointments: data.today_appointments || 0,
        week_appointments: data.week_appointments || 0,
        staff_count: data.staff_count || 0,
        today_revenue: data.today_revenue || 0,
        pending_leave_requests: data.pending_leave_requests || 0,
        low_stock_alerts: data.low_stock_alerts || 0
      });
      
    } catch (error) {
      console.error('Dashboard error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(t('manager.dashboard.loadError') || 'Failed to load dashboard data');
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('manager.dashboard.title') || 'Manager Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('manager.dashboard.subtitle') || 'Welcome back! Here is an overview of your branch today.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Today's Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('manager.dashboard.todayAppointments') || "Today's Appointments"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dashboardData.today_appointments}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaCalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Weekly Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('manager.dashboard.weekAppointments') || "This Week's Appointments"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dashboardData.week_appointments}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FaCalendarWeek className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Active Staff */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('manager.dashboard.staffCount') || "Active Staff"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dashboardData.staff_count}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('manager.dashboard.todayRevenue') || "Today's Revenue"}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(dashboardData.today_revenue)}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <FaMoneyBillWave className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('manager.dashboard.pendingLeave') || "Pending Leave"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dashboardData.pending_leave_requests}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <FaUserClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('manager.dashboard.lowStock') || "Low Stock Alerts"}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {dashboardData.low_stock_alerts}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FaExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('manager.dashboard.recentActivity') || 'Recent Activity'}
            </h3>
            <div className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
              {t('manager.dashboard.noActivity') || 'No recent activity to display.'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('manager.dashboard.quickActions') || 'Quick Actions'}
            </h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/manager/appointments')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t('manager.dashboard.viewAppointments') || 'View Appointments'}
              </button>
              <button onClick={() => navigate('/manager/staff')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                {t('manager.dashboard.manageStaff') || 'Manage Staff'}
              </button>
              <button onClick={() => navigate('/manager/inventory')} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                {t('manager.dashboard.checkInventory') || 'Check Inventory'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;