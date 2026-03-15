import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, User, PlusCircle,
  Users, BookOpen, LogOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import DashboardTab from '../components/student/DashboardTab';
import CreateRoomTab from '../components/student/CreateRoomTab';
import FindMentorTab from '../components/student/FindMentorTab';
import CoursesTab from '../components/student/CoursesTab';
import ProfileTab from '../components/student/ProfileTab';
import CareerBotTab from '../components/student/CareerBotTab';
import MentorRequestsTab from '../components/student/MentorRequestsTab';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bot', label: 'Career Bot', icon: Briefcase },
  { id: 'create_room', label: 'Create Room', icon: PlusCircle },
  { id: 'find_mentor', label: 'Find Mentor', icon: Users },
  { id: 'requests', label: 'Connections', icon: Bell },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'profile', label: 'My Profile', icon: User },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const navigate = useNavigate();

  // Get user role to conditionally show nav items
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser?.role || 'student';

  // Filters: 
  // - Mentors don't see 'Find Mentor'
  const navItems = NAV_ITEMS.filter(item => {
    if (item.id === 'find_mentor' && userRole === 'mentor') return false;
    return true;
  });

  // TopBar passed down to each tab
  const TopBar = ({ title, icon: Icon }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.1rem 1.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {Icon && <Icon size={20} color="#a78bfa" />}
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>{title}</h2>
      </div>
      <button
        onClick={() => setIsFullscreen(f => !f)}
        title={isFullscreen ? 'Show sidebar' : 'Hide sidebar'}
        style={{ 
          background: 'rgba(124,58,237,0.1)', 
          border: '1px solid rgba(124,58,237,0.25)', 
          borderRadius: 10, 
          padding: '7px 14px', 
          color: '#a78bfa', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 7, 
          fontSize: '0.85rem',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'rgba(124,58,237,0.2)';
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(124,58,237,0.15)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        <span style={{ letterSpacing: '0.01em' }}>{isFullscreen ? 'Show Nav' : 'Hide Sidebar'}</span>
      </button>
    </div>
  );

  const sidebarWidth = sidebarCollapsed ? 64 : 220;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f13', color: 'white', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      {!isFullscreen && (
        <aside style={{
          width: sidebarWidth, flexShrink: 0,
          background: '#111117',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}>
          {/* Logo row */}
          <div style={{ padding: '1.1rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LayoutDashboard size={15} color="white" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>CollabSphere</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(c => !c)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', marginLeft: sidebarCollapsed ? 'auto' : 0 }}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  title={sidebarCollapsed ? label : ''}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.6rem 0.75rem', borderRadius: 8,
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    width: '100%', whiteSpace: 'nowrap', overflow: 'hidden',
                    background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                    fontWeight: active ? 600 : 400, fontSize: '0.9rem',
                    transition: 'all 0.15s',
                    borderLeft: active ? '3px solid #7c3aed' : '3px solid transparent',
                  }}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>{label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', background: 'transparent', color: 'rgba(255,100,100,0.6)', fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              <LogOut size={17} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>
      )}

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardTab isFullscreen={isFullscreen} TopBar={TopBar} />}
          {activeTab === 'create_room' && <CreateRoomTab isFullscreen={isFullscreen} TopBar={TopBar} />}
          {activeTab === 'find_mentor' && <FindMentorTab isFullscreen={isFullscreen} TopBar={TopBar} />}
          {activeTab === 'requests' && <MentorRequestsTab isFullscreen={isFullscreen} TopBar={TopBar} />}
          {activeTab === 'courses' && <CoursesTab isFullscreen={isFullscreen} TopBar={TopBar} />}
          {activeTab === 'profile' && <ProfileTab isFullscreen={isFullscreen} TopBar={TopBar} />}
          {activeTab === 'bot' && <CareerBotTab isFullscreen={isFullscreen} TopBar={TopBar} />}
        </div>
      </main>

    </div>
  );
};

export default StudentDashboard;
