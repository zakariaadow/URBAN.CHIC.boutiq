import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCalendarAlt, FaClock, FaUser, FaCut, 
  FaStore, FaArrowLeft, FaCheck, FaSpinner,
  FaCalendarDay, FaInfoCircle, FaArrowRight,
  FaExclamationTriangle, FaPlus, FaTimes,
  FaTrash, FaShoppingCart, FaCreditCard,
  FaMoneyBillWave, FaWallet, FaStar,
  FaStarHalfAlt, FaRegStar
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const BookAppointment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(false);
  
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedServices, setSelectedServices] = useState([]);
  const [formData, setFormData] = useState({
    branch_id: '',
    stylist_id: '',
    date: '',
    time: ''
  });
  
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [step, setStep] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Calculate total price whenever selected services change
    const total = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
    setTotalPrice(total);
  }, [selectedServices]);

  const fetchInitialData = async () => {
    setFetchingData(true);
    try {
      const [branchesRes, servicesRes] = await Promise.all([
        api.get('/api/customer/appointments/branches', config),
        api.get('/api/customer/appointments/services', config)
      ]);
      
      const branchesData = branchesRes.data?.data || branchesRes.data || [];
      const servicesData = servicesRes.data?.data || servicesRes.data || [];
      
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error(t('booking.loadError'));
      setBranches([]);
      setServices([]);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchStylists = async (branchId) => {
    try {
      const response = await api.get('/api/customer/appointments/stylists', {
        ...config,
        params: { branch_id: branchId }
      });
      const stylistsData = response.data?.data || response.data || [];
      setStylists(Array.isArray(stylistsData) ? stylistsData : []);
    } catch (error) {
      console.error('Error fetching stylists:', error);
      toast.error('Failed to load stylists');
      setStylists([]);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!formData.branch_id || selectedServices.length === 0 || !formData.date) {
      toast.error('Please select branch, at least one service, and date first');
      return;
    }
    
    setIsFetchingSlots(true);
    setSlotError('');
    setAvailableSlots([]);
    
    try {
      // Calculate total duration
      const totalDuration = selectedServices.reduce((sum, service) => sum + (service.duration || 30), 0);
      
      const params = {
        branch_id: formData.branch_id,
        date: formData.date,
        duration: totalDuration
      };
      
      if (formData.stylist_id) {
        params.stylist_id = formData.stylist_id;
      }
      
      const response = await api.get('/api/customer/appointments/available-slots', {
        ...config,
        params: params
      });
      
      let slotsData = [];
      if (response.data?.data?.slots) {
        slotsData = response.data.data.slots;
      } else if (response.data?.slots) {
        slotsData = response.data.slots;
      } else if (response.data?.data) {
        slotsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else {
        slotsData = response.data || [];
      }
      
      if (!Array.isArray(slotsData)) {
        slotsData = [];
      }
      
      const availableSlotsData = slotsData.filter(slot => slot.available !== false);
      
      if (availableSlotsData.length === 0) {
        toast.info('No available time slots for this date');
      } else {
        toast.success(`Found ${availableSlotsData.length} available time slots`);
      }
      
      setAvailableSlots(availableSlotsData);
      
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setSlotError('Could not fetch available slots. Please try again.');
      toast.error('Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const handleBranchChange = (branchId) => {
    setFormData({ ...formData, branch_id: branchId, stylist_id: '', time: '' });
    const branch = branches.find(b => b.id === parseInt(branchId));
    setSelectedBranch(branch);
    setAvailableSlots([]);
    setSlotError('');
    setSelectedServices([]);
    setTotalPrice(0);
    setSelectedStylist(null);
    if (branchId) {
      fetchStylists(branchId);
    }
    setStep(2);
  };

  const toggleService = (service) => {
    const exists = selectedServices.find(s => s.id === service.id);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date, time: '' });
    setAvailableSlots([]);
    setSlotError('');
  };

  const handleFetchSlots = async () => {
    if (!formData.branch_id) {
      toast.error('Please select a branch first');
      return;
    }
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }
    
    await fetchAvailableSlots();
    
    if (availableSlots.length > 0) {
      setStep(4);
    }
  };

  const handleSlotSelect = (slot) => {
    const timeValue = slot.time || slot;
    setFormData({ ...formData, time: timeValue });
    setStep(5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    
    setProcessingBooking(true);
    
    try {
      const appointmentData = {
        branch_id: parseInt(formData.branch_id),
        services: selectedServices.map(s => parseInt(s.id)),
        stylist_id: formData.stylist_id ? parseInt(formData.stylist_id) : null,
        appointment_date: formData.date,
        appointment_time: formData.time,
        notes: notes
      };
      
      console.log('Booking appointment with data:', appointmentData);
      
      const response = await api.post('/api/customer/appointments/book-multiple', appointmentData, config);
      console.log('Booking response:', response.data);
      
      toast.success('Appointment booked successfully! You can now make payment.');
      
      // Navigate to My Appointments page where user can pay
      navigate('/customer/appointments');
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setProcessingBooking(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((sum, service) => sum + (service.duration || 30), 0);
  };

  // Render star rating
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-3 h-3 text-yellow-400" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="w-3 h-3 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="w-3 h-3 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
    );
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaShoppingCart className="mr-3 text-blue-600" />
            Book Appointment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select multiple services, choose your stylist, and confirm booking
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {step > stepNum ? <FaCheck /> : stepNum}
                </div>
                {stepNum < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Branch</span>
            <span>Services</span>
            <span>Stylist</span>
            <span>Date & Time</span>
            <span>Confirm</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Select Branch */}
            {step >= 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Branch <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        parseInt(formData.branch_id) === branch.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => handleBranchChange(branch.id.toString())}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {branch.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {branch.address}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            📞 {branch.phone}
                          </p>
                        </div>
                        {parseInt(formData.branch_id) === branch.id && (
                          <FaCheck className="w-5 h-5 text-blue-500 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Multiple Services */}
            {step >= 2 && selectedBranch && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Services <span className="text-red-500">*</span>
                  </label>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {selectedServices.length} selected
                  </span>
                </div>
                
                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Services ({selectedServices.length})
                    </h4>
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between py-1 border-b border-blue-100 dark:border-blue-800 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(service.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeService(service.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <span className="font-medium text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedServices.find(s => s.id === service.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => toggleService(service)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {formatCurrency(service.price)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              ⏱️ {service.duration || 30} min
                            </span>
                          </div>
                        </div>
                        {selectedServices.find(s => s.id === service.id) && (
                          <FaCheck className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedServices.length === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                    Please select at least one service to continue
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Select Stylist */}
            {step >= 3 && selectedServices.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Stylist <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                
                {/* Selected Stylist Info */}
                {selectedStylist && (
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {selectedStylist.name?.charAt(0) || 'S'}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900 dark:text-white">{selectedStylist.name}</p>
                          <div className="flex items-center gap-2">
                            {renderRating(selectedStylist.rating)}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({selectedStylist.review_count || 0})
                            </span>
                          </div>
                          {selectedStylist.specialization && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedStylist.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, stylist_id: '' });
                          setSelectedStylist(null);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center"
                      >
                        <FaTimes className="mr-1" /> Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Stylist Grid */}
                {!selectedStylist && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        !formData.stylist_id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setFormData({ ...formData, stylist_id: '' });
                        setSelectedStylist(null);
                      }}
                    >
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                          <FaUser className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          Any Stylist
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Auto-assign
                        </p>
                        {!formData.stylist_id && (
                          <FaCheck className="w-4 h-4 text-blue-500 mx-auto mt-1" />
                        )}
                      </div>
                    </div>
                    
                    {stylists.map((stylist) => (
                      <div
                        key={stylist.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          parseInt(formData.stylist_id) === stylist.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                        onClick={() => {
                          setFormData({ ...formData, stylist_id: stylist.id.toString() });
                          setSelectedStylist(stylist);
                        }}
                      >
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl">
                            {stylist.profile_picture ? (
                              <img 
                                src={stylist.profile_picture} 
                                alt={stylist.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              stylist.name?.charAt(0) || 'S'
                            )}
                          </div>
                          
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {stylist.name || `Stylist ${stylist.id}`}
                          </p>
                          
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {renderRating(stylist.rating)}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              ({stylist.review_count || 0})
                            </span>
                          </div>
                          
                          {stylist.specialization && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                              {stylist.specialization.split(',').slice(0, 2).join(', ')}
                            </p>
                          )}
                          
                          {stylist.experience_years > 0 && (
                            <p className="text-xs text-blue-500 dark:text-blue-400">
                              {stylist.experience_years} yrs exp
                            </p>
                          )}
                          
                          {parseInt(formData.stylist_id) === stylist.id && (
                            <FaCheck className="w-4 h-4 text-blue-500 mx-auto mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Select Date & Time */}
            {step >= 4 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date & Time <span className="text-red-500">*</span>
                </label>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarDay className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchSlots}
                    disabled={!formData.date || isFetchingSlots || selectedServices.length === 0}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                  >
                    {isFetchingSlots ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Find Available Times <FaArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>

                {slotError && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start">
                    <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{slotError}</p>
                  </div>
                )}

                {formData.date && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {isFetchingSlots ? (
                        'Searching for available times...'
                      ) : availableSlots.length > 0 ? (
                        `Available times for ${formData.date} (${availableSlots.length} available)`
                      ) : (
                        formData.date ? 'No available times for this date' : ''
                      )}
                    </p>
                    {isFetchingSlots ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot, index) => {
                          const timeValue = slot.time || slot;
                          return (
                            <button
                              key={index}
                              type="button"
                              className={`p-3 text-sm rounded-lg border-2 transition-all ${
                                formData.time === timeValue
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                              onClick={() => handleSlotSelect(slot)}
                            >
                              <FaClock className="mx-auto mb-1" />
                              {timeValue}
                            </button>
                          );
                        })}
                      </div>
                    ) : formData.date && (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <FaInfoCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No available time slots for {formData.date}
                        </p>
                        <button
                          type="button"
                          onClick={handleFetchSlots}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Refresh Times
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Confirm Booking */}
            {step >= 5 && formData.time && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Confirm Booking
                </h3>
                
                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Order Summary</h4>
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between py-1 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{service.name}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(service.price)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>Total Duration</span>
                    <span>{getTotalDuration()} minutes</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>Stylist</span>
                    <span>{selectedStylist?.name || 'Any Stylist'}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>Branch</span>
                    <span>{selectedBranch?.name}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>Date & Time</span>
                    <span>{formData.date} at {formData.time}</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Any special requests or notes for the appointment..."
                  />
                </div>

                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <FaInfoCircle className="inline mr-2" />
                    Payment will be processed after booking confirmation. You can pay at the salon or via M-Pesa.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setStep(Math.max(1, step - 1))}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !formData.branch_id) {
                      toast.error('Please select a branch');
                      return;
                    }
                    if (step === 2 && selectedServices.length === 0) {
                      toast.error('Please select at least one service');
                      return;
                    }
                    if (step === 4 && !formData.time) {
                      toast.error('Please select a time slot');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={processingBooking || selectedServices.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {processingBooking ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;