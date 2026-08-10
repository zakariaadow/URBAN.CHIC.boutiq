// src/components/cards/StaffCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaUser, FaStar, FaClock, FaCut, 
  FaEye, FaEdit, FaTrash, FaCalendarDay,
  FaUserCheck, FaUserTimes
} from 'react-icons/fa';

const StaffCard = ({ 
  staff, 
  role = 'staff',
  showActions = true,
  onEdit = null,
  onDelete = null,
  onToggleStatus = null,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      stylist: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      receptionist: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      finance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inventory: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-2xl font-bold text-purple-500">
            {getInitials(staff.name)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {staff.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(role)}`}>
                {role?.charAt(0).toUpperCase() + role?.slice(1) || 'Staff'}
              </span>
              {staff.specialties && (
                <span className="text-gray-500 dark:text-gray-400">
                  • {staff.specialties}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          staff.status === 'active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {staff.status || 'inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {staff.experience || staff.experience_years || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            {(staff.rating || 0).toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {staff.reviews || staff.review_count || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(staff.created_at)}
          </p>
        </div>
      </div>

      {staff.skills && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Skills</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {typeof staff.skills === 'string' 
              ? staff.skills.split(',').map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded">
                    {skill.trim()}
                  </span>
                ))
              : staff.skills?.map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded">
                    {skill}
                  </span>
                ))
            }
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => navigate(`/staff/${staff.id}`)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <FaEye className="mr-1" />
            View
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(staff.id)}
              className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center text-sm"
            >
              <FaEdit className="mr-1" />
              Edit
            </button>
          )}
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(staff.id, staff.status)}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm ${
                staff.status === 'active'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
              }`}
            >
              {staff.status === 'active' ? (
                <>
                  <FaUserTimes className="mr-1" />
                  Deactivate
                </>
              ) : (
                <>
                  <FaUserCheck className="mr-1" />
                  Activate
                </>
              )}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(staff.id)}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
            >
              <FaTrash className="mr-1" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffCard;