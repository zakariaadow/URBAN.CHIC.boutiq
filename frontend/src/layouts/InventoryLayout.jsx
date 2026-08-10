// src/layouts/InventoryLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaHome, FaBox, FaUser, FaCog,
  FaSignOutAlt, FaBars, FaTimes,
  FaWarehouse, FaShoppingCart, FaTruck,
  FaBell, FaFileAlt, FaChartBar,
  FaExclamationTriangle, FaTags
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const InventoryLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { path: '/inventory/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/inventory/products', icon: <FaBox />, label: 'Products' },
    { path: '/inventory/suppliers', icon: <FaTruck />, label: 'Suppliers' },
    { path: '/inventory/purchases', icon: <FaShoppingCart />, label: 'Purchases' },
    { path: '/inventory/stock', icon: <FaWarehouse />, label: 'Stock' },
    { path: '/inventory/alerts', icon: <FaExclamationTriangle />, label: 'Alerts' },
    // ⚠️ REMOVED: { path: '/inventory/batches', icon: <FaTags />, label: 'Batches' },
    { path: '/inventory/reports', icon: <FaFileAlt />, label: 'Reports' },
    { path: '/inventory/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/inventory/profile', icon: <FaUser />, label: 'Profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              Inventory
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-500">
              <FaTimes />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-600 to-amber-600 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0) || 'I'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name || 'Inventory'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || 'inventory@urbanchic.com'}
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
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-yellow-600 dark:text-yellow-400'
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

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64">
        <div className="p-4 md:p-6">
          {/* ✅ Outlet wrapped in a div with proper padding */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InventoryLayout;