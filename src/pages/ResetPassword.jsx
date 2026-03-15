import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        token,
        password
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg-primary relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in relative z-10 glass-panel p-10 rounded-3xl border border-glass-border shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            {success ? <CheckCircle size={32} className="text-white" /> : <Lock size={32} className="text-white" />}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Reset Password</h2>
          <p className="text-text-muted">
            {success ? 'Your password has been successfully reset!' : 'Enter a new password for your account.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <p className="text-sm font-medium text-white/80 mb-8">Redirecting you to login...</p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full btn btn-primary py-4 text-lg font-bold"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-muted ml-1 tracking-wide uppercase">New Password</label>
              <input 
                type="password" 
                className="input-field bg-black/40 border-glass-border focus:bg-black/60 focus:border-primary py-3.5 px-4 text-lg" 
                placeholder="••••••••"
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-muted ml-1 tracking-wide uppercase">Confirm Password</label>
              <input 
                type="password" 
                className="input-field bg-black/40 border-glass-border focus:bg-black/60 focus:border-primary py-3.5 px-4 text-lg" 
                placeholder="••••••••"
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !token}
              className="w-full btn btn-primary py-4 text-lg font-bold mt-8 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
