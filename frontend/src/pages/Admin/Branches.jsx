import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaEdit, FaTrash, FaSearch, FaFilter,
  FaCheckCircle, FaTimes, FaSpinner,
  FaPlus, FaEye, FaToggleOn, FaToggleOff,
  FaCalendarDay, FaUsers, FaCity, FaClock,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Branches = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    country: 'Kenya',
    phone: '',
    email: '',
    manager_name: '',
    opening_time: '08:00',
    closing_time: '20:00',
    days_open: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchBranches();
  }, [currentPage, statusFilter]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        is_active: statusFilter !== 'all' ? (statusFilter === 'active' ? 1 : 0) : undefined
      };
      
      const response = await api.get('/api/admin/branches', { params });
      
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      setBranches(responseData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || responseData.length);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
      toast.error(t('admin.branches.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let endpoint = '';
      let submitData = {
        name: formData.name,
        code: formData.code,
        address: formData.address || '',
        city: formData.city || '',
        country: formData.country || 'Kenya',
        phone: formData.phone || '',
        email: formData.email || '',
        manager_name: formData.manager_name || '',
        opening_time: formData.opening_time || '08:00',
        closing_time: formData.closing_time || '20:00',
        days_open: formData.days_open || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        is_active: formData.is_active
      };

      if (editingBranch) {
        endpoint = `/api/admin/branches/${editingBranch.id}`;
        await api.put(endpoint, submitData);
        toast.success(t('admin.branches.updateSuccess'));
      } else {
        endpoint = '/api/admin/branches';
        await api.post(endpoint, submitData);
        toast.success(t('admin.branches.createSuccess'));
      }
      
      resetForm();
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error(error.response?.data?.message || t('admin.branches.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === true || currentStatus === 1 ? false : true;
      await api.put(`/api/admin/branches/${id}`, { is_active: newStatus });
      toast.success(t('admin.branches.statusUpdateSuccess'));
      fetchBranches();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('admin.branches.statusError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.branches.deleteConfirmation'))) return;
    try {
      await api.delete(`/api/admin/branches/${id}`);
      toast.success(t('admin.branches.deleteSuccess'));
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error(t('admin.branches.deleteError'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      country: 'Kenya',
      phone: '',
      email: '',
      manager_name: '',
      opening_time: '08:00',
      closing_time: '20:00',
      days_open: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      is_active: true
    });
    setEditingBranch(null);
    setShowForm(false);
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.days_open || [];
      if (days.includes(day)) {
        return { ...prev, days_open: days.filter(d => d !== day) };
      } else {
        return { ...prev, days_open: [...days, day] };
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getDaysOpenDisplay = (daysOpen) => {
    if (!daysOpen || !Array.isArray(daysOpen)) return 'N/A';
    if (daysOpen.length === 7) return 'Open Daily';
    if (daysOpen.length === 0) return 'Closed';
    return daysOpen.join(', ');
  };

  const filteredBranches = Array.isArray(branches) 
    ? branches.filter(branch => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          branch.name?.toLowerCase().includes(search) ||
          branch.city?.toLowerCase().includes(search) ||
          branch.code?.toLowerCase().includes(search) ||
          branch.address?.toLowerCase().includes(search) ||
          branch.manager_name?.toLowerCase().includes(search)
        );
      })
    : [];

  if (loading && branches.length === 0) {
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
            {t('admin.branches.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.branches.subtitle')} ({totalItems} total)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.branches.addBranch')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.branches.search')}
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
                {t(`admin.branches.${status}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.length > 0 ? (
          filteredBranches.map((branch) => (
            <div key={branch.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <FaBuilding className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{branch.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Code: {branch.code || 'N/A'}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(branch.is_active)}`}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => { setSelectedBranch(branch); setShowDetails(true); }} 
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => { 
                        setEditingBranch(branch); 
                        setFormData({ 
                          name: branch.name || '',
                          code: branch.code || '',
                          address: branch.address || '',
                          city: branch.city || '',
                          country: branch.country || 'Kenya',
                          phone: branch.phone || '',
                          email: branch.email || '',
                          manager_name: branch.manager_name || '',
                          opening_time: branch.opening_time || '08:00',
                          closing_time: branch.closing_time || '20:00',
                          days_open: branch.days_open || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                          is_active: branch.is_active === 1 || branch.is_active === true
                        }); 
                        setShowForm(true); 
                      }} 
                      className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(branch.id, branch.is_active)} 
                      className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
                      title="Toggle Status"
                    >
                      {branch.is_active ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button 
                      onClick={() => handleDelete(branch.id)} 
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start text-gray-600 dark:text-gray-400">
                    <FaMapMarkerAlt className="mr-2 mt-1 text-gray-400 flex-shrink-0" />
                    <span>{branch.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaCity className="mr-2 text-gray-400" />
                    {branch.city || 'N/A'}
                  </div>
                  {branch.phone && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaPhone className="mr-2 text-gray-400" />
                      {branch.phone}
                    </div>
                  )}
                  {branch.manager_name && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaUsers className="mr-2 text-gray-400" />
                      Manager: {branch.manager_name}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaClock className="mr-2 text-gray-400" />
                    {branch.opening_time || 'N/A'} - {branch.closing_time || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.branches.noBranches')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.branches.noBranchesDesc')}
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
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingBranch ? t('admin.branches.editBranch') : t('admin.branches.addBranch')}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Branch Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Branch Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Manager Name
                    </label>
                    <input
                      type="text"
                      value={formData.manager_name}
                      onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        value={formData.opening_time}
                        onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        value={formData.closing_time}
                        onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Days Open
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            formData.days_open?.includes(day)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        {t('common.saving')}
                      </>
                    ) : (
                      editingBranch ? t('common.update') : t('common.add')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Branch Details Modal */}
      {showDetails && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('admin.branches.details')}
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <FaBuilding className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedBranch.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(selectedBranch.is_active)}`}>
                        {selectedBranch.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Code: {selectedBranch.code}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Address</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.address || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">City</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.city || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Manager</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.manager_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Hours</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.opening_time || 'N/A'} - {selectedBranch.closing_time || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Days Open</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getDaysOpenDisplay(selectedBranch.days_open)}
                    </p>
                  </div>
                </div>
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

export default Branches;