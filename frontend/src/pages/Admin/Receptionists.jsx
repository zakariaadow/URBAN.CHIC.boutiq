import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaUser, FaEnvelope, FaPhone, FaBuilding,
  FaEdit, FaTrash, FaSearch, FaFilter,
  FaCheckCircle, FaTimes, FaSpinner,
  FaPlus, FaEye, FaUserCheck, FaUserTimes,
  FaCalendarDay
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Receptionists = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receptionists, setReceptionists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch_id: '',
    password: ''
  });
  const [branches, setBranches] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchReceptionists();
    fetchBranches();
  }, [currentPage, statusFilter]);

  const fetchReceptionists = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/users', {
        ...config,
        params: {
          role: 'receptionist',
          page: currentPage,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      const data = response.data?.data || response.data || [];
      setReceptionists(Array.isArray(data) ? data : []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching receptionists:', error);
      setReceptionists([]);
      toast.error(t('admin.receptionists.loadError'));
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

  const filteredReceptionists = Array.isArray(receptionists) 
    ? receptionists.filter(rec => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          rec.name?.toLowerCase().includes(search) ||
          rec.email?.toLowerCase().includes(search)
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
            {t('admin.receptionists.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.receptionists.subtitle')} ({Array.isArray(receptionists) ? receptionists.length : 0})
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> {t('admin.receptionists.addReceptionist')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.receptionists.search')}
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
                {t(`admin.receptionists.${status}`)}
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
                  {t('admin.receptionists.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.receptionists.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.receptionists.branch')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.receptionists.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.receptionists.joined')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.receptionists.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReceptionists.length > 0 ? (
                filteredReceptionists.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <FaUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{rec.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{rec.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{rec.branch_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        rec.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {rec.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(rec.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedReceptionist(rec); setShowDetails(true); }} className="p-1 text-blue-600 hover:text-blue-800 transition-colors"><FaEye /></button>
                        <button onClick={() => { setEditingReceptionist(rec); setFormData({ name: rec.name, email: rec.email, phone: rec.phone || '', branch_id: rec.branch_id || '', password: '' }); setShowForm(true); }} className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"><FaEdit /></button>
                        <button onClick={() => handleToggleStatus(rec.id, rec.status)} className={`p-1 ${rec.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} transition-colors`}>
                          {rec.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                        </button>
                        <button onClick={() => handleDelete(rec.id)} className="p-1 text-red-600 hover:text-red-800 transition-colors"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('admin.receptionists.noReceptionists')}
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

export default Receptionists;
