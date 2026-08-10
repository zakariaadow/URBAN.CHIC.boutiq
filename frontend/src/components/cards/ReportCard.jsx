// src/components/cards/ReportCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaChartBar, FaChartLine, FaChartPie,
  FaFileAlt, FaDownload, FaEye, FaCalendarDay,
  FaBuilding, FaUsers, FaMoneyBillWave
} from 'react-icons/fa';

const ReportCard = ({ 
  report, 
  showActions = true,
  onExport = null,
  onView = null,
  className = ''
}) => {
  const { t } = useTranslation();

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

  const getReportIcon = (type) => {
    const icons = {
      appointments: <FaChartBar className="text-blue-500" />,
      sales: <FaChartLine className="text-green-500" />,
      revenue: <FaChartPie className="text-purple-500" />,
      inventory: <FaChartBar className="text-yellow-500" />,
      staff: <FaChartLine className="text-pink-500" />,
      customer: <FaChartPie className="text-indigo-500" />
    };
    return icons[type] || <FaFileAlt className="text-gray-500" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      appointments: 'Appointments',
      sales: 'Sales',
      revenue: 'Revenue',
      inventory: 'Inventory',
      staff: 'Staff Performance',
      customer: 'Customer Analytics'
    };
    return labels[type] || type;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            {getReportIcon(report.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {report.title || `${getTypeLabel(report.type)} Report`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <FaCalendarDay className="mr-1" />
              {formatDate(report.created_at)}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {report.status || 'Generated'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {report.metrics && Object.entries(report.metrics).map(([key, value]) => (
          <div key={key}>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' && key.includes('amount') 
                ? formatCurrency(value) 
                : value}
            </p>
          </div>
        ))}
      </div>

      {report.summary && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {report.summary}
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {onView && (
            <button
              onClick={() => onView(report.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <FaEye className="mr-2" />
              View Report
            </button>
          )}
          {onExport && (
            <button
              onClick={() => onExport(report.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
            >
              <FaDownload className="mr-2" />
              Export
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCard;