import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaStore, FaSearch, FaMapMarkerAlt, FaPhone, 
  FaEnvelope, FaClock, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Create axios instance with session-based authentication
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const ReceptionistBranches = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/receptionist/branches');
      
      // Handle different response structures
      let branchData = [];
      if (response.data?.data) {
        branchData = Array.isArray(response.data.data) ? response.data.data : [];
      } else {
        branchData = Array.isArray(response.data) ? response.data : [];
      }
      
      setBranches(branchData);
      
      // Debug: Log the response to see what's coming from the API
      console.log('Branches API Response:', response.data);
      console.log('Parsed branches:', branchData);
      
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = Array.isArray(branches) 
    ? branches.filter(branch => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          branch.name?.toLowerCase().includes(search) ||
          branch.city?.toLowerCase().includes(search) ||
          branch.code?.toLowerCase().includes(search) ||
          branch.address?.toLowerCase().includes(search)
        );
      })
    : [];

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
            Branches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all branches ({filteredBranches.length} total)
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches by name, city, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Branches Grid */}
      {filteredBranches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FaStore className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {branch.name || 'Branch'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {branch.code || 'N/A'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  branch.is_active 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {branch.address && (
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{branch.address}</span>
                  </div>
                )}
                {branch.city && (
                  <div className="flex items-center">
                    <span className="text-gray-500">City:</span>
                    <span className="ml-2">{branch.city}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    {branch.phone}
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <span className="truncate">{branch.email}</span>
                  </div>
                )}
                {branch.opening_time && branch.closing_time && (
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    {branch.opening_time} - {branch.closing_time}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FaStore className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No branches found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No branches match your search' : 'No branches are currently registered'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceptionistBranches;