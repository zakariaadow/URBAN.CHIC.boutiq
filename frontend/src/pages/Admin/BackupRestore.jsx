import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaDatabase, FaDownload, FaUpload, FaSpinner,
  FaCheckCircle, FaTimes, FaClock, FaTrash,
  FaFile, FaCalendarDay, FaHdd, FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const BackupRestore = () => {
  const { t } = useTranslation();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Simulated backups data
  const mockBackups = [
    { id: 1, name: 'backup-2024-01-15.sql', size: '245 MB', date: '2024-01-15 02:30:00', type: 'full' },
    { id: 2, name: 'backup-2024-01-14.sql', size: '238 MB', date: '2024-01-14 02:30:00', type: 'full' },
    { id: 3, name: 'backup-2024-01-13.sql', size: '241 MB', date: '2024-01-13 02:30:00', type: 'full' },
  ];

  React.useEffect(() => {
    // In production, fetch actual backups
    setBackups(mockBackups);
    setLoading(false);
  }, []);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      await axios.post('/api/admin/settings/backup', {}, config);
      toast.success(t('admin.backup.backupSuccess'));
      // Refresh backup list
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(t('admin.backup.backupError'));
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async (backupId) => {
    if (!window.confirm(t('admin.backup.restoreConfirmation'))) return;
    
    setRestoring(true);
    try {
      await axios.post(`/api/admin/settings/restore/${backupId}`, {}, config);
      toast.success(t('admin.backup.restoreSuccess'));
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error(t('admin.backup.restoreError'));
    } finally {
      setRestoring(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.backup.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.backup.subtitle')}
          </p>
        </div>
        <button
          onClick={handleBackup}
          disabled={backingUp}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {backingUp ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {t('admin.backup.backingUp')}
            </>
          ) : (
            <>
              <FaDatabase className="mr-2" />
              {t('admin.backup.createBackup')}
            </>
          )}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.backup.totalBackups')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{backups.length}</p>
            </div>
            <FaHdd className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.backup.lastBackup')}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {backups.length > 0 ? formatDate(backups[0].date) : 'N/A'}
              </p>
            </div>
            <FaClock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.backup.totalSize')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {backups.reduce((acc, b) => acc + parseInt(b.size), 0)} MB
              </p>
            </div>
            <FaShieldAlt className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.backup.backupHistory')}
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin w-8 h-8 text-blue-500" />
            </div>
          ) : backups.length > 0 ? (
            backups.map((backup) => (
              <div key={backup.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <FaFile className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{backup.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FaCalendarDay className="mr-1" />
                        {formatDate(backup.date)}
                      </span>
                      <span>{backup.size}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        backup.type === 'full' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {backup.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(backup.id)}
                    disabled={restoring}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {restoring ? <FaSpinner className="animate-spin mr-2" /> : <FaUpload className="mr-2" />}
                    {t('admin.backup.restore')}
                  </button>
                  <button
                    onClick={() => toast.info(t('admin.backup.downloadComing'))}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    {t('admin.backup.download')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FaDatabase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('admin.backup.noBackups')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('admin.backup.noBackupsDesc')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
              {t('admin.backup.infoTitle')}
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {t('admin.backup.infoDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;