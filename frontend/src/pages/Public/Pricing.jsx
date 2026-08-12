// src/pages/Public/Pricing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCheckCircle, FaClock, FaTag, FaStar,
  FaArrowRight, FaFilter, FaSearch,
  FaCut, FaSpa, FaPaintBrush, FaHands
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Fallback data with correct field names
  const servicesData = [
    { id: 1, name: 'Haircut', description: 'Professional haircut tailored to your style', price: 1500, duration_minutes: 30, category: 'Hair', is_popular: true },
    { id: 2, name: 'Hair Coloring', description: 'Full hair coloring with premium products', price: 5000, duration_minutes: 90, category: 'Hair', is_popular: true },
    { id: 3, name: 'Hair Highlights', description: 'Partial or full highlights for dimension', price: 3500, duration_minutes: 60, category: 'Hair' },
    { id: 4, name: 'Blow Dry', description: 'Professional blow dry and styling', price: 1000, duration_minutes: 30, category: 'Hair' },
    { id: 5, name: 'Manicure', description: 'Basic manicure with polish', price: 800, duration_minutes: 30, category: 'Nails' },
    { id: 6, name: 'Pedicure', description: 'Basic pedicure with foot massage', price: 1000, duration_minutes: 40, category: 'Nails' },
    { id: 7, name: 'Gel Manicure', description: 'Long-lasting gel polish application', price: 1500, duration_minutes: 45, category: 'Nails', is_popular: true },
    { id: 8, name: 'Nail Art', description: 'Custom nail art designs', price: 2000, duration_minutes: 60, category: 'Nails' },
    { id: 9, name: 'Full Makeup', description: 'Complete makeup for any occasion', price: 3000, duration_minutes: 60, category: 'Makeup', is_popular: true },
    { id: 10, name: 'Bridal Makeup', description: 'Special bridal makeup with trial', price: 5000, duration_minutes: 90, category: 'Makeup', is_popular: true },
    { id: 11, name: 'Facial', description: 'Luxury facial with deep cleansing', price: 4000, duration_minutes: 60, category: 'Spa', is_popular: true },
    { id: 12, name: 'Body Massage', description: 'Full body therapeutic massage', price: 6000, duration_minutes: 90, category: 'Spa', is_popular: true },
    { id: 13, name: 'Body Scrub', description: 'Exfoliating body scrub treatment', price: 3500, duration_minutes: 45, category: 'Spa' },
    { id: 14, name: 'Waxing', description: 'Full body waxing service', price: 3500, duration_minutes: 60, category: 'Waxing' },
    { id: 15, name: 'Eyebrow Shaping', description: 'Professional eyebrow shaping', price: 500, duration_minutes: 15, category: 'Waxing' },
    { id: 16, name: 'Full Body Waxing', description: 'Complete body waxing package', price: 5000, duration_minutes: 90, category: 'Waxing', is_popular: true }
  ];

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/public/pricing');
      let data = response.data.data || response.data || servicesData;
      
      // Fix 2: Handle grouped API response if present
      // If data is an array and the first element is an array (grouped data), flatten it
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        // This handles the case where API returns: [grouped_services, 200]
        const grouped = data[0] || data;
        const flat = Object.entries(grouped).flatMap(([category, services]) =>
          services.map((service, index) => ({
            id: service.id || `${category}-${index}`,
            ...service,
            category: category,
            // Ensure consistent field names
            duration_minutes: service.duration_minutes || service.duration || 0,
            is_popular: service.is_popular || service.popular || false,
            price: service.price || 0,
            name: service.name || '',
            description: service.description || ''
          }))
        );
        setPricingData(flat);
        
        // Extract categories from flat data
        const uniqueCategories = [...new Set(flat.map(s => s.category))];
        setCategories(uniqueCategories);
      } else if (Array.isArray(data)) {
        // Normal array of services
        const normalizedData = data.map(service => ({
          ...service,
          duration_minutes: service.duration_minutes || service.duration || 0,
          is_popular: service.is_popular || service.popular || false,
          category: service.category?.name || service.category || 'Uncategorized'
        }));
        setPricingData(normalizedData);
        
        // Extract categories from data
        const uniqueCategories = [...new Set(normalizedData.map(s => s.category))];
        setCategories(uniqueCategories);
      } else {
        // Fallback to hardcoded data
        setPricingData(servicesData);
        const uniqueCategories = [...new Set(servicesData.map(s => s.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setPricingData(servicesData);
      const uniqueCategories = [...new Set(servicesData.map(s => s.category))];
      setCategories(uniqueCategories);
      toast.error(t('pricing.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Hair': <FaCut className="text-purple-500" />,
      'Nails': <FaHands className="text-pink-500" />,
      'Makeup': <FaPaintBrush className="text-yellow-500" />,
      'Spa': <FaSpa className="text-green-500" />,
      'Waxing': <FaHands className="text-orange-500" />
    };
    return icons[category] || <FaTag className="text-gray-500" />;
  };

  // Helper function to safely get category name
  const getCategoryName = (service) => {
    if (service.category && typeof service.category === 'object') {
      return service.category.name;
    }
    return service.category || 'Uncategorized';
  };

  // Helper function to safely get duration
  const getDuration = (service) => {
    return service.duration_minutes || service.duration || 0;
  };

  // Helper function to safely get popular status
  const isPopular = (service) => {
    return service.is_popular || service.popular || false;
  };

  const filteredServices = pricingData
    .filter(service => {
      const categoryName = getCategoryName(service);
      if (selectedCategory !== 'all' && categoryName !== selectedCategory) return false;
      if (searchTerm && !service.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !service.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aPopular = isPopular(a);
      const bPopular = isPopular(b);
      if (aPopular && !bPopular) return -1;
      if (!aPopular && bPopular) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('pricing.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('pricing.all')}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('pricing.service')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('pricing.category')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('pricing.duration')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('pricing.price')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('pricing.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => {
                    const categoryName = getCategoryName(service);
                    const duration = getDuration(service);
                    const popular = isPopular(service);
                    
                    return (
                      <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                              {getCategoryIcon(categoryName)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {service.name}
                                {popular && (
                                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                                    {t('pricing.popular')}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <FaClock className="mr-2 text-gray-400" />
                            {duration} min
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(service.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => navigate('/book-appointment', { state: { serviceId: service.id } })}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            {t('pricing.bookNow')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('pricing.noServices')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;