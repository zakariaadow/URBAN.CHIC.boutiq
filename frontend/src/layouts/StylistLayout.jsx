import api from "../services/api";
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaHome, FaCalendarCheck, FaUser, FaCog,
  FaSignOutAlt, FaBars, FaTimes, FaClock,
  FaMoneyBillWave, FaStar, FaBell, FaCut,
  FaImage, FaFileAlt, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';

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
    completedAppointments: 0,
    totalEarnings: 0,
    rating: 0,
    totalClients: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  // Create axios instance with auth header
  const authAxios = api.create({
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
      navigate('/login');
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
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get('/stylist/dashboard');
      if (response.data.status === 'success') {
        const data = response.data.data;
        setStats({
          todayAppointments: data.today_appointments || 0,
          pendingAppointments: data.pending_appointments || 0,
          completedAppointments: data.completed_appointments || 0,
          totalEarnings: data.total_earnings || 0,
          rating: data.rating || 0,
          totalClients: data.total_clients || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { path: '/stylist/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/stylist/appointments', icon: <FaCalendarCheck />, label: 'Appointments' },
    { path: '/stylist/schedule', icon: <FaClock />, label: 'Schedule' },
    { path: '/stylist/earnings', icon: <FaMoneyBillWave />, label: 'Earnings' },
    { path: '/stylist/commissions', icon: <FaStar />, label: 'Commissions' },
    { path: '/stylist/performance', icon: <FaStar />, label: 'Performance' },
    { path: '/stylist/leave-requests', icon: <FaFileAlt />, label: 'Leave Requests' },
    { path: '/stylist/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/stylist/profile', icon: <FaUser />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">UC</span>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight">Urban Chic</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Stylist Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <FaSignOutAlt />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          <Outlet context={{ userData, stats, loading }} />
        </div>
      </main>
    </div>
  );
};

export default StylistLayout;
