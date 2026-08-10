import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarCheck, 
  FaClock, 
  FaStar, 
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowRight,
  FaBell,
  FaCalendarAlt,
  FaTag,
  FaChartLine,
  FaDollarSign,
  FaTools,
  FaAward,
  FaCoffee,
  FaUserCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const StylistDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stylist: {},
    today_appointments: [],
    upcoming_appointments: [],
    stats: {}
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/stylist/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setDashboardData(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to load dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: FaClock },
      confirmed: { color: 'bg-blue-100 text-blue-700', icon: FaCheckCircle },
      'in-progress': { color: 'bg-purple-100 text-purple-700', icon: FaClock },
      completed: { color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
      'no-show': { color: 'bg-gray-100 text-gray-700', icon: FaTimesCircle }
    };
    const info = statusMap[status] || statusMap.pending;
    const Icon = info.icon;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${info.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const statCards = [
    {
      title: "Today's Appointments",
      value: dashboardData.today_appointments?.length || 0,
      subtitle: `${dashboardData.stats?.total_appointments || 0} total appointments`,
      icon: FaCalendarCheck,
      color: 'bg-blue-500',
      path: '/stylist/appointments'
    },
    {
      title: "Total Revenue",
      value: `Ksh ${(dashboardData.stats?.total_revenue || 0).toLocaleString()}`,
      subtitle: `Ksh ${(dashboardData.stats?.today_revenue || 0).toLocaleString()} today`,
      icon: FaMoneyBillWave,
      color: 'bg-green-500',
      path: '/stylist/earnings'
    },
    {
      title: "Rating",
      value: (dashboardData.stats?.avg_rating || 0).toFixed(1),
      subtitle: `${dashboardData.stats?.completed_appointments || 0} completed services`,
      icon: FaStar,
      color: 'bg-yellow-500',
      path: '/stylist/performance'
    },
    {
      title: "Pending Commission",
      value: `Ksh ${(dashboardData.stats?.pending_commission || 0).toLocaleString()}`,
      subtitle: `${dashboardData.stats?.pending_leave || 0} pending leave requests`,
      icon: FaDollarSign,
      color: 'bg-purple-500',
      path: '/stylist/commissions'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {dashboardData.stylist?.user?.first_name?.charAt(0) || 'S'}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">
                Welcome back, {dashboardData.stylist?.user?.first_name || 'Stylist'}!
              </h1>
              <div className="flex items-center gap-3 mt-1 text-blue-100">
                <span className="flex items-center">
                  <FaTools className="mr-1" /> {dashboardData.stylist?.specialization || 'Beautician'}
                </span>
                <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                <span className="flex items-center">
                  <FaAward className="mr-1" /> {dashboardData.stylist?.experience_years || 0} years experience
                </span>
                <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                <span className="flex items-center">
                  <FaStar className="mr-1 text-yellow-300" /> {(dashboardData.stylist?.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-lg text-sm flex items-center ${dashboardData.stylist?.is_available ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${dashboardData.stylist?.is_available ? 'bg-green-300' : 'bg-red-300'}`}></span>
              {dashboardData.stylist?.is_available ? 'Available' : 'Unavailable'}
            </span>
            <span className="px-4 py-2 bg-blue-400/30 rounded-lg text-sm flex items-center">
              <FaCalendarAlt className="mr-2" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.path && navigate(stat.path)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => navigate('/stylist/appointments')}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-center"
        >
          <FaCalendarCheck className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Appointments</span>
        </button>
        <button
          onClick={() => navigate('/stylist/schedule')}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-center"
        >
          <FaClock className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</span>
        </button>
        <button
          onClick={() => navigate('/stylist/earnings')}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-center"
        >
          <FaMoneyBillWave className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Earnings</span>
        </button>
        <button
          onClick={() => navigate('/stylist/commissions')}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-center"
        >
          <FaDollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Commissions</span>
        </button>
        <button
          onClick={() => navigate('/stylist/leave-requests')}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-center"
        >
          <FaCoffee className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave</span>
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaCalendarCheck className="mr-2 text-blue-500" />
              Today's Appointments
            </h2>
            <button
              onClick={() => navigate('/stylist/appointments')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              View All <FaArrowRight className="ml-1" />
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
            {dashboardData.today_appointments?.length > 0 ? (
              dashboardData.today_appointments.map((appt) => (
                <div key={appt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                        {appt.customer_name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {appt.customer_name || 'Walk-in'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <FaTag className="w-3 h-3" />
                          {appt.service_name || 'N/A'}
                          <span className="mx-1">•</span>
                          <FaClock className="w-3 h-3" />
                          {appt.appointment_time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(appt.status)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Ksh {appt.final_amount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FaCalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No appointments today</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Enjoy your free time!</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaCalendarAlt className="mr-2 text-green-500" />
              Upcoming Appointments
            </h2>
            <button
              onClick={() => navigate('/stylist/appointments')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              View All <FaArrowRight className="ml-1" />
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
            {dashboardData.upcoming_appointments?.length > 0 ? (
              dashboardData.upcoming_appointments.slice(0, 10).map((appt) => (
                <div key={appt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                        {appt.customer_name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {appt.customer_name || 'Walk-in'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <FaCalendarAlt className="w-3 h-3" />
                          {appt.appointment_date}
                          <span className="mx-1">•</span>
                          <FaClock className="w-3 h-3" />
                          {appt.appointment_time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(appt.status)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {appt.service_name || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Check back later for new bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <FaStar className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(dashboardData.stats?.avg_rating || 0).toFixed(1)} / 5.0
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <FaUsers className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {dashboardData.stats?.total_appointments || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <FaChartLine className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {dashboardData.stats?.total_appointments > 0 
                  ? Math.round((dashboardData.stats?.completed_appointments || 0) / (dashboardData.stats?.total_appointments || 1) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <FaBell className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notifications</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {dashboardData.stats?.unread_notifications || 0} unread
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistDashboard;