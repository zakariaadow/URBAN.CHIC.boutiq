import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaChartLine, 
  FaMoneyBillWave,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Commissions = () => {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    rate: 0,
    history: []
  });
  const [period, setPeriod] = useState('monthly');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCommissions();
  }, [period]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/stylist/commissions?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setCommissions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Ksh ${amount?.toLocaleString() || 0}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaChartLine className="mr-3 text-purple-600" />
            Commissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your commission earnings
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg">
            Rate: {commissions.rate || 0}%
          </span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Commissions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(commissions.total)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(commissions.pending)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(commissions.paid)}
          </p>
        </div>
      </div>

      {/* Commission History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Commission History
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {commissions.history?.length > 0 ? (
            commissions.history.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.label || `Commission ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className={`text-sm ${item.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {item.status || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No commission history available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Commissions;