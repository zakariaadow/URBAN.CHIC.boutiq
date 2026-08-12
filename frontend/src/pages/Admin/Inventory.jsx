import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaUser, FaEnvelope, FaPhone, FaBuilding,
  FaEdit, FaTrash, FaSearch, FaFilter,
  FaCheckCircle, FaTimes, FaSpinner,
  FaPlus, FaEye, FaUserCheck, FaUserTimes,
  FaCalendarDay, FaBox
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Inventory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryOfficers, setInventoryOfficers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch_id: '',
    password: ''
  });
  const [branches, setBranches] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchInventoryOfficers();
    fetchBranches();
  }, [currentPage, statusFilter]);

  const fetchInventoryOfficers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/users', {
        ...config,
        params: {
          role: 'inventory',
          page: currentPage,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      const data = response.data?.data || response.data || [];
      setInventoryOfficers(Array.isArray(data) ? data : []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching inventory officers:', error);
      setInventoryOfficers([]);
      toast.error(t('admin.inventory.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/admin/branches', config);
      const data = response.data?.data || response.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const filteredOfficers = Array.isArray(inventoryOfficers) 
    ? inventoryOfficers.filter(officer => {
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
            {t('admin.inventory.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.inventory.subtitle')} ({Array.isArray(inventoryOfficers) ? inventoryOfficers.length : 0})
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.inventory.addOfficer')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.inventory.search')}
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
                {t(`admin.inventory.${status}`)}
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
                  {t('admin.inventory.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.inventory.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.inventory.branch')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.inventory.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.inventory.joined')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.inventory.actions')}
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
                        <button onClick={() => { setEditingOfficer(officer); setFormData({ name: officer.name, email: officer.email, phone: officer.phone || '', branch_id: officer.branch_id || '', password: '' }); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"><FaEdit /></button>
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
                    {t('admin.inventory.noOfficers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
