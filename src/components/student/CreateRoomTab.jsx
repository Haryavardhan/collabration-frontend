import React, { useState } from 'react';
import { PlusCircle, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CreateRoomTab = ({ isFullscreen, TopBar }) => {
  const token = localStorage.getItem('token');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!subject.trim()) { setError('Room subject is required.'); return; }
    setLoading(true); setError(null); setSuccess(false);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rooms/`, { subject, description }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(true);
      setSubject('');
      setDescription('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '0.7rem 1rem',
    color: 'white', fontSize: '0.95rem', outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar title="Create Subject Room" icon={PlusCircle} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <p style={{ margin: '0 0 1.75rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
          Start a new study group and invite others to join the discussion.
        </p>

        <div style={{ maxWidth: 520 }}>
          {/* Alerts */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.65rem 1rem', color: '#f87171', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '0.65rem 1rem', color: '#4ade80', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              <CheckCircle size={15} /> Room created successfully! Find it in your Dashboard.
            </div>
          )}

          {/* Subject */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Room Subject *</label>
            <input
              type="text" value={subject} onChange={e => setSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Advanced Calculus, ML Study Group"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Description <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</span></label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={4} placeholder="What will this group focus on? Topics, goals, schedule..."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={loading || !subject.trim()}
            style={{
              width: '100%', padding: '0.75rem',
              background: loading || !subject.trim() ? 'rgba(124,58,237,0.4)' : '#7c3aed',
              border: 'none', borderRadius: 10, color: 'white',
              fontWeight: 600, fontSize: '0.95rem', cursor: loading || !subject.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomTab;
