import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaShoppingCart, FaPlus, FaSpinner, FaTimes, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Purchases = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: '',
    product_id: '',
    quantity: '',
    unit_price: '',
    total_price: '',
    final_total: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/inventory/purchases', config);
      
      console.log("Purchases API Response:", response.data); // Debug log

      // ✅ ROBUST DATA EXTRACTION
      let fetchedPurchases = [];
      
      // Case 1: Paginated response with 'items' array inside .data
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        fetchedPurchases = response.data.data.items;
      } 
      // Case 2: Standard array inside .data
      else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedPurchases = response.data.data;
      } 
      // Case 3: Flat array response
      else if (Array.isArray(response.data)) {
        fetchedPurchases = response.data;
      }
      // Fallback
      else {
        fetchedPurchases = [];
        console.warn("Unexpected purchases API response structure:", response.data);
      }

      setPurchases(fetchedPurchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchases');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/inventory/suppliers', config);
      
      // ✅ Extract suppliers similarly
      let fetchedSuppliers = [];
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        fetchedSuppliers = response.data.data.items;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedSuppliers = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedSuppliers = response.data;
      } else {
        fetchedSuppliers = [];
      }
      
      setSuppliers(fetchedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/inventory/purchases', formData, config);
      toast.success('Purchase recorded successfully');
      setShowForm(false);
      setFormData({
        supplier_id: '',
        product_id: '',
        quantity: '',
        unit_price: '',
        total_price: '',
        final_total: '',
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchPurchases();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><FaSpinner className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('inventory.purchases.title') || 'Purchases'}
        </h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <FaPlus className="mr-2" /> {t('inventory.purchases.record') || 'Record Purchase'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.isArray(purchases) && purchases.length > 0 ? (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">{p.purchase_date}</td>
                    <td className="px-6 py-4">{p.supplier?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{p.product?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{p.quantity}</td>
                    <td className="px-6 py-4 font-medium">${p.total_price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('inventory.purchases.noPurchases') || 'No purchases found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{t('inventory.purchases.record') || 'Record Purchase'}</h2>
              <button onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select 
                value={formData.supplier_id} 
                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
                required
              >
                <option value="">{t('inventory.purchases.selectSupplier') || 'Select Supplier'}</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Quantity" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                  className="w-full p-2 border rounded dark:bg-gray-700" 
                  required 
                />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Unit Price" 
                  value={formData.unit_price} 
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})} 
                  className="w-full p-2 border rounded dark:bg-gray-700" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Total Price" 
                  value={formData.total_price} 
                  onChange={(e) => setFormData({...formData, total_price: e.target.value})} 
                  className="w-full p-2 border rounded dark:bg-gray-700" 
                  required 
                />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Final Total" 
                  value={formData.final_total} 
                  onChange={(e) => setFormData({...formData, final_total: e.target.value})} 
                  className="w-full p-2 border rounded dark:bg-gray-700" 
                  required 
                />
              </div>
              
              <input 
                type="date" 
                value={formData.purchase_date} 
                onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
                required 
              />
              
              <textarea 
                placeholder="Notes" 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
              />
              
              <button type="submit" disabled={submitting} className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Purchase'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;