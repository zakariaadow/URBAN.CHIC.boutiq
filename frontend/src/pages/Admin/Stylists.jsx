import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaUser, FaEnvelope, FaPhone, FaBuilding,
  FaEdit, FaTrash, FaSearch, FaFilter,
  FaCheckCircle, FaTimes, FaSpinner,
  FaPlus, FaEye, FaUserCheck, FaUserTimes,
  FaCalendarDay, FaCut, FaStar,
  FaClock, FaAward, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Stylists = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stylists, setStylists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingStylist, setEditingStylist] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchStylists();
  }, [currentPage, statusFilter]);

  const fetchStylists = async () => {
    setLoading(true);
    try {
      // Fetch stylists with their details
      const response = await api.get('/api/admin/users', {
        ...config,
        params: {
          role: 'stylist',
          page: currentPage,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      
      const data = response.data?.data || response.data || [];
      
      // Enhance stylist data with stylist table information
      const enhancedStylists = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (user) => {
          try {
            // Fetch stylist details from stylists table
            const stylistRes = await api.get(`/api/admin/stylists/user/${user.id}`, config);
            const stylistData = stylistRes.data?.data || stylistRes.data || {};
            return {
              ...user,
              user_id: user.id,
              specialization: stylistData.specialization || user.specialties || 'General Stylist',
              is_available: stylistData.is_available !== undefined ? stylistData.is_available : true,
              stylist_id: stylistData.id
            };
          } catch (error) {
            // If no stylist record exists, return user data with defaults
            return {
              ...user,
              specialization: user.specialties || 'General Stylist',
              is_available: true
            };
          }
        })
      );
      
      setStylists(enhancedStylists);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching stylists:', error);
      setStylists([]);
      toast.error(t('admin.stylists.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: 'stylist',
        password: formData.password
      };

      let userId;
      if (editingStylist) {
        // Update user
        await api.put(`/api/admin/users/${editingStylist.id}`, userData, config);
        userId = editingStylist.id;
        toast.success(t('admin.stylists.updateSuccess'));
      } else {
        // Create user
        const response = await api.post('/api/admin/users', userData, config);
        userId = response.data?.data?.id || response.data?.id;
        toast.success(t('admin.stylists.createSuccess'));
      }

      // Update or create stylist record
      if (userId) {
        const stylistData = {
          user_id: userId,
          specialization: formData.specialization,
          is_available: true,
          is_active: true
        };
        
        if (editingStylist?.stylist_id) {
          await api.put(`/api/admin/stylists/${editingStylist.stylist_id}`, stylistData, config);
        } else {
          await api.post('/api/admin/stylists', stylistData, config);
        }
      }

      resetForm();
      fetchStylists();
    } catch (error) {
      console.error('Error saving stylist:', error);
      toast.error(error.response?.data?.message || t('admin.stylists.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    try {
      await api.post(`/api/admin/users/${id}/${action}`, {}, config);
      toast.success(t(`admin.stylists.${action}Success`));
      fetchStylists();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('admin.stylists.statusError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.stylists.deleteConfirmation'))) return;
    try {
      await api.delete(`/api/admin/users/${id}`, config);
      toast.success(t('admin.stylists.deleteSuccess'));
      fetchStylists();
    } catch (error) {
      console.error('Error deleting stylist:', error);
      toast.error(t('admin.stylists.deleteError'));
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '',
      password: ''
    });
    setEditingStylist(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const filteredStylists = Array.isArray(stylists) 
    ? stylists.filter(stylist => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const fullName = `${stylist.first_name || ''} ${stylist.last_name || ''}`.toLowerCase();
        return (
          fullName.includes(search) ||
          stylist.email?.toLowerCase().includes(search) ||
          stylist.specialization?.toLowerCase().includes(search) ||
          stylist.first_name?.toLowerCase().includes(search) ||
          stylist.last_name?.toLowerCase().includes(search)
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
            {t('admin.stylists.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.stylists.subtitle')} ({Array.isArray(stylists) ? stylists.length : 0})
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.stylists.addStylist')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.stylists.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
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
                {t(`admin.stylists.${status}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stylists Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stylists.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stylists.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stylists.specialization')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stylists.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stylists.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStylists.length > 0 ? (
                filteredStylists.map((stylist) => (
                  <tr key={stylist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <FaUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stylist.first_name} {stylist.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{stylist.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FaCut className="mr-2 text-purple-500" />
                        {stylist.specialization || 'General Stylist'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          stylist.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {stylist.status || 'inactive'}
                        </span>
                        {stylist.is_available && stylist.status === 'active' && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Available
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedStylist(stylist);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStylist(stylist);
                            setFormData({
                              first_name: stylist.first_name || '',
                              last_name: stylist.last_name || '',
                              email: stylist.email || '',
                              phone: stylist.phone || '',
                              specialization: stylist.specialization || '',
                              experience: stylist.experience || '',
                              password: ''
                            });
                            setShowForm(true);
                          }}
                          className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(stylist.id, stylist.status)}
                          className={`p-1 transition-colors ${
                            stylist.status === 'active'
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {stylist.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                        </button>
                        <button 
                          onClick={() => handleDelete(stylist.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('admin.stylists.noStylists')}
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
            {t('common.showing')} {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, Array.isArray(stylists) ? stylists.length : 0)} of {Array.isArray(stylists) ? stylists.length : 0}
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingStylist ? t('admin.stylists.editStylist') : t('admin.stylists.addStylist')}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('admin.stylists.firstName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('admin.stylists.lastName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.stylists.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.stylists.phone')}
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
                      {t('admin.stylists.specialization')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Hair Styling, Makeup, Nails"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.stylists.experience')}
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 5 years"
                    />
                  </div>
                  {!editingStylist && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('admin.stylists.password')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required={!editingStylist}
                        minLength="6"
                      />
                    </div>
                  )}
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        {t('common.saving')}
                      </>
                    ) : (
                      editingStylist ? t('common.update') : t('common.add')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedStylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('admin.stylists.details')}
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FaUser className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedStylist.first_name} {selectedStylist.last_name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FaStar className="text-yellow-400" />
                      {selectedStylist.rating || 'New'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stylists.email')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStylist.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stylists.phone')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedStylist.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stylists.specialization')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedStylist.specialization || 'General Stylist'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stylists.experience')}</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedStylist.experience || 'Experienced'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stylists.status')}</label>
                    <p className={`font-medium ${selectedStylist.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedStylist.status || 'inactive'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stylists.availability')}</label>
                    <p className={`font-medium ${selectedStylist.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedStylist.is_available ? 'Available' : 'Unavailable'}
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

export default Stylists;