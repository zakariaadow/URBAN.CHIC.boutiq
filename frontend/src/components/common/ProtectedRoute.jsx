import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Get authentication data from localStorage
  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // Get user role from localStorage - PRIORITIZE userRole first
  let userRole = localStorage.getItem('userRole');
  
  // If no userRole, try to get from user object
  if (!userRole) {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        userRole = user?.role || user?.role_name;
        // Store it for future use
        if (userRole) {
          localStorage.setItem('userRole', userRole);
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // Debug logs - remove in production
  console.log('🔒 ProtectedRoute Check:', {
    token: token ? '✅ Present' : '❌ Missing',
    isLoggedIn,
    userRole,
    allowedRoles,
    path: window.location.pathname
  });

  // Check if user is authenticated
  const isAuthenticated = !!(token && token !== 'null' && token !== 'undefined' && isLoggedIn);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  // SPECIAL: If the route is for manager, ensure the role is correct
  const isManagerRoute = allowedRoles.includes('manager') || window.location.pathname.startsWith('/manager');
  
  if (isManagerRoute && userRole === 'manager') {
    console.log('✅ Manager route access granted');
    return children;
  }

  // If roles are specified and user doesn't have the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log(`❌ Role mismatch. Required: ${allowedRoles.join(', ')}, Got: ${userRole}`);
    toast.error('You do not have permission to access this page');
    
    // Redirect to the appropriate dashboard based on role
    let redirectPath = '/';
    switch(userRole) {
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      case 'manager':
        redirectPath = '/manager/dashboard';
        break;
      case 'stylist':
        redirectPath = '/stylist/dashboard';
        break;
      case 'finance':
        redirectPath = '/finance/dashboard';
        break;
      case 'inventory':
        redirectPath = '/inventory/dashboard';
        break;
      case 'receptionist':
        redirectPath = '/receptionist/dashboard';
        break;
      default:
        redirectPath = '/customer/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed - render children
  console.log('✅ Authentication successful, rendering protected route');
  return children;
};

export default ProtectedRoute;