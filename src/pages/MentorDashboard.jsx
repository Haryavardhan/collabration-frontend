import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, Users, LogOut, Loader, DollarSign, Tag, Info, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    interests: '',
    bio: '',
    charge_per_min: '',
    discount_percent: '',
    razorpay_account_id: '',
    razorpay_account_status: '',
  });
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/connections/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const u = res.data;
      setProfile({
        name: u.name || '',
        interests: Array.isArray(u.interests) ? u.interests.join(', ') : (u.interests || ''),
        bio: u.bio || '',
        charge_per_min: u.charge_per_min || '',
        discount_percent: u.discount_percent || '',
        razorpay_account_id: u.razorpay_account_id || '',
        razorpay_account_status: u.razorpay_account_status || '',
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'profile') fetchProfile();
  }, [activeTab]);

  const handleResponse = async (id, action) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/${id}/respond`, 
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update request');
    }
  };

  const handleConnectBank = async () => {
    setOnboardingLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/onboard-mentor`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message || 'Bank account connected successfully!');
      fetchProfile(); // refresh profile to get new account id
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to connect bank account');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const saveProfile = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/users/${user.id}`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      // Update local storage too
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (e) {
      alert('Failed to save profile');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-6 bg-[#0f172a] text-white">
      {/* Header */}
      <header className="glass-panel p-4 mb-8 flex justify-between items-center border-white/10" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">M</div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Mentor Portal</span>
        </h1>
        <div className="flex gap-3 items-center">
          <button className="flex gap-2 items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" onClick={() => setActiveTab('profile')}>
            <User size={18} /> My Profile
          </button>
          <button className="flex gap-2 items-center px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-3">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 mb-4">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Navigation</h2>
            <button 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'requests' ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-lg shadow-pink-500/20' : 'hover:bg-white/5 text-white/60'}`}
              onClick={() => setActiveTab('requests')}
            >
              <CheckCircle size={18} /> Requests
            </button>
            <button 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-lg shadow-pink-500/20' : 'hover:bg-white/5 text-white/60'}`}
              onClick={() => setActiveTab('rooms')}
            >
              <Users size={18} /> My Rooms
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'requests' && (
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5 min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Connection Requests</h2>
                {loading && <Loader className="animate-spin text-pink-500" size={20} />}
              </div>
              
              {!loading && requests.length === 0 ? (
                <div className="text-center py-20 text-white/30 border border-dashed border-white/10 rounded-xl">
                  <p>No pending requests at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req.id} className="p-5 rounded-xl border border-white/10 bg-black/20 flex justify-between items-center group hover:border-pink-500/50 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center font-bold text-lg">
                          {req.student_name?.[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{req.student_name}</h3>
                          <p className="text-white/40 text-sm">{req.student_email}</p>
                          {req.message && <p className="text-pink-400/80 text-sm italic mt-1">"{req.message}"</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleResponse(req.id, 'approved')}
                              className="px-4 py-2 rounded-lg bg-green-500 text-black font-bold text-sm hover:bg-green-400 transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleResponse(req.id, 'rejected')}
                              className="px-4 py-2 rounded-lg border border-red-500/50 text-red-500 font-bold text-sm hover:bg-red-500/10 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${req.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <User className="text-pink-500" /> Profile Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:border-pink-500 outline-none transition-all"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Interests (comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:border-pink-500 outline-none transition-all"
                      value={profile.interests}
                      onChange={e => setProfile({...profile, interests: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Info size={12} /> Bio / About Me
                    </label>
                    <textarea 
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:border-pink-500 outline-none transition-all min-h-[120px]"
                      value={profile.bio}
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-pink-500/5 border border-pink-500/20">
                    <h3 className="text-pink-400 font-bold mb-4 flex items-center gap-2 text-sm">
                      <DollarSign size={16} /> Monetization Settings
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-white/60 mb-2">Charge Per Minute (INR)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</div>
                        <input 
                          type="number" 
                          placeholder="e.g. 5"
                          className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-4 py-3 focus:border-pink-500 outline-none transition-all"
                          value={profile.charge_per_min}
                          onChange={e => setProfile({...profile, charge_per_min: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-2">Discount Percent (%)</label>
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">%</div>
                        <input 
                          type="number" 
                          placeholder="e.g. 10"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:border-pink-500 outline-none transition-all"
                          value={profile.discount_percent}
                          onChange={e => setProfile({...profile, discount_percent: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Bank Linking Section */}
                  <div className="p-5 rounded-xl bg-violet-500/5 border border-violet-500/20 mt-4">
                    <h3 className="text-violet-400 font-bold mb-4 flex items-center gap-2 text-sm">
                      <LinkIcon size={16} /> Bank Account Connections
                    </h3>
                    <div className="text-sm text-white/60 mb-4">
                      Connect your bank account via Razorpay to automatically receive payouts from student sessions.
                    </div>
                    
                    {profile.razorpay_account_id ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                         <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                           <CheckCircle size={16} />
                         </div>
                         <div>
                           <div className="font-bold text-sm text-green-400">Account Connected</div>
                           <div className="text-xs text-white/40">{profile.razorpay_account_id} • Status: {profile.razorpay_account_status}</div>
                         </div>
                      </div>
                    ) : (
                      <button 
                         onClick={handleConnectBank}
                         disabled={onboardingLoading}
                         className="w-full flex justify-center items-center gap-2 py-3 rounded-lg bg-white text-black font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
                      >
                         {onboardingLoading ? <Loader size={16} className="animate-spin" /> : 'Connect Bank via Razorpay'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <button 
                  onClick={saveProfile}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;
