import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCalendarCheck, FaUser, FaCut, FaBuilding,
  FaSearch, FaFilter, FaEye, FaTimes,
  FaCheckCircle, FaClock, FaSpinner,
  FaChevronLeft, FaChevronRight, FaCalendarDay,
  FaMoneyBillWave, FaDownload, FaPrint,
  FaUserCheck, FaUserTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminAppointments = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchAppointments();
    fetchBranches();
  }, [currentPage, statusFilter, branchFilter, dateFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        branch_id: branchFilter !== 'all' ? branchFilter : undefined,
        date: dateFilter || undefined
      };
      
      console.log('Fetching appointments with params:', params);
      const response = await api.get('/api/admin/appointments', { ...config, params });
      
      // Handle different response structures
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      setAppointments(responseData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || responseData.length);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      toast.error(t('admin.appointments.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/admin/branches', config);
      const branchesData = response.data?.data || response.data || [];
      setBranches(Array.isArray(branchesData) ? branchesData : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingStatus(true);
    try {
      // Try both possible endpoints
      try {
        await api.put(`/api/admin/appointments/${id}/status`, { status }, config);
      } catch (error) {
        // If the above fails, try alternative endpoint
        await api.patch(`/api/admin/appointments/${id}`, { status }, config);
      }
      toast.success(t('admin.appointments.statusUpdateSuccess'));
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('admin.appointments.statusUpdateError'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.appointments.deleteConfirmation'))) return;
    try {
      await api.delete(`/api/admin/appointments/${id}`, config);
      toast.success(t('admin.appointments.deleteSuccess'));
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(t('admin.appointments.deleteError'));
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
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaTimes className="text-red-500" />;
      case 'in-progress': return <FaClock className="text-purple-500" />;
      case 'confirmed': return <FaUserCheck className="text-blue-500" />;
      case 'no-show': return <FaUserTimes className="text-gray-500" />;
      default: return <FaClock className="text-yellow-500" />;
    }
  };

  // Filter appointments by search term
  const filteredAppointments = Array.isArray(appointments) 
    ? appointments.filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const customerName = item.customer?.user?.first_name + ' ' + item.customer?.user?.last_name || item.customer_name || '';
        const serviceName = item.service?.name || item.service_name || '';
        const customerEmail = item.customer?.user?.email || item.customer_email || '';
        
        return (
          customerName.toLowerCase().includes(search) ||
          serviceName.toLowerCase().includes(search) ||
          customerEmail.toLowerCase().includes(search)
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.appointments.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.appointments.subtitle')} ({Array.isArray(appointments) ? appointments.length : 0})
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <FaPrint className="mr-2" /> {t('admin.appointments.print')}
          </button>
          <button
            onClick={() => toast.info(t('admin.appointments.exportComing'))}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaDownload className="mr-2" /> {t('admin.appointments.export')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.appointments.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('admin.appointments.allStatus')}</option>
            <option value="pending">{t('admin.appointments.pending')}</option>
            <option value="confirmed">{t('admin.appointments.confirmed')}</option>
            <option value="in-progress">{t('admin.appointments.inProgress')}</option>
            <option value="completed">{t('admin.appointments.completed')}</option>
            <option value="cancelled">{t('admin.appointments.cancelled')}</option>
            <option value="no-show">{t('admin.appointments.noShow')}</option>
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('admin.appointments.allBranches')}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.appointments.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.appointments.service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.appointments.dateTime')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.appointments.branch')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.appointments.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.appointments.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <FaUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {appointment.customer?.user?.first_name} {appointment.customer?.user?.last_name || appointment.customer_name || 'N/A'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {appointment.customer?.user?.email || appointment.customer_email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaCut className="text-purple-500 mr-2" />
                        <span className="text-gray-900 dark:text-white">
                          {appointment.service?.name || appointment.service_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FaCalendarDay className="mr-2 text-blue-500" />
                        {appointment.appointment_date && appointment.appointment_time 
                          ? formatDate(`${appointment.appointment_date} ${appointment.appointment_time}`)
                          : formatDate(appointment.date_time || appointment.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FaBuilding className="mr-2 text-green-500" />
                        {appointment.branch?.name || appointment.branch_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status || 'pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <select
                          value={appointment.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(appointment.id, e.target.value)}
                          disabled={updatingStatus}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No Show</option>
                        </select>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('admin.appointments.noAppointments')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.showing')} {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
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
              {currentPage}
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

      {/* Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('admin.appointments.details')}
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.customer')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.customer?.user?.first_name} {selectedAppointment.customer?.user?.last_name || selectedAppointment.customer_name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedAppointment.customer?.user?.email || selectedAppointment.customer_email || 'N/A'}
                    </p>
                    {selectedAppointment.customer?.user?.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedAppointment.customer.user.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.service')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.service?.name || selectedAppointment.service_name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('admin.appointments.price')}: {formatCurrency(selectedAppointment.service?.price || selectedAppointment.price || 0)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('admin.appointments.duration')}: {selectedAppointment.service?.duration_minutes || selectedAppointment.duration || 'N/A'} min
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.dateTime')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.appointment_date && selectedAppointment.appointment_time 
                        ? formatDate(`${selectedAppointment.appointment_date} ${selectedAppointment.appointment_time}`)
                        : formatDate(selectedAppointment.date_time || selectedAppointment.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.branch')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.branch?.name || selectedAppointment.branch_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.stylist')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAppointment.stylist?.user?.first_name} {selectedAppointment.stylist?.user?.last_name || selectedAppointment.stylist_name || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.status')}</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedAppointment.status)}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.totalAmount')}</label>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    {formatCurrency(selectedAppointment.total_amount || selectedAppointment.final_amount || selectedAppointment.price || 0)}
                  </p>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.appointments.notes')}</label>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;