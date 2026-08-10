// src/components/cards/ProductCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaBox, FaEdit, FaTrash, FaEye,
  FaToggleOn, FaToggleOff, FaBarcode,
  FaShoppingCart, FaStar
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductCard = ({ 
  product, 
  showActions = true,
  onEdit = null,
  onDelete = null,
  onToggleStatus = null,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (stock <= 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  const stockStatus = getStockStatus(product.stock || 0);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <FaBox className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {product.name}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.category?.name || product.category || 'Uncategorized'}
              </span>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.status === 'active'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          }`}>
            {product.status || 'inactive'}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {product.description || 'No description available'}
        </p>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
            {stockStatus.label}
          </span>
        </div>

        {/* Stock & Barcode */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <FaBox className="mr-1" />
            {product.stock || 0} units
          </div>
          {product.barcode && (
            <div className="flex items-center">
              <FaBarcode className="mr-1" />
              {product.barcode}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => navigate(`/products/${product.id}`)}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              aria-label="View product"
            >
              <FaEye />
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(product.id)}
                className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                aria-label="Edit product"
              >
                <FaEdit />
              </button>
            )}
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(product.id, product.status)}
                className={`p-2 transition-colors ${
                  product.status === 'active'
                    ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                    : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                }`}
                aria-label="Toggle status"
              >
                {product.status === 'active' ? <FaToggleOff /> : <FaToggleOn />}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                aria-label="Delete product"
              >
                <FaTrash />
              </button>
            )}
            <button
              onClick={() => navigate('/book-appointment')}
              className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            >
              <FaShoppingCart className="mr-2" />
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;