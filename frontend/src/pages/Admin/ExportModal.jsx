// ExportModal.jsx - Combined PDF & Excel Export
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFilePdf, FaFileExcel, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const ExportModal = ({ isOpen, onClose, type, data, title }) => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState('pdf');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.post('/api/reports/export', {
        data,
        format,
        title,
        type
      }, {
        ...config,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'export'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(t('export.success'));
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('export.error'));
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('export.title')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('export.format')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  format === 'pdf'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                }`}
              >
                <FaFilePdf className="w-8 h-8 text-red-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF</span>
              </button>
              <button
                onClick={() => setFormat('excel')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  format === 'excel'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <FaFileExcel className="w-8 h-8 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Excel</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {exporting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  {t('export.exporting')}
                </>
              ) : (
                t('export.export')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;