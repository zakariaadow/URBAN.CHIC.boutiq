// src/components/forms/AppointmentForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSpinner, FaCalendarAlt, FaClock, FaUser, FaCut, FaStore } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AppointmentForm = ({ 
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  branches = [],
  services = [],
  stylists = [],
  availableSlots = [],
  mode = 'create' // 'create' or 'edit'
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    branch_id: initialData.branch_id || '',
    service_id: initialData.service_id || '',
    stylist_id: initialData.stylist_id || '',
    date: initialData.date || '',
    time: initialData.time || '',
    customer_name: initialData.customer_name || '',
    customer_email: initialData.customer_email || '',
    customer_phone: initialData.customer_phone || '',
    notes: initialData.notes || '',
    ...initialData
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData({ ...formData, date, time: '' });
    // Fetch available slots for this date
    if (formData.branch_id && formData.service_id) {
      // Parent component should handle fetching slots
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
    if (!formData.service_id) newErrors.service_id = 'Service is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.customer_name) newErrors.customer_name = 'Customer name is required';
    if (!formData.customer_email) newErrors.customer_email = 'Customer email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Branch */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('booking.selectBranch')} <span className="text-red-500">*</span>
        </label>
        <select
          name="branch_id"
          value={formData.branch_id}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            errors.branch_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
        {errors.branch_id && <p className="mt-1 text-sm text-red-500">{errors.branch_id}</p>}
      </div>

      {/* Service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('booking.selectService')} <span className="text-red-500">*</span>
        </label>
        <select
          name="service_id"
          value={formData.service_id}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            errors.service_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        >
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
        {errors.service_id && <p className="mt-1 text-sm text-red-500">{errors.service_id}</p>}
      </div>

      {/* Stylist (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('booking.selectStylist')} <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <select
          name="stylist_id"
          value={formData.stylist_id}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        >
          <option value="">Any Stylist</option>
          {stylists.map((stylist) => (
            <option key={stylist.id} value={stylist.id}>{stylist.name}</option>
          ))}
        </select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('booking.date')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isLoading}
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('booking.time')} <span className="text-red-500">*</span>
          </label>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              errors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isLoading || !formData.date}
          >
            <option value="">Select Time</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
        </div>
      </div>

      {/* Customer Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('booking.customerName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            errors.customer_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {errors.customer_name && <p className="mt-1 text-sm text-red-500">{errors.customer_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('booking.customerEmail')} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="customer_email"
          value={formData.customer_email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            errors.customer_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {errors.customer_email && <p className="mt-1 text-sm text-red-500">{errors.customer_email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('booking.customerPhone')} <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="customer_phone"
          value={formData.customer_phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('booking.notes')}
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder={t('booking.notesPlaceholder')}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            mode === 'create' ? 'Book Appointment' : 'Update Appointment'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;