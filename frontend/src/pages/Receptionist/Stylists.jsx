import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaUser, FaSearch, FaStar, FaStarHalfAlt,
  FaCheckCircle, FaTimesCircle, FaSpinner,
  FaCut, FaClock, FaPhone, FaEnvelope
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

const ReceptionistStylists = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stylists, setStylists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    setLoading(true);
    try {
      const response = await api.get('/receptionist/stylists');
      
      // Handle different response structures
      let stylistData = [];
      if (response.data?.data) {
        stylistData = Array.isArray(response.data.data) ? response.data.data : [];
      } else {
        stylistData = Array.isArray(response.data) ? response.data : [];
      }
      
      setStylists(stylistData);
      
      // Debug: Log the response
      console.log('Stylists API Response:', response.data);
      console.log('Parsed stylists:', stylistData);
      
    } catch (error) {
      console.error('Error fetching stylists:', error);
      setStylists([]);
      toast.error('Failed to load stylists');
    } finally {
      setLoading(false);
    }
  };

  const filteredStylists = Array.isArray(stylists) 
    ? stylists.filter(stylist => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const name = stylist.user?.full_name || stylist.name || '';
        const email = stylist.user?.email || stylist.email || '';
        const specialization = stylist.specialization || '';
        return (
          name.toLowerCase().includes(search) ||
          email.toLowerCase().includes(search) ||
          specialization.toLowerCase().includes(search)
        );
      })
    : [];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }
    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }
    return stars;
  };

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
            Stylists
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all stylists ({filteredStylists.length} total)
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stylists by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Stylists Grid */}
      {filteredStylists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStylists.map((stylist) => {
            const user = stylist.user || {};
            const name = user.full_name || stylist.name || 'Stylist';
            const email = user.email || stylist.email || 'No email';
            const phone = user.phone || stylist.phone || 'No phone';
            const specialization = stylist.specialization || 'General';
            const experience = stylist.experience_years || 0;
            const rating = stylist.rating || 0;
            const skills = stylist.skills || [];
            
            return (
              <div
                key={stylist.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <FaUser className="text-purple-600 text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(rating)}
                    <span className="text-sm text-gray-500 ml-1">({rating.toFixed(1)})</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <FaCut className="mr-2 text-gray-400" />
                    <span className="font-medium">Specialization:</span>
                    <span className="ml-2">{specialization}</span>
                  </div>

                  <div className="flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    <span className="font-medium">Experience:</span>
                    <span className="ml-2">{experience} years</span>
                  </div>

                  {phone !== 'No phone' && (
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {phone}
                    </div>
                  )}

                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <span className="truncate">{email}</span>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {stylist.is_available ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <FaCheckCircle className="mr-1" />
                        Available
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <FaTimesCircle className="mr-1" />
                        Unavailable
                      </span>
                    )}
                    {stylist.is_active ? (
                      <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FaUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No stylists found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No stylists match your search' : 'No stylists are currently registered'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceptionistStylists;