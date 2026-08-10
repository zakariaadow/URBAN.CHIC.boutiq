import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaCalendarCheck, FaClock, FaUser, FaStore, FaTag, 
  FaMoneyBillWave, FaEye, FaTimes, FaCheckCircle,
  FaSpinner, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCreditCard, FaMobileAlt, FaUniversity, FaWallet
} from 'react-icons/fa';

const MyAppointments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    amount: 0,
    appointment_id: null
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchAppointments();
    fetchPaymentMethods();
  }, [currentPage, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/customer/appointments/upcoming', {
        ...config,
        params: { 
          page: currentPage, 
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      
      let data = [];
      if (response.data?.data) {
        data = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      setAppointments(Array.isArray(data) ? data : []);
      setTotalPages(response.data?.pages || response.data?.totalPages || 1);
      setTotalCount(response.data?.total || response.data?.count || 0);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/api/customer/payments/methods', config);
      
      let methods = [];
      if (response.data?.data) {
        methods = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        methods = response.data;
      }
      
      // If methods is empty or not an array, use default methods as objects
      if (!Array.isArray(methods) || methods.length === 0) {
        methods = [
          { id: 'cash', name: 'Cash', icon: 'cash' },
          { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
          { id: 'mobile_money', name: 'Mobile Money', icon: 'mobile' },
          { id: 'bank_transfer', name: 'Bank Transfer', icon: 'bank' }
        ];
      }
      
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([
        { id: 'cash', name: 'Cash', icon: 'cash' },
        { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
        { id: 'mobile_money', name: 'Mobile Money', icon: 'mobile' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: 'bank' }
      ]);
    }
  };

  const getPaymentMethodName = (method) => {
    const nameMap = {
      'cash': 'Cash',
      'card': 'Card',
      'mobile_money': 'Mobile Money',
      'bank_transfer': 'Bank Transfer',
      'm-pesa': 'M-Pesa',
      'mpesa': 'M-Pesa'
    };
    return nameMap[method] || method?.replace('_', ' ') || method || 'N/A';
  };

  const getPaymentMethodIcon = (method) => {
    const iconMap = {
      'cash': <FaMoneyBillWave className="text-green-500" />,
      'card': <FaCreditCard className="text-blue-500" />,
      'mobile_money': <FaMobileAlt className="text-purple-500" />,
      'bank_transfer': <FaUniversity className="text-indigo-500" />
    };
    return iconMap[method] || <FaCreditCard className="text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { icon: <FaClock className="text-yellow-500" />, label: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      'confirmed': { icon: <FaCheckCircle className="text-blue-500" />, label: 'Confirmed', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      'in_progress': { icon: <FaClock className="text-purple-500" />, label: 'In Progress', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      'completed': { icon: <FaCheckCircle className="text-green-500" />, label: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'cancelled': { icon: <FaTimes className="text-red-500" />, label: 'Cancelled', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  const handlePayNow = (appointment) => {
    setPaymentData({
      payment_method: '',
      amount: appointment.total_amount || 0,
      appointment_id: appointment.id
    });
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!paymentData.payment_method) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await axios.post(
        '/api/customer/payments',
        {
          appointment_id: paymentData.appointment_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method
        },
        config
      );

      toast.success('Payment completed successfully!');
      setShowPaymentModal(false);
      setPaymentData({
        payment_method: '',
        amount: 0,
        appointment_id: null
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await axios.post(
        `/api/customer/appointments/${appointmentId}/cancel`,
        {},
        config
      );
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(app => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (app.service_name || '').toLowerCase().includes(search) ||
      (app.branch_name || '').toLowerCase().includes(search) ||
      (app.stylist_name || '').toLowerCase().includes(search)
    );
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your appointments
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments Grid */}
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment) => {
              const status = getStatusBadge(appointment.status);
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {appointment.service_name || 'Service'}
                        </h3>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 mt-1 ${status.class}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaCalendarCheck className="text-blue-500" />
                        <span>{formatDate(appointment.date)}</span>
                        <span className="mx-1">•</span>
                        <FaClock className="text-purple-500" />
                        <span>{formatTime(appointment.time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaStore className="text-orange-500" />
                        <span>{appointment.branch_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaUser className="text-green-500" />
                        <span>{appointment.stylist_name || 'Not Assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaMoneyBillWave className="text-green-500" />
                        <span>{formatCurrency(appointment.total_amount)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetails(true);
                        }}
                        className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        <FaEye className="mr-2" /> View
                      </button>
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handlePayNow(appointment)}
                            className="flex-1 px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
                          >
                            <FaWallet className="mr-2" /> Pay Now
                          </button>
                          <button
                            onClick={() => cancelAppointment(appointment.id)}
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarCheck className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Book your first appointment today!
            </p>
            <button
              onClick={() => navigate('/customer/book-appointment')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCount)} of {totalCount}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Complete Payment
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedAppointment.total_amount || 0)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      // Handle both string and object payment methods
                      const methodId = typeof method === 'string' ? method : method.id || method.name;
                      const methodName = typeof method === 'string' ? method : method.name || method.id;
                      
                      return (
                        <button
                          key={methodId}
                          onClick={() => setPaymentData({ ...paymentData, payment_method: methodId })}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            paymentData.payment_method === methodId
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {getPaymentMethodIcon(methodId)}
                            <span className="text-sm capitalize">{getPaymentMethodName(methodId)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={!paymentData.payment_method || processingPayment}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processingPayment ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaWallet className="mr-2" /> Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Appointment Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.service_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(selectedAppointment.status).class}`}>
                      {getStatusBadge(selectedAppointment.status).icon}
                      {getStatusBadge(selectedAppointment.status).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedAppointment.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatTime(selectedAppointment.time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Branch</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.branch_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stylist</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.stylist_name || 'Not Assigned'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(selectedAppointment.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handlePayNow(selectedAppointment);
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
                    >
                      <FaWallet className="mr-2" /> Pay Now
                    </button>
                    <button
                      onClick={() => {
                        cancelAppointment(selectedAppointment.id);
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                    >
                      <FaTimes className="mr-2" /> Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
