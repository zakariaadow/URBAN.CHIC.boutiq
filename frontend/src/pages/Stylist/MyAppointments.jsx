import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaCalendarCheck, 
  FaSearch, 
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaClock,
  FaUser,
  FaTag,
  FaMoneyBillWave,
  FaCamera,
  FaStickyNote,
  FaCheckDouble,
  FaHistory
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const MyAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/stylist/appointments';
      
      // Use different endpoints based on filter
      if (filter === 'today') {
        endpoint = '/api/stylist/appointments/today';
      } else if (filter === 'upcoming') {
        endpoint = '/api/stylist/appointments/upcoming';
      } else if (filter === 'history') {
        endpoint = '/api/stylist/appointments/history';
      }

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        const data = response.data.data;
        setAppointments(Array.isArray(data) ? data : data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const acceptAppointment = async (appointmentId) => {
    try {
      const response = await api.post(
        `/api/stylist/appointments/${appointmentId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Appointment accepted');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error accepting appointment:', error);
      toast.error('Failed to accept appointment');
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const response = await api.post(
        `/api/stylist/appointments/${appointmentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Appointment marked as completed');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Failed to complete appointment');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: FaClock },
      confirmed: { color: 'bg-blue-100 text-blue-700', icon: FaCheckCircle },
      'in-progress': { color: 'bg-purple-100 text-purple-700', icon: FaClock },
      completed: { color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-700', icon: FaTimes },
      'no-show': { color: 'bg-gray-100 text-gray-700', icon: FaTimes }
    };
    const info = statusMap[status] || statusMap.pending;
    const Icon = info.icon;
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${info.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaCalendarCheck className="mr-3 text-purple-600" />
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {appointments.length} appointments found
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="mt-4 sm:mt-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'today' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'upcoming' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('history')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'history' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {appt.service_name || 'Service'}
                    </h3>
                    {getStatusBadge(appt.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <FaUser className="mr-2 text-gray-400" />
                      {appt.customer_name || 'Customer'}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-gray-400" />
                      {appt.appointment_date} at {appt.appointment_time}
                    </div>
                    <div className="flex items-center">
                      <FaMoneyBillWave className="mr-2 text-gray-400" />
                      Ksh {appt.final_amount?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 lg:mt-0">
                  {appt.status === 'pending' && (
                    <button
                      onClick={() => acceptAppointment(appt.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FaCheckCircle className="mr-2" /> Accept
                    </button>
                  )}
                  
                  {appt.status === 'confirmed' && (
                    <button
                      onClick={() => completeAppointment(appt.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FaCheckDouble className="mr-2" /> Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setShowDetails(true);
                    }}
                    className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center"
                  >
                    <FaEye className="mr-2" /> Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaCalendarCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You have no appointments matching the current filter
            </p>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Appointment Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedAppointment.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedAppointment.service_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedAppointment.appointment_date} at {selectedAppointment.appointment_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Ksh {selectedAppointment.final_amount?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedAppointment.duration || 60} minutes
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => {
                      acceptAppointment(selectedAppointment.id);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaCheckCircle className="mr-2" /> Accept
                  </button>
                )}
                
                {selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      completeAppointment(selectedAppointment.id);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaCheckDouble className="mr-2" /> Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;