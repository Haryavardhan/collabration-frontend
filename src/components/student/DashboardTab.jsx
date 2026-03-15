import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Users, Lock, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';

const DashboardTab = ({ isFullscreen, TopBar }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rooms/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data.rooms || []);
    } catch (e) {
      console.error('Error fetching rooms:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchRooms(); }, [token]);

  const handleJoinRequest = async (roomId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/rooms/${roomId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to request join.');
    }
  };

  const statusBadge = (room) => {
    if (room.membership_status === 'approved') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
          <CheckCircle size={12} /> Member
        </span>
      );
    }
    if (room.membership_status === 'pending') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#fb923c', background: 'rgba(251,146,60,0.1)', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
          <Clock size={12} /> Pending
        </span>
      );
    }
    return null;
  };

  const actionButton = (room) => {
    const base = { width: '100%', padding: '0.55rem 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 'auto' };

    if (room.membership_status === 'approved') {
      return (
        <button onClick={() => navigate(`/room/${room.id}`)} style={{ ...base, background: '#7c3aed', color: 'white' }}>
          Enter Room <ArrowRight size={15} />
        </button>
      );
    }
    if (room.membership_status === 'pending') {
      return (
        <button disabled style={{ ...base, background: 'rgba(251,146,60,0.12)', color: '#fb923c', cursor: 'not-allowed' }}>
          <Clock size={15} /> Request Pending
        </button>
      );
    }
    return (
      <button onClick={() => handleJoinRequest(room.id)} style={{ ...base, background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Lock size={14} /> Request to Join
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar title="Dashboard" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        {/* Welcome row */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>Here are all available study rooms</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader size={32} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '1rem', marginBottom: 6 }}>No rooms available yet.</p>
            <p style={{ fontSize: '0.85rem' }}>Go to "Create Room" to start one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {rooms.map(room => (
              <div key={room.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '1.1rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{room.subject}</h4>
                  {statusBadge(room)}
                </div>

                {room.description && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {room.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: 2 }}>
                  <Users size={13} />
                  {room.member_count} member{room.member_count !== 1 ? 's' : ''}
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  {actionButton(room)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
