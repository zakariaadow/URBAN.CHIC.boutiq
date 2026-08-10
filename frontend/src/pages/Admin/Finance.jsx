import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaUser, FaEnvelope, FaPhone, FaBuilding,
  FaEdit, FaTrash, FaSearch, FaFilter,
  FaCheckCircle, FaTimes, FaSpinner,
  FaPlus, FaEye, FaUserCheck, FaUserTimes,
  FaCalendarDay, FaMoneyBillWave
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// ==================== FORM MODAL COMPONENT ====================
const FinanceFormModal = ({ isOpen, onClose, onSubmit, initialData, branches, submitting, t }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch_id: '',
    password: ''
  });

  // Reset form when modal opens/closes or editing officer changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        branch_id: initialData.branch_id || '',
        password: '' // Password is never pre-filled
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        branch_id: '',
        password: ''
      });
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? (t('admin.finance.editOfficer') || 'Edit Finance Officer') : (t('admin.finance.addOfficer') || 'Add Finance Officer')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.finance.name') || 'Full Name'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.finance.email') || 'Email'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.finance.phone') || 'Phone Number'}
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.finance.branch') || 'Branch'}
              </label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('admin.finance.selectBranch') || 'Select a branch'}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {!initialData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.finance.password') || 'Password'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!initialData}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {submitting ? <FaSpinner className="animate-spin mr-2" /> : null}
                {submitting ? (t('common.saving') || 'Saving...') : (initialData ? (t('common.update') || 'Update') : (t('common.create') || 'Create'))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const Finance = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [financeOfficers, setFinanceOfficers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [branches, setBranches] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchFinanceOfficers();
    fetchBranches();
  }, [currentPage, statusFilter]);

  const fetchFinanceOfficers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users', {
        ...config,
        params: {
          role: 'finance',
          page: currentPage,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      const data = response.data?.data || response.data || [];
      setFinanceOfficers(Array.isArray(data) ? data : []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching finance officers:', error);
      setFinanceOfficers([]);
      toast.error(t('admin.finance.loadError') || 'Failed to load finance officers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/admin/branches', config);
      const data = response.data?.data || response.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // ✅ ADD: Handle Add/Edit Submission
  const handleSubmitForm = async (formData) => {
    setSubmitting(true);
    try {
      let response;
      if (editingOfficer) {
        // UPDATE EXISTING
        response = await axios.put(`/api/admin/users/${editingOfficer.id}`, formData, config);
        toast.success(t('admin.finance.updateSuccess') || 'Finance officer updated successfully');
      } else {
        // CREATE NEW
        response = await axios.post('/api/admin/users', { ...formData, role: 'finance' }, config);
        toast.success(t('admin.finance.addSuccess') || 'Finance officer added successfully');
      }
      closeForm();
      fetchFinanceOfficers();
    } catch (error) {
      console.error('Error saving finance officer:', error);
      toast.error(error.response?.data?.message || t('admin.finance.saveError') || 'Failed to save finance officer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    try {
      await axios.post(`/api/admin/users/${id}/${action}`, {}, config);
      toast.success(t(`admin.finance.${action}Success`) || `User ${action}d successfully`);
      fetchFinanceOfficers();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('admin.finance.statusError') || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.finance.confirmDelete') || 'Are you sure you want to delete this finance officer?')) {
      return;
    }
    try {
      await axios.delete(`/api/admin/users/${id}`, config);
      toast.success(t('admin.finance.deleteSuccess') || 'Finance officer deleted successfully');
      fetchFinanceOfficers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('admin.finance.deleteError') || 'Failed to delete finance officer');
    }
  };

  // ✅ ADD: Handle closing the form
  const closeForm = () => {
    setShowForm(false);
    setEditingOfficer(null);
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

  const filteredOfficers = Array.isArray(financeOfficers) 
    ? financeOfficers.filter(officer => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          officer.name?.toLowerCase().includes(search) ||
          officer.email?.toLowerCase().includes(search)
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
            {t('admin.finance.title') || 'Finance Officers'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.finance.subtitle') || 'Manage finance officers'} ({Array.isArray(financeOfficers) ? financeOfficers.length : 0})
          </p>
        </div>
        <button
          onClick={() => { setEditingOfficer(null); setShowForm(true); }}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.finance.addOfficer') || 'Add Officer'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.finance.search') || 'Search officers...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                {t(`admin.finance.${status}`) || status}
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
                  {t('admin.finance.name') || 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.finance.email') || 'Email'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.finance.branch') || 'Branch'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.finance.status') || 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.finance.joined') || 'Joined'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.finance.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOfficers.length > 0 ? (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <FaUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{officer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{officer.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{officer.branch_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        officer.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {officer.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(officer.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedOfficer(officer); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 transition-colors"><FaEye /></button>
                        <button onClick={() => { setEditingOfficer(officer); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"><FaEdit /></button>
                        <button onClick={() => handleToggleStatus(officer.id, officer.status)} className={`p-1 ${officer.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} transition-colors`}>
                          {officer.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                        </button>
                        <button onClick={() => handleDelete(officer.id)} className="p-1 text-red-600 hover:text-red-800 transition-colors"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('admin.finance.noOfficers') || 'No finance officers found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== FORM MODAL ==================== */}
      <FinanceFormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmitForm}
        initialData={editingOfficer}
        branches={branches}
        submitting={submitting}
        t={t}
      />
    </div>
  );
};

export default Finance;