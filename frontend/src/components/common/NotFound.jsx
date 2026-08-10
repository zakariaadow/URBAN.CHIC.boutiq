// src/components/common/NotFound.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = ({ title, message, showHomeButton = true, showBackButton = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <FaExclamationTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {title || '404'}
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {message || t('error.notFound')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('error.notFoundDesc') || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              {t('common.back')}
            </button>
          )}
          
          {showHomeButton && (
            <Link
              to="/"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <FaHome className="mr-2" />
              {t('common.home')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;