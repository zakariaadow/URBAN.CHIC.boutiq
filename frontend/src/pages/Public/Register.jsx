import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaUser, FaEnvelope, FaLock, FaPhone,
  FaSpinner, FaEye, FaEyeSlash, FaCheck,
  FaCut, FaSpa, FaMoneyBillWave, FaBox,
  FaUserPlus, FaArrowRight, FaClipboardList,
  FaUserTie
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    branch: '',
    notes: ''
  });

  const roles = [
    { id: 'customer', name: 'Customer', icon: <FaUser className="text-blue-500" />, description: 'Book appointments, view services, manage profile' },
    { id: 'receptionist', name: 'Receptionist', icon: <FaClipboardList className="text-orange-500" />, description: 'Manage appointments, check-in customers, handle walk-ins' },
    { id: 'stylist', name: 'Stylist', icon: <FaCut className="text-purple-500" />, description: 'Manage appointments, track earnings, update schedule' },
    { id: 'finance', name: 'Finance', icon: <FaMoneyBillWave className="text-green-500" />, description: 'Manage payments, generate invoices, track expenses' },
    { id: 'inventory', name: 'Inventory Officer', icon: <FaBox className="text-yellow-500" />, description: 'Manage stock, products, and supplies' },
    { id: 'manager', name: 'Manager', icon: <FaUserTie className="text-indigo-500" />, description: 'Oversee branch operations, manage staff, track performance' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role: role.id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validate all required fields
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields (First Name, Last Name, Email, Phone)');
      setStep(1);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // ✅ Get the API URL from environment variable
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      const safeUsername = formData.first_name 
        ? `${formData.first_name.toLowerCase()}${Math.floor(Math.random() * 1000)}`
        : `user${Math.floor(Math.random() * 10000)}`;

      const registerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || '0700000000',  // ✅ Always provide a phone number
        username: safeUsername,
        password: formData.password,
        account_type: formData.role || 'customer'
      };

      console.log('📤 Registration data:', registerData);  // ✅ Debug log

      // ✅ Use axios with the full URL
      const response = await axios.post(`${API_URL}/api/auth/register`, registerData);
      
      console.log('📥 Registration response:', response.data);  // ✅ Debug log
      
      if (response.data.status === 'success') {
        toast.success(response.data.message || 'Registration successful! Please login.');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Registration failed');
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('📄 Error response:', error.response?.data);
      
      // ✅ Show specific error message from backend
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Left Side - Registration Form */}
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Create Account
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Join Urban Chic Boutique today
                </p>
              </div>

              {/* Steps Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    1
                  </div>
                  <div className={`w-16 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    2
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                        placeholder="0700000000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10"
                          required
                          minLength="8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Minimum 8 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      Continue <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select Account Type
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose the role that best describes you
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedRole?.id === role.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                          onClick={() => handleRoleSelect(role)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              {role.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {role.name}
                                </h3>
                                {selectedRole?.id === role.id && (
                                  <FaCheck className="text-purple-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !selectedRole}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Registering...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Back to personal info
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                    Login here
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
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Urban Chic Boutique</h2>
                <p className="text-sm opacity-90">Join our community of fashion enthusiasts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;