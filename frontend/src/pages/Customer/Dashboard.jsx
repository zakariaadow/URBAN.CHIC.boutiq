import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaCalendarCheck, FaClock, FaStar, FaHeart, FaBell,
  FaWallet, FaUser, FaSignOutAlt, FaClipboardList,
  FaCreditCard, FaGift, FaComment, FaArrowRight, FaSpinner,
  FaCheckCircle, FaExclamationCircle, FaCalendarDay, FaHistory,
  FaStore, FaCut, FaPercentage
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [favoriteServices, setFavoriteServices] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalSpent: 0,
    averageRating: 0
  });
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || token === 'null' || token === 'undefined' || token === '') {
      toast.error('Please login to view dashboard');
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [
        dashboardRes,
        upcomingRes,
        paymentsRes,
        loyaltyRes,
        notificationsRes,
        favoritesRes
      ] = await Promise.all([
        axios.get('/api/customer/dashboard', { headers }),
        axios.get('/api/customer/appointments/upcoming', { headers }),
        axios.get('/api/customer/payments', { headers, params: { limit: 5 } }),
        axios.get('/api/customer/loyalty/points', { headers }),
        axios.get('/api/customer/notifications/unread', { headers }),
        axios.get('/api/customer/favorites/services', { headers })
      ]);

      // Extract data from response
      const dashboardData = dashboardRes.data?.data || dashboardRes.data || {};
      const upcomingData = upcomingRes.data?.data || upcomingRes.data || [];
      const paymentsData = paymentsRes.data?.data || paymentsRes.data || [];
      const loyaltyData = loyaltyRes.data?.data || loyaltyRes.data || {};
      const notificationsData = notificationsRes.data?.data || notificationsRes.data || {};
      const favoritesData = favoritesRes.data?.data || favoritesRes.data || [];

      console.log('Dashboard Data:', dashboardData);
      console.log('Upcoming Appointments:', upcomingData);

      setDashboardData(dashboardData);
      setUpcomingAppointments(Array.isArray(upcomingData) ? upcomingData : []);
      setRecentPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      // FIX: Extract points from loyalty object
      setLoyaltyPoints(loyaltyData.points || 0);
      
      setUnreadNotifications(notificationsData.unread_count || notificationsData.count || 0);
      setFavoriteServices(Array.isArray(favoritesData) ? favoritesData : []);

      // Extract stats from dashboard data
      const statsData = dashboardData.stats || {};
      setStats({
        totalAppointments: statsData.total_appointments || dashboardData.total_appointments || 0,
        completedAppointments: statsData.completed_appointments || 0,
        cancelledAppointments: statsData.cancelled_appointments || 0,
        totalSpent: statsData.total_spent || dashboardData.total_spent || 0,
        averageRating: statsData.average_rating || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };
      await axios.post(`/api/customer/appointments/${appointmentId}/cancel`, {}, { headers });
      toast.success('Appointment cancelled successfully');
      fetchDashboardData();
      setActiveModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'KES 0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
      'confirmed': { class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Confirmed' },
      'in_progress': { class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'In Progress' },
      'completed': { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Completed' },
      'cancelled': { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {dashboardData?.customer?.name || 'Customer'}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button
                onClick={() => navigate('/customer/notifications')}
                className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaBell className="w-6 h-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/customer/profile')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FaUser className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <FaSignOutAlt className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalAppointments}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.completedAppointments}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <FaCheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <FaWallet className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Loyalty Points
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {loyaltyPoints}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <FaGift className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => navigate('/customer/book-appointment')}
            className="bg-blue-500 text-white rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center space-y-2">
              <FaCalendarDay className="text-2xl" />
              <span className="text-sm font-medium">Book Now</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/appointments/history')}
            className="bg-purple-500 text-white rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center space-y-2">
              <FaHistory className="text-2xl" />
              <span className="text-sm font-medium">History</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/payments')}
            className="bg-green-500 text-white rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center space-y-2">
              <FaCreditCard className="text-2xl" />
              <span className="text-sm font-medium">Payments</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/favorites')}
            className="bg-pink-500 text-white rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center space-y-2">
              <FaHeart className="text-2xl" />
              <span className="text-sm font-medium">Favorites</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/reviews')}
            className="bg-yellow-500 text-white rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center space-y-2">
              <FaComment className="text-2xl" />
              <span className="text-sm font-medium">Reviews</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/promotions')}
            className="bg-red-500 text-white rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center space-y-2">
              <FaPercentage className="text-2xl" />
              <span className="text-sm font-medium">Promotions</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Upcoming Appointments */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Appointments
                </h2>
                <button
                  onClick={() => navigate('/customer/appointments')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  View All <FaArrowRight className="ml-1 w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => {
                    const status = getStatusBadge(appointment.status);
                    return (
                      <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {appointment.service_name || 'Service'}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.class}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="mt-1 space-y-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <FaCalendarDay className="inline w-3 h-3 mr-1" />
                                {formatDate(appointment.date)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <FaClock className="inline w-3 h-3 mr-1" />
                                {formatTime(appointment.time)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {appointment.branch_name || 'Branch'} • Stylist: {appointment.stylist_name || 'Not assigned'}
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(appointment.total_amount || appointment.price || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                              <button
                                onClick={() => {
                                  setModalData(appointment);
                                  setActiveModal('cancel');
                                }}
                                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/customer/appointments/${appointment.id}`)}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <FaCalendarDay className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No upcoming appointments
                    </p>
                    <button
                      onClick={() => navigate('/customer/book-appointment')}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Recent Payments */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Payments
                </h2>
                <button
                  onClick={() => navigate('/customer/payments')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  View All <FaArrowRight className="ml-1 w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentPayments.length > 0 ? (
                  recentPayments.map((payment) => (
                    <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {payment.appointment?.service_name || 'Payment'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(payment.created_at)}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                            payment.payment_status === 'paid' || payment.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : payment.payment_status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {payment.payment_status || payment.status || 'Pending'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </p>
                          <button
                            onClick={() => navigate(`/customer/payments/${payment.id}`)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent payments
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Loyalty Points Card */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Loyalty Points</p>
                  {/* FIX: Use loyaltyPoints (number) directly */}
                  <p className="text-3xl font-bold mt-1">{loyaltyPoints}</p>
                </div>
                <FaGift className="w-12 h-12 text-yellow-300 opacity-75" />
              </div>
              <div className="mt-4">
                <div className="w-full bg-yellow-300/30 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${Math.min((loyaltyPoints / 500) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-yellow-100 text-xs mt-2">
                  {500 - (loyaltyPoints % 500)} points to next reward
                </p>
              </div>
              <button
                onClick={() => navigate('/customer/loyalty')}
                className="mt-4 w-full bg-white text-yellow-600 py-2 rounded-lg font-medium hover:bg-yellow-50 transition-colors"
              >
                Redeem Points
              </button>
            </div>

            {/* Favorite Services */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Favorite Services
                </h3>
                <button
                  onClick={() => navigate('/customer/favorites')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All
                </button>
              </div>
              {favoriteServices.length > 0 ? (
                <div className="space-y-2">
                  {favoriteServices.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <FaHeart className="w-4 h-4 text-pink-500 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {service.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No favorite services yet
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Completed Appointments
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.completedAppointments}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cancelled Appointments
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.cancelledAppointments}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Average Rating
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white flex items-center">
                    <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    Total Spent
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalSpent)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      {activeModal === 'cancel' && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActiveModal(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <FaExclamationCircle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Cancel Appointment
            </h3>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
              Are you sure you want to cancel this appointment?
            </p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              {modalData.service_name || 'Service'} on {formatDate(modalData.date)} at {formatTime(modalData.time)}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                No, Keep It
              </button>
              <button
                onClick={() => handleCancelAppointment(modalData.id)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;