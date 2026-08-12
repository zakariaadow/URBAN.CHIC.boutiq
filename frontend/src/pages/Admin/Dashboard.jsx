import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaUsers, FaCut, FaTags, FaStore, FaCalendarCheck,
  FaMoneyBillWave, FaBoxes, FaUserCog, FaFileAlt,
  FaSearch, FaPlus, FaEdit, FaTrash, FaEye,
  FaSpinner, FaTimes, FaChevronLeft, FaChevronRight,
  FaUser, FaEnvelope, FaPhone, FaBuilding,
  FaClock, FaStar, FaToggleOn, FaToggleOff,
  FaCheckCircle, FaTimesCircle, FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customers');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [allServices, setAllServices] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Form data based on active tab
  const [formData, setFormData] = useState({});

  // ✅ FIX: Added Finance and Inventory to the tabs list
  const tabs = [
    { id: 'customers', label: 'Customers', icon: FaUsers },
    { id: 'stylists', label: 'Stylists', icon: FaUserCog },
    { id: 'services', label: 'Services', icon: FaCut },
    { id: 'categories', label: 'Categories', icon: FaTags },
    { id: 'branches', label: 'Branches', icon: FaStore },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarCheck },
    { id: 'finance', label: 'Finance', icon: FaMoneyBillWave },
    { id: 'inventory', label: 'Inventory', icon: FaBoxes },
  ];

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchBranches();
    fetchStylists();
    fetchServices();
  }, [activeTab, currentPage, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let params = {
        page: currentPage,
        limit: 10,
      };

      switch(activeTab) {
        case 'customers':
          endpoint = '/api/admin/users';
          params.role = 'customer';
          if (statusFilter !== 'all') {
            params.is_active = statusFilter === 'active' ? 1 : 0;
          }
          break;
        case 'stylists':
          endpoint = '/api/admin/users';
          params.role = 'stylist';
          if (statusFilter !== 'all') {
            params.is_active = statusFilter === 'active' ? 1 : 0;
          }
          break;
        case 'finance': // ✅ Added Finance endpoint
          endpoint = '/api/admin/users';
          params.role = 'finance';
          if (statusFilter !== 'all') {
            params.is_active = statusFilter === 'active' ? 1 : 0;
          }
          break;
        case 'inventory': // ✅ Added Inventory endpoint
          endpoint = '/api/admin/users';
          params.role = 'inventory';
          if (statusFilter !== 'all') {
            params.is_active = statusFilter === 'active' ? 1 : 0;
          }
          break;
        case 'services':
          endpoint = '/api/admin/services';
          if (statusFilter !== 'all') {
            params.is_active = statusFilter === 'active' ? 1 : 0;
          }
          break;
        case 'categories':
          endpoint = '/api/admin/categories';
          if (statusFilter !== 'all') {
            params.is_active = statusFilter === 'active' ? 1 : 0;
          }
          break;
        case 'branches':
          endpoint = '/api/admin/branches';
          if (statusFilter !== 'all') {
            params.is_active = statusFilter === 'active' ? 1 : 0;
          }
          break;
        case 'appointments':
          endpoint = '/api/admin/appointments';
          if (statusFilter !== 'all') {
            params.status = statusFilter;
          }
          break;
        default:
          endpoint = '/api/admin/users';
      }

      console.log('Fetching from endpoint:', endpoint, 'with params:', params);
      const response = await api.get(endpoint, { ...config, params });
      
      // Handle different response structures
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      setData(responseData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || responseData.length);
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setData([]);
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/admin/categories', config);
      const cats = response.data?.data || response.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/admin/branches', config);
      const branches = response.data?.data || response.data || [];
      setBranches(Array.isArray(branches) ? branches : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchStylists = async () => {
    try {
      const response = await api.get('/api/admin/users', {
        ...config,
        params: { role: 'stylist' }
      });
      const stylists = response.data?.data || response.data || [];
      setStylists(Array.isArray(stylists) ? stylists : []);
    } catch (error) {
      console.error('Error fetching stylists:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/admin/services', config);
      const services = response.data?.data || response.data || [];
      setAllServices(Array.isArray(services) ? services : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let endpoint = '';
      let response;

      console.log('Submitting form data:', formData);
      console.log('Editing item:', editingItem);

      switch(activeTab) {
        case 'customers':
        case 'stylists':
        case 'finance': // ✅ Added Finance to User creation
        case 'inventory': // ✅ Added Inventory to User creation
        {
          if (editingItem) {
            endpoint = `/api/admin/users/${editingItem.id}`;
            
            // Create a clean update object - only send fields that should be updated
            const updateData = {
              first_name: formData.first_name || '',
              last_name: formData.last_name || '',
              email: formData.email || '',
              phone: formData.phone || '',
            };
            
            // Only include password if it's provided and not empty
            if (formData.password && formData.password.length > 0) {
              updateData.password = formData.password;
            }
            
            console.log('Updating user with data:', updateData);
            response = await api.put(endpoint, updateData, config);
          } else {
            endpoint = '/api/admin/users';
            const newUserData = {
              first_name: formData.first_name || '',
              last_name: formData.last_name || '',
              email: formData.email || '',
              phone: formData.phone || '',
              password: formData.password || 'password123',
              role: activeTab === 'stylists' ? 'stylist' : 
                    activeTab === 'finance' ? 'finance' : 
                    activeTab === 'inventory' ? 'inventory' : 'customer'
            };
            
            console.log('Creating user with data:', newUserData);
            response = await api.post(endpoint, newUserData, config);
            
            // If creating a stylist, also create stylist record
            if (activeTab === 'stylists' && response.data?.data?.id) {
              try {
                const stylistData = {
                  user_id: response.data.data.id,
                  specialization: formData.specialization || 'General Stylist',
                  is_available: true,
                  is_active: true
                };
                await api.post('/api/admin/stylists', stylistData, config);
                console.log('Stylist record created:', stylistData);
              } catch (stylistError) {
                console.error('Error creating stylist record:', stylistError);
                // Don't fail the whole operation
              }
            }
          }
          break;
        }
        
        case 'services': {
          if (editingItem) {
            endpoint = `/api/admin/services/${editingItem.id}`;
          } else {
            endpoint = '/api/admin/services';
          }
          const serviceData = {
            name: formData.name,
            description: formData.description || '',
            category_id: parseInt(formData.category_id),
            price: parseFloat(formData.price),
            duration_minutes: parseInt(formData.duration_minutes),
            branch_id: formData.branch_id ? parseInt(formData.branch_id) : 1,
            is_active: formData.is_active !== undefined ? formData.is_active : true
          };
          console.log('Service data:', serviceData);
          response = editingItem ? await api.put(endpoint, serviceData, config) : await api.post(endpoint, serviceData, config);
          break;
        }
        
        case 'categories': {
          if (editingItem) {
            endpoint = `/api/admin/categories/${editingItem.id}`;
          } else {
            endpoint = '/api/admin/categories';
          }
          const categoryData = {
            name: formData.name,
            description: formData.description || '',
            is_active: true
          };
          response = editingItem ? await api.put(endpoint, categoryData, config) : await api.post(endpoint, categoryData, config);
          break;
        }
        
        case 'branches': {
          if (editingItem) {
            endpoint = `/api/admin/branches/${editingItem.id}`;
          } else {
            endpoint = '/api/admin/branches';
          }
          const branchData = {
            name: formData.name,
            code: formData.code,
            address: formData.address || '',
            city: formData.city || '',
            phone: formData.phone || '',
            email: formData.email || '',
            manager_name: formData.manager_name || '',
            is_active: true
          };
          response = editingItem ? await api.put(endpoint, branchData, config) : await api.post(endpoint, branchData, config);
          break;
        }
        
        case 'appointments': {
          if (editingItem) {
            endpoint = `/api/admin/appointments/${editingItem.id}`;
          } else {
            endpoint = '/api/admin/appointments';
          }
          const appointmentData = {
            appointment_date: formData.appointment_date,
            appointment_time: formData.appointment_time,
            customer_id: parseInt(formData.customer_id),
            service_id: parseInt(formData.service_id),
            stylist_id: formData.stylist_id ? parseInt(formData.stylist_id) : null,
            status: formData.status || 'pending'
          };
          response = editingItem ? await api.put(endpoint, appointmentData, config) : await api.post(endpoint, appointmentData, config);
          break;
        }
        
        default:
          return;
      }

      console.log('Response:', response.data);
      toast.success(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully`);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    try {
      let endpoint = '';
      switch(activeTab) {
        case 'customers':
        case 'stylists':
        case 'finance': // ✅ Added Finance delete
        case 'inventory': // ✅ Added Inventory delete
          endpoint = `/api/admin/users/${id}`;
          break;
        case 'services':
          endpoint = `/api/admin/services/${id}`;
          break;
        case 'categories':
          endpoint = `/api/admin/categories/${id}`;
          break;
        case 'branches':
          endpoint = `/api/admin/branches/${id}`;
          break;
        case 'appointments':
          endpoint = `/api/admin/appointments/${id}`;
          break;
        default:
          return;
      }
      await api.delete(endpoint, config);
      toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      let endpoint = '';
      // Convert boolean to string for the action
      const isActive = currentStatus === true || currentStatus === 1 || currentStatus === 'active';
      const action = isActive ? 'deactivate' : 'activate';
      
      switch(activeTab) {
        case 'customers':
        case 'stylists':
        case 'finance': // ✅ Added Finance toggle
        case 'inventory': // ✅ Added Inventory toggle
          endpoint = `/api/admin/users/${id}/${action}`;
          break;
        case 'services':
          endpoint = `/api/admin/services/${id}/toggle`;
          break;
        case 'categories':
          endpoint = `/api/admin/categories/${id}/toggle`;
          break;
        case 'branches':
          endpoint = `/api/admin/branches/${id}/toggle`;
          break;
        default:
          return;
      }
      
      console.log('Toggling status with endpoint:', endpoint);
      await api.post(endpoint, {}, config);
      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
    setShowForm(false);
  };

  const getFormFields = () => {
    switch(activeTab) {
      case 'customers':
      case 'finance': // ✅ Add Finance form
      case 'inventory': // ✅ Add Inventory form
      case 'stylists':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branch
              </label>
              <select
                value={formData.branch_id || ''}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            {activeTab === 'stylists' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization || ''}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Hair Styling, Makeup, Nails"
                />
              </div>
            )}
            {!editingItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required={!editingItem}
                  minLength="6"
                  placeholder={editingItem ? "Leave blank to keep current password" : "Minimum 6 characters"}
                />
              </div>
            )}
          </>
        );
      
      case 'services':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes || ''}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branch
              </label>
              <select
                value={formData.branch_id || ''}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
          </>
        );
      
      case 'categories':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </>
        );
      
      case 'branches':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Manager Name
              </label>
              <input
                type="text"
                value={formData.manager_name || ''}
                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </>
        );
      
      case 'appointments':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.appointment_date || ''}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.appointment_time || ''}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customer_id || ''}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Customer</option>
                {data.filter(d => d.role === 'customer' || d.role_id === 7).map((customer) => (
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
                value={formData.service_id || ''}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Service</option>
                {allServices.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stylist
              </label>
              <select
                value={formData.stylist_id || ''}
                onChange={(e) => setFormData({ ...formData, stylist_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Stylist</option>
                {stylists.map((stylist) => (
                  <option key={stylist.id} value={stylist.id}>
                    {stylist.first_name} {stylist.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const renderTableHeaders = () => {
    switch(activeTab) {
      case 'customers':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'stylists':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'finance': // ✅ Added Finance table headers
      case 'inventory': // ✅ Added Inventory table headers
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'services':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'categories':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'branches':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'appointments':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item) => {
    switch(activeTab) {
      case 'customers':
        return (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <FaUser className="w-4 h-4 text-gray-500" />
                </div>
                <span className="font-medium">{item.first_name} {item.last_name}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.email}</td>
            <td className="px-6 py-4">{item.phone || 'N/A'}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <FaEye />
                </button>
                <button onClick={() => { setEditingItem(item); setFormData({...item}); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
                  <FaEdit />
                </button>
                <button onClick={() => handleToggleStatus(item.id, item.is_active)} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400">
                  {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case 'stylists':
        return (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <FaUser className="w-4 h-4 text-gray-500" />
                </div>
                <span className="font-medium">{item.first_name} {item.last_name}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.email}</td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                <FaCut className="mr-2 text-purple-500" />
                {item.specialization || 'General'}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <FaEye />
                </button>
                <button onClick={() => { setEditingItem(item); setFormData({...item}); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
                  <FaEdit />
                </button>
                <button onClick={() => handleToggleStatus(item.id, item.is_active)} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400">
                  {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case 'finance': // ✅ Added Finance table row
      case 'inventory': // ✅ Added Inventory table row
        return (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <FaUser className="w-4 h-4 text-gray-500" />
                </div>
                <span className="font-medium">{item.first_name} {item.last_name}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.email}</td>
            <td className="px-6 py-4">{item.branch_name || 'N/A'}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <FaEye />
                </button>
                <button onClick={() => { setEditingItem(item); setFormData({...item}); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
                  <FaEdit />
                </button>
                <button onClick={() => handleToggleStatus(item.id, item.is_active)} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400">
                  {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case 'services':
        return (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mr-3">
                  <FaCut className="w-4 h-4 text-purple-500" />
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.category?.name || 'Uncategorized'}</td>
            <td className="px-6 py-4 font-medium">${item.price}</td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                <FaClock className="mr-2 text-gray-400" />
                {item.duration_minutes} min
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <FaEye />
                </button>
                <button onClick={() => { setEditingItem(item); setFormData({...item}); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
                  <FaEdit />
                </button>
                <button onClick={() => handleToggleStatus(item.id, item.is_active)} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400">
                  {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case 'categories':
        return (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                  <FaTags className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.description || 'N/A'}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <FaEye />
                </button>
                <button onClick={() => { setEditingItem(item); setFormData({...item}); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
                  <FaEdit />
                </button>
                <button onClick={() => handleToggleStatus(item.id, item.is_active)} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400">
                  {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case 'branches':
        return (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center mr-3">
                  <FaStore className="w-4 h-4 text-green-500" />
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.code}</td>
            <td className="px-6 py-4">{item.city || 'N/A'}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <FaEye />
                </button>
                <button onClick={() => { setEditingItem(item); setFormData({...item}); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
                  <FaEdit />
                </button>
                <button onClick={() => handleToggleStatus(item.id, item.is_active)} className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400">
                  {item.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case 'appointments':
        return (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td className="px-6 py-4">{item.appointment_date}</td>
            <td className="px-6 py-4">{item.appointment_time}</td>
            <td className="px-6 py-4">
              {item.customer?.user?.first_name} {item.customer?.user?.last_name}
            </td>
            <td className="px-6 py-4">{item.service?.name}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                item.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                item.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {item.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedItem(item); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  <FaEye />
                </button>
                <button onClick={() => { setEditingItem(item); setFormData({...item}); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        );
      
      default:
        return null;
    }
  };

  const renderDetails = () => {
    if (!selectedItem) return null;
    
    return (
      <div className="space-y-4">
        {Object.entries(selectedItem).map(([key, value]) => {
          if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'password' || typeof value === 'object') return null;
          return (
            <div key={key}>
              <label className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key.replace(/_/g, ' ')}</label>
              <p className="font-medium text-gray-900 dark:text-white">{String(value)}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredData = Array.isArray(data) 
    ? data.filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const searchableFields = ['name', 'email', 'first_name', 'last_name', 'phone', 'description'];
        return searchableFields.some(field => 
          String(item[field] || '').toLowerCase().includes(search)
        );
      })
    : [];

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                {activeTab === 'appointments' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                )}
              </select>
              <button
                onClick={() => {
                  setFormData({});
                  setEditingItem(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Add New
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                {renderTableHeaders()}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.length > 0 ? (
                  filteredData.map(item => renderTableRow(item))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No {activeTab} found
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
              Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
                    {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                  </h2>
                  <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <FaTimes />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {getFormFields()}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        editingItem ? 'Update' : 'Create'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Details
                  </h2>
                  <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <FaTimes />
                  </button>
                </div>
                
                <div className="max-h-[70vh] overflow-y-auto">
                  {renderDetails()}
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;