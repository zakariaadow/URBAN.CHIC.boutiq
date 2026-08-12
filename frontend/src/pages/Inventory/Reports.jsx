import React, { useState } from 'react';
import api from '../../services/api';
import { FaFileAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const generateReport = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/inventory/reports';
      if (reportType === 'valuation') endpoint = '/api/inventory/reports/valuation';
      else if (reportType === 'movement') endpoint = '/api/inventory/reports/movement';
      else if (reportType === 'summary') endpoint = '/api/inventory/reports/summary';

      const response = await api.get(endpoint, config);
      console.log('Report Data:', response.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.post('/api/inventory/reports/export', { format: 'excel' }, { ...config, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory Reports</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700">
            <option value="summary">Inventory Summary</option>
            <option value="valuation">Valuation Report</option>
            <option value="movement">Stock Movement Report</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={generateReport} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaFileAlt className="mr-2" />} Generate
          </button>
          <button onClick={exportReport} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Export (Excel)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;