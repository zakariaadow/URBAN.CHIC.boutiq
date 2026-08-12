import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaArrowDown, FaSearch, FaSpinner, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StockIn = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', quantity: '', reference: '', notes: '' });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api.get('/api/inventory/products', config).then(res => {
      setProducts(res.data?.data || []);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/inventory/stock/in', formData, config);
      toast.success('Stock In recorded');
      setShowForm(false);
      setFormData({ product_id: '', quantity: '', reference: '', notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Stock In</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg"><FaPlus className="inline mr-2" /> Record Stock In</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden p-6 text-center text-gray-500">
        <FaArrowDown className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <p>Use the "Record Stock In" button to add inventory.</p>
        <p className="text-sm">Recent stock-ins will appear here.</p>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">Record Stock In</h2><button onClick={() => setShowForm(false)}><FaTimes /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" required>
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Qty: {p.quantity})</option>)}
              </select>
              <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" required />
              <input placeholder="Reference (e.g. PO-123)" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" />
              <textarea placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockIn;