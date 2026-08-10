import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaChartLine, 
  FaStar, 
  FaSpinner,
  FaTrophy,
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const StylistPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({
    total_appointments: 0,
    completed_appointments: 0,
    avg_rating: 0,
    total_reviews: 0,
    completion_rate: 0,
    monthly_stats: []
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/stylist/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setPerformance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <FaChartLine className="mr-3 text-purple-600" />
          My Performance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your service performance and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {performance.total_appointments || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {performance.completed_appointments || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-yellow-500">
              {performance.avg_rating?.toFixed(1) || 0}
            </span>
            <FaStar className="ml-2 text-yellow-400 w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {performance.completion_rate?.toFixed(1) || 0}%
          </p>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Performance
        </h3>
        {performance.monthly_stats?.length > 0 ? (
          <div className="space-y-3">
            {performance.monthly_stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{stat.month}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.appointments} appointments</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ⭐ {stat.avg_rating?.toFixed(1) || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.reviews} reviews</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No monthly data available</p>
        )}
      </div>
    </div>
  );
};

export default StylistPerformance;