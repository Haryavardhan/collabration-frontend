import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, BookOpen, Shield, Edit2, Check, X, Loader } from 'lucide-react';
import axios from 'axios';

// A single editable row
const ProfileRow = ({ icon: Icon, label, value, type = 'text', readOnly = false, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  // Keep draft in sync if parent refreshes
  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setDraft(value); setEditing(false); };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1rem 1.25rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Icon */}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color="#a78bfa" />
      </div>

      {/* Label + Value */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 3 }}>{label}</p>
        {editing ? (
          <input
            autoFocus
            type={type}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid #7c3aed',
              borderRadius: 8, padding: '0.4rem 0.7rem', color: 'white', fontSize: '0.97rem', outline: 'none',
            }}
          />
        ) : (
          <p style={{ margin: 0, fontSize: '0.97rem', color: value ? 'white' : 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            {value || `Not set`}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {editing ? (
            <>
              <button
                onClick={handleSave} disabled={saving}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
              <button
                onClick={handleCancel}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
const ProfileTab = ({ isFullscreen, TopBar }) => {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = storedUser?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch {
      showToast('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId && token) fetchProfile(); }, [userId]);

  const saveField = async (field, value) => {
    try {
      const payload = { [field]: value };
      // interests comes in as a string "A, B, C" — split it
      if (field === 'interests') {
        payload.interests = value.split(',').map(s => s.trim()).filter(Boolean);
      }
      const res = await axios.put(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.user);
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data.user }));
      showToast('success', 'Saved!');
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Save failed');
      throw err; // propagate so ProfileRow knows it failed
    }
  };

  return (
    <>
      <TopBar title="My Profile" icon={User} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 9999,
          padding: '0.65rem 1.2rem', borderRadius: 10,
          background: toast.type === 'success' ? '#166534' : '#7f1d1d',
          border: `1px solid ${toast.type === 'success' ? '#4ade80' : '#f87171'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          fontSize: '0.88rem', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div style={{ padding: '1.5rem 2rem', maxWidth: 680 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.5)', padding: '3rem 0' }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading profile...
          </div>
        ) : !profile ? (
          <p style={{ color: '#f87171' }}>Could not load profile.</p>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Avatar header */}
            <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(124,58,237,0.07)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>{profile.name}</p>
                <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20, background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {profile.role}
                </span>
              </div>
              <p style={{ margin: '0 0 0 auto', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Click ✏ to edit any field</p>
            </div>

            {/* Rows */}
            <ProfileRow
              icon={User} label="Full Name" value={profile.name}
              onSave={v => saveField('name', v)}
            />
            <ProfileRow
              icon={Mail} label="Email Address" value={profile.email}
              readOnly
            />
            <ProfileRow
              icon={Phone} label="Phone Number"
              value={profile.phone_number}
              type="tel"
              onSave={v => saveField('phone_number', v)}
            />
            <ProfileRow
              icon={BookOpen} label="Interests (comma-separated)"
              value={Array.isArray(profile.interests) ? profile.interests.join(', ') : profile.interests}
              onSave={v => saveField('interests', v)}
            />
            {profile.role === 'mentor' && (
              <>
                <ProfileRow
                  icon={BookOpen} label="Bio (shown on Find Mentor page)"
                  value={profile.bio}
                  onSave={v => saveField('bio', v)}
                />
                <ProfileRow
                  icon={Shield} label="Charge Per Minute (₹)"
                  value={profile.charge_per_min || ''}
                  type="number"
                  onSave={v => saveField('charge_per_min', v)}
                />
                <ProfileRow
                  icon={Shield} label="Discount Offer (%)"
                  value={profile.discount_percent || ''}
                  type="number"
                  onSave={v => saveField('discount_percent', v)}
                />
              </>
            )}
            <ProfileRow
              icon={Shield} label="Role" value={profile.role}
              readOnly
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileTab;
