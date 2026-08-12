import React, { useState } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [range, setRange] = useState({ start: '', end: '' });
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchReport = async (type) => {
    const endpoints = {
      summary: '/api/manager/sales/summary',
      daily: '/api/manager/sales/daily',
      monthly: '/api/manager/sales/monthly',
      service: '/api/manager/sales/by-service',
      stylist: '/api/manager/sales/by-stylist'
    };
    try {
      const res = await api.get(endpoints[type], { ...config, params: range });
      console.log(res.data);
    } catch { alert('Failed to fetch report'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border space-y-4">
        <div className="flex gap-4"><input type="date" value={range.start} onChange={(e) => setRange({...range, start: e.target.value})} className="p-2 border rounded" /><input type="date" value={range.end} onChange={(e) => setRange({...range, end: e.target.value})} className="p-2 border rounded" /></div>
        <div className="flex flex-wrap gap-2">
          {['summary', 'daily', 'monthly', 'service', 'stylist'].map(t => <button key={t} onClick={() => fetchReport(t)} className="px-4 py-2 bg-blue-600 text-white rounded">{t.toUpperCase()}</button>)}
        </div>
      </div>
    </div>
  );
};
export default Reports;