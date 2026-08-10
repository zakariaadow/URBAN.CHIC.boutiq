// src/components/forms/PaymentForm.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSpinner, FaSave, FaTimes, FaCreditCard, FaWallet, FaMoneyBillWave } from 'react-icons/fa';

const PaymentForm = ({ 
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  appointments = [],
  paymentMethods = ['cash', 'card', 'mpesa', 'paypal'],
  mode = 'create' // 'create' or 'edit'
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    appointment_id: initialData.appointment_id || '',
    amount: initialData.amount || '',
    method: initialData.method || '',
    reference: initialData.reference || '',
    notes: initialData.notes || '',
    status: initialData.status || 'pending',
    ...initialData
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.appointment_id) newErrors.appointment_id = 'Appointment is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.method) newErrors.method = 'Payment method is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Appointment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Appointment <span className="text-red-500">*</span>
        </label>
        <select
          name="appointment_id"
          value={formData.appointment_id}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            errors.appointment_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading || mode === 'edit'}
          required
        >
          <option value="">Select Appointment</option>
          {appointments.map((app) => (
            <option key={app.id} value={app.id}>
              {app.service_name} - {new Date(app.date_time).toLocaleDateString()}
            </option>
          ))}
        </select>
        {errors.appointment_id && <p className="mt-1 text-sm text-red-500">{errors.appointment_id}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount (KES) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
          required
        />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Method <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setFormData({ ...formData, method })}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                formData.method === method
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
              disabled={isLoading}
            >
              <div className="flex flex-col items-center">
                {method === 'cash' && <FaMoneyBillWave className="text-green-500 text-xl" />}
                {method === 'card' && <FaCreditCard className="text-blue-500 text-xl" />}
                {method === 'mpesa' && <FaWallet className="text-green-500 text-xl" />}
                {method === 'paypal' && <FaWallet className="text-blue-500 text-xl" />}
                <span className="text-sm mt-1 capitalize">{method}</span>
              </div>
            </button>
          ))}
        </div>
        {errors.method && <p className="mt-1 text-sm text-red-500">{errors.method}</p>}
      </div>

      {/* Reference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reference / Transaction ID
        </label>
        <input
          type="text"
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Additional notes..."
          disabled={isLoading}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
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
              {mode === 'create' ? 'Processing...' : 'Updating...'}
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              {mode === 'create' ? 'Process Payment' : 'Update Payment'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <FaTimes className="mr-2" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;