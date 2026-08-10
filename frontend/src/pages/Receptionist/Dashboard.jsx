import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaCalendarCheck, FaUsers, FaClock, FaMoneyBillWave,
  FaUserPlus, FaBell, FaSearch, FaSpinner,
  FaArrowUp, FaArrowDown, FaCut, FaStore,
  FaCheckCircle, FaTimesCircle, FaBuilding
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReceptionistDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingApprovals: 0,
    walkIns: 0,
    totalCustomers: 0,
    todayRevenue: 0,
    totalRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/receptionist/dashboard');
      
      const data = response.data?.data || response.data || {};
      
      // Debug: Log the raw data to see what's coming from the API
      console.log('Raw dashboard data:', data);
      console.log('Today appointments:', data.today_appointments);
      console.log('Pending requests:', data.pending_requests);
      
      setStats({
        todayAppointments: data.total_today || data.todayAppointments || 0,
        pendingApprovals: data.pending_requests?.length || data.pendingApprovals || 0,
        walkIns: data.walk_ins_today || data.walkIns || 0,
        totalCustomers: data.total_customers || data.totalCustomers || 0,
        todayRevenue: data.today_revenue || data.todayRevenue || 0,
        totalRevenue: data.total_revenue || data.totalRevenue || 0
      });
      
      // Get appointment data - use today_appointments from API
      const todayData = data.today_appointments || [];
      const pendingData = data.pending_requests || [];
      
      // Debug: Log the first appointment to see its structure
      if (todayData.length > 0) {
        console.log('First today appointment structure:', todayData[0]);
        console.log('Appointment keys:', Object.keys(todayData[0]));
      }
      
      // SAFE: Extract only primitive values from appointment objects
      const transformedToday = Array.isArray(todayData) ? todayData.map(app => {
        // Debug each appointment
        console.log('Processing appointment:', app);
        
        return {
          id: app.id || 'N/A',
          // Extract customer name safely
          customer_name: app.customer?.user?.first_name && app.customer?.user?.last_name 
            ? `${app.customer.user.first_name} ${app.customer.user.last_name}`
            : app.customer_name || app.customer?.full_name || app.customer?.name || 'Guest',
          // Extract service name safely
          service_name: app.service?.name || app.service_name || 'N/A',
          // Extract branch name safely
          branch_name: app.branch?.name || app.branch_name || 'N/A',
          // Extract status safely
          status: app.status || 'pending',
          // Extract time safely
          appointment_time: app.appointment_time || app.time || 'N/A',
          // Extract date safely
          appointment_date: app.appointment_date || app.date || 'N/A'
        };
      }) : [];
      
      const transformedPending = Array.isArray(pendingData) ? pendingData.map(app => ({
        id: app.id || 'N/A',
        customer_name: app.customer?.user?.first_name && app.customer?.user?.last_name 
          ? `${app.customer.user.first_name} ${app.customer.user.last_name}`
          : app.customer_name || app.customer?.full_name || app.customer?.name || 'Guest',
        service_name: app.service?.name || app.service_name || 'N/A',
        status: app.status || 'pending',
        appointment_date: app.appointment_date || app.date || 'N/A',
        appointment_time: app.appointment_time || app.time || 'N/A'
      })) : [];
      
      // Debug: Log transformed data
      console.log('Transformed today appointments:', transformedToday);
      console.log('Transformed pending requests:', transformedPending);
      
      setRecentAppointments(transformedToday);
      setUpcomingAppointments(transformedPending);
      setUnreadNotifications(data.unread_notifications || data.unreadNotifications || 0);
      
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
      // Set default values on error
      setStats({
        todayAppointments: 0,
        pendingApprovals: 0,
        walkIns: 0,
        totalCustomers: 0,
        todayRevenue: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
      // If it's a full date string, extract time
      if (timeString.includes('T') || timeString.includes(':')) {
        const options = { 
          hour: '2-digit', 
          minute: '2-digit'
        };
        return new Date(timeString).toLocaleTimeString('en-US', options);
      }
      // If it's just time (HH:MM), format it
      return timeString;
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const options = { 
        month: 'short', 
        day: 'numeric'
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
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'in-progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'no-show': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || colors.pending;
  };

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
            Receptionist Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your daily overview
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/receptionist/checkin')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FaUserPlus className="mr-2" /> Check In
          </button>
          <button
            onClick={() => navigate('/receptionist/notifications')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center relative"
          >
            <FaBell className="mr-2" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.todayAppointments}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <FaCalendarCheck className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <FaClock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Walk-ins Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.walkIns}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <FaUserPlus className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(stats.todayRevenue)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <FaMoneyBillWave className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Appointments
            </h2>
            <button
              onClick={() => navigate('/receptionist/appointments')}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {recentAppointments.length > 0 ? (
              recentAppointments.slice(0, 10).map((appointment) => {
                return (
                  <div key={appointment.id || Math.random().toString()} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {/* ✅ Using string value, not object */}
                          <p className="font-medium text-gray-900 dark:text-white">
                            {typeof appointment.customer_name === 'string' ? appointment.customer_name : 'Guest'}
                          </p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status || 'pending'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <FaCut className="mr-1 text-purple-500" />
                            {/* ✅ Using string value, not object */}
                            {typeof appointment.service_name === 'string' ? appointment.service_name : 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <FaBuilding className="mr-1 text-blue-500" />
                            {/* ✅ Using string value, not object */}
                            {typeof appointment.branch_name === 'string' ? appointment.branch_name : 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <FaClock className="mr-1 text-gray-400" />
                            {formatTime(appointment.appointment_time)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/receptionist/appointments/${appointment.id}`)}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <FaCalendarCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No appointments today</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Requests
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {upcomingAppointments.length} pending
            </span>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 10).map((appointment) => {
                return (
                  <div key={appointment.id || Math.random().toString()} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {/* ✅ Using string value, not object */}
                          <p className="font-medium text-gray-900 dark:text-white">
                            {typeof appointment.customer_name === 'string' ? appointment.customer_name : 'Guest'}
                          </p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status || 'pending'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <FaCut className="mr-1 text-purple-500" />
                            {/* ✅ Using string value, not object */}
                            {typeof appointment.service_name === 'string' ? appointment.service_name : 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <FaClock className="mr-1 text-gray-400" />
                            {formatDate(appointment.appointment_date)}
                            {appointment.appointment_time && appointment.appointment_time !== 'N/A' && ` at ${formatTime(appointment.appointment_time)}`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/receptionist/appointments/${appointment.id}`)}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <FaCheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No pending requests</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <button
          onClick={() => navigate('/receptionist/appointments')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaCalendarCheck className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View All Appointments</span>
        </button>
        <button
          onClick={() => navigate('/receptionist/customers')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaUsers className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Customers</span>
        </button>
        <button
          onClick={() => navigate('/receptionist/stylists')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaCut className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Stylists</span>
        </button>
        <button
          onClick={() => navigate('/receptionist/branches')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <FaStore className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Branches</span>
        </button>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;