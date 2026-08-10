// src/components/cards/ReviewCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaStar, FaUser, FaCalendarDay, FaEdit,
  FaTrash, FaReply, FaCheckCircle
} from 'react-icons/fa';

const ReviewCard = ({ 
  review, 
  showActions = true,
  onEdit = null,
  onDelete = null,
  onReply = null,
  className = ''
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
    ));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-sm font-bold text-purple-500">
            {getInitials(review.customer_name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {review.customer_name || 'Anonymous'}
              </h4>
              {review.is_verified_purchase && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <FaCheckCircle className="mr-1" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex">
                {renderStars(review.rating)}
              </div>
              <span className="flex items-center">
                <FaCalendarDay className="mr-1" />
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(review.id)}
                className="p-1.5 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                aria-label="Edit review"
              >
                <FaEdit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                aria-label="Delete review"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {review.title && (
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-3">
          {review.title}
        </h4>
      )}
      <p className="text-gray-700 dark:text-gray-300 mt-2">
        {review.comment}
      </p>

      {/* Service/Product Info */}
      {(review.service_name || review.stylist_name) && (
        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
          {review.service_name && (
            <span className="flex items-center">
              Service: {review.service_name}
            </span>
          )}
          {review.stylist_name && (
            <span className="flex items-center">
              Stylist: {review.stylist_name}
            </span>
          )}
        </div>
      )}

      {/* Reply */}
      {review.reply && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <FaReply className="w-3 h-3" />
            <span className="font-medium">Staff Reply</span>
            {review.replied_at && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {formatDate(review.replied_at)}
              </span>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            {review.reply}
          </p>
        </div>
      )}

      {/* Reply Button */}
      {showActions && onReply && !review.reply && (
        <button
          onClick={() => onReply(review.id)}
          className="mt-4 px-4 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center"
        >
          <FaReply className="mr-2" />
          Reply to Review
        </button>
      )}
    </div>
  );
};

export default ReviewCard;