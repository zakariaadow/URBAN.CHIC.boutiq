import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaFolder, FaFolderOpen, FaEdit, FaTrash,
  FaSearch, FaPlus, FaToggleOn, FaToggleOff,
  FaSpinner, FaTimes, FaChevronLeft, FaChevronRight,
  FaCut, FaEye
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Categories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [categoryServices, setCategoryServices] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, statusFilter]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const response = await api.get('/api/admin/categories', { ...config, params });
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      toast.error(t('admin.categories.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryServices = async (categoryId) => {
    try {
      const response = await api.get(`/api/categories/${categoryId}/services`, config);
      const data = response.data?.data || response.data || [];
      setCategoryServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching category services:', error);
      setCategoryServices([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/api/admin/categories/${editingCategory.id}`, formData, config);
        toast.success(t('admin.categories.updateSuccess'));
      } else {
        await api.post('/api/admin/categories', formData, config);
        toast.success(t('admin.categories.createSuccess'));
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || t('admin.categories.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.post(`/api/admin/categories/${id}/toggle`, {}, config);
      toast.success(t('admin.categories.statusUpdateSuccess'));
      fetchCategories();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('admin.categories.statusError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.categories.deleteConfirmation'))) return;
    try {
      await api.delete(`/api/admin/categories/${id}`, config);
      toast.success(t('admin.categories.deleteSuccess'));
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(t('admin.categories.deleteError'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // FIXED: Added : [] at the end
  const filteredCategories = Array.isArray(categories) 
    ? categories.filter(category => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          category.name?.toLowerCase().includes(search) ||
          category.description?.toLowerCase().includes(search)
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
            {t('admin.categories.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.categories.subtitle')} ({Array.isArray(categories) ? categories.length : 0})
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.categories.addCategory')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.categories.search')}
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
                {t(`admin.categories.${status}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      {category.status === 'active' ? (
                        <FaFolderOpen className="w-6 h-6 text-blue-500" />
                      ) : (
                        <FaFolder className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {category.services_count || 0} services
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        fetchCategoryServices(category.id);
                        setShowDetails(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setFormData({
                          name: category.name,
                          description: category.description || '',
                          status: category.status || 'active'
                        });
                        setShowForm(true);
                      }}
                      className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category.id, category.status)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {category.status === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {category.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    category.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {category.status || 'inactive'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(category.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.categories.noCategories')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.categories.noCategoriesDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
