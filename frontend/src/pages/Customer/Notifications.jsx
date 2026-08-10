import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaBell, FaCheckCircle, FaTimesCircle, FaClock,
  FaCalendarCheck, FaMoneyBillWave, FaStar,
  FaSpinner, FaChevronLeft, FaChevronRight,
  FaEnvelope, FaSms, FaInfoCircle, FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage, filterType]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/customer/notifications', {
        ...config,
        params: { 
          page: currentPage, 
          limit: 20,
          type: filterType !== 'all' ? filterType : undefined
        }
      });
      
      // Handle different response formats
      let notificationsData = [];
      if (response.data?.data?.items) {
        notificationsData = response.data.data.items;
      } else if (response.data?.data) {
        notificationsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        notificationsData = response.data;
      }
      
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setTotalPages(response.data?.data?.pages || response.data?.pages || 1);
      setTotalCount(response.data?.data?.total || response.data?.total || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      toast.error(t('notifications.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/customer/notifications/unread', config);
      const count = response.data?.data?.length || response.data?.length || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/customer/notifications/${notificationId}/read`, {}, config);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success(t('notifications.markedAsRead'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error(t('notifications.markAsReadError'));
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/customer/notifications/read-all', {}, config);
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success(t('notifications.allMarkedAsRead'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(t('notifications.markAllAsReadError'));
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/customer/notifications/${notificationId}`, config);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success(t('notifications.deleted'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t('notifications.deleteError'));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <FaCalendarCheck className="text-blue-500" />;
      case 'payment':
        return <FaMoneyBillWave className="text-green-500" />;
      case 'promotion':
        return <FaStar className="text-yellow-500" />;
      case 'reminder':
        return <FaClock className="text-orange-500" />;
      case 'review':
        return <FaStar className="text-purple-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const filteredNotifications = Array.isArray(notifications) ? notifications : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaBell className="mr-3 text-blue-500" />
              {t('notifications.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? (
                <span className="text-blue-600 dark:text-blue-400">
                  {unreadCount} {t('notifications.unread')}
                </span>
              ) : (
                t('notifications.noUnread')
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaCheckCircle className="mr-2" /> {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'appointment', 'payment', 'promotion', 'reminder', 'system'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? t('notifications.all') : t(`notifications.types.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
                  notification.is_read
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
                } p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm font-medium ${
                          notification.is_read
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-900 dark:text-white font-semibold'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority || 'normal'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatDate(notification.created_at)}
                      </span>
                      {notification.type && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {t(`notifications.types.${notification.type}`, notification.type)}
                        </span>
                      )}
                      {notification.is_emailed && (
                        <FaEnvelope className="text-gray-400" title={t('notifications.emailed')} />
                      )}
                      {notification.is_sms && (
                        <FaSms className="text-gray-400" title={t('notifications.sms')} />
                      )}
                    </div>

                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {notification.action_text || t('common.view')}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title={t('notifications.markAsRead')}
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t('notifications.delete')}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('notifications.noNotifications')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('notifications.noNotificationsDesc')}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.showing')} {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalCount)} of {totalCount}
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
                {currentPage} / {totalPages}
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
    </div>
  );
};

export default Notifications;