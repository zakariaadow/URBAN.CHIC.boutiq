import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaUsers, FaSearch, FaUser, FaEnvelope, FaPhone,
  FaCalendarDay, FaEye, FaSpinner, FaPlus,
  FaTimes, FaCheck, FaMoneyBillWave, FaBuilding,
  FaUserPlus, FaEdit, FaTrash, FaHistory,
  FaCreditCard, FaStar, FaClock, FaChartLine,
  FaWallet, FaGift, FaShoppingBag
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Create axios instance with session-based authentication
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const ReceptionistCustomers = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [customerFinance, setCustomerFinance] = useState(null);
  const [customerAppointments, setCustomerAppointments] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    address: '',
    city: '',
    country: 'Kenya'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/receptionist/customers');
      
      let customerData = [];
      if (response.data?.data?.items) {
        customerData = response.data.data.items;
      } else if (response.data?.data) {
        customerData = Array.isArray(response.data.data) ? response.data.data : [];
      } else {
        customerData = Array.isArray(response.data) ? response.data : [];
      }
      
      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || '',
        password: formData.password || 'password123',
        role: formData.role || 'customer',
        address: formData.address || '',
        city: formData.city || '',
        country: formData.country || 'Kenya'
      };

      let response;
      if (isEditing && selectedCustomer) {
        // Update existing customer
        response = await api.put(`/admin/users/${selectedCustomer.id}`, payload);
        toast.success('Customer updated successfully');
      } else {
        // Add new customer
        response = await api.post('/admin/users', payload);
        toast.success('Customer added successfully');
      }
      
      setShowAddModal(false);
      setSelectedCustomer(null);
      setIsEditing(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer',
        address: '',
        city: '',
        country: 'Kenya'
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(error.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      // Fetch customer finance info
      const financeRes = await api.get(`/admin/customers/${customerId}/finance`);
      setCustomerFinance(financeRes.data?.data || financeRes.data || null);
      
      // Fetch customer appointments
      const appointmentsRes = await api.get('/admin/appointments', {
        params: { customer_id: customerId, limit: 10 }
      });
      const appointmentsData = appointmentsRes.data?.data?.items || 
                              appointmentsRes.data?.data || 
                              appointmentsRes.data || [];
      setCustomerAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      
      // Fetch customer reviews
      const reviewsRes = await api.get(`/admin/reviews`, {
        params: { customer_id: customerId, limit: 5 }
      });
      const reviewsData = reviewsRes.data?.data?.items || 
                         reviewsRes.data?.data || 
                         reviewsRes.data || [];
      setCustomerReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerDetails(customer.id);
    setShowDetails(true);
  };

  const handleEditCustomer = (customer) => {
    const user = customer.user || {};
    setSelectedCustomer(customer);
    setIsEditing(true);
    setFormData({
      first_name: user.first_name || customer.first_name || '',
      last_name: user.last_name || customer.last_name || '',
      email: user.email || customer.email || '',
      phone: user.phone || customer.phone || '',
      password: '',
      role: user.role || 'customer',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'Kenya'
    });
    setShowAddModal(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (!deleteConfirm) {
      setDeleteConfirm(id);
      toast.warning('Click Delete again to confirm');
      setTimeout(() => setDeleteConfirm(null), 5000);
      return;
    }
    
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Customer deleted successfully');
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      setDeleteConfirm(null);
    }
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      confirmed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[status] || colors.pending;
  };

  const filteredCustomers = Array.isArray(customers) 
    ? customers.filter(customer => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const user = customer.user || {};
        const name = user.full_name || customer.name || '';
        const email = user.email || customer.email || '';
        const phone = user.phone || customer.phone || '';
        return (
          name.toLowerCase().includes(search) ||
          email.toLowerCase().includes(search) ||
          phone.toLowerCase().includes(search)
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
            Customers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all customers ({filteredCustomers.length} total)
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedCustomer(null);
              setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'customer',
                address: '',
                city: '',
                country: 'Kenya'
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FaUserPlus className="mr-2" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const user = customer.user || {};
            const name = user.full_name || customer.name || 'Customer';
            const email = user.email || customer.email || 'No email';
            const phone = user.phone || customer.phone || 'No phone';
            const createdAt = customer.created_at || user.created_at;
            
            return (
              <div
                key={customer.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <FaUser className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {email}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {phone !== 'No phone' && (
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {phone}
                    </div>
                  )}
                  <div className="flex items-center">
                    <FaCalendarDay className="mr-2 text-gray-400" />
                    Joined: {createdAt ? formatDate(createdAt) : 'N/A'}
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-2 text-gray-400" />
                    {customer.total_visits || customer.appointments_count || 0} appointments
                  </div>
                  <div className="flex items-center">
                    <FaMoneyBillWave className="mr-2 text-green-500" />
                    Spent: {formatCurrency(customer.total_spent || 0)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className={`p-2 transition-colors ${
                        deleteConfirm === customer.id 
                          ? 'text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/20 rounded' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                      title={deleteConfirm === customer.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: #{customer.id}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaUsers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No customers found matching your search' : 'No customers found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Click "Add Customer" to register a new customer'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowAddModal(false);
            setSelectedCustomer(null);
            setIsEditing(false);
            setFormData({
              first_name: '',
              last_name: '',
              email: '',
              phone: '',
              password: '',
              role: 'customer',
              address: '',
              city: '',
              country: 'Kenya'
            });
          }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCustomer(null);
                    setIsEditing(false);
                    setFormData({
                      first_name: '',
                      last_name: '',
                      email: '',
                      phone: '',
                      password: '',
                      role: 'customer',
                      address: '',
                      city: '',
                      country: 'Kenya'
                    });
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleAddCustomer}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {!isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required={!isEditing}
                        minLength="6"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="customer">Customer</option>
                      <option value="stylist">Stylist</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="finance">Finance</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedCustomer(null);
                      setIsEditing(false);
                      setFormData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        password: '',
                        role: 'customer',
                        address: '',
                        city: '',
                        country: 'Kenya'
                      });
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
                        {isEditing ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        {isEditing ? 'Update' : 'Add'} Customer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal with Finance Info */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Customer Details
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FaUser className="text-purple-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedCustomer.user?.full_name || selectedCustomer.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.user?.email || selectedCustomer.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.user?.phone || selectedCustomer.phone || 'No phone'}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {selectedCustomer.user?.role || 'customer'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedCustomer.user?.is_active !== false 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {selectedCustomer.user?.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Finance Summary */}
                {customerFinance && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <FaMoneyBillWave className="mr-2 text-green-500" /> Financial Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(customerFinance.total_spent || 0)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Visits</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {customerFinance.total_visits || 0}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loyalty Points</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {customerFinance.loyalty_points || 0}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Spend</p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(customerFinance.average_spend || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Appointments */}
                {customerAppointments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <FaCalendarDay className="mr-2 text-blue-500" /> Recent Appointments
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {customerAppointments.map((appt) => (
                        <div key={appt.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {appt.service?.name || appt.service_name || 'Service'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(appt.appointment_date)} at {appt.appointment_time} • {appt.branch?.name || appt.branch_name || 'Branch'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(appt.final_amount || appt.total_amount || 0)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(appt.status)}`}>
                              {appt.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {customerReviews.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <FaStar className="mr-2 text-yellow-500" /> Recent Reviews
                    </h4>
                    <div className="space-y-2">
                      {customerReviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {review.title || 'Review'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {review.comment || 'No comment'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleEditCustomer(selectedCustomer);
                  }}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <FaEdit className="inline mr-2" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleDeleteCustomer(selectedCustomer.id);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistCustomers;