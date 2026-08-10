import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LowStock = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get('/api/inventory/stock/alerts/low', config)
      .then(res => {
        setItems(res.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load low stock alerts');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center"><FaExclamationTriangle className="text-yellow-500 mr-2" /> Low Stock Alerts</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        {items.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Product</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Current Qty</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Min Qty</th></tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-red-600 font-bold">{item.quantity}</td>
                  <td className="px-6 py-4">{item.min_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">No low stock items found.</div>
        )}
      </div>
    </div>
  );
};

export default LowStock;