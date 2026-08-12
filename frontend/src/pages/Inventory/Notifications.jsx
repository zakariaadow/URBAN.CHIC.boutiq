import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaBell, FaCheckCircle, FaTimesCircle, FaInfoCircle, 
  FaExclamationTriangle, FaSpinner, FaCheck, FaTrash 
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Notifications = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log("Fetching notifications from /api/inventory/notifications...");
      
      // ✅ SEND APPROPRIATE QUERY PARAMETERS
      const response = await api.get('/api/inventory/notifications', {
        ...config,
        params: { 
          page: 1, 
          limit: 50,
          unread_only: false // <--- Some backends require this to return ALL notifications
        }
      });
      
      console.log("Inventory Notifications Response:", response.data);

      // ✅ ROBUST DATA EXTRACTION
      let fetchedNotifications = [];
      let totalUnread = 0;
      
      // Case 1: Paginated response with 'items' array inside .data
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        fetchedNotifications = response.data.data.items;
        totalUnread = response.data.data.unread_count || 0;
      } 
      // Case 2: Standard array inside .data
      else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedNotifications = response.data.data;
        totalUnread = fetchedNotifications.filter(n => !n.is_read).length;
      } 
      // Case 3: Flat array response
      else if (Array.isArray(response.data)) {
        fetchedNotifications = response.data;
        totalUnread = fetchedNotifications.filter(n => !n.is_read).length;
      }
      // Fallback
      else {
        fetchedNotifications = [];
        console.warn("Unexpected notifications API response structure:", response.data);
      }

      setNotifications(fetchedNotifications);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // ✅ CRITICAL FIX: If we get a 400, let's examine the error message
      if (error.response && error.response.status === 400) {
        toast.error('Bad Request: ' + (error.response.data?.message || 'Invalid parameters sent to backend'));
        console.error("Backend error details:", error.response.data);
      } else if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(t('notifications.loadError') || 'Failed to load notifications');
      }
      
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await api.post(`/api/inventory/notifications/${id}/read`, {}, config);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error(t('notifications.markError') || 'Failed to mark as read');
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) {
        toast.info(t('notifications.noUnread') || 'No unread notifications');
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await api.post('/api/inventory/notifications/mark-all-read', {}, config);
      toast.success(t('notifications.markAllSuccess') || 'All marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(t('notifications.markAllError') || 'Failed to mark all as read');
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm(t('notifications.deleteConfirm') || 'Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await api.delete(`/api/inventory/notifications/${id}`, config);
      toast.success(t('notifications.deleteSuccess') || 'Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t('notifications.deleteError') || 'Failed to delete notification');
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'error': return <FaTimesCircle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info':
      default: return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    try {
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin w-8 h-8 text-yellow-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaBell className="mr-3 text-yellow-600" />
            {t('inventory.notifications.title') || 'Notifications'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('inventory.notifications.subtitle') || 'Manage your notifications and alerts'}
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {unreadCount} {t('notifications.unread') || 'unread'}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center text-sm"
          >
            <FaCheck className="mr-2" /> {t('notifications.markAllRead') || 'Mark all read'}
          </button>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center text-sm"
          >
            <FaSpinner className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> {t('common.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {Array.isArray(notifications) && notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors ${
                  notification.is_read 
                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50' 
                    : 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-sm font-medium ${
                          notification.is_read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-900 dark:text-white font-semibold'
                        }`}>
                          {notification.title || 'Notification'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors text-xs"
                            title={t('notifications.markRead') || 'Mark as read'}
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors text-xs"
                          title={t('common.delete') || 'Delete'}
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FaBell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('notifications.noNotifications') || 'No notifications'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('notifications.noNotificationsDesc') || 'You are all caught up!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;