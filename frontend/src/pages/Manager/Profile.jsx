import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState({});

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get('/api/manager/branch', config)
      .then(res => setBranch(res.data?.data || {}))
      .finally(() => setLoading(false));
  }, []);

  const updateBranch = async () => {
    try { await axios.put('/api/manager/branch', branch, config); toast.success('Branch updated'); } 
    catch { toast.error('Failed to update'); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Branch Profile</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border space-y-4">
        <div className="flex items-center gap-2 p-2 border rounded"><FaBuilding /> <input value={branch.name || ''} onChange={(e) => setBranch({...branch, name: e.target.value})} className="w-full bg-transparent outline-none" placeholder="Branch Name" /></div>
        <div className="flex items-center gap-2 p-2 border rounded"><FaEnvelope /> <input value={branch.email || ''} onChange={(e) => setBranch({...branch, email: e.target.value})} className="w-full bg-transparent outline-none" placeholder="Email" /></div>
        <div className="flex items-center gap-2 p-2 border rounded"><FaPhone /> <input value={branch.phone || ''} onChange={(e) => setBranch({...branch, phone: e.target.value})} className="w-full bg-transparent outline-none" placeholder="Phone" /></div>
        <button onClick={updateBranch} className="w-full py-2 bg-blue-600 text-white rounded flex justify-center items-center"><FaSave className="mr-2" /> Save</button>
      </div>
    </div>
  );
};
export default Profile;