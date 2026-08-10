import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaFileExcel, FaSpinner, FaTimes, FaCheck,
  FaCalendarDay, FaBuilding, FaFileInvoice,
  FaDownload, FaPrint
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const FinanceExportExcel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('expenses');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [branches, setBranches] = useState([]);
  const [format, setFormat] = useState('xlsx');

  const exportTypes = [
    { id: 'expenses', label: 'Expenses' },
    { id: 'income', label: 'Income' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'commissions', label: 'Commissions' },
    { id: 'payments', label: 'Payment History' },
    { id: 'profit-loss', label: 'Profit & Loss' },
    { id: 'daily-sales', label: 'Daily Sales' },
    { id: 'monthly-sales', label: 'Monthly Sales' },
    { id: 'yearly-sales', label: 'Yearly Sales' },
    { id: 'financial-summary', label: 'Financial Summary' }
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
        branch_id: branchFilter !== 'all' ? branchFilter : undefined,
        format: format
      };

      if (period === 'custom') {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axios.get('/api/finance/export/excel', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType}-report-${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
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
            Export to Excel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export financial reports as Excel files
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {exportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-sm ${
                    exportType === type.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 text-gray-700 dark:text-gray-300'
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

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Format
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat('xlsx')}
                className={`px-6 py-2 rounded-lg border-2 transition-all ${
                  format === 'xlsx'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                Excel (.xlsx)
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`px-6 py-2 rounded-lg border-2 transition-all ${
                  format === 'csv'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                CSV (.csv)
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <FaFileExcel className="mr-2" />
                  Export Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Export Tips */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Export Tips</h3>
        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <li>• Choose the report type you want to export</li>
          <li>• Select the time period for the data</li>
          <li>• Choose between Excel (.xlsx) or CSV format</li>
          <li>• The file will be downloaded automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default FinanceExportExcel;