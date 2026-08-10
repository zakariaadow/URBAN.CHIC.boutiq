import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaDollarSign, FaEdit, FaTrash, FaSearch,
  FaPlus, FaEye, FaToggleOn, FaToggleOff,
  FaSpinner, FaTimes, FaTag, FaCalendarDay,
  FaChevronLeft, FaChevronRight, FaClock,
  FaBuilding, FaPercent, FaMoneyBillWave
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Prices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceTypeFilter, setPriceTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [formData, setFormData] = useState({
    service_id: '',
    price_type: 'regular',
    current_price: '',
    discount_percentage: 0,
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPrices();
    fetchServices();
  }, [currentPage, typeFilter, priceTypeFilter]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        is_active: typeFilter !== 'all' ? (typeFilter === 'active' ? 1 : 0) : undefined,
        price_type: priceTypeFilter !== 'all' ? priceTypeFilter : undefined
      };
      
      console.log('Fetching prices with params:', params);
      
      const response = await axios.get('/api/admin/prices', { ...config, params });
      
      // Handle different response structures
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      // Transform data to include service names
      const transformedData = responseData.map(item => ({
        ...item,
        service_name: item.service?.name || item.service_name || 'N/A',
        service_category: item.service?.category?.name || 'N/A',
        branch_name: item.branch?.name || item.branch_name || 'N/A',
        // Calculate final price if not provided
        final_price: item.final_price || (item.current_price * (1 - (item.discount_percentage || 0) / 100))
      }));
      
      setPrices(transformedData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || transformedData.length);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setPrices([]);
      toast.error(t('admin.prices.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/admin/services', { 
        ...config, 
        params: { is_active: 1 } 
      });
      const data = response.data?.data || response.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let endpoint = '';
      let submitData = {
        service_id: parseInt(formData.service_id),
        price_type: formData.price_type,
        current_price: parseFloat(formData.current_price),
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        is_active: formData.is_active
      };

      // Calculate final price
      const discount = submitData.discount_percentage || 0;
      const price = submitData.current_price;
      submitData.final_price = price * (1 - discount / 100);

      if (editingPrice) {
        endpoint = `/api/admin/prices/${editingPrice.id}`;
        await axios.put(endpoint, submitData, config);
        toast.success(t('admin.prices.updateSuccess'));
      } else {
        endpoint = '/api/admin/prices';
        await axios.post(endpoint, submitData, config);
        toast.success(t('admin.prices.createSuccess'));
      }
      
      resetForm();
      fetchPrices();
    } catch (error) {
      console.error('Error saving price:', error);
      toast.error(error.response?.data?.message || t('admin.prices.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/api/admin/prices/${id}`, { 
        is_active: !currentStatus 
      }, config);
      toast.success(t('admin.prices.statusUpdateSuccess'));
      fetchPrices();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t('admin.prices.statusError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.prices.deleteConfirmation'))) return;
    try {
      await axios.delete(`/api/admin/prices/${id}`, config);
      toast.success(t('admin.prices.deleteSuccess'));
      fetchPrices();
    } catch (error) {
      console.error('Error deleting price:', error);
      toast.error(t('admin.prices.deleteError'));
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: '',
      price_type: 'regular',
      current_price: '',
      discount_percentage: 0,
      is_active: true
    });
    setEditingPrice(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getPriceTypeColor = (type) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      promotional: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      vip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[type] || colors.regular;
  };

  // Filter prices by search term
  const filteredPrices = Array.isArray(prices) 
    ? prices.filter(price => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          (price.service_name || '').toLowerCase().includes(search) ||
          (price.service_category || '').toLowerCase().includes(search) ||
          (price.branch_name || '').toLowerCase().includes(search) ||
          (price.price_type || '').toLowerCase().includes(search)
        );
      })
    : [];

  if (loading && prices.length === 0) {
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
            {t('admin.prices.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.prices.subtitle')} ({Array.isArray(prices) ? prices.length : 0})
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.prices.addPrice')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.prices.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={priceTypeFilter}
            onChange={(e) => setPriceTypeFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="regular">Regular</option>
            <option value="promotional">Promotional</option>
            <option value="vip">VIP</option>
          </select>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setTypeFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t(`admin.prices.${status}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.prices.service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Final Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((price) => (
                  <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                          <FaTag className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {price.service_name}
                          </span>
                          {price.branch_name && price.branch_name !== 'N/A' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <FaBuilding className="mr-1" /> {price.branch_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriceTypeColor(price.price_type)}`}>
                        {price.price_type || 'regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(price.current_price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {price.discount_percentage > 0 ? (
                        <span className="flex items-center text-orange-600 dark:text-orange-400">
                          <FaPercent className="mr-1" />
                          {price.discount_percentage}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${price.discount_percentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {formatCurrency(price.final_price || price.current_price)}
                      </span>
                      {price.discount_percentage > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
                          {formatCurrency(price.current_price)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(price.is_active)}`}>
                        {price.is_active ? t('admin.prices.active') : t('admin.prices.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPrice(price);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPrice(price);
                            setFormData({
                              service_id: price.service_id,
                              price_type: price.price_type || 'regular',
                              current_price: price.current_price,
                              discount_percentage: price.discount_percentage || 0,
                              is_active: price.is_active
                            });
                            setShowForm(true);
                          }}
                          className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(price.id, price.is_active)}
                          className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                          title="Toggle Status"
                        >
                          {price.is_active ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          onClick={() => handleDelete(price.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <FaDollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    {t('admin.prices.noPrices')}
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPrice ? t('admin.prices.editPrice') : t('admin.prices.addPrice')}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.service_id}
                      onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      disabled={!!editingPrice}
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                    {editingPrice && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Service cannot be changed after creation
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.price_type}
                      onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="regular">Regular</option>
                      <option value="promotional">Promotional</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Price (KES) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.current_price}
                      onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      placeholder="Enter price in KES"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.discount_percentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, discount_percentage: Math.min(100, Math.max(0, val)) });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    {formData.discount_percentage > 0 && formData.current_price && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Final Price: {formatCurrency(formData.current_price * (1 - formData.discount_percentage / 100))}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      editingPrice ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Price Details
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <FaMoneyBillWave className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedPrice.service_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPriceTypeColor(selectedPrice.price_type)}`}>
                        {selectedPrice.price_type || 'regular'}
                      </span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(selectedPrice.is_active)}`}>
                        {selectedPrice.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Current Price</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedPrice.current_price)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Discount</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPrice.discount_percentage > 0 ? (
                        <span className="text-orange-600 dark:text-orange-400">
                          {selectedPrice.discount_percentage}%
                        </span>
                      ) : (
                        'No discount'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Final Price</label>
                    <p className={`text-2xl font-bold ${selectedPrice.discount_percentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {formatCurrency(selectedPrice.final_price || selectedPrice.current_price)}
                    </p>
                  </div>
                  {selectedPrice.branch_name && selectedPrice.branch_name !== 'N/A' && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Branch</label>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <FaBuilding className="mr-2" /> {selectedPrice.branch_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Created</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedPrice.created_at)}
                    </p>
                  </div>
                  {selectedPrice.updated_at && selectedPrice.updated_at !== selectedPrice.created_at && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</label>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedPrice.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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

export default Prices;