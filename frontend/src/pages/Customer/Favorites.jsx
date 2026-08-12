import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { FaHeart, FaStar, FaCut, FaUser, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Favorites = () => {
  const { t } = useTranslation();
  const [favoriteServices, setFavoriteServices] = useState([]);
  const [favoriteStylists, setFavoriteStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const customApi = customApi.create({
    baseURL: '/api',
    withCredentials: true
  });

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const [servicesRes, stylistsRes] = await Promise.all([
        customApi.get('/customer/favorites/services'),
        customApi.get('/customer/favorites/stylists')
      ]);
      setFavoriteServices(servicesRes.data?.data || servicesRes.data || []);
      setFavoriteStylists(stylistsRes.data?.data || stylistsRes.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavoriteService = async (serviceId) => {
    try {
      await customApi.post(`/customer/favorites/services/${serviceId}`);
      setFavoriteServices(favoriteServices.filter(s => s.id !== serviceId));
      toast.success('Service removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your favorite services and stylists
          </p>
        </div>
      </div>

      {/* Favorite Services */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaCut className="mr-2 text-purple-500" /> Favorite Services
        </h2>
        {favoriteServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteServices.map((service) => (
              <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{service.category?.name || 'N/A'}</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                      KES {service.price}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFavoriteService(service.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FaHeart className="fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaHeart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No favorite services yet</p>
          </div>
        )}
      </div>

      {/* Favorite Stylists */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaUser className="mr-2 text-blue-500" /> Favorite Stylists
        </h2>
        {favoriteStylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteStylists.map((stylist) => (
              <div key={stylist.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{stylist.name || 'Stylist'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stylist.specialization || 'General'}</p>
                    <div className="flex items-center mt-1">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{stylist.rating || 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavoriteService(stylist.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No favorite stylists yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
