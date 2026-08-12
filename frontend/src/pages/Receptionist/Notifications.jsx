import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaBell, FaSearch, FaCheck, FaCheckDouble,
  FaSpinner, FaTimes, FaEye, FaTrash,
  FaCalendarDay, FaUser, FaEnvelope,
  FaChevronLeft, FaChevronRight,
  FaInfoCircle, FaClock, FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReceptionistNotifications = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter, readFilter, currentPage]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        read: readFilter !== 'all' ? (readFilter === 'read' ? 1 : 0) : undefined
      };
      
      const response = await api.get('/api/receptionist/notifications', { params });
      
      // Handle different response structures
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      // Transform notification data
      const transformedData = responseData.map(item => ({
        id: item.id,
        title: item.title || 'Notification',
        message: item.message || item.content || '',
        type: item.type || 'system',
        is_read: item.is_read || item.read || 0,
        priority: item.priority || 'normal',
        user_id: item.user_id,
        user_name: item.user?.full_name || item.user_name || 'System',
        created_at: item.created_at || item.timestamp,
        updated_at: item.updated_at,
        action_url: item.action_url || null,
        icon: item.icon || null
      }));
      
      setNotifications(transformedData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || transformedData.length);
      
      // Count unread notifications
      const unread = transformedData.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/receptionist/notifications/${id}/read`, {});
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/api/receptionist/notifications/read-all', {});
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/api/receptionist/notifications/${id}`);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
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
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      system: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      appointment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      payment: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      reminder: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      alert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      promotion: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    };
    return colors[type] || colors.system;
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'system': return <FaInfoCircle className="text-blue-500" />;
      case 'appointment': return <FaCalendarDay className="text-purple-500" />;
      case 'payment': return <FaEnvelope className="text-green-500" />;
      case 'reminder': return <FaClock className="text-yellow-500" />;
      case 'alert': return <FaBell className="text-red-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  const filteredNotifications = Array.isArray(notifications) 
    ? notifications.filter(notification => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          notification.title?.toLowerCase().includes(search) ||
          notification.message?.toLowerCase().includes(search) ||
          notification.user_name?.toLowerCase().includes(search)
        );
      })
    : [];

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
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notifications (${totalItems} total)`
              : `All caught up! (${totalItems} total)`}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaCheckDouble className="mr-2" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="system">System</option>
            <option value="appointment">Appointment</option>
            <option value="payment">Payment</option>
            <option value="reminder">Reminder</option>
            <option value="alert">Alert</option>
            <option value="promotion">Promotion</option>
          </select>
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
                !notification.is_read 
                  ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10' 
                  : 'border-gray-200 dark:border-gray-700'
              } p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            New
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowDetails(true);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1.5 text-green-600 hover:text-green-800 transition-colors"
                          title="Mark as Read"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-0.5 rounded-full ${getTypeColor(notification.type)}`}>
                      {notification.type || 'system'}
                    </span>
                    <span className="flex items-center">
                      <FaUser className="mr-1" /> {notification.user_name}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" /> {formatDate(notification.created_at)}
                    </span>
                    <span className={`flex items-center ${notification.is_read ? 'text-green-600' : 'text-yellow-600'}`}>
                      {notification.is_read ? '✓ Read' : '○ Unread'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaBell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'All caught up! No notifications to display'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {showDetails && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notification Details
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    {getTypeIcon(selectedNotification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedNotification.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(selectedNotification.type)}`}>
                        {selectedNotification.type || 'system'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        selectedNotification.is_read 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {selectedNotification.is_read ? 'Read' : 'Unread'}
                      </span>
                      {selectedNotification.priority && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          selectedNotification.priority === 'high' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : selectedNotification.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {selectedNotification.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">From</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedNotification.user_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Sent</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedNotification.created_at)}
                    </p>
                  </div>
                  {selectedNotification.action_url && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-500 dark:text-gray-400">Action URL</label>
                      <p className="font-medium text-blue-600 dark:text-blue-400 break-all">
                        <a href={selectedNotification.action_url} target="_blank" rel="noopener noreferrer">
                          {selectedNotification.action_url}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                {!selectedNotification.is_read && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedNotification.id);
                      setShowDetails(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaCheck className="mr-2" /> Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistNotifications;