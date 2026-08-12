import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaUsers, 
  FaSearch, 
  FaFilter,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaClock,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Staff = () => {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/manager/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        const data = response.data.data;
        // Ensure data is an array
        const staffData = Array.isArray(data) ? data : data.staff || [];
        setStaff(staffData);
        setFilteredStaff(staffData);
      } else {
        setStaff([]);
        setFilteredStaff([]);
        toast.error(response.data.message || 'Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
      setFilteredStaff([]);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  // Filter staff based on search and filters
  useEffect(() => {
    let filtered = staff;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }
    
    setFilteredStaff(filtered);
  }, [searchTerm, roleFilter, statusFilter, staff]);

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Active' },
      inactive: { icon: FaTimes, color: 'text-red-500', bg: 'bg-red-100', label: 'Inactive' },
      pending: { icon: FaClock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Pending' },
      on_leave: { icon: FaClock, color: 'text-blue-500', bg: 'bg-blue-100', label: 'On Leave' }
    };
    return statusMap[status] || statusMap.inactive;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaUsers className="mr-3 text-blue-600" />
              Staff Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your team members and their schedules
            </p>
          </div>
          <button
            onClick={() => {/* Navigate to add staff */}}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaUserPlus className="mr-2" /> Add Staff
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="stylist">Stylist</option>
                <option value="receptionist">Receptionist</option>
                <option value="manager">Manager</option>
                <option value="finance">Finance</option>
                <option value="inventory">Inventory</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filteredStaff) && filteredStaff.length > 0 ? (
            filteredStaff.map((member) => {
              const status = getStatusBadge(member.status || 'active');
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-lg">
                        {member.name?.charAt(0) || 'S'}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {member.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.role || 'No role'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${status.bg} ${status.color}`}>
                      <StatusIcon className="inline mr-1" />
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {member.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Phone:</span> {member.phone || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Joined:</span> {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                    <button
                      onClick={() => {/* Edit staff */}}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {/* View staff details */}}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <FaUserCheck />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Staff Members Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start by adding your first staff member'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Staff;