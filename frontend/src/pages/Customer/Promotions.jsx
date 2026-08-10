import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaPercentage, FaGift, FaTag, FaClock,
  FaCalendarDay, FaChevronRight, FaCopy,
  FaCheckCircle, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Promotions = () => {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/public/promotions', {
        ...config,
        params: { active: true }
      });
      setPromotions(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error(t('promotions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPromotionIcon = (type) => {
    const icons = {
      discount: <FaPercentage className="text-green-500" />,
      gift: <FaGift className="text-purple-500" />,
      seasonal: <FaTag className="text-red-500" />,
      referral: <FaCopy className="text-blue-500" />,
      default: <FaTag className="text-gray-500" />
    };
    return icons[type] || icons.default;
  };

  const getPromotionColor = (type) => {
    const colors = {
      discount: 'border-green-500 bg-green-50 dark:bg-green-900/20',
      gift: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
      seasonal: 'border-red-500 bg-red-50 dark:bg-red-900/20',
      referral: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      default: 'border-gray-500 bg-gray-50 dark:bg-gray-800'
    };
    return colors[type] || colors.default;
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t('promotions.codeCopied'));
    setTimeout(() => setCopied(false), 3000);
  };

  const calculateDiscount = (price, discount) => {
    const discountAmount = (price * discount) / 100;
    return price - discountAmount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('promotions.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('promotions.subtitle')}
          </p>
        </div>

        {/* Featured Promotions */}
        {promotions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 ${getPromotionColor(promotion.type)} p-6 hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => {
                  setSelectedPromotion(promotion);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getPromotionIcon(promotion.type)}
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {promotion.type || 'Promotion'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {promotion.discount_percentage}%
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {promotion.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {promotion.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FaClock className="mr-1" />
                    {t('promotions.validUntil')} {formatDate(promotion.end_date)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(promotion.code);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-xs"
                  >
                    <FaCopy className="mr-1" /> {t('promotions.copyCode')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {promotions.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaTag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('promotions.noPromotions')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('promotions.noPromotionsDesc')}
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('promotions.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('promotions.findPromo')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('promotions.findPromoDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaCopy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('promotions.copyCode')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('promotions.copyCodeDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaCheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('promotions.applyDiscount')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('promotions.applyDiscountDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Details Modal */}
      {showDetails && selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getPromotionIcon(selectedPromotion.type)}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {selectedPromotion.type || 'Promotion'}
                  </span>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedPromotion.name}
                </h2>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedPromotion.discount_percentage}% OFF
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedPromotion.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t('promotions.code')}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-lg">
                      {selectedPromotion.code}
                    </code>
                    <button
                      onClick={() => copyCode(selectedPromotion.code)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">{t('promotions.validUntil')}</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {formatDate(selectedPromotion.end_date)}
                  </p>
                </div>
              </div>
              
              {selectedPromotion.terms && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('promotions.terms')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPromotion.terms}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    copyCode(selectedPromotion.code);
                    setShowDetails(false);
                  }}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> {t('promotions.usePromo')}
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;