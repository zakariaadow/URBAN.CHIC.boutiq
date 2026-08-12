import api from "../services/api";
// src/layouts/ReceptionistLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaHome, FaCalendarCheck, FaUser, FaCog,
  FaSignOutAlt, FaBars, FaTimes, FaUsers,
  FaMoneyBillWave, FaBell, FaClipboardList,
  FaCut, FaStore
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReceptionistLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { path: '/receptionist/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/receptionist/appointments', icon: <FaCalendarCheck />, label: 'Appointments' },
    { path: '/receptionist/customers', icon: <FaUsers />, label: 'Customers' },
    { path: '/receptionist/stylists', icon: <FaCut />, label: 'Stylists' },
    { path: '/receptionist/payments', icon: <FaMoneyBillWave />, label: 'Payments' },
    { path: '/receptionist/branches', icon: <FaStore />, label: 'Branches' },
    { path: '/receptionist/reports', icon: <FaClipboardList />, label: 'Reports' },
    { path: '/receptionist/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/receptionist/profile', icon: <FaUser />, label: 'Profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Receptionist
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-500">
              <FaTimes />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0) || 'R'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name || 'Receptionist'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || 'receptionist@urbanchic.com'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 mx-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 text-orange-600 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="w-5 h-5 mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 lg:ml-64">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ReceptionistLayout;