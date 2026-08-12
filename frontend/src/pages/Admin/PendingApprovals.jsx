import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaUserPlus, FaCheck, FaTimes, FaEye,
  FaSpinner, FaSearch, FaFilter,
  FaUser, FaEnvelope, FaPhone, FaCalendarDay,
  FaBuilding, FaUsers, FaCut, FaMoneyBillWave,
  FaBox, FaClipboardList
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const PendingApprovals = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [approving, setApproving] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/admin/approvals/pending';
      if (filter !== 'all') {
        endpoint = `/api/admin/approvals/${filter}`;
      }
      const response = await api.get(endpoint, config);
      const data = response.data?.data || response.data || [];
      setApprovals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      setApprovals([]);
      toast.error(t('admin.approvals.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, role) => {
    setApproving(true);
    try {
      await api.post(`/api/admin/approvals/${role}/${id}`, {}, config);
      toast.success(t('admin.approvals.approveSuccess'));
      fetchApprovals();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error(error.response?.data?.message || t('admin.approvals.approveError'));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm(t('admin.approvals.rejectConfirmation'))) return;
    setApproving(true);
    try {
      await api.post(`/api/admin/approvals/reject/${id}`, {}, config);
      toast.success(t('admin.approvals.rejectSuccess'));
      fetchApprovals();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error(error.response?.data?.message || t('admin.approvals.rejectError'));
    } finally {
      setApproving(false);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      manager: <FaBuilding className="text-blue-500" />,
      stylist: <FaCut className="text-purple-500" />,
      finance: <FaMoneyBillWave className="text-green-500" />,
      inventory: <FaBox className="text-yellow-500" />,
      receptionist: <FaClipboardList className="text-orange-500" />,
      default: <FaUser className="text-gray-500" />
    };
    return icons[role] || icons.default;
  };

  const getRoleLabel = (role) => {
    const labels = {
      manager: t('admin.approvals.roles.manager'),
      stylist: t('admin.approvals.roles.stylist'),
      finance: t('admin.approvals.roles.finance'),
      inventory: t('admin.approvals.roles.inventory'),
      receptionist: t('admin.approvals.roles.receptionist')
    };
    return labels[role] || role;
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const filteredApprovals = Array.isArray(approvals) 
    ? approvals.filter(approval => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          approval.name?.toLowerCase().includes(search) ||
          approval.email?.toLowerCase().includes(search) ||
          approval.role?.toLowerCase().includes(search)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.approvals.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.approvals.subtitle')} ({Array.isArray(approvals) ? approvals.length : 0} pending)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.approvals.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'manager', 'stylist', 'finance', 'inventory', 'receptionist'].map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {role === 'all' ? t('admin.approvals.all') : getRoleLabel(role)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length > 0 ? (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getRoleIcon(approval.role)}
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {t('admin.approvals.pending')}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {getRoleLabel(approval.role)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {approval.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-blue-500" />
                      {approval.email}
                    </div>
                    {approval.phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-2 text-green-500" />
                        {approval.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <FaCalendarDay className="mr-2 text-purple-500" />
                      {t('admin.approvals.requested')} {formatDate(approval.created_at)}
                    </div>
                    {approval.branch_name && (
                      <div className="flex items-center">
                        <FaBuilding className="mr-2 text-blue-500" />
                        {approval.branch_name}
                      </div>
                    )}
                  </div>
                  
                  {approval.notes && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('admin.approvals.notes')}:</span> {approval.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-4 lg:mt-0">
                  <button
                    onClick={() => {
                      setSelectedApproval(approval);
                      setShowDetails(true);
                    }}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id, approval.role)}
                    disabled={approving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {approving ? <FaSpinner className="animate-spin" /> : <FaCheck className="mr-1" />}
                    {t('admin.approvals.approve')}
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    disabled={approving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {approving ? <FaSpinner className="animate-spin" /> : <FaTimes className="mr-1" />}
                    {t('admin.approvals.reject')}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaUserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.approvals.noPending')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.approvals.noPendingDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;
