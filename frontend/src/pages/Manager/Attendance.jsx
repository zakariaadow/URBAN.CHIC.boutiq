import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [form, setForm] = useState({ stylist_id: '', date: '', check_in_time: '', status: 'present' });
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/api/manager/staff/attendance', form, config); toast.success('Attendance recorded'); } 
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Record Attendance</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl border space-y-4 max-w-lg">
        <input placeholder="Stylist ID" value={form.stylist_id} onChange={(e) => setForm({...form, stylist_id: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="time" value={form.check_in_time} onChange={(e) => setForm({...form, check_in_time: e.target.value})} className="w-full p-2 border rounded" required />
        <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full p-2 border rounded">
          <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option>
        </select>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Submit</button>
      </form>
    </div>
  );
};
export default Attendance;