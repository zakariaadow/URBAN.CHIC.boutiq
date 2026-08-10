// src/components/common/Header.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBars, FaBell, FaSearch, FaUser, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = ({ title, onMenuClick, onSearchClick, notifications = 0 }) => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
            aria-label="Toggle menu"
          >
            <FaBars className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title || 'Dashboard'}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <button
            onClick={onSearchClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Search"
          >
            <FaSearch className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            aria-label="Notifications"
          >
            <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
              {user.name?.charAt(0) || 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;