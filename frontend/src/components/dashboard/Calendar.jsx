// src/components/dashboard/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaClock } from 'react-icons/fa';

const Calendar = ({ 
  events = [],
  onDateSelect = null,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // 'month' or 'week'

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventsForDate = (dateStr) => {
    return events.filter(event => {
      const eventDate = new Date(event.date_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isSelected = (dateStr) => {
    return dateStr === selectedDate;
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    if (onDateSelect) {
      onDateSelect(dateStr);
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date().toISOString().split('T')[0];

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isTodayDate = isToday(dateStr);
      const isSelectedDate = isSelected(dateStr);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(dateStr)}
          className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors text-sm ${
            isSelectedDate
              ? 'bg-purple-600 text-white'
              : isTodayDate
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <div className="relative">
            {day}
            {dayEvents.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                isSelectedDate ? 'bg-white' : 'bg-purple-500'
              }`}></span>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = getEventsForDate(dateStr);
      const isTodayDate = isToday(dateStr);

      days.push(
        <div key={i} className="flex-1">
          <div className={`text-center p-2 border-b border-gray-200 dark:border-gray-700 ${
            isTodayDate ? 'bg-purple-50 dark:bg-purple-900/20' : ''
          }`}>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold ${
              isTodayDate ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'
            }`}>
              {date.getDate()}
            </div>
          </div>
          <div className="p-1 space-y-1 min-h-[300px]">
            {dayEvents.map((event, idx) => (
              <div
                key={idx}
                className="text-xs p-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 truncate cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50"
                title={event.title || event.service_name}
              >
                <div className="flex items-center gap-1">
                  <FaClock className="w-2 h-2" />
                  <span>{formatTime(event.date_time)}</span>
                </div>
                <div className="truncate">{event.service_name || event.title}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaCalendarDay className="text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.calendar')}
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <div className="flex gap-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                view === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                view === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Week
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={goToPrevious}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNext}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next"
            >
              <FaChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Month/Year Display */}
      <div className="text-center mb-4">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Calendar Grid */}
      {view === 'month' ? (
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {renderMonthView()}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto">
          {renderWeekView()}
        </div>
      )}

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {formatDate(selectedDate)}
          </p>
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.service_name || event.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(event.date_time)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    {event.status || 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No events on this day</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;