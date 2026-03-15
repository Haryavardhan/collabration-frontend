import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { BookOpen, Users, BrainCircuit, Sparkles, Network, Code, Globe, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        // Handle Forgot Password
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, { email });
        setSuccessMsg('If your email is registered, you will receive a password reset link.');
        setEmail('');
      } else if (isLogin) {
        await login(email, password);
        navigate(role === 'student' ? '/student' : '/mentor');
      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }
        await register(name, email, password, role);
        navigate(role === 'student' ? '/student' : '/mentor');
      }
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual/Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-bg-secondary flex-col justify-center items-center overflow-hidden border-r border-glass-border">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/40 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

        {/* Floating background icons */}
        <div className="absolute top-20 left-20 text-primary/30 animate-float-delayed z-0">
          <Code size={64} />
        </div>
        <div className="absolute bottom-16 left-24 text-secondary/30 animate-float-reverse z-0">
          <Network size={56} />
        </div>
        <div className="absolute top-1/4 right-20 text-accent/30 animate-float z-0">
          <Globe size={48} />
        </div>
        <div className="absolute bottom-24 right-24 text-primary/30 animate-float-delayed z-0" style={{ animationDelay: '3s' }}>
          <Sparkles size={56} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl px-12 text-center animate-fade-in mt-16">
          <div className="w-40 h-40 mx-auto bg-glass-bg rounded-[2.5rem] border border-glass-border flex items-center justify-center mb-12 rotate-12 animate-float shadow-[0_0_60px_rgba(99,102,241,0.4)] backdrop-blur-xl group hover:rotate-0 transition-all duration-500 cursor-default">
            <BrainCircuit size={84} className="text-primary group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 border border-primary/30 rounded-[2.5rem] animate-pulse-slow"></div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-8 leading-tight tracking-tight flex flex-col items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-white animate-type-1 border-r-[3px] border-primary pr-2">Learn, Connect,</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary animate-type-2 border-r-[3px] border-secondary pr-2 mt-2">Collaborate.</span>
          </h1>

          <div className="flex gap-8 justify-center mt-20">
            <div className="animate-float">
              <div className="glass-panel p-6 flex flex-col items-center gap-4 rounded-2xl w-40 border border-primary/40 hover:-translate-y-3 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-glow-border">
                <div className="p-3 bg-primary/10 rounded-xl mb-1 group-hover:bg-primary/20 transition-colors">
                  <Users size={32} className="text-primary" />
                </div>
                <span className="text-sm font-bold tracking-wide text-white">Mentorship</span>
              </div>
            </div>
            <div className="animate-float-delayed">
              <div className="glass-panel p-6 flex flex-col items-center gap-4 rounded-2xl w-40 border border-secondary/40 hover:-translate-y-3 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-glow-border">
                <div className="p-3 bg-secondary/10 rounded-xl mb-1 group-hover:bg-secondary/20 transition-colors">
                  <BookOpen size={32} className="text-secondary" />
                </div>
                <span className="text-sm font-bold tracking-wide text-white">Study Rooms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-bg-primary relative">
        <div className="w-full max-w-lg animate-fade-in relative z-10">
          
          <div className="mb-16 lg:text-left text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight">
              {isForgotPassword ? (
                <span>Reset Password</span>
              ) : (
                <>
                  Welcome to <span className="gradient-text hidden lg:inline">CollabSphere</span>
                  <span className="gradient-text lg:hidden">CollabSphere</span>
                </>
              )}
            </h2>
            <p className="text-text-muted text-lg opacity-80">
              {isForgotPassword 
                ? 'Enter your email to receive a reset link' 
                : isLogin ? 'Sign in to your account' : 'Create an account to get started'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-green-500/10 text-green-500 border border-green-500/20 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              {successMsg}
            </div>
          )}

          {/* Role Selection (Only shown during signup) */}
          {!isLogin && !isForgotPassword && (
            <div className="flex gap-4 mb-8 bg-[#181824] p-2 rounded-[1.25rem] border border-glass-border/50 shadow-inner relative overflow-hidden">
              {/* Animated active background pill */}
              <div 
                className={`absolute top-2 bottom-2 rounded-xl transition-all duration-500 ease-out-expo ${role === 'student' ? 'left-2 right-1/2 bg-gradient-to-br from-primary to-accent opacity-20' : 'left-1/2 right-2 bg-gradient-to-br from-secondary to-[#f43f5e] opacity-20'}`}
              ></div>
              <button 
                type="button"
                className={`flex-1 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${role === 'student' ? 'bg-gradient-to-br from-primary to-accent text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-100 ring-1 ring-white/20' : 'text-text-muted hover:text-white bg-transparent scale-95 hover:bg-white/5'}`}
                onClick={() => setRole('student')}
              >
                🎓 I'm a Student
              </button>
              <button 
                type="button"
                className={`flex-1 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${role === 'mentor' ? 'bg-gradient-to-br from-secondary to-[#f43f5e] text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-100 ring-1 ring-white/20' : 'text-text-muted hover:text-white bg-transparent scale-95 hover:bg-white/5'}`}
                onClick={() => setRole('mentor')}
              >
                🌟 I'm a Mentor
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-7">
              {!isLogin && !isForgotPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-muted ml-1 tracking-wide uppercase">Full Name</label>
                  <input 
                    type="text" 
                    className="input-field bg-bg-secondary/70 border-glass-border/50 focus:bg-bg-secondary focus:border-primary py-3.5 px-4 text-lg shadow-inner" 
                    placeholder="John Doe"
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted ml-1 tracking-wide uppercase">Email Address</label>
                <input 
                  type="email" 
                  className="input-field bg-bg-secondary/70 border-glass-border/50 focus:bg-bg-secondary focus:border-primary py-3.5 px-4 text-lg shadow-inner" 
                  placeholder="you@example.com"
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              
              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-text-muted tracking-wide uppercase">Password</label>
                    {isLogin && (
                      <button 
                        type="button" 
                        onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                        className="text-sm text-primary hover:text-primary-hover transition-colors font-medium">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input-field bg-bg-secondary/70 border-glass-border/50 focus:bg-bg-secondary focus:border-primary py-3.5 px-4 text-lg shadow-inner tracking-widest w-full pr-12" 
                      placeholder="••••••••"
                      required 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div className="space-y-2 pb-2">
                  <label className="text-sm font-semibold text-text-muted ml-1 tracking-wide uppercase">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input-field bg-bg-secondary/70 border-glass-border/50 focus:bg-bg-secondary focus:border-primary py-3.5 px-4 text-lg shadow-inner tracking-widest w-full pr-12" 
                      placeholder="••••••••"
                      required 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full btn flex items-center justify-center gap-2 mt-10 py-4 text-lg font-bold shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] ${isLogin || role === 'student' || isForgotPassword ? 'btn-primary' : 'bg-gradient-to-r from-secondary to-pink-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)]'}`}
            >
              {loading ? (
                <span className="animate-pulse">{isForgotPassword ? 'Sending link...' : isLogin ? 'Signing in...' : 'Creating account...'}</span>
              ) : (
                <>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            {isForgotPassword ? (
              <button 
                type="button" 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }} 
                className="text-white font-medium hover:text-primary transition-colors inline-block ml-1"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} 
                  className="text-white font-medium hover:text-primary transition-colors inline-block ml-1"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
