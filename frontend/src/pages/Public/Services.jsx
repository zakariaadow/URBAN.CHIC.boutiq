import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCut, FaSpa, FaPaintBrush, FaHands,
  FaStar, FaClock, FaSearch, FaFilter,
  FaArrowRight, FaCheckCircle, FaTag,
  FaHeart, FaRegHeart, FaShoppingBag, FaImages
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);

  // Fallback data with correct images
  const servicesData = [
    { id: 1, name: 'Haircut', description: 'Professional haircut tailored to your style and preference', price: 1500, duration_minutes: 30, category: { id: 1, name: 'Hair' }, rating: 4.8, reviews: 125, is_popular: true, image: '/image6.png' },
    { id: 2, name: 'Hair Coloring', description: 'Full hair coloring service', price: 5000, duration_minutes: 90, category: { id: 1, name: 'Hair' }, rating: 4.9, reviews: 89, is_popular: true, image: '/image8.jpg' },
    { id: 3, name: 'Manicure', description: 'Basic manicure service', price: 800, duration_minutes: 30, category: { id: 2, name: 'Nails' }, rating: 4.6, reviews: 78, is_popular: false, image: '/image12.jpg' },
    { id: 4, name: 'Pedicure', description: 'Basic pedicure service', price: 1000, duration_minutes: 40, category: { id: 2, name: 'Nails' }, rating: 4.7, reviews: 65, is_popular: true, image: '/image11.jpg' },
    { id: 5, name: 'Full Makeup', description: 'Complete makeup application for any occasion, using high-quality products', price: 3000, duration_minutes: 60, category: { id: 3, name: 'Makeup' }, rating: 4.9, reviews: 95, is_popular: true, image: '/image19.jpg' },
    { id: 6, name: 'Luxury Facial', description: 'Luxury facial treatment with deep cleansing, exfoliation, and hydration', price: 4000, duration_minutes: 60, category: { id: 4, name: 'Spa' }, rating: 4.8, reviews: 112, is_popular: true, image: '/image16.jpg' },
    { id: 7, name: 'Body Massage', description: 'Full body massage to relieve tension and promote relaxation', price: 6000, duration_minutes: 90, category: { id: 4, name: 'Spa' }, rating: 4.9, reviews: 156, is_popular: true, image: '/image10.jpg' },
    { id: 8, name: 'Full Body Waxing', description: 'Complete body waxing using gentle, hypoallergenic wax', price: 3500, duration_minutes: 60, category: { id: 5, name: 'Waxing' }, rating: 4.5, reviews: 43, is_popular: false, image: '/image20.jpg' },
    { id: 9, name: 'Box Braids', description: 'Classic box braids with neat parting and professional finish', price: 4500, duration_minutes: 180, category: { id: 1, name: 'Hair' }, rating: 4.9, reviews: 78, is_popular: true, image: '/image2.png' },
    { id: 10, name: 'Knotless Braids', description: 'Pain-free knotless braids with natural-looking finish', price: 5000, duration_minutes: 200, category: { id: 1, name: 'Hair' }, rating: 4.8, reviews: 65, is_popular: true, image: '/image3.jpeg' },
    { id: 11, name: 'Stitch Braids', description: 'Crisp stitch line braids for a polished and elegant look', price: 4000, duration_minutes: 150, category: { id: 1, name: 'Hair' }, rating: 4.6, reviews: 43, is_popular: false, image: '/image4.png' },
    { id: 12, name: 'Senegalese Twists', description: 'Beautiful Senegalese twists with natural hair texture', price: 3500, duration_minutes: 120, category: { id: 1, name: 'Hair' }, rating: 4.7, reviews: 56, is_popular: false, image: '/image7.jpg' },
    { id: 13, name: 'Spring Twists', description: 'Bouncy spring twists with a fun and playful look', price: 3800, duration_minutes: 130, category: { id: 1, name: 'Hair' }, rating: 4.6, reviews: 34, is_popular: false, image: '/image5.png' },
    { id: 14, name: 'Loc Retouch', description: 'Professional loc retouch and maintenance service', price: 3000, duration_minutes: 90, category: { id: 1, name: 'Hair' }, rating: 4.9, reviews: 89, is_popular: true, image: '/image4.png' },
    { id: 15, name: 'Starter Locs', description: 'New loc installation with proper parting and technique', price: 4500, duration_minutes: 180, category: { id: 1, name: 'Hair' }, rating: 4.7, reviews: 45, is_popular: false, image: '/image9.jpg' },
    { id: 16, name: 'Loc Styling', description: 'Styling and grooming for mature locs', price: 2500, duration_minutes: 60, category: { id: 1, name: 'Hair' }, rating: 4.5, reviews: 67, is_popular: false, image: '/image9.jpg' },
    { id: 17, name: 'Signature Style', description: 'Custom signature hairstyle with finishing touches', price: 3500, duration_minutes: 90, category: { id: 1, name: 'Hair' }, rating: 4.8, reviews: 72, is_popular: true, image: '/image17.jpg' },
    { id: 18, name: 'Wash & Style', description: 'Professional wash, blow dry, and styling', price: 2000, duration_minutes: 60, category: { id: 1, name: 'Hair' }, rating: 4.7, reviews: 123, is_popular: false, image: '/image17.jpg' },
  ];

  useEffect(() => {
    fetchServices();
    loadCategoriesFromServices();
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteServices') || '[]');
    setFavorites(savedFavorites);
  }, []);

  const loadCategoriesFromServices = () => {
    const uniqueCategories = servicesData.map(s => s.category?.name)
      .filter((name, index, self) => name && self.indexOf(name) === index)
      .map(name => ({ id: name.toLowerCase(), name }));
    setCategories(uniqueCategories);
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/public/services');
      const servicesData = response.data.data || response.data || [];
      setServices(servicesData);
      
      const uniqueCategories = servicesData
        .map(s => s.category?.name)
        .filter((name, index, self) => name && self.indexOf(name) === index)
        .map(name => ({ id: name.toLowerCase(), name }));
      
      if (uniqueCategories.length > 0) {
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices(servicesData);
      toast.error(t('services.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (serviceId) => {
    const newFavorites = favorites.includes(serviceId)
      ? favorites.filter(id => id !== serviceId)
      : [...favorites, serviceId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteServices', JSON.stringify(newFavorites));
    toast.success(newFavorites.includes(serviceId) ? t('services.addedToFavorites') : t('services.removedFromFavorites'));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Hair': <FaCut className="text-purple-500" />,
      'Nails': <FaHands className="text-pink-500" />,
      'Makeup': <FaPaintBrush className="text-yellow-500" />,
      'Spa': <FaSpa className="text-green-500" />,
      'Waxing': <FaHands className="text-orange-500" />
    };
    return icons[categoryName] || <FaStar className="text-gray-500" />;
  };

  const getCategoryName = (service) => {
    if (service.category && typeof service.category === 'object') {
      return service.category.name;
    }
    if (typeof service.category === 'string') {
      return service.category;
    }
    return 'Uncategorized';
  };

  const filteredServices = services
    .filter(service => {
      const categoryName = getCategoryName(service);
      if (selectedCategory !== 'all' && categoryName.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchTerm && !service.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !service.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.is_popular || 0) - (a.is_popular || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            {t('services.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-200/50 dark:border-pink-800/30 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('services.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-200/50 dark:border-pink-800/30 rounded-full bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-pink-200/50 dark:border-pink-800/30 rounded-full bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
            >
              <option value="all">{t('services.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-pink-200/50 dark:border-pink-800/30 rounded-full bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
            >
              <option value="popular">{t('services.sortPopular')}</option>
              <option value="rating">{t('services.sortRating')}</option>
              <option value="price-low">{t('services.sortPriceLow')}</option>
              <option value="price-high">{t('services.sortPriceHigh')}</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => {
              const categoryName = getCategoryName(service);
              const duration = service.duration_minutes || service.duration || 0;
              const rating = service.rating || 0;
              const reviewCount = service.reviews || service.review_count || 0;
              const imageUrl = service.image || '/image6.png';
              
              return (
                <div
                  key={service.id}
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-200/50 dark:border-pink-800/30 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/image6.png';
                      }}
                    />
                    {service.is_popular && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full px-3 py-1 text-xs text-white font-semibold shadow-lg">
                        ★ Popular
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                      {getCategoryIcon(categoryName)}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(service.id); }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        {favorites.includes(service.id) ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart />
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({reviewCount} reviews)
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FaClock className="mr-1" />
                        {duration} min
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-pink-200/50 dark:border-pink-800/30">
                      <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                        {formatCurrency(service.price)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/book-appointment', { state: { serviceId: service.id } }); }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-pink-500/30"
                      >
                        <FaShoppingBag className="mr-2" />
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-pink-200/50 dark:border-pink-800/30">
            <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('services.noServices')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('services.noServicesDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
