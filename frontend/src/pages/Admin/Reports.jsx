import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaChartBar, FaChartLine, FaChartPie,
  FaDownload, FaPrint, FaSearch, FaFilter,
  FaSpinner, FaCalendarDay, FaBuilding,
  FaFilePdf, FaFileExcel, FaEye,
  FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('appointments');
  const [period, setPeriod] = useState('month');
  const [branchFilter, setBranchFilter] = useState('all');
  const [branches, setBranches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [generating, setGenerating] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchReports();
    fetchBranches();
  }, [reportType, period, branchFilter, currentPage]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        type: reportType,
        period,
        branch_id: branchFilter !== 'all' ? branchFilter : undefined,
        page: currentPage,
        limit: 10
      };
      const response = await api.get('/api/admin/reports/comprehensive', { ...config, params });
      setReports(response.data.data || response.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error(t('admin.reports.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/admin/branches', config);
      setBranches(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/api/admin/reports/export', {
        type: reportType,
        period,
        branch_id: branchFilter !== 'all' ? branchFilter : undefined
      }, config);
      toast.success(t('admin.reports.generateSuccess'));
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(t('admin.reports.generateError'));
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await api.get('/api/admin/reports/export', {
        ...config,
        params: {
          type: reportType,
          period,
          branch_id: branchFilter !== 'all' ? branchFilter : undefined,
          format
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportType}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(t('admin.reports.exportSuccess'));
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(t('admin.reports.exportError'));
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      appointments: <FaChartBar className="text-blue-500" />,
      sales: <FaChartLine className="text-green-500" />,
      revenue: <FaChartPie className="text-purple-500" />,
      inventory: <FaChartBar className="text-yellow-500" />,
      staff: <FaChartLine className="text-pink-500" />,
      customer: <FaChartPie className="text-indigo-500" />
    };
    return icons[type] || icons.appointments;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.reports.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.reports.subtitle')}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FaFilePdf className="mr-2" /> PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaFileExcel className="mr-2" /> Excel
          </button>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {generating ? <FaSpinner className="animate-spin mr-2" /> : <FaEye className="mr-2" />}
            {generating ? t('admin.reports.generating') : t('admin.reports.generate')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="appointments">{t('admin.reports.appointments')}</option>
            <option value="sales">{t('admin.reports.sales')}</option>
            <option value="revenue">{t('admin.reports.revenue')}</option>
            <option value="inventory">{t('admin.reports.inventory')}</option>
            <option value="staff">{t('admin.reports.staff')}</option>
            <option value="customer">{t('admin.reports.customer')}</option>
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="today">{t('admin.reports.today')}</option>
            <option value="week">{t('admin.reports.week')}</option>
            <option value="month">{t('admin.reports.month')}</option>
            <option value="quarter">{t('admin.reports.quarter')}</option>
            <option value="year">{t('admin.reports.year')}</option>
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('admin.reports.allBranches')}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getReportTypeIcon(report.type)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {report.title || `${report.type} Report`}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {report.metrics && Object.entries(report.metrics).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {typeof value === 'number' ? formatCurrency(value) : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setShowDetails(true);
                  }}
                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <FaEye />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaChartBar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.reports.noReports')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('admin.reports.noReportsDesc')}
            </p>
            <button
              onClick={generateReport}
              disabled={generating}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.reports.generateFirst')}
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.showing')} {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, reports.length)} of {reports.length}
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

      {/* Report Details Modal */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('admin.reports.details')}
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getReportTypeIcon(selectedReport.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedReport.title || `${selectedReport.type} Report`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(selectedReport.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedReport.metrics && Object.entries(selectedReport.metrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{key}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {typeof value === 'number' ? formatCurrency(value) : value}
                      </p>
                    </div>
                  ))}
                </div>
                
                {selectedReport.details && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('admin.reports.details')}</label>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {typeof selectedReport.details === 'string' 
                          ? selectedReport.details 
                          : JSON.stringify(selectedReport.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => exportReport('pdf')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaFilePdf className="mr-2" /> PDF
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaFileExcel className="mr-2" /> Excel
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;