import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCog, FaSave, FaSpinner, FaTimes,
  FaBuilding, FaClock, FaMoneyBillWave,
  FaShieldAlt, FaEnvelope, FaPhone,
  FaGlobe, FaPalette, FaDatabase,
  FaUsers, FaBell, FaLock, FaKey
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Settings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      site_name: 'Urban Chic Boutique',
      site_description: 'Premium Salon & Spa Services',
      timezone: 'Africa/Nairobi',
      currency: 'USD',
      language: 'en'
    },
    business: {
      working_hours: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-18:00',
        saturday: '09:00-17:00',
        sunday: 'Closed'
      },
      break_hours: '13:00-14:00',
      booking_advance: 1,
      max_booking_days: 30
    },
    notifications: {
      email_enabled: true,
      sms_enabled: true,
      appointment_reminder: true,
      marketing_emails: false
    },
    security: {
      two_factor_auth: false,
      session_timeout: 60,
      max_login_attempts: 5
    }
  });
  const [activeTab, setActiveTab] = useState('general');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const response = await api.get('/api/admin/settings', config);
      // setSettings(response.data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(t('admin.settings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', settings, config);
      toast.success(t('admin.settings.saveSuccess'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('admin.settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleGeneralChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [key]: value }
    }));
  };

  const handleBusinessChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      business: { ...prev.business, [key]: value }
    }));
  };

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const handleSecurityChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [key]: value }
    }));
  };

  const clearCache = async () => {
    try {
      await api.post('/api/admin/settings/cache/clear', {}, config);
      toast.success(t('admin.settings.cacheCleared'));
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error(t('admin.settings.cacheError'));
    }
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
            {t('admin.settings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.settings.subtitle')}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
          >
            <FaDatabase className="mr-2" /> {t('admin.settings.clearCache')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {t('common.saveChanges')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['general', 'business', 'notifications', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {t(`admin.settings.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.settings.generalSettings')}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.siteName')}
              </label>
              <input
                type="text"
                value={settings.general.site_name}
                onChange={(e) => handleGeneralChange('site_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.siteDescription')}
              </label>
              <textarea
                value={settings.general.site_description}
                onChange={(e) => handleGeneralChange('site_description', e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.settings.timezone')}
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Africa/Nairobi">Africa/Nairobi</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.settings.currency')}
                </label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => handleGeneralChange('currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.settings.businessSettings')}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.workingHours')}
              </label>
              {Object.entries(settings.business.working_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 mb-2">
                  <span className="w-20 text-sm text-gray-600 dark:text-gray-400 capitalize">{day}</span>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => {
                      const newHours = { ...settings.business.working_hours, [day]: e.target.value };
                      setSettings(prev => ({
                        ...prev,
                        business: { ...prev.business, working_hours: newHours }
                      }));
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="09:00-18:00"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.breakHours')}
              </label>
              <input
                type="text"
                value={settings.business.break_hours}
                onChange={(e) => handleBusinessChange('break_hours', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="13:00-14:00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.settings.bookingAdvance')} (days)
                </label>
                <input
                  type="number"
                  value={settings.business.booking_advance}
                  onChange={(e) => handleBusinessChange('booking_advance', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.settings.maxBookingDays')}
                </label>
                <input
                  type="number"
                  value={settings.business.max_booking_days}
                  onChange={(e) => handleBusinessChange('max_booking_days', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.settings.notificationSettings')}
            </h2>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  {t(`admin.settings.notifications.${key}`)}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('admin.settings.securitySettings')}
            </h2>
            {Object.entries(settings.security).map(([key, value]) => (
              <div key={key} className="border-b border-gray-100 dark:border-gray-700 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {t(`admin.settings.security.${key}`)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(`admin.settings.security.${key}Desc`)}
                    </p>
                  </div>
                  {typeof value === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSecurityChange(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  ) : (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleSecurityChange(key, parseInt(e.target.value))}
                      className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;