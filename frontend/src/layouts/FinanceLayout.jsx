import api from "../services/api";
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaHome, FaMoneyBillWave, FaChartBar, FaUser,
  FaCog, FaSignOutAlt, FaBars, FaTimes,
  FaFileAlt, FaBell, FaCreditCard, FaCalculator,
  FaWallet, FaFileInvoice, FaHistory, FaReceipt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinanceLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get user from localStorage (session-based auth doesn't store user in localStorage)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { path: '/finance/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/finance/income', icon: <FaMoneyBillWave />, label: 'Income' },
    { path: '/finance/expenses', icon: <FaWallet />, label: 'Expenses' },
    { path: '/finance/payroll', icon: <FaCalculator />, label: 'Payroll' },
    { path: '/finance/commissions', icon: <FaCreditCard />, label: 'Commissions' },
    { path: '/finance/payments', icon: <FaFileInvoice />, label: 'Payments' },
    { path: '/finance/payment-history', icon: <FaHistory />, label: 'Payment History' },
    { path: '/finance/daily-sales', icon: <FaChartBar />, label: 'Daily Sales' },
    { path: '/finance/profit-loss', icon: <FaChartBar />, label: 'Profit & Loss' },
    { path: '/finance/sales', icon: <FaChartBar />, label: 'Sales' },
    { path: '/finance/reports', icon: <FaFileAlt />, label: 'Reports' },
    { path: '/finance/export-pdf', icon: <FaFileAlt />, label: 'Export PDF' },
    { path: '/finance/export-excel', icon: <FaFileAlt />, label: 'Export Excel' },
    { path: '/finance/tax', icon: <FaCalculator />, label: 'Tax' },
    { path: '/finance/budget', icon: <FaWallet />, label: 'Budget' },
    { path: '/finance/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/finance/profile', icon: <FaUser />, label: 'Profile' },
  ];

  const handleLogout = async () => {
    try {
      // Use session-based logout - just navigate to login
      localStorage.removeItem('user');
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
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
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Finance
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-500">
              <FaTimes />
            </button>
          </div>

          {/* User Profile */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'F'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'Finance Officer'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'finance@urbanchic.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 mx-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400'
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

          {/* Footer */}
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

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default FinanceLayout;