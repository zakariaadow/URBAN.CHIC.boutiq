import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaChartLine, 
  FaStar, 
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaSpinner,
  FaUserCheck,
  FaTrophy,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);
  const [summary, setSummary] = useState({
    totalStaff: 0,
    avgRating: 0,
    totalAppointments: 0,
    totalRevenue: 0
  });
  const [timeRange, setTimeRange] = useState('monthly');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPerformance();
  }, [timeRange]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/manager/staff/performance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { range: timeRange }
      });

      if (response.data.status === 'success') {
        const data = response.data.data;
        // Ensure data is an array
        const performanceArray = Array.isArray(data) ? data : data.performance || [];
        setPerformanceData(performanceArray);
        
        // Calculate summary
        if (performanceArray.length > 0) {
          const total = performanceArray.length;
          const avgRating = performanceArray.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / total;
          const totalAppointments = performanceArray.reduce((sum, p) => sum + (p.total_appointments || 0), 0);
          const totalRevenue = performanceArray.reduce((sum, p) => sum + (p.revenue || 0), 0);
          
          setSummary({
            totalStaff: total,
            avgRating: Math.round(avgRating * 10) / 10,
            totalAppointments,
            totalRevenue
          });
        }
      } else {
        setPerformanceData([]);
        toast.error(response.data.message || 'Failed to fetch performance data');
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      setPerformanceData([]);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 3.5) return 'text-blue-500';
    if (rating >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading performance data...</p>
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
              <FaChartLine className="mr-3 text-blue-600" />
              Staff Performance
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and analyze staff performance metrics
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
              <option value="yearly">This Year</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalStaff}
                </p>
              </div>
              <FaUsers className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  {summary.avgRating || 0}
                  <FaStar className="ml-2 text-yellow-400" />
                </p>
              </div>
              <FaStar className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalAppointments}
                </p>
              </div>
              <FaCalendarCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ksh {summary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <FaMoneyBillWave className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Performance List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Staff Performance Rankings
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.isArray(performanceData) && performanceData.length > 0 ? (
              performanceData.map((staff, index) => (
                <div key={staff.id || index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                        {staff.name?.charAt(0) || 'S'}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {staff.name || 'Unknown'}
                          </h3>
                          {index === 0 && (
                            <span className="ml-2 text-yellow-500">
                              <FaTrophy />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {staff.role || 'Staff'} • {staff.total_appointments || 0} appointments
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${getPerformanceColor(staff.avg_rating || 0)}`}>
                            {staff.avg_rating ? staff.avg_rating.toFixed(1) : '0.0'}
                          </span>
                          <FaStar className="ml-1 text-yellow-400 text-sm" />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          Ksh {(staff.revenue || 0).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {Math.round(staff.performance_score || 0)}%
                          </span>
                          <span className={`ml-1 ${(staff.performance_score || 0) >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                            {(staff.performance_score || 0) >= 70 ? <FaArrowUp /> : <FaArrowDown />}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(staff.performance_score || 0)} transition-all duration-500`}
                        style={{ width: `${Math.min(staff.performance_score || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Performance Data
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Staff performance data will appear here once appointments are completed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;