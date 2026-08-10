// src/components/cards/ServiceCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaClock, FaStar, FaHeart, FaRegHeart, 
  FaShoppingBag, FaCut, FaSpa, FaPaintBrush, FaHands
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ServiceCard = ({ 
  service, 
  showFavorite = true, 
  showBookButton = true,
  className = '',
  onFavoriteToggle = null
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const getCategoryIcon = (category) => {
    const icons = {
      'Hair': <FaCut className="text-purple-500" />,
      'Nails': <FaHands className="text-pink-500" />,
      'Makeup': <FaPaintBrush className="text-yellow-500" />,
      'Spa': <FaSpa className="text-green-500" />,
      'Waxing': <FaHands className="text-orange-500" />
    };
    return icons[category] || <FaStar className="text-gray-500" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    if (onFavoriteToggle) {
      onFavoriteToggle(service.id);
    }
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBookNow = () => {
    navigate('/book-appointment', { state: { serviceId: service.id } });
  };

  const categoryName = service.category?.name || service.category || 'Uncategorized';
  const duration = service.duration_minutes || service.duration || 0;
  const rating = service.rating || 0;
  const reviewCount = service.reviews || service.review_count || 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              {getCategoryIcon(categoryName)}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {categoryName}
            </span>
          </div>
          {showFavorite && (
            <button
              onClick={handleFavoriteToggle}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {service.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Rating & Duration */}
        <div className="flex items-center justify-between mb-4">
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(service.price)}
          </span>
          {showBookButton && (
            <button
              onClick={handleBookNow}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            >
              <FaShoppingBag className="mr-2" />
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;