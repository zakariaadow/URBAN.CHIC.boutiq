import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaCalendarCheck, FaSearch, FaFilter, FaEye,
  FaCheck, FaTimes, FaSpinner, FaClock,
  FaUser, FaCut, FaStore, FaCalendarDay,
  FaChevronLeft, FaChevronRight, FaPhone,
  FaEnvelope, FaBuilding, FaMoneyBillWave,
  FaEdit, FaTrash, FaSave, FaPlus
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReceptionistAppointments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    stylist_id: '',
    branch_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchCustomers();
    fetchServices();
    fetchStylists();
    fetchBranches();
  }, [statusFilter, currentPage]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await axios.get('/api/receptionist/appointments', { params });
      
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      const transformedData = responseData.map(item => ({
        id: item.id,
        customer_id: item.customer_id || item.customer?.id,
        customer_name: item.customer?.user?.first_name && item.customer?.user?.last_name 
          ? `${item.customer.user.first_name} ${item.customer.user.last_name}`
          : item.customer_name || 'Walk In',
        customer_email: item.customer?.user?.email || item.customer_email || 'N/A',
        customer_phone: item.customer?.user?.phone || item.customer_phone || 'N/A',
        service_id: item.service_id || item.service?.id,
        service_name: item.service?.name || item.service_name || 'N/A',
        service_price: item.service?.price || item.price || 0,
        service_duration: item.service?.duration_minutes || item.duration || 0,
        branch_id: item.branch_id || item.branch?.id,
        branch_name: item.branch?.name || item.branch_name || 'N/A',
        stylist_id: item.stylist_id || item.stylist?.id,
        stylist_name: item.stylist?.user?.first_name && item.stylist?.user?.last_name
          ? `${item.stylist.user.first_name} ${item.stylist.user.last_name}`
          : item.stylist_name || 'Not assigned',
        status: item.status || 'pending',
        appointment_date: item.appointment_date || item.date_time || item.created_at?.split('T')[0] || '',
        appointment_time: item.appointment_time || item.time || '',
        final_amount: item.final_amount || item.total_amount || item.amount || 0,
        notes: item.notes || item.customer_notes || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setAppointments(transformedData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || transformedData.length);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        params: { role: 'customer', limit: 100 }
      });
      const data = response.data?.data || response.data || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/admin/services', {
        params: { is_active: 1, limit: 100 }
      });
      const data = response.data?.data || response.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStylists = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        params: { role: 'stylist', limit: 100 }
      });
      const data = response.data?.data || response.data || [];
      setStylists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stylists:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/admin/branches', {
        params: { is_active: 1, limit: 100 }
      });
      const data = response.data?.data || response.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingStatus(true);
    try {
      await axios.put(`/api/receptionist/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await axios.delete(`/api/receptionist/appointments/${id}`);
      toast.success('Appointment deleted successfully');
      fetchAppointments();
      if (showDetails) setShowDetails(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customer_id: appointment.customer_id || '',
      service_id: appointment.service_id || '',
      stylist_id: appointment.stylist_id || '',
      branch_id: appointment.branch_id || '',
      appointment_date: appointment.appointment_date || '',
      appointment_time: appointment.appointment_time || '',
      status: appointment.status || 'pending',
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updateData = {
        customer_id: parseInt(formData.customer_id),
        service_id: parseInt(formData.service_id),
        stylist_id: formData.stylist_id ? parseInt(formData.stylist_id) : null,
        branch_id: parseInt(formData.branch_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        status: formData.status,
        notes: formData.notes
      };
      
      await axios.put(`/api/receptionist/appointments/${editingAppointment.id}`, updateData);
      toast.success('Appointment updated successfully');
      setShowEditModal(false);
      setEditingAppointment(null);
      fetchAppointments();
      if (showDetails) setShowDetails(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'in-progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'no-show': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheck className="text-green-500" />;
      case 'cancelled': return <FaTimes className="text-red-500" />;
      case 'in-progress': return <FaClock className="text-purple-500" />;
      case 'confirmed': return <FaCheck className="text-blue-500" />;
      default: return <FaClock className="text-yellow-500" />;
    }
  };

  const filteredAppointments = Array.isArray(appointments) 
    ? appointments.filter(app => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          app.customer_name?.toLowerCase().includes(search) ||
          app.service_name?.toLowerCase().includes(search) ||
          app.branch_name?.toLowerCase().includes(search) ||
          app.stylist_name?.toLowerCase().includes(search)
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all appointments ({totalItems} total)
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/receptionist/checkin')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FaCalendarCheck className="mr-2" /> Check In
          </button>
          <button
            onClick={() => navigate('/receptionist/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <FaCalendarCheck className="mr-2" /> Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, service, branch, stylist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {appointment.customer_name}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <FaCut className="mr-2 text-purple-500" />
                      {appointment.service_name}
                    </div>
                    <div className="flex items-center">
                      <FaStore className="mr-2 text-green-500" />
                      {appointment.branch_name}
                    </div>
                    <div className="flex items-center">
                      <FaCalendarDay className="mr-2 text-blue-500" />
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center">
                      <FaUser className="mr-2 text-gray-500" />
                      {appointment.stylist_name}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {appointment.customer_email && appointment.customer_email !== 'N/A' && (
                      <span className="flex items-center">
                        <FaEnvelope className="mr-1" /> {appointment.customer_email}
                      </span>
                    )}
                    {appointment.customer_phone && appointment.customer_phone !== 'N/A' && (
                      <span className="flex items-center">
                        <FaPhone className="mr-1" /> {appointment.customer_phone}
                      </span>
                    )}
                    <span className="flex items-center font-medium text-gray-900 dark:text-white">
                      <FaMoneyBillWave className="mr-1 text-green-500" />
                      {formatCurrency(appointment.final_amount)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(appointment)}
                    className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                  
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        disabled={updatingStatus}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center disabled:opacity-50"
                      >
                        <FaCheck className="mr-1" /> Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        disabled={updatingStatus}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center disabled:opacity-50"
                      >
                        <FaTimes className="mr-1" /> Cancel
                      </button>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'in-progress')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center disabled:opacity-50"
                    >
                      <FaClock className="mr-1" /> Start
                    </button>
                  )}
                  
                  {appointment.status === 'in-progress' && (
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center disabled:opacity-50"
                    >
                      <FaCheck className="mr-1" /> Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaCalendarCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'No appointments match the selected filters'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Appointment Details
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedAppointment.customer_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(selectedAppointment.status)}`}>
                        {getStatusIcon(selectedAppointment.status)}
                        {selectedAppointment.status || 'pending'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {selectedAppointment.customer_email && selectedAppointment.customer_email !== 'N/A' && (
                        <p className="flex items-center"><FaEnvelope className="mr-2" /> {selectedAppointment.customer_email}</p>
                      )}
                      {selectedAppointment.customer_phone && selectedAppointment.customer_phone !== 'N/A' && (
                        <p className="flex items-center"><FaPhone className="mr-2" /> {selectedAppointment.customer_phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service & Appointment Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Service</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.service_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Duration: {selectedAppointment.service_duration} min
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Amount</label>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedAppointment.final_amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Branch</label>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      <FaBuilding className="mr-2" /> {selectedAppointment.branch_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Stylist</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.stylist_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Date & Time</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedAppointment.appointment_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Booked On</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedAppointment.created_at)}
                    </p>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Notes</label>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-1">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setShowDetails(false);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleEdit(selectedAppointment);
                  }}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedAppointment.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'confirmed');
                      setShowDetails(false);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Confirm Appointment
                  </button>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'in-progress');
                      setShowDetails(false);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start Service
                  </button>
                )}
                {selectedAppointment.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedAppointment.id, 'completed');
                      setShowDetails(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowEditModal(false);
            setEditingAppointment(null);
          }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Appointment
                </h2>
                <button onClick={() => {
                  setShowEditModal(false);
                  setEditingAppointment(null);
                }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.customer_id}
                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.service_id}
                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatCurrency(service.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.branch_id}
                        onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stylist
                      </label>
                      <select
                        value={formData.stylist_id}
                        onChange={(e) => setFormData({ ...formData, stylist_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Stylist</option>
                        {stylists.map((stylist) => (
                          <option key={stylist.id} value={stylist.id}>
                            {stylist.first_name} {stylist.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.appointment_time}
                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAppointment(null);
                    }}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Update Appointment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistAppointments;