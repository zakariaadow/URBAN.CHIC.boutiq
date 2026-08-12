import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaGift, FaStar, FaHistory, FaRocket, 
  FaCheckCircle, FaSpinner, FaCalendarDay,
  FaCoins, FaTrophy, FaMedal, FaGem
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const LoyaltyPoints = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [tier, setTier] = useState('bronze');
  const [nextTierPoints, setNextTierPoints] = useState(500);
  const [redeemOptions, setRedeemOptions] = useState([]);
  const [redeeming, setRedeeming] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const [pointsRes, historyRes] = await Promise.all([
        api.get('/api/customer/loyalty/points', config),
        api.get('/api/customer/loyalty/history', config)
      ]);
      
      setPoints(pointsRes.data.points || 0);
      setTier(pointsRes.data.tier || 'bronze');
      setNextTierPoints(pointsRes.data.nextTierPoints || 500);
      setHistory(historyRes.data.data || historyRes.data || []);
      
      // Set redeem options
      setRedeemOptions([
        { id: 1, name: t('loyalty.discount10'), points: 100, value: 10 },
        { id: 2, name: t('loyalty.discount25'), points: 250, value: 25 },
        { id: 3, name: t('loyalty.freeService'), points: 500, value: 50 },
        { id: 4, name: t('loyalty.premiumService'), points: 1000, value: 100 }
      ]);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      toast.error(t('loyalty.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedOption) {
      toast.error(t('loyalty.selectOption'));
      return;
    }
    
    setRedeeming(true);
    try {
      await api.post('/api/customer/loyalty/redeem', {
        option_id: selectedOption.id
      }, config);
      
      toast.success(t('loyalty.redeemSuccess'));
      setShowRedeemModal(false);
      fetchLoyaltyData();
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast.error(error.response?.data?.message || t('loyalty.redeemError'));
    } finally {
      setRedeeming(false);
    }
  };

  const getTierInfo = () => {
    const tiers = {
      bronze: { 
        icon: <FaMedal className="text-amber-600" />,
        color: 'from-amber-400 to-amber-600',
        label: t('loyalty.bronze'),
        minPoints: 0,
        maxPoints: 499
      },
      silver: { 
        icon: <FaMedal className="text-gray-400" />,
        color: 'from-gray-400 to-gray-600',
        label: t('loyalty.silver'),
        minPoints: 500,
        maxPoints: 999
      },
      gold: { 
        icon: <FaMedal className="text-yellow-500" />,
        color: 'from-yellow-400 to-yellow-600',
        label: t('loyalty.gold'),
        minPoints: 1000,
        maxPoints: 1999
      },
      platinum: { 
        icon: <FaGem className="text-blue-500" />,
        color: 'from-blue-400 to-blue-600',
        label: t('loyalty.platinum'),
        minPoints: 2000,
        maxPoints: Infinity
      }
    };
    return tiers[tier] || tiers.bronze;
  };

  const getProgressPercentage = () => {
    const tierInfo = getTierInfo();
    if (tier === 'platinum') return 100;
    const progress = ((points - tierInfo.minPoints) / (nextTierPoints - tierInfo.minPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tierInfo = getTierInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('loyalty.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('loyalty.subtitle')}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className={`bg-gradient-to-r ${tierInfo.color} p-8 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{t('loyalty.yourTier')}</p>
                <div className="flex items-center gap-2 mt-1">
                  {tierInfo.icon}
                  <span className="text-2xl font-bold">{tierInfo.label}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">{t('loyalty.points')}</p>
                <p className="text-4xl font-bold">{points}</p>
              </div>
            </div>
            
            {tier !== 'platinum' && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-white/80 mb-2">
                  <span>{t('loyalty.progress')}</span>
                  <span>{points} / {nextTierPoints} {t('loyalty.points')}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <p className="text-white/80 text-xs mt-2">
                  {t('loyalty.nextTier')}: {nextTierPoints - points} {t('loyalty.pointsToGo')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('loyalty.totalPoints')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{points}</p>
              </div>
              <FaCoins className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('loyalty.transactions')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{history.length}</p>
              </div>
              <FaHistory className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('loyalty.availableRewards')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {redeemOptions.filter(o => o.points <= points).length}
                </p>
              </div>
              <FaGift className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('loyalty.earned')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {history.filter(h => h.type === 'earned').length}
                </p>
              </div>
              <FaRocket className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Redeem Points */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('loyalty.redeemPoints')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('loyalty.redeemDesc')}
              </p>
            </div>
            <button
              onClick={() => setShowRedeemModal(true)}
              disabled={points < 100}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('loyalty.redeem')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {redeemOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 border-2 rounded-lg ${
                  option.points <= points
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FaGift className="w-5 h-5 text-green-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {option.points} pts
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {option.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('loyalty.value')}: ${option.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('loyalty.history')}
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.type === 'earned' ? (
                      <FaCheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <FaGift className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <FaCalendarDay className="inline mr-1" />
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    item.type === 'earned' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.type === 'earned' ? '+' : '-'}{item.points}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaHistory className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('loyalty.noHistory')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRedeemModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('loyalty.redeemPoints')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('loyalty.selectReward')}
            </p>
            <div className="space-y-3 mb-6">
              {redeemOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                    selectedOption?.id === option.id
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                  } ${option.points > points ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={option.points > points}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {option.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {option.points} {t('loyalty.points')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ${option.value} {t('loyalty.value')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleRedeem}
                disabled={!selectedOption || redeeming}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {redeeming ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {t('common.processing')}
                  </>
                ) : (
                  t('loyalty.confirmRedeem')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPoints;