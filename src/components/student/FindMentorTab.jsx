import React, { useState, useEffect } from 'react';
import { Users, ExternalLink, Loader, CheckCircle, Clock, DollarSign, Tag, CreditCard } from 'lucide-react';
import axios from 'axios';
import PaymentModal from './PaymentModal';

const FindMentorTab = ({ isFullscreen, TopBar }) => {
  const token = localStorage.getItem('token');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connStatuses, setConnStatuses] = useState({});  // mentorId → status
  const [connecting, setConnecting] = useState({});
  const [payingMentor, setPayingMentor] = useState(null); // mentor object for modal

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/mentors`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const m = res.data.mentors || [];
      setMentors(m);
      // Fetch connection status for each mentor
      m.forEach(mentor => {
        axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/status/${mentor.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => setConnStatuses(prev => ({ ...prev, [mentor.id]: r.data.status || 'none' })))
          .catch(() => {});
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleConnect = async (mentor) => {
    setConnecting(prev => ({ ...prev, [mentor.id]: true }));
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/request/${mentor.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnStatuses(prev => ({ ...prev, [mentor.id]: res.data.connection?.status || 'pending' }));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to send request');
    } finally {
      setConnecting(prev => ({ ...prev, [mentor.id]: false }));
    }
  };

  const ConnectButton = ({ mentor }) => {
    const status = connStatuses[mentor.id] || 'none';
    const busy = connecting[mentor.id];
    if (status === 'approved') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#4ade80', fontWeight: 700 }}>
        <CheckCircle size={14} /> Connected
      </span>
    );
    if (status === 'pending') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#fb923c', fontWeight: 600 }}>
        <Clock size={14} /> Request Pending
      </span>
    );
    if (status === 'rejected') return (
      <span style={{ fontSize: '0.78rem', color: 'rgba(248,113,113,0.8)', fontWeight: 600 }}>Request Declined</span>
    );
    return (
      <button
        onClick={() => handleConnect(mentor)}
        disabled={busy}
        style={{ padding: '0.4rem 1rem', borderRadius: 8, border: 'none', background: '#7c3aed', color: 'white', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontSize: '0.82rem', opacity: busy ? 0.6 : 1 }}
      >
        {busy ? 'Sending...' : 'Connect'}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar title="Find a Mentor" icon={Users} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <p style={{ margin: '0 0 1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          Connect with experienced mentors who can guide you in your learning journey.
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader size={28} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : mentors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ marginBottom: 6 }}>No mentors registered yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {mentors.map((mentor) => {
              const initials = mentor.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
              const interests = Array.isArray(mentor.interests) ? mentor.interests : (mentor.interests ? mentor.interests.split(',') : []);
              const isConnected = connStatuses[mentor.id] === 'approved';
              const canPay = isConnected && mentor.charge_per_min;
              return (
                <div key={mentor.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '1rem', color: 'white' }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '1rem' }}>{mentor.name}</p>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>Mentor</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {mentor.bio ? (
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.55 }}>{mentor.bio}</p>
                  ) : (
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontStyle: 'italic' }}>No bio yet.</p>
                  )}

                  {/* Interests */}
                  {interests.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {interests.filter(t => t.trim()).map(tag => (
                        <span key={tag} style={{ fontSize: '0.71rem', padding: '2px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pricing */}
                  {(mentor.charge_per_min || mentor.discount_percent) && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {mentor.charge_per_min && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>
                          <DollarSign size={11} /> ₹{mentor.charge_per_min}/min
                        </span>
                      )}
                      {mentor.discount_percent && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#facc15', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>
                          <Tag size={11} /> {mentor.discount_percent}% off
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 4 }}>
                    <ConnectButton mentor={mentor} />

                    {/* ✅ Pay button — visible if connected */}
                    {isConnected && (
                      <button
                        onClick={() => setPayingMentor({
                          ...mentor,
                          charge_per_min: mentor.charge_per_min || 5 // Fallback to 5 for UI testing
                        })}
                        style={{
                          padding: '0.45rem 1.1rem', borderRadius: 8,
                          border: 'none',
                          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                          color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem',
                          transition: 'all 0.15s',
                          boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                          display: 'flex', alignItems: 'center', gap: 6
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(124,58,237,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.3)'; }}
                      >
                        <CreditCard size={15} /> 💳 Pay
                      </button>
                    )}

                    <a href={`mailto:${mentor.email}`} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingMentor && (
        <PaymentModal
          mentor={payingMentor}
          onClose={() => setPayingMentor(null)}
          onSuccess={(payment) => {
            console.log('Payment successful:', payment);
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FindMentorTab;


