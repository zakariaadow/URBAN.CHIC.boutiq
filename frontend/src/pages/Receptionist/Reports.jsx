import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaFileAlt, FaSearch, FaDownload, FaEye,
  FaCalendarAlt, FaSpinner, FaFilePdf,
  FaFileExcel, FaFileCsv, FaPrint,
  FaChartBar, FaUsers, FaCalendarCheck,
  FaMoneyBillWave, FaBox, FaStar
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Create axios instance with session-based authentication
const customApi = customApi.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const ReceptionistReports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [filterType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = filterType !== 'all' 
        ? `/receptionist/reports?report_type=${filterType}`
        : '/receptionist/reports';
      
      const response = await customApi.get(url);
      
      let reportData = [];
      if (response.data?.data?.items) {
        reportData = response.data.data.items;
      } else if (response.data?.data) {
        reportData = Array.isArray(response.data.data) ? response.data.data : [];
      } else {
        reportData = Array.isArray(response.data) ? response.data : [];
      }
      
      setReports(reportData);
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportId) => {
    try {
      const response = await customApi.post('/receptionist/reports/export', {
        report_id: reportId
      });
      
      if (response.data.status === 'success') {
        toast.success('Report exported successfully!');
        fetchReports(); // Refresh the list
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const filteredReports = Array.isArray(reports) 
    ? reports.filter(report => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          report.report_name?.toLowerCase().includes(search) ||
          report.report_type?.toLowerCase().includes(search) ||
          report.report_type?.toLowerCase().includes(search)
        );
      })
    : [];

  const getReportTypeIcon = (type) => {
    const icons = {
      daily: <FaCalendarAlt className="text-blue-500" />,
      weekly: <FaCalendarAlt className="text-purple-500" />,
      monthly: <FaCalendarAlt className="text-indigo-500" />,
      appointments: <FaCalendarCheck className="text-green-500" />,
      customers: <FaUsers className="text-yellow-500" />,
      sales: <FaMoneyBillWave className="text-green-600" />,
      revenue: <FaMoneyBillWave className="text-emerald-600" />,
      inventory: <FaBox className="text-orange-500" />,
      staff: <FaUsers className="text-pink-500" />
    };
    return icons[type] || <FaFileAlt className="text-gray-500" />;
  };

  const getFileFormatIcon = (format) => {
    const icons = {
      pdf: <FaFilePdf className="text-red-500" />,
      excel: <FaFileExcel className="text-green-600" />,
      csv: <FaFileCsv className="text-blue-500" />
    };
    return icons[format] || <FaFileAlt className="text-gray-500" />;
  };

  const getStatusBadge = (isExported) => {
    return isExported ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Exported
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        Pending
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all reports ({filteredReports.length} total)
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="appointments">Appointments</option>
              <option value="customers">Customers</option>
              <option value="sales">Sales</option>
              <option value="revenue">Revenue</option>
              <option value="inventory">Inventory</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                    {getReportTypeIcon(report.report_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {report.report_name || 'Report'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {report.report_type || 'Unknown Type'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(report.is_exported)}
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Period:</span>
                  <span>
                    {formatDate(report.start_date)} - {formatDate(report.end_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Format:</span>
                  <span className="flex items-center gap-1">
                    {getFileFormatIcon(report.file_format)}
                    {report.file_format?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-xs">{formatDateTime(report.created_at)}</span>
                </div>
              </div>

              {/* Summary Preview */}
              {report.summary && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(report.summary).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500 capitalize">{key}:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleViewReport(report)}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye /> View
                </button>
                <button
                  onClick={() => handleExport(report.id)}
                  disabled={report.is_exported}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    report.is_exported
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No reports found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No reports match your search' : 'No reports are currently available'}
          </p>
        </div>
      )}

      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Report Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReport.report_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  Type: {selectedReport.report_type}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedReport.start_date)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedReport.end_date)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">File Format:</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    {getFileFormatIcon(selectedReport.file_format)}
                    {selectedReport.file_format?.toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium">
                    {getStatusBadge(selectedReport.is_exported)}
                  </p>
                </div>
              </div>

              {selectedReport.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Summary
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(selectedReport.summary).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-xs text-gray-500 capitalize">{key}</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleExport(selectedReport.id)}
                  disabled={selectedReport.is_exported}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedReport.is_exported
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <FaDownload /> Export Report
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
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

export default ReceptionistReports;