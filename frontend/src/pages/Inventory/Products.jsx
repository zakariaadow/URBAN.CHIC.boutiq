import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaBox, FaSearch, FaPlus, FaEdit, FaTrash, FaEye,
  FaSpinner, FaTimes, FaChevronLeft, FaChevronRight,
  FaToggleOn, FaToggleOff, FaImage
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Products = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    sku: '', 
    barcode: '', 
    description: '', 
    image_url: '',
    purchase_price: '', 
    selling_price: '', 
    quantity: '', 
    min_quantity: 5
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/inventory/products', {
        ...config,
        params: { page: currentPage, limit: 10, search: searchTerm || undefined }
      });
      
      console.log("API Response:", response.data); // Debug log

      // ✅ FIX: Robustly extract the array from the paginated response
      let fetchedProducts = [];
      
      // Case 1: Standard paginated response { data: { items: [...] } }
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        fetchedProducts = response.data.data.items;
        setTotalPages(response.data.data.pages || response.data.data.totalPages || 1);
      } 
      // Case 2: Non-paginated array wrapped in .data { data: [...] }
      else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedProducts = response.data.data;
        setTotalPages(1);
      } 
      // Case 3: Flat array response.data = [...]
      else if (Array.isArray(response.data)) {
        fetchedProducts = response.data;
        setTotalPages(1);
      }
      // Case 4: Fallback to empty array
      else {
        fetchedProducts = [];
        setTotalPages(1);
        console.warn("Unexpected API response structure:", response.data);
      }

      setProducts(fetchedProducts);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await axios.put(`/api/inventory/products/${editingProduct.id}`, formData, config);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/inventory/products', formData, config);
        toast.success('Product added successfully');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/inventory/products/${id}`, config);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggle = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      await axios.put(`/api/inventory/products/${id}`, { is_active: !product.is_active }, config);
      toast.success('Status updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ 
      name: '', sku: '', barcode: '', description: '', image_url: '',
      purchase_price: '', selling_price: '', quantity: '', min_quantity: 5 
    });
  };

  if (loading && products.length === 0) {
    return <div className="flex justify-center p-10"><FaSpinner className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('inventory.products.title') || 'Products'}</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FaPlus className="inline mr-2" /> {t('inventory.products.add') || 'Add Product'}
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('inventory.products.search') || 'Search products...'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
          {t('common.search') || 'Search'}
        </button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-400">
                          <FaBox />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-6 py-4">{product.sku}</td>
                    <td className="px-6 py-4">${product.selling_price}</td>
                    <td className="px-6 py-4">{product.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleToggle(product.id)} className="text-purple-600 hover:text-purple-800">
                        {product.is_active ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button onClick={() => { setEditingProduct(product); setFormData(product); setShowForm(true); }} className="text-yellow-600 hover:text-yellow-800">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('inventory.products.noProducts') || 'No products found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border rounded disabled:opacity-50">
            <FaChevronLeft />
          </button>
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">{currentPage}</span>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border rounded disabled:opacity-50">
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={resetForm}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" required />
              <input name="sku" placeholder="SKU (Optional)" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" />
              <input name="barcode" placeholder="Barcode (Optional)" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" />
              
              {/* Image URL Field */}
              <input 
                name="image_url" 
                placeholder="Image URL (e.g., https://...)" 
                value={formData.image_url} 
                onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                className="w-full p-2 border rounded dark:bg-gray-700" 
              />

              <div className="grid grid-cols-2 gap-4">
                <input name="purchase_price" type="number" step="0.01" placeholder="Purchase Price" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" required />
                <input name="selling_price" type="number" step="0.01" placeholder="Selling Price" value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="quantity" type="number" placeholder="Initial Qty" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" required />
                <input name="min_quantity" type="number" placeholder="Min Qty Alert" value={formData.min_quantity} onChange={(e) => setFormData({...formData, min_quantity: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                  {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;