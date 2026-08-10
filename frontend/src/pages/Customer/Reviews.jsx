import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaStar, FaStarHalfAlt, FaRegStar, FaUser,
  FaCalendarDay, FaEdit, FaTrash, FaTimes,
  FaSpinner, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Reviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    appointment_id: '',
    rating: 0,
    comment: '',
    service_id: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availableAppointments, setAvailableAppointments] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchReviews();
    fetchAvailableAppointments();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/customer/reviews', config);
      // Handle both array and object responses
      const reviewsData = response.data?.data || response.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(t('reviews.loadError'));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAppointments = async () => {
    try {
      const response = await axios.get('/api/customer/appointments/history', {
        ...config,
        params: { status: 'completed', limit: 100 }
      });
      
      // Handle the response correctly - check for nested data structure
      let appointments = [];
      if (response.data?.data?.items) {
        appointments = response.data.data.items;
      } else if (response.data?.data) {
        appointments = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        appointments = response.data;
      } else {
        appointments = [];
      }
      
      // Make sure appointments is an array
      const completedAppointments = Array.isArray(appointments) ? appointments : [];
      
      // Filter out already reviewed appointments
      const reviewedIds = reviews.map(r => r.appointment_id);
      const available = completedAppointments.filter(
        app => !reviewedIds.includes(app.id)
      );
      
      setAvailableAppointments(available);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAvailableAppointments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      toast.error(t('reviews.ratingRequired'));
      return;
    }
    if (!formData.comment.trim()) {
      toast.error(t('reviews.commentRequired'));
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await axios.put(`/api/customer/reviews/${editingReview.id}`, {
          rating: formData.rating,
          comment: formData.comment
        }, config);
        toast.success(t('reviews.updateSuccess'));
      } else {
        await axios.post('/api/customer/reviews', {
          appointment_id: formData.appointment_id,
          rating: formData.rating,
          comment: formData.comment
        }, config);
        toast.success(t('reviews.createSuccess'));
      }
      resetForm();
      fetchReviews();
      fetchAvailableAppointments();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || t('reviews.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('reviews.deleteConfirmation'))) return;
    
    try {
      await axios.delete(`/api/customer/reviews/${id}`, config);
      toast.success(t('reviews.deleteSuccess'));
      fetchReviews();
      fetchAvailableAppointments();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(t('reviews.deleteError'));
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      appointment_id: review.appointment_id,
      rating: review.rating,
      comment: review.comment,
      service_id: review.service_id
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      appointment_id: '',
      rating: 0,
      comment: '',
      service_id: ''
    });
    setEditingReview(null);
    setShowForm(false);
    setHoverRating(0);
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => onStarClick(i)}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-3xl focus:outline-none transition-colors"
          >
            {i <= (hoverRating || rating) ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-gray-300 dark:text-gray-600" />
            )}
          </button>
        );
      } else {
        if (i <= fullStars) {
          stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
          stars.push(<FaRegStar key={i} className="text-gray-300 dark:text-gray-600" />);
        }
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('reviews.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('reviews.subtitle')} ({Array.isArray(reviews) ? reviews.length : 0})
            </p>
          </div>
          {availableAppointments.length > 0 && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('reviews.writeReview')}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingReview ? t('reviews.editReview') : t('reviews.writeReview')}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {!editingReview && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('reviews.selectAppointment')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.appointment_id}
                    onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">{t('reviews.selectAppointmentPlaceholder')}</option>
                    {availableAppointments.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.service?.name || app.service_name || 'Service'} - {formatDate(app.appointment_date || app.date_time)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reviews.rating')} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData({ ...formData, rating })
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formData.rating > 0 && `${formData.rating} ${t('reviews.stars')}`}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reviews.comment')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={t('reviews.commentPlaceholder')}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {t('common.submitting')}
                    </>
                  ) : (
                    editingReview ? t('common.update') : t('common.submit')
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {review.service?.name || review.service_name || 'Service'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FaUser className="mr-1" />
                        {review.customer?.user?.full_name || review.customer_name || 'You'}
                      </span>
                      <span className="flex items-center">
                        <FaCalendarDay className="mr-1" />
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    
                    {review.reply && (
                      <div className="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('reviews.staffReply')}:</span> {review.reply}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('reviews.noReviews')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('reviews.noReviewsDesc')}
              </p>
              {availableAppointments.length > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('reviews.writeFirstReview')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;