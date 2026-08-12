import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaUser, FaEnvelope, FaPhone, FaSearch,
  FaEye, FaUserCheck, FaUserTimes,
  FaSpinner, FaTimes, FaChevronLeft, FaChevronRight,
  FaPlus, FaEdit, FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// ==================== CUSTOMER FORM MODAL ====================
const CustomerFormModal = ({ isOpen, onClose, onSubmit, initialData, submitting, t }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.full_name || initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: ''
      });
    } else {
      setFormData({ name: '', email: '', phone: '', password: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? (t('admin.customers.editCustomer') || 'Edit Customer') : (t('admin.customers.addCustomer') || 'Add Customer')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.customers.name') || 'Full Name'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.customers.email') || 'Email'}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.customers.phone') || 'Phone Number'}
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {!initialData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.customers.password') || 'Password'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!initialData}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {submitting ? <FaSpinner className="animate-spin mr-2" /> : null}
              {submitting ? (t('common.saving') || 'Saving...') : (initialData ? (t('common.update') || 'Update') : (t('common.create') || 'Create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const Customers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Only fetch users with the 'customer' role
      const response = await api.get('/api/admin/users', {
        ...config,
        params: {
          role: 'customer',
          page: currentPage,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });

      let usersData = [];
      if (response.data?.data?.items) {
        usersData = response.data.data.items;
      } else if (Array.isArray(response.data?.data)) {
        usersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else {
        usersData = [];
      }

      setUsers(usersData);
      
      if (response.data?.data?.pages) {
        setTotalPages(response.data.data.pages);
      } else if (response.data?.totalPages) {
        setTotalPages(response.data.totalPages);
      } else {
        setTotalPages(1);
      }

    } catch (error) {
      console.error('Error fetching customers:', error);
      setUsers([]);
      toast.error(t('admin.customers.loadError') || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD: Handle Add/Edit Submission
  const handleSubmitForm = async (formData) => {
    setSubmitting(true);
    try {
      let response;
      if (editingUser) {
        // UPDATE EXISTING
        response = await api.put(`/api/admin/users/${editingUser.id}`, formData, config);
        toast.success(t('admin.customers.updateSuccess') || 'Customer updated successfully');
      } else {
        // CREATE NEW (Force role to be customer)
        response = await api.post('/api/admin/users', { ...formData, role: 'customer' }, config);
        toast.success(t('admin.customers.addSuccess') || 'Customer added successfully');
      }
      closeForm();
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(error.response?.data?.message || t('admin.customers.saveError') || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    try {
      await api.post(`/api/admin/users/${id}/${action}`, {}, config);
      toast.success(t(`admin.customers.${action}Success`) || `Customer ${action}d successfully`);
      fetchCustomers();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('admin.customers.statusError') || 'Failed to update status');
    }
  };

  // ✅ ADD: Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.customers.confirmDelete') || 'Are you sure you want to delete this customer?')) {
      return;
    }
    try {
      await api.delete(`/api/admin/users/${id}`, config);
      toast.success(t('admin.customers.deleteSuccess') || 'Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(t('admin.customers.deleteError') || 'Failed to delete customer');
    }
  };

  // ✅ ADD: Handle closing the form
  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          user.full_name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.phone?.toLowerCase().includes(search) ||
          user.username?.toLowerCase().includes(search)
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.customers.title') || 'Customer Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.customers.subtitle') || 'Manage all customers'} ({Array.isArray(users) ? users.length : 0})
          </p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.customers.addCustomer') || 'Add Customer'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.customers.search') || 'Search customers...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t(`admin.customers.${status}`) || status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.name') || 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.email') || 'Email'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.phone') || 'Phone'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.joined') || 'Joined'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.status') || 'Status'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.customers.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <FaUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.full_name || user.username || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {user.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingUser(user); setShowForm(true); }}
                          className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit Customer"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.status)} 
                          className={`p-1 ${user.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} transition-colors`}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Customer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('admin.customers.noCustomers') || 'No customers found'}
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
            Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, filteredUsers.length)} of {filteredUsers.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <FaChevronLeft />
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* ==================== CUSTOMER FORM MODAL ==================== */}
      <CustomerFormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmitForm}
        initialData={editingUser}
        submitting={submitting}
        t={t}
      />
    </div>
  );
};

export default Customers;