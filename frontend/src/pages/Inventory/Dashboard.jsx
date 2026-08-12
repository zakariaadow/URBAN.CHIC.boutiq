import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaBoxes, FaExclamationTriangle, FaClock, FaDollarSign,
  FaSpinner, FaArrowUp, FaArrowDown, FaClipboardList
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expired, setExpired] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, lowStockRes, expiredRes] = await Promise.all([
        api.get('/api/inventory/dashboard', config),
        api.get('/api/inventory/stock/alerts/low', config),
        api.get('/api/inventory/stock/alerts/expired', config)
      ]);

      setStats(dashboardRes.data?.data || {});
      setLowStock(lowStockRes.data?.data || []);
      setExpired(expiredRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching inventory dashboard:', error);
      toast.error('Failed to load inventory dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('inventory.dashboard.title') || 'Inventory Dashboard'}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('inventory.dashboard.totalProducts') || 'Total Products'} 
          value={stats?.total_products || 0} 
          icon={FaBoxes} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={t('inventory.dashboard.totalValue') || 'Total Value'} 
          value={`$${(stats?.total_value || 0).toFixed(2)}`} 
          icon={FaDollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title={t('inventory.dashboard.lowStock') || 'Low Stock'} 
          value={stats?.low_stock_count || 0} 
          icon={FaExclamationTriangle} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title={t('inventory.dashboard.expired') || 'Expired'} 
          value={stats?.expired_count || 0} 
          icon={FaClock} 
          color="bg-red-500" 
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('inventory.dashboard.lowStockAlerts') || 'Low Stock Alerts'}
            </h3>
            <Link to="/inventory/low-stock" className="text-sm text-blue-600 hover:text-blue-800">
              {t('common.viewAll') || 'View All'}
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {lowStock.length > 0 ? (
              lowStock.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('inventory.dashboard.quantity') || 'Qty'}: {item.quantity} / {item.min_quantity}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {t('inventory.dashboard.low') || 'Low'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {t('inventory.dashboard.noLowStock') || 'No low stock items'}
              </div>
            )}
          </div>
        </div>

        {/* Expired Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('inventory.dashboard.expiredProducts') || 'Expired Products'}
            </h3>
            <Link to="/inventory/expired-products" className="text-sm text-blue-600 hover:text-blue-800">
              {t('common.viewAll') || 'View All'}
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {expired.length > 0 ? (
              expired.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('inventory.dashboard.expiry') || 'Expiry'}: {item.expiry_date}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {t('inventory.dashboard.expired') || 'Expired'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {t('inventory.dashboard.noExpired') || 'No expired products'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;