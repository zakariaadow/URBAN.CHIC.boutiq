import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaClock, 
  FaCalendarAlt,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Schedule = () => {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(
        `/api/stylist/schedule?date=${dateStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setSchedule(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <FaClock className="mr-3 text-purple-600" />
          My Schedule
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your daily appointments
        </p>
      </div>

      {/* Date Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-purple-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {formatDate(selectedDate)}
            </span>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {schedule.length > 0 ? (
            schedule.map((appt) => (
              <div key={appt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {appt.appointment_time}
                      </p>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appt.customer_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appt.service_name} • {appt.duration || 60} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                      appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      appt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FaClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No appointments scheduled
              </h3>
              <p className="text-sm">
                You have no appointments on this day
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;