import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, X, Clock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ConnectionsTab = ({ isFullscreen, TopBar }) => {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const [inRes, outRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/connections/requests`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/connections/mine`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setIncoming(inRes.data.requests || []);
      setOutgoing(outRes.data.connections || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConnections(); }, []);

  const respond = async (connId, action) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/${connId}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchConnections();
    } catch (e) { alert('Action failed'); }
  };

  const STATUS_COLORS = { pending: '#fb923c', approved: '#4ade80', rejected: '#f87171' };
  const STATUS_ICONS  = { pending: <Clock size={13} />, approved: <CheckCircle size={13} />, rejected: <X size={13} /> };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar title="My Network & Connections" icon={Users} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        
        {/* INCOMING REQUESTS */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowRight size={18} color="#a78bfa" /> Incoming Requests
          </h2>
          <p style={{ margin: '4px 0 1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>People who want to connect with you.</p>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>Loading...</p>
          ) : incoming.length === 0 ? (
            <div style={{ padding: '2rem 0', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <p style={{ margin: 0 }}>No incoming requests.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {incoming.map(req => (
                <div key={req.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.9rem', flexShrink: 0 }}>
                    {req.student_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{req.student_name}</p>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{req.student_email}</p>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: STATUS_COLORS[req.status], background: `${STATUS_COLORS[req.status]}18`, border: `1px solid ${STATUS_COLORS[req.status]}40`, borderRadius: 20, padding: '2px 10px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {STATUS_ICONS[req.status]} {req.status}
                      </span>
                    </div>
                    {req.message && <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontStyle: 'italic' }}>"{req.message}"</p>}
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button onClick={() => respond(req.id, 'approved')} style={{ padding: '0.4rem 1rem', borderRadius: 8, border: 'none', background: '#4ade80', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem' }}>
                          Approve
                        </button>
                        <button onClick={() => respond(req.id, 'rejected')} style={{ padding: '0.4rem 1rem', borderRadius: 8, border: '1px solid rgba(248,113,113,0.5)', background: 'transparent', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem' }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OUTGOING REQUESTS */}
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={18} color="#34d399" /> My Sent Requests
          </h2>
          <p style={{ margin: '4px 0 1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>People you have requested to connect with.</p>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>Loading...</p>
          ) : outgoing.length === 0 ? (
            <div style={{ padding: '2rem 0', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <p style={{ margin: 0 }}>No outgoing requests.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {outgoing.map(req => (
                <div key={req.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.9rem', flexShrink: 0 }}>
                    {req.mentor_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{req.mentor_name}</p>
                    {req.mentor_charge_per_min && req.status === 'approved' && (
                      <span style={{ display: 'inline-block', marginTop: 4, fontSize: '0.75rem', color: '#34d399' }}>Pricing: ₹{req.mentor_charge_per_min}/min</span>
                    )}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: STATUS_COLORS[req.status], background: `${STATUS_COLORS[req.status]}18`, border: `1px solid ${STATUS_COLORS[req.status]}40`, borderRadius: 20, padding: '2px 10px', fontWeight: 700, textTransform: 'capitalize' }}>
                    {STATUS_ICONS[req.status]} {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConnectionsTab;
