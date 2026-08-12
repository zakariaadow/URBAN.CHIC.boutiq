import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaFilePdf, FaSpinner, FaTimes, FaCheck,
  FaCalendarDay, FaBuilding, FaFileInvoice,
  FaDownload, FaPrint
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinanceExportPDF = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('profit-loss');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [branches, setBranches] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const exportTypes = [
    { id: 'profit-loss', label: 'Profit & Loss' },
    { id: 'daily-sales', label: 'Daily Sales' },
    { id: 'monthly-sales', label: 'Monthly Sales' },
    { id: 'yearly-sales', label: 'Yearly Sales' },
    { id: 'financial-summary', label: 'Financial Summary' },
    { id: 'expenses', label: 'Expenses Report' },
    { id: 'payroll', label: 'Payroll Report' },
    { id: 'commissions', label: 'Commissions Report' }
  ];

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {
        type: exportType,
        period: period,
        branch_id: branchFilter !== 'all' ? branchFilter : undefined
      };

      if (period === 'custom') {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await api.get('/api/finance/export/pdf', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const params = {
        type: exportType,
        period: period,
        branch_id: branchFilter !== 'all' ? branchFilter : undefined
      };

      if (period === 'custom') {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await api.get('/api/finance/export/preview', { params });
      setPreviewData(response.data?.data || {});
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing report:', error);
      toast.error('Failed to preview report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Export Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export financial reports as PDF
          </p>
        </div>
        <button
          onClick={() => navigate('/finance/reports')}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
        >
          <FaFileInvoice className="mr-2" /> Back to Reports
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {exportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    exportType === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-sm ${
                    period === p.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <FaFileInvoice className="mr-2" />
                  Preview Report
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPreview(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Report Preview
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {exportTypes.find(t => t.id === exportType)?.label}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(previewData.revenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(previewData.expenses || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Net Profit</span>
                      <span className={`font-bold ${(previewData.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(previewData.profit || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Profit Margin</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {((previewData.profit_margin || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      handleExport();
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceExportPDF;