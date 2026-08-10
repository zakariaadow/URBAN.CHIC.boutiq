import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaShieldAlt, FaUserCog, FaEdit, FaTrash,
  FaSearch, FaPlus, FaSpinner, FaTimes,
  FaCheck, FaTimes as FaTimesIcon,
  FaChevronLeft, FaChevronRight, FaLock,
  FaUnlock, FaKey, FaEye
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const RolesPermissions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [currentPage]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      const response = await axios.get('/api/admin/roles', { ...config, params });
      const data = response.data?.data || response.data || [];
      setRoles(Array.isArray(data) ? data : []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
      toast.error(t('admin.roles.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get('/api/admin/permissions', config);
      const data = response.data?.data || response.data || [];
      setPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRole) {
        await axios.put(`/api/admin/roles/${editingRole.id}`, formData, config);
        toast.success(t('admin.roles.updateSuccess'));
      } else {
        await axios.post('/api/admin/roles', formData, config);
        toast.success(t('admin.roles.createSuccess'));
      }
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.message || t('admin.roles.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePermissions = async (roleId, permissions) => {
    try {
      await axios.put(`/api/admin/roles/${roleId}/permissions`, { permissions }, config);
      toast.success(t('admin.roles.permissionsUpdateSuccess'));
      fetchRoles();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error(t('admin.roles.permissionsUpdateError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.roles.deleteConfirmation'))) return;
    try {
      await axios.delete(`/api/admin/roles/${id}`, config);
      toast.success(t('admin.roles.deleteSuccess'));
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(t('admin.roles.deleteError'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setEditingRole(null);
    setShowForm(false);
  };

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // FIXED: Added : [] at the end
  const filteredRoles = Array.isArray(roles) 
    ? roles.filter(role => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          role.name?.toLowerCase().includes(search) ||
          role.description?.toLowerCase().includes(search)
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
            {t('admin.roles.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.roles.subtitle')} ({Array.isArray(roles) ? roles.length : 0})
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.roles.addRole')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.roles.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                      <FaShieldAlt className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {role.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {role.permissions_count || 0} permissions
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setShowDetails(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaKey />
                    </button>
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setFormData({
                          name: role.name,
                          description: role.description || '',
                          permissions: role.permissions || []
                        });
                        setShowForm(true);
                      }}
                      className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    {role.name !== 'admin' && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {role.description || 'No description available'}
                </p>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.isArray(role.permissions) && role.permissions.slice(0, 5).map((perm) => (
                    <span key={perm.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded">
                      {perm.name}
                    </span>
                  ))}
                  {Array.isArray(role.permissions) && role.permissions.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded">
                      +{role.permissions.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaShieldAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.roles.noRoles')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.roles.noRolesDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPermissions;
