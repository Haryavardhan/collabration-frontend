import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, CheckSquare, Users, Video, Send, ArrowLeft, CheckCircle, Clock, Plus, Sparkles, User, CreditCard, Loader } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from './PaymentModal';

// Smart mentor suggestion panel shown in the Members tab
function SuggestedMentors({ roomId, token, roomSubject, studentCount = 1, onPay }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser?.role || 'student';

  useEffect(() => {
    if (!roomId || !token) return;
    axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/users/mentors/suggest/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async res => {
      const fetchedMentors = res.data.mentors || [];
      // Also fetch connection statuses for each
      const statusPromises = fetchedMentors.map(m =>
        axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/status/${m.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => ({ id: m.id, status: r.data.status || 'none' })).catch(() => ({ id: m.id, status: 'none' }))
      );
      const statuses = await Promise.all(statusPromises);
      const statusMap = statuses.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.status }), {});
      
      setMentors(fetchedMentors.map(m => ({ ...m, connStatus: statusMap[m.id] })));
    })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  // Only show to students
  if (userRole === 'mentor') return null;
  if (loading) return null;
  if (mentors.length === 0) return null;

  return (
    <div>
      <h3 style={{ margin: '0 0 0.75rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkles size={13} color="#a78bfa" /> Suggested Mentors for "{roomSubject}"
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {mentors.map(mentor => {
          const initials = mentor.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
          const tags = Array.isArray(mentor.interests) ? mentor.interests : (mentor.interests ? mentor.interests.split(',') : []);
          return (
            <div key={mentor.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.9rem 1rem', background: 'rgba(124,58,237,0.07)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{mentor.name}</p>
                  {mentor.match_score > 0 && (
                    <span style={{ fontSize: '0.7rem', color: '#a78bfa', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '1px 8px', fontWeight: 600, flexShrink: 0 }}>
                      {mentor.match_score} keyword{mentor.match_score !== 1 ? 's' : ''} matched
                    </span>
                  )}
                </div>
                {mentor.bio && <p style={{ margin: '3px 0 6px', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', lineHeight: 1.45 }}>{mentor.bio.slice(0, 120)}{mentor.bio.length > 120 ? '...' : ''}</p>}
                {tags.filter(t => t?.trim()).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: 8 }}>
                    {tags.filter(t => t?.trim()).slice(0, 4).map(tag => (
                      <span key={tag} style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <button
                    onClick={async () => {
                      if (mentor.connStatus && mentor.connStatus !== 'none') return;
                      try {
                        const res = await axios.post(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/request/${mentor.id}`, {
                          message: `Hi, I'd like to connect regarding the ${roomSubject} room.`
                        }, { headers: { Authorization: `Bearer ${token}` } });
                        setMentors(mentors.map(m => m.id === mentor.id ? { ...m, connStatus: res.data.connection?.status || 'pending' } : m));
                      } catch (e) { alert('Failed to send request'); }
                    }}
                    disabled={mentor.connStatus && mentor.connStatus !== 'none'}
                    style={{
                      background: mentor.connStatus === 'approved' ? 'rgba(74,222,128,0.1)' : mentor.connStatus === 'pending' ? 'rgba(251,146,60,0.1)' : 'rgba(124,58,237,0.12)',
                      border: `1px solid ${mentor.connStatus === 'approved' ? 'rgba(74,222,128,0.4)' : mentor.connStatus === 'pending' ? 'rgba(251,146,60,0.4)' : 'rgba(124,58,237,0.4)'}`,
                      color: mentor.connStatus === 'approved' ? '#4ade80' : mentor.connStatus === 'pending' ? '#fb923c' : '#a78bfa',
                      padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: (mentor.connStatus && mentor.connStatus !== 'none') ? 'default' : 'pointer'
                    }}
                  >
                    {mentor.connStatus === 'approved' ? 'Connected' : mentor.connStatus === 'pending' ? 'Request Pending' : 'Connect'}
                  </button>
                  {mentor.connStatus === 'approved' && (
                    <button
                      onClick={() => onPay(mentor)}
                      style={{ padding: '4px 14px', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, boxShadow: '0 4px 10px rgba(124,58,237,0.3)' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CreditCard size={12} /> Pay ₹{((mentor.charge_per_min || 5) / studentCount).toFixed(1)}/min
                      </span>
                      {studentCount > 1 && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>(Split with {studentCount} students)</span>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RoomDetailView = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = currentUser?.role || storedUser?.role || 'student';

  const [activeTab, setActiveTab] = useState('chat');
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [error, setError] = useState(null);
  const [payingMentor, setPayingMentor] = useState(null);
  const [memberConnStatuses, setMemberConnStatuses] = useState({});
  const [approvingIds, setApprovingIds] = useState(new Set());
  const [connectingIds, setConnectingIds] = useState(new Set());

  const [messageContent, setMessageContent] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [meetNotification, setMeetNotification] = useState(null);
  const chatEndRef = useRef(null);

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load room details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRoomDetails();
  }, [id, token]);

  // Track how many seconds we've been loading (for the wake-up message)
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roomData?.messages, activeTab]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/rooms/${id}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageContent('');
      fetchRoomDetails();
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/rooms/${id}/tasks`,
        { title: newTaskTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTaskTitle('');
      fetchRoomDetails();
    } catch (e) {
      console.error('Failed to add task', e);
    }
  };

  const handleApproveMember = async (targetUserId) => {
    setApprovingIds(prev => new Set(prev).add(targetUserId));
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/rooms/${id}/approve/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchRoomDetails();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to approve the member. Please try again.');
    } finally {
      setApprovingIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  const handleStartMeet = async () => {
    setMeetNotification('sending');
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/rooms/${id}/start-meet`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetNotification('sent');
      setTimeout(() => setMeetNotification(null), 5000);
    } catch (e) {
      setMeetNotification('error');
      setTimeout(() => setMeetNotification(null), 5000);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '1.5rem' }}>
      <Loader size={44} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
          {loadingSeconds < 4 ? 'Loading Room...' : 'Waking up the server...'}
        </p>
        {loadingSeconds >= 4 && (
          <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: 400, lineHeight: 1.5 }}>
            The backend is starting up after a period of inactivity. This usually takes <strong style={{ color: 'rgba(255,255,255,0.6)' }}>20–40 seconds</strong> on first load. Hang tight!
          </p>
        )}
        {loadingSeconds >= 4 && (
          <p style={{ margin: '10px 0 0', color: '#7c3aed', fontSize: '0.9rem', fontWeight: 700 }}>
            {loadingSeconds}s elapsed
          </p>
        )}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => navigate('/student')} style={{ color: '#a78bfa', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    </div>
  );

  if (!roomData) return null;

  const { room, members, tasks, messages, current_user_role } = roomData;

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'meet', label: 'Meet', icon: Video },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'inherit' }}>

      {/* ── Header ── */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/student')}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{room.subject}</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: 2 }}>{room.description || 'Collaborative Study Workspace'}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 1rem', borderRadius: 12, border: 'none',
                  cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '0.95rem', fontWeight: 600,
                  background: active ? '#7c3aed' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── TAB: CHAT ── */}
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '3rem' }}>No messages yet. Say hi!</p>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.user_id === currentUser?.id;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{isMe ? 'You' : msg.user_name}</span>
                        <div style={{
                          padding: '0.6rem 1rem', borderRadius: 16, maxWidth: '70%', fontSize: '0.95rem', lineHeight: 1.5,
                          background: isMe ? '#7c3aed' : 'rgba(255,255,255,0.08)',
                          color: 'white',
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4,
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '0.65rem 1.2rem', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim()}
                  style={{ width: 44, height: 44, borderRadius: '50%', background: '#7c3aed', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: messageContent.trim() ? 1 : 0.4 }}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}

          {/* ── TAB: TASKS ── */}
          {activeTab === 'tasks' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem' }}>
              {/* Add Task */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexShrink: 0 }}>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="Add a new task..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.65rem 1rem', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  style={{ padding: '0.65rem 1.2rem', borderRadius: 12, background: '#7c3aed', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: newTaskTitle.trim() ? 1 : 0.4 }}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>

              {/* Task List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '3rem' }}>No tasks yet. Add one above!</p>
                ) : (
                  tasks.map(task => {
                    const isDone = task.status === 'done';
                    const handleToggle = async () => {
                      try {
                        await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/rooms/${id}/tasks/${task.id}`, {
                          method: 'PATCH',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: isDone ? 'todo' : 'done' }),
                        });
                        fetchRoomDetails();
                      } catch (e) { console.error(e); }
                    };
                    return (
                      <div key={task.id} onClick={handleToggle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, border: isDone ? 'none' : '2px solid rgba(255,255,255,0.3)', background: isDone ? '#7c3aed' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isDone && <CheckSquare size={13} color="white" />}
                        </div>
                        <span style={{ flex: 1, color: isDone ? 'rgba(255,255,255,0.35)' : 'white', textDecoration: isDone ? 'line-through' : 'none', fontSize: '0.95rem' }}>{task.title}</span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, background: isDone ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.08)', color: isDone ? '#a78bfa' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{isDone ? 'done' : 'todo'}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}


          {/* ── TAB: MEMBERS ── */}
          {activeTab === 'members' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Room Members</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
                {members.map(member => {
                  const isMentor = member.role === 'mentor';
                  const connStatus = memberConnStatuses[member.user_id] || 'none';
                  const isConnected = connStatus === 'approved';

                  // Fetch status if not present and is a mentor
                  if (activeTab === 'members' && isMentor && !memberConnStatuses[member.user_id]) {
                    axios.get(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/status/${member.user_id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    }).then(r => setMemberConnStatuses(prev => ({ ...prev, [member.user_id]: r.data.status || 'none' })))
                      .catch(() => {});
                  }

                  return (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{member.user_name}</p>
                        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                          {member.user_email}
                          <span style={{ marginLeft: 8, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>{member.role}</span>
                        </p>
                      </div>

                      {/* Pay Button for room mentors with approved connection */}
                      {userRole === 'student' && isMentor && isConnected && (
                        <button
                          onClick={() => setPayingMentor({
                            id: member.user_id,
                            name: member.user_name,
                            charge_per_min: member.mentor_charge_per_min || 5 // The backend to_dict should include this
                          })}
                          style={{ padding: '0.45rem 1.1rem', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem', marginRight: 10, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
                        >
                          💳 Pay
                        </button>
                      )}

                      {/* Student-to-Student Connect Button (for members/mentors not connected) */}
                      {userRole === 'student' && member.user_id !== currentUser?.id && !isConnected && (
                        <button
                          onClick={async () => {
                            setConnectingIds(prev => new Set(prev).add(member.user_id));
                            try {
                              const res = await axios.post(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/connections/request/${member.user_id}`, {
                                message: `Hi ${member.user_name}, I'm in the "${roomData?.room?.subject}" room and would like to connect!`
                              }, { headers: { Authorization: `Bearer ${token}` } });
                              
                              setMemberConnStatuses(prev => ({ ...prev, [member.user_id]: res.data.connection?.status || 'pending' }));
                              
                              alert(res.data.status === 'success' ? 'Request sent!' : res.data.message || 'Already requested');
                            } catch (e) { 
                              alert(e.response?.data?.error || 'Failed to send request'); 
                            } finally {
                              setConnectingIds(prev => {
                                const next = new Set(prev);
                                next.delete(member.user_id);
                                return next;
                              });
                            }
                          }}
                          disabled={connStatus === 'pending' || connectingIds.has(member.user_id)}
                          style={{ padding: '0.35rem 0.9rem', borderRadius: 20, border: '1px solid #a78bfa', background: 'transparent', color: '#a78bfa', fontWeight: 700, cursor: (connStatus === 'pending' || connectingIds.has(member.user_id)) ? 'default' : 'pointer', fontSize: '0.82rem', marginRight: 10, opacity: (connStatus === 'pending' || connectingIds.has(member.user_id)) ? 0.6 : 1 }}
                        >
                          {connectingIds.has(member.user_id) ? 'Connecting...' : connStatus === 'pending' ? 'Pending' : 'Connect'}
                        </button>
                      )}

                      {member.status === 'approved' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80', fontSize: '0.82rem', fontWeight: 700 }}>
                          <CheckCircle size={15} /> Approved
                        </span>
                      ) : member.status === 'pending' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fb923c', fontSize: '0.82rem', fontWeight: 700 }}>
                            <Clock size={15} /> Pending
                          </span>
                          {(current_user_role === 'admin' || current_user_role === 'mentor') && (
                            <button
                              onClick={() => handleApproveMember(member.user_id)}
                              disabled={approvingIds.has(member.user_id)}
                              style={{ padding: '0.35rem 0.9rem', borderRadius: 20, border: '1px solid #4ade80', background: 'transparent', color: '#4ade80', fontWeight: 700, cursor: approvingIds.has(member.user_id) ? 'default' : 'pointer', fontSize: '0.82rem', opacity: approvingIds.has(member.user_id) ? 0.6 : 1 }}
                            >
                              {approvingIds.has(member.user_id) ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* ── Suggested Mentors (student-only) ── */}
              <SuggestedMentors 
                roomId={id} 
                token={token} 
                roomSubject={roomData?.room?.subject} 
                studentCount={members.filter(m => m.role === 'member' || m.role === 'admin').length || 1}
                onPay={setPayingMentor}
              />
            </div>
          )}


          {/* ── TAB: MEET ── */}
          {activeTab === 'meet' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Meet header */}
              <div style={{ padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>Anyone in the room can start the meet and notify all members</span>
                <button
                  onClick={handleStartMeet}
                  disabled={meetNotification === 'sending'}
                  style={{
                    padding: '0.5rem 1.2rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.88rem',
                    background: meetNotification === 'sent' ? '#16a34a' : meetNotification === 'error' ? '#dc2626' : '#7c3aed',
                    color: 'white', opacity: meetNotification === 'sending' ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Video size={15} />
                  {meetNotification === 'sending' ? 'Notifying...' : meetNotification === 'sent' ? '✅ Members Notified!' : meetNotification === 'error' ? '❌ Failed' : 'Start Meet & Notify All'}
                </button>
              </div>

              {/* Jitsi iframe */}
              <iframe
                title="Room Video Meet"
                src={`https://meet.jit.si/CollabSphere_Room_${id}`}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                style={{ flex: 1, border: 'none', width: '100%' }}
              />
            </div>
          )}

        </div>
      </div>
      {/* ── Payment Modal ── */}
      {payingMentor && (
        <PaymentModal
          mentor={payingMentor}
          onClose={() => setPayingMentor(null)}
          onSuccess={(p) => console.log('Paid:', p)}
        />
      )}
    </div>
  );
};

export default RoomDetailView;