import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FaStickyNote, 
  FaSpinner, 
  FaTimes,
  FaSave,
  FaEdit,
  FaTrash,
  FaUser,
  FaClock,
  FaCheck,
  FaPlus,
  FaHistory
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const CustomerNotes = ({ appointment, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [customerNotes, setCustomerNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [noteHistory, setNoteHistory] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
      fetchCustomerNotes();
      fetchNoteHistory();
    }
  }, [appointment]);

  const fetchCustomerNotes = async () => {
    try {
      const response = await api.get(
        `/api/stylist/appointments/${appointment.id}/notes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setCustomerNotes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer notes:', error);
    }
  };

  const fetchNoteHistory = async () => {
    try {
      const response = await api.get(
        `/api/stylist/appointments/${appointment.id}/notes/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setNoteHistory(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching note history:', error);
    }
  };

  const updateAppointmentNotes = async () => {
    setLoading(true);
    try {
      const response = await api.put(
        `/api/stylist/appointments/${appointment.id}/notes`,
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Appointment notes updated successfully');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setLoading(false);
    }
  };

  const addCustomerNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/api/stylist/appointments/${appointment.id}/notes`,
        { note: newNote, customer_id: appointment.customer_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Note added successfully');
        setNewNote('');
        fetchCustomerNotes();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerNote = async (noteId) => {
    if (!editingNote?.text?.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(
        `/api/stylist/appointments/${appointment.id}/notes/${noteId}`,
        { note: editingNote.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Note updated successfully');
        setEditingNote(null);
        fetchCustomerNotes();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomerNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    try {
      const response = await api.delete(
        `/api/stylist/appointments/${appointment.id}/notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Note deleted successfully');
        fetchCustomerNotes();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Customer Notes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {appointment?.customer_name || 'Customer'} - {appointment?.service_name || 'Service'}
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
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowHistory(false)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                !showHistory
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaStickyNote className="inline mr-2" /> Current Notes
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                showHistory
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaHistory className="inline mr-2" /> History
            </button>
          </div>

          {/* Current Notes */}
          {!showHistory && (
            <div className="space-y-6">
              {/* Appointment Notes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Add notes about the appointment..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={updateAppointmentNotes}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Customer Notes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <FaUser className="mr-2 text-purple-500" />
                  Customer Notes
                </h3>
                
                {/* Add Note */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about the customer..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomerNote()}
                  />
                  <button
                    onClick={addCustomerNote}
                    disabled={loading || !newNote.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {customerNotes.length > 0 ? (
                    customerNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {editingNote?.id === note.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingNote.text}
                              onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                              className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                              onKeyPress={(e) => e.key === 'Enter' && updateCustomerNote(note.id)}
                            />
                            <button
                              onClick={() => updateCustomerNote(note.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => setEditingNote(null)}
                              className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-white">
                                {note.text}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <FaClock className="mr-1" />
                                {formatDate(note.created_at)}
                                {note.stylist_name && (
                                  <span className="ml-3">
                                    By: {note.stylist_name}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => setEditingNote({ id: note.id, text: note.text })}
                                className="p-1 text-blue-500 hover:text-blue-700"
                              >
                                <FaEdit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteCustomerNote(note.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No customer notes yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Note History */}
          {showHistory && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {noteHistory.length > 0 ? (
                noteHistory.map((note, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 border-purple-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">
                          {note.text || note.note}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <FaUser className="mr-1" />
                            {note.author || 'System'}
                          </span>
                          <span className="flex items-center">
                            <FaClock className="mr-1" />
                            {formatDate(note.created_at || note.timestamp)}
                          </span>
                          {note.action && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                              {note.action}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No note history available
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
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

export default CustomerNotes;