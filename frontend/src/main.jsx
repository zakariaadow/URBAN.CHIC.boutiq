import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import App from './App';
import i18n from './i18n/i18n';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import api from './services/api';  // ✅ FIXED: Changed from '../services/api' to './services/api'

// ============ AXIOS INTERCEPTORS ============
// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Only add token if it exists and is valid (not 'null', 'undefined', or empty)
    if (token && token !== 'null' && token !== 'undefined' && token !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove Authorization header if no valid token
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), clear token and redirect to login
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      
      // Redirect to login if not already there
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && !currentPath.startsWith('/auth')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ THEME SETUP ============
// Set default theme based on user preference
const theme = localStorage.getItem('theme') || 'light';
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Set default language
const language = localStorage.getItem('language') || 'en';
i18n.changeLanguage(language);

// ============ RENDER APP ============
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </I18nextProvider>
  </React.StrictMode>
);