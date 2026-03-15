import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';

import RoomDetailView from './components/student/RoomDetailView';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/room/:id" element={<RoomDetailView />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
