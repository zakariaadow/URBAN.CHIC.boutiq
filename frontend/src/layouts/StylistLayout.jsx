import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  FaHome, FaCalendarCheck, FaUser, FaCog,
  FaSignOutAlt, FaBars, FaTimes, FaClock,
  FaMoneyBillWave, FaStar, FaBell, FaCut,
  FaImage, FaFileAlt, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Use import.meta.env instead of process.env for Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StylistLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    rating: 0,
    totalEarnings: 0
  });

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Create axios instance with auth header
  const authAxios = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!token || !isLoggedIn) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }
    
    if (userRole !== 'stylist') {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }

    fetchUserData();
    fetchStats();
  }, [navigate, token]);

  const fetchUserData = async () => {
    try {
      const response = await authAxios.get('/auth/profile');
      if (response.data.status === 'success') {
        setUserData(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authAxios.get('/stylist/dashboard');
      if (response.data.status === 'success') {
        const data = response.data.data;
        setStats({
          todayAppointments: data.today_appointments || 0,
          pendingAppointments: data.pending_appointments || 0,
          completedToday: data.completed_today || 0,
          rating: data.rating || 0,
          totalEarnings: data.total_earnings || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    { 
      path: '/stylist/dashboard', 
      icon: <FaHome className="w-5 h-5" />, 
      label: 'Dashboard'
    },
    { 
      path: '/stylist/appointments', 
      icon: <FaCalendarCheck className="w-5 h-5" />, 
      label: 'My Appointments'
    },
    { 
      path: '/stylist/schedule', 
      icon: <FaClock className="w-5 h-5" />, 
      label: 'Schedule'
    },
    { 
      path: '/stylist/earnings', 
      icon: <FaMoneyBillWave className="w-5 h-5" />, 
      label: 'Earnings'
    },
    { 
      path: '/stylist/commissions', 
      icon: <FaStar className="w-5 h-5" />, 
      label: 'Commissions'
    },
    { 
      path: '/stylist/leave-requests', 
      icon: <FaFileAlt className="w-5 h-5" />, 
      label: 'Leave Requests'
    },
    { 
      path: '/stylist/notifications', 
      icon: <FaBell className="w-5 h-5" />, 
      label: 'Notifications'
    },
    { 
      path: '/stylist/profile', 
      icon: <FaUser className="w-5 h-5" />, 
      label: 'Profile'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading stylist panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SB</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Stylist Panel</h2>
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
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">
              {userData?.first_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userData?.first_name} {userData?.last_name || 'Stylist'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userData?.email || 'stylist@urbanchic.com'}
              </p>
              <div className="flex items-center mt-1">
                <FaStar className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {stats.rating || 0} rating
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.todayAppointments}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {stats.completedToday}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pendingAppointments}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Ksh {stats.totalEarnings?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Earnings</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="flex-1 text-sm">{item.label}</span>
              {isActive(item.path) && (
                <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

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
                  {t('stylist.dashboard.title') || 'Stylist Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('stylist.dashboard.subtitle') || 'Manage your appointments and services'}
                </p>
              </div>
            </div>
            
            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StylistLayout;