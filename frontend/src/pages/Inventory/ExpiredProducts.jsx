import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaClock, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExpiredProducts = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api.get('/api/inventory/stock/alerts/expired', config)
      .then(res => {
        setItems(res.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load expired products');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center"><FaClock className="text-red-500 mr-2" /> Expired Products</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        {items.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Product</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Expiry Date</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Qty</th></tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-red-600">{item.expiry_date}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">No expired products found.</div>
        )}
      </div>
    </div>
  );
};

export default ExpiredProducts;