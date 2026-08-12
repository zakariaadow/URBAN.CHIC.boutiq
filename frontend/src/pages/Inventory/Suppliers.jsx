import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { FaTruck, FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Suppliers = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    contact_person: '', 
    email: '', 
    phone: '', 
    address: '' 
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { 
    fetchSuppliers(); 
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/inventory/suppliers', { 
        ...config, 
        params: { search: searchTerm || undefined }
      });

      console.log("Suppliers API Response:", response.data); // Debug log

      // ✅ ROBUST DATA EXTRACTION
      let fetchedSuppliers = [];
      
      // Case 1: Paginated response with 'items' array
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        fetchedSuppliers = response.data.data.items;
      } 
      // Case 2: Standard array inside .data
      else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedSuppliers = response.data.data;
      } 
      // Case 3: Flat array response
      else if (Array.isArray(response.data)) {
        fetchedSuppliers = response.data;
      } 
      // Fallback
      else {
        fetchedSuppliers = [];
        console.warn("Unexpected suppliers API response structure:", response.data);
      }

      setSuppliers(fetchedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/api/inventory/suppliers/${editing.id}`, formData, config);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/api/inventory/suppliers', formData, config);
        toast.success('Supplier added successfully');
      }
      setShowForm(false); 
      setEditing(null); 
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try { 
      await api.delete(`/api/inventory/suppliers/${id}`, config); 
      toast.success('Supplier deleted successfully');
      fetchSuppliers(); 
    } catch (error) { 
      toast.error('Failed to delete supplier'); 
    }
  };

  if (loading && suppliers.length === 0) {
    return <div className="flex justify-center p-10"><FaSpinner className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('inventory.suppliers.title') || 'Suppliers'}
        </h1>
        <button 
          onClick={() => { setEditing(null); setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' }); setShowForm(true); }} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus className="inline mr-2" /> {t('inventory.suppliers.add') || 'Add Supplier'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder={t('inventory.suppliers.search') || 'Search suppliers...'} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <button onClick={fetchSuppliers} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
          {t('common.search') || 'Search'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.isArray(suppliers) && suppliers.length > 0 ? (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4">{s.contact_person || 'N/A'}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setEditing(s); setFormData(s); setShowForm(true); }} 
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('inventory.suppliers.noSuppliers') || 'No suppliers found'}
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
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Supplier' : 'Add Supplier'}
              </h2>
              <button onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                placeholder="Supplier Name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
                required 
              />
              <input 
                placeholder="Contact Person" 
                value={formData.contact_person} 
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
              />
              <input 
                placeholder="Email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
              />
              <input 
                placeholder="Phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
              />
              <textarea 
                placeholder="Address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                  {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;