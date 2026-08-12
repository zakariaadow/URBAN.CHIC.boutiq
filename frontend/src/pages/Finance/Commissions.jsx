import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCut, FaSearch, FaEdit, FaTrash,
  FaSpinner, FaTimes, FaChevronLeft, FaChevronRight,
  FaCheck, FaFilter, FaCalendarDay, FaMoneyBillWave,
  FaFileInvoice, FaDownload, FaPrint, FaUserCheck,
  FaPercent, FaPlus
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinanceCommissions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState({ total_commission: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stylists, setStylists] = useState([]);
  const [formData, setFormData] = useState({
    stylist_id: '',
    commission_rate: 0.1,
    service_amount: '',
    commission_amount: '',
    period_start: '',
    period_end: '',
    is_paid: false,
    notes: ''
  });

  useEffect(() => {
    fetchCommissions();
    fetchStylists();
  }, [currentPage, statusFilter]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        is_paid: statusFilter !== 'all' ? (statusFilter === 'paid' ? 1 : 0) : undefined
      };
      
      const response = await api.get('/api/finance/commissions', { params });
      
      let responseData = response.data?.data?.items || response.data?.data || response.data || [];
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }
      
      setCommissions(responseData);
      setTotalPages(response.data?.data?.pages || response.data?.totalPages || 1);
      setTotalItems(response.data?.data?.total || response.data?.total || responseData.length);
      setSummary(response.data?.data?.summary || { total_commission: 0 });
      
    } catch (error) {
      console.error('Error fetching commissions:', error);
      setCommissions([]);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStylists = async () => {
    try {
      const response = await api.get('/api/finance/payroll/staff');
      const data = response.data?.data || response.data || [];
      setStylists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stylists:', error);
      setStylists([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = {
        stylist_id: parseInt(formData.stylist_id),
        commission_rate: parseFloat(formData.commission_rate),
        service_amount: parseFloat(formData.service_amount),
        commission_amount: parseFloat(formData.commission_amount),
        period_start: formData.period_start,
        period_end: formData.period_end,
        is_paid: formData.is_paid,
        notes: formData.notes
      };

      if (editingCommission) {
        await api.put(`/api/finance/commissions/${editingCommission.id}`, submitData);
        toast.success('Commission updated successfully');
      } else {
        await api.post('/api/finance/commissions', submitData);
        toast.success('Commission created successfully');
      }
      
      resetForm();
      fetchCommissions();
    } catch (error) {
      console.error('Error saving commission:', error);
      toast.error(error.response?.data?.message || 'Failed to save commission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this commission?')) return;
    try {
      await api.delete(`/api/finance/commissions/${id}`);
      toast.success('Commission deleted successfully');
      fetchCommissions();
    } catch (error) {
      console.error('Error deleting commission:', error);
      toast.error('Failed to delete commission');
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    try {
      await api.put(`/api/finance/commissions/${id}`, { is_paid: !currentStatus });
      toast.success('Commission status updated');
      fetchCommissions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      stylist_id: '',
      commission_rate: 0.1,
      service_amount: '',
      commission_amount: '',
      period_start: '',
      period_end: '',
      is_paid: false,
      notes: ''
    });
    setEditingCommission(null);
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
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const filteredCommissions = Array.isArray(commissions)
    ? commissions.filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          (item.stylist?.user?.full_name || '').toLowerCase().includes(search) ||
          (item.stylist?.specialization || '').toLowerCase().includes(search)
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Commissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total Commissions: {formatCurrency(summary.total_commission)} ({totalItems} records)
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" /> Add Commission
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search commissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stylist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCommissions.length > 0 ? (
                filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-3">
                          <FaCut className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {commission.stylist?.user?.full_name || 'N/A'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {commission.stylist?.specialization || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center">
                        <FaPercent className="mr-1 text-blue-500" />
                        {(commission.commission_rate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatCurrency(commission.service_amount)}
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(commission.commission_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(commission.period_start)} - {formatDate(commission.period_end)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${commission.is_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {commission.is_paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingCommission(commission);
                            setFormData({
                              stylist_id: commission.stylist_id,
                              commission_rate: commission.commission_rate,
                              service_amount: commission.service_amount,
                              commission_amount: commission.commission_amount,
                              period_start: commission.period_start,
                              period_end: commission.period_end,
                              is_paid: commission.is_paid,
                              notes: commission.notes || ''
                            });
                            setShowForm(true);
                          }}
                          className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(commission.id, commission.is_paid)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Toggle Status"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleDelete(commission.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
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
                    No commissions found
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

      {/* Add/Edit Commission Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCommission ? 'Edit Commission' : 'Add Commission'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stylist <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.stylist_id}
                      onChange={(e) => setFormData({ ...formData, stylist_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select Stylist</option>
                      {stylists.map((stylist) => (
                        <option key={stylist.id} value={stylist.id}>
                          {stylist.full_name || `${stylist.first_name} ${stylist.last_name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Commission Rate (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={formData.commission_rate}
                        onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.service_amount}
                        onChange={(e) => setFormData({ ...formData, service_amount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Commission Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.commission_amount}
                      onChange={(e) => setFormData({ ...formData, commission_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Period Start <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.period_start}
                        onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Period End <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.period_end}
                        onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.is_paid ? 'paid' : 'pending'}
                      onChange={(e) => setFormData({ ...formData, is_paid: e.target.value === 'paid' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      editingCommission ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceCommissions;