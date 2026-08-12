import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaEnvelope, FaLock, FaSpinner,
  FaEye, FaEyeSlash, FaUserShield,
  FaArrowRight, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
        remember: formData.remember
      }, {
        withCredentials: true
      });

      console.log('Login Response:', response.data);

      // Get data from response
      const data = response.data.data || response.data;
      const { user, token } = data;
      
      if (!user) {
        throw new Error('No user data received');
      }

      // Store token immediately
      if (token && token !== 'null' && token !== 'undefined' && token !== '') {
        localStorage.setItem('token', token);
        console.log('Token stored:', token);
      } else {
        console.error('No valid token received');
        toast.error('No valid token received');
        setLoading(false);
        return;
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', user.role || 'customer');

      toast.success('Login successful!');

      // Determine redirect path based on role
      let path = '/customer/dashboard';
      switch(user?.role) {
        case 'admin':
          path = '/admin/dashboard';
          break;
        case 'manager':
          path = '/manager/dashboard';
          break;
        case 'stylist':
          path = '/stylist/dashboard';
          break;
        case 'finance':
          path = '/finance/dashboard';
          break;
        case 'inventory':
          path = '/inventory/dashboard';
          break;
        case 'receptionist':
          path = '/receptionist/dashboard';
          break;
        default:
          path = '/customer/dashboard';
      }

      // IMMEDIATE REDIRECT - no delay
      navigate(path);

    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid email or password';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Left Side - Login Form */}
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img 
                  src="/logo.png" 
                  alt="Urban Chic Boutique Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Login to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Register
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden md:block relative bg-purple-50 dark:bg-purple-900/20">
            <img 
              src="/image19.jpg" 
              alt="Fashion showcase" 
              className="w-full h-full object-cover"
            />
            {/* Optional overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
            {/* Optional text overlay */}
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Urban Chic Boutique</h2>
              <p className="text-sm opacity-90">Discover the latest fashion trends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;