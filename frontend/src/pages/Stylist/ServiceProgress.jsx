import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCheckCircle, 
  FaSpinner, 
  FaTimes,
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaPause,
  FaPlay,
  FaStop
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ServiceProgress = ({ appointment, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (appointment) {
      setProgress(appointment.progress || 0);
      setStatus(appointment.status || 'pending');
      setTimeSpent(appointment.time_spent || 0);
      setSteps(appointment.steps || [
        { id: 1, name: 'Consultation', completed: false },
        { id: 2, name: 'Preparation', completed: false },
        { id: 3, name: 'Service', completed: false },
        { id: 4, name: 'Finishing', completed: false },
        { id: 5, name: 'Review', completed: false }
      ]);
      
      // Calculate current step based on progress
      const stepSize = 100 / steps.length;
      const currentStepIndex = Math.floor(progress / stepSize);
      setCurrentStep(Math.min(currentStepIndex, steps.length - 1));
    }
  }, [appointment]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const updateProgress = async (newProgress) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/stylist/appointments/${appointment.id}/progress`,
        { 
          progress: newProgress,
          time_spent: timeSpent,
          status: status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Progress updated successfully');
        setProgress(newProgress);
        
        // Update steps completion
        const stepSize = 100 / steps.length;
        const newSteps = steps.map((step, index) => ({
          ...step,
          completed: newProgress >= (index + 1) * stepSize
        }));
        setSteps(newSteps);
        
        // Update current step
        const currentStepIndex = Math.floor(newProgress / stepSize);
        setCurrentStep(Math.min(currentStepIndex, steps.length - 1));
        
        if (newProgress >= 100) {
          setStatus('completed');
          setIsRunning(false);
          toast.success('Service completed!');
        }
        
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-500 bg-yellow-100';
      case 'in-progress': return 'text-blue-500 bg-blue-100';
      case 'completed': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="w-4 h-4" />;
      case 'in-progress': return <FaPlay className="w-4 h-4" />;
      case 'completed': return <FaCheckCircle className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  const handleStepClick = (index) => {
    const stepSize = 100 / steps.length;
    const newProgress = (index + 1) * stepSize;
    setProgress(Math.min(newProgress, 100));
    updateProgress(Math.min(newProgress, 100));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Service Progress
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {appointment?.service_name || 'Service'} - {appointment?.customer_name || 'Customer'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p className={`text-lg font-bold ${getStatusColor(status)} px-3 py-1 rounded-full inline-flex items-center gap-2`}>
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatTime(timeSpent)}
              </p>
              <button
                onClick={toggleTimer}
                className={`mt-2 px-3 py-1 text-sm rounded-lg ${
                  isRunning 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } transition-colors`}
              >
                {isRunning ? <FaPause className="inline mr-1" /> : <FaPlay className="inline mr-1" />}
                {isRunning ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>0%</span>
              <span className="font-medium text-purple-600">Current: {Math.round(progress)}%</span>
              <span>100%</span>
            </div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Service Steps
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = step.completed;
                const stepSize = 100 / steps.length;
                const stepProgress = (index + 1) * stepSize;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    disabled={loading || status === 'completed'}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : isActive 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    } border hover:shadow-md transition-all`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      {isCompleted ? <FaCheck className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${
                        isCompleted ? 'text-green-700 dark:text-green-400' : 
                        isActive ? 'text-purple-700 dark:text-purple-400' : 
                        'text-gray-700 dark:text-gray-300'
                      }`}>
                        {step.name}
                      </p>
                      {isActive && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Click to complete this step
                        </p>
                      )}
                    </div>
                    {isCompleted && (
                      <FaCheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isActive && !isCompleted && (
                      <FaArrowRight className="w-4 h-4 text-purple-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => updateProgress(Math.min(progress + 10, 100))}
              disabled={loading || status === 'completed' || progress >= 100}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowRight className="inline mr-2" /> Advance 10%
            </button>
            <button
              onClick={() => updateProgress(100)}
              disabled={loading || status === 'completed'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheckCircle className="inline mr-2" /> Complete Service
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProgress;