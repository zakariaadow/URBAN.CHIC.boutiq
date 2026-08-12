import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaStore, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaSpinner,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Branches = () => {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/manager/branches', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setBranches(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <FaStore className="mr-3 text-blue-600" />
          Branches
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Managing {branches.length} branches
        </p>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FaBuilding className="w-6 h-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {branch.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Code: {branch.code}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                branch.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {branch.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Branch Details */}
            <div className="space-y-2">
              {branch.address && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FaMapMarkerAlt className="mr-2 text-gray-400 w-4 h-4" />
                  {branch.address}, {branch.city}, {branch.state}
                </div>
              )}
              {branch.phone && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FaPhone className="mr-2 text-gray-400 w-4 h-4" />
                  {branch.phone}
                </div>
              )}
              {branch.email && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FaEnvelope className="mr-2 text-gray-400 w-4 h-4" />
                  {branch.email}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaClock className="mr-2 text-gray-400 w-4 h-4" />
                {branch.opening_time} - {branch.closing_time}
              </div>
              {branch.days_open && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="mr-2 text-gray-400">📅</span>
                  {Array.isArray(branch.days_open) ? branch.days_open.join(', ') : branch.days_open}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaUsers className="mr-2 text-gray-400 w-4 h-4" />
                Staff: {branch.staff_count} members
              </div>
            </div>

            {/* Staff by Role */}
            {branch.staff_by_role && Object.keys(branch.staff_by_role).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Staff by Role
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(branch.staff_by_role).map(([role, count]) => (
                    <span key={role} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {role}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {branch.appointment_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {branch.customer_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Customers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  Ksh {branch.revenue?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Branches;