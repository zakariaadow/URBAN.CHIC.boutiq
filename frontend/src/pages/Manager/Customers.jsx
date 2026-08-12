import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaUsers, 
  FaSearch, 
  FaEye,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaStar,
  FaFilter,
  FaUserPlus
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search
      });

      const response = await api.get(
        `/api/manager/customers?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        const data = response.data.data;
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } else {
        toast.error(response.data.message || 'Failed to load customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = async (customerId) => {
    try {
      const response = await api.get(
        `/api/manager/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setSelectedCustomer(response.data.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to load customer details');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaUsers className="mr-3 text-blue-600" />
            Customers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total: {total} customers
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <FaUserPlus className="mr-2" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-lg">
                  {customer.name?.charAt(0) || 'C'}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {customer.email}
                  </p>
                </div>
              </div>
              {customer.is_walk_in && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  Walk-in
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaPhone className="mr-2 text-gray-400" />
                {customer.phone || 'N/A'}
              </div>
              {customer.address && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  {customer.address}, {customer.city}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaMoneyBillWave className="mr-2 text-gray-400" />
                Total Spent: Ksh {customer.total_spent.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FaCalendarCheck className="mr-2 text-gray-400" />
                Visits: {customer.total_visits}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => viewCustomerDetails(customer.id)}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center"
              >
                <FaEye className="mr-2" /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} of {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Customer Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Info</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Name:</span> {selectedCustomer.customer.name}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Email:</span> {selectedCustomer.customer.email}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Phone:</span> {selectedCustomer.customer.phone}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Address:</span> {selectedCustomer.customer.address || 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Statistics</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Total Spent:</span> Ksh {selectedCustomer.customer.total_spent.toLocaleString()}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Total Visits:</span> {selectedCustomer.customer.total_visits}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Loyalty Points:</span> {selectedCustomer.statistics?.loyalty_points || 0}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">Average Rating:</span> {selectedCustomer.statistics?.avg_rating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointments */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Appointment History ({selectedCustomer.appointments?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Service</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedCustomer.appointments?.map((appt) => (
                      <tr key={appt.id}>
                        <td className="px-4 py-2 text-sm">{appt.date}</td>
                        <td className="px-4 py-2 text-sm">{appt.service}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                            appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">Ksh {appt.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;