import api from "../services/api";
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  FaHome,
  FaCalendarCheck, 
  FaUsers, 
  FaClock, 
  FaChartLine,
  FaUserFriends,
  FaBoxes,
  FaFileAlt,
  FaBell,
  FaStore,
  FaUserCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaClipboardList,
  FaMoneyBillWave,
  FaCog,
  FaSpinner
} from 'react-icons/fa';

const ManagerLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    todayRevenue: 0,
    pendingLeave: 0,
    lowStock: 0
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Check if user is logged in and has manager role
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!token || !isLoggedIn) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }
    
    if (userRole !== 'manager') {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }

    fetchUserData();
    fetchStats();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setUserData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/manager/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        const data = response.data.data;
        setStats({
          todayAppointments: data.today_appointments || 0,
          todayRevenue: data.today_revenue || 0,
          pendingLeave: data.pending_leave || 0,
          lowStock: data.low_stock || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items
  const navItems = [
    {
      path: '/manager/dashboard',
      icon: <FaHome className="w-5 h-5" />,
      label: 'Dashboard',
      active: isActive('/manager/dashboard')
    },
    {
      path: '/manager/appointments',
      icon: <FaCalendarCheck className="w-5 h-5" />,
      label: 'Appointments',
      active: isActive('/manager/appointments')
    },
    {
      path: '/manager/staff',
      icon: <FaUsers className="w-5 h-5" />,
      label: 'Staff Management',
      active: isActive('/manager/staff')
    },
    {
      path: '/manager/schedules',
      icon: <FaClock className="w-5 h-5" />,
      label: 'Schedules',
      active: isActive('/manager/schedules')
    },
    {
      path: '/manager/attendance',
      icon: <FaClipboardList className="w-5 h-5" />,
      label: 'Attendance',
      active: isActive('/manager/attendance')
    },
    {
      path: '/manager/performance',
      icon: <FaChartLine className="w-5 h-5" />,
      label: 'Performance',
      active: isActive('/manager/performance')
    },
    {
      path: '/manager/customers',
      icon: <FaUserFriends className="w-5 h-5" />,
      label: 'Customers',
      active: isActive('/manager/customers')
    },
    {
      path: '/manager/inventory',
      icon: <FaBoxes className="w-5 h-5" />,
      label: 'Inventory Requests',
      active: isActive('/manager/inventory')
    },
    {
      path: '/manager/reports',
      icon: <FaFileAlt className="w-5 h-5" />,
      label: 'Reports',
      active: isActive('/manager/reports')
    },
    {
      path: '/manager/notifications',
      icon: <FaBell className="w-5 h-5" />,
      label: 'Notifications',
      active: isActive('/manager/notifications')
    },
    {
      path: '/manager/branches',
      icon: <FaStore className="w-5 h-5" />,
      label: 'Branches',
      active: isActive('/manager/branches')
    },
    {
      path: '/manager/profile',
      icon: <FaUserCog className="w-5 h-5" />,
      label: 'Profile',
      active: isActive('/manager/profile')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading manager panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Overlay for mobile */}
      {!sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">UB</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manager Panel</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Urban Chic Boutique</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
              {userData?.first_name?.charAt(0) || 'M'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userData?.first_name} {userData?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userData?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="flex-1 text-sm">{item.label}</span>
              {item.active && (
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                <FaBars className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('manager.dashboard.title') || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('manager.dashboard.subtitle') || 'Manage your branch operations'}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Today's Appointments</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.todayAppointments}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Today's Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Ksh {stats.todayRevenue}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending Leave</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.pendingLeave}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;