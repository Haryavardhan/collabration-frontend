import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, CheckSquare, Edit3, Mail, ArrowLeft, Send } from 'lucide-react';

const RoomBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="h-screen flex flex-col p-4 bg-bg-secondary">
      {/* Header */}
      <header className="glass-panel p-4 mb-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button className="btn btn-outline p-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Machine Learning 101 <span className="text-sm font-normal text-text-muted">(Room: {id || '123'})</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">5 Members online</span>
          <button className="btn btn-primary flex gap-2 items-center text-sm">
            <Mail size={16} /> Invite Mentor
          </button>
        </div>
      </header>

      {/* Main Board */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Sidebar Tools */}
        <div className="w-64 glass-panel p-4 flex flex-col gap-2 shrink-0">
          <h2 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Tools</h2>
          <button 
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex gap-3 items-center ${activeTab === 'chat' ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-glass-bg'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageCircle size={18} /> Group Chat
          </button>
          <button 
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex gap-3 items-center ${activeTab === 'tasks' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'hover:bg-glass-bg'}`}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} /> Tasks
          </button>
          <button 
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex gap-3 items-center ${activeTab === 'whiteboard' ? 'bg-accent/20 text-accent border border-accent/30' : 'hover:bg-glass-bg'}`}
            onClick={() => setActiveTab('whiteboard')}
          >
            <Edit3 size={18} /> Whiteboard
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-panel p-0 overflow-hidden relative">
          
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col p-6 animate-fade-in">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                <div className="bg-glass-bg p-3 rounded-lg max-w-[80%]">
                  <span className="text-xs text-primary font-bold">Student 1</span>
                  <p className="text-sm mt-1">Has anyone figured out the third concept?</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-lg max-w-[80%] ml-auto border border-primary/20">
                  <span className="text-xs text-secondary font-bold">You</span>
                  <p className="text-sm mt-1">Not yet, maybe we should invite a mentor.</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <input type="text" className="input-field flex-1" placeholder="Type a message..." />
                <button className="btn btn-primary p-3"><Send size={18} /></button>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="h-full p-8 overflow-y-auto animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Room Tasks</h2>
              <div className="space-y-3">
                <div className="flex gap-3 items-center bg-black/20 p-4 rounded-lg border border-glass-border">
                  <input type="checkbox" className="w-5 h-5 accent-secondary" />
                  <span className="flex-1 line-through text-text-muted">Review basics of Neural Networks</span>
                </div>
                <div className="flex gap-3 items-center bg-black/20 p-4 rounded-lg border border-glass-border">
                  <input type="checkbox" className="w-5 h-5 accent-secondary" />
                  <span className="flex-1">Understand Backpropagation</span>
                </div>
              </div>
              <button className="btn btn-outline mt-6 border-dashed border-2 w-full text-text-muted hover:text-white">
                + Add New Task
              </button>
            </div>
          )}

          {activeTab === 'whiteboard' && (
            <div className="h-full bg-black/40 flex items-center justify-center animate-fade-in">
              <div className="text-center text-text-muted">
                <Edit3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Interactive Whiteboard Canvas</p>
                <p className="text-sm opacity-60">(Integration point for fabric.js or similar)</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RoomBoard;
