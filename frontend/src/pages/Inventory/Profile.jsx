import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaSpinner, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // Note: You might need an API endpoint to get the current Inventory Officer's profile.
    // Currently using '/api/admin/users/me' or standard user logic. 
    // If not available, you can manually fill the form.
    api.get('/api/admin/users/me', config).then(res => {
      setProfile(res.data?.data || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/users/me', profile, config);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Inventory Officer Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center space-x-4 border-b pb-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl">
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.first_name} {profile.last_name}</h2>
            <p className="text-gray-500">{profile.role || 'Inventory Officer'}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FaUser className="text-gray-400 mr-3" />
            <input value={profile.first_name || ''} onChange={(e) => setProfile({...profile, first_name: e.target.value})} placeholder="First Name" className="flex-1 bg-transparent border-none focus:ring-0" />
          </div>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FaUser className="text-gray-400 mr-3" />
            <input value={profile.last_name || ''} onChange={(e) => setProfile({...profile, last_name: e.target.value})} placeholder="Last Name" className="flex-1 bg-transparent border-none focus:ring-0" />
          </div>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FaEnvelope className="text-gray-400 mr-3" />
            <input value={profile.email || ''} onChange={(e) => setProfile({...profile, email: e.target.value})} placeholder="Email" className="flex-1 bg-transparent border-none focus:ring-0" disabled />
          </div>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FaPhone className="text-gray-400 mr-3" />
            <input value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="Phone" className="flex-1 bg-transparent border-none focus:ring-0" />
          </div>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FaBuilding className="text-gray-400 mr-3" />
            <input value={profile.branch_name || ''} placeholder="Branch" className="flex-1 bg-transparent border-none focus:ring-0" disabled />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
            {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;