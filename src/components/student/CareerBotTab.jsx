import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Sparkles, RotateCcw, Briefcase } from 'lucide-react';
import axios from 'axios';

const WELCOME_MSG = {
  role: 'bot',
  content: `👋 Hi! I'm your **Career Navigator AI**.\n\nI use our career knowledge base first, and if I don't find a good answer there, I'll tap into my broader AI knowledge to help you.\n\nAsk me anything like:\n• "What should I do after 10th class?"\n• "How do I become a Data Scientist?"\n• "Suggest a learning roadmap for Web Development"\n• "What career options are there in Commerce?"`,
  source: null,
};

const SUGGESTIONS = [
  "What to do after 10th class?",
  "Roadmap for Data Science",
  "Best engineering branches?",
  "How to get into IIT?",
  "Career in AI/ML?",
  "How to become a software engineer?",
  "Tips for cracking UPSC?",
  "Best courses for finance career?",
];

// Render **bold** and bullet lines
function RenderContent({ text }) {
  const renderInline = (str) => {
    // Handle **bold**
    return str.split(/\*\*(.*?)\*\*/g).map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
  };

  return (
    <div style={{ lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          const content = line.startsWith('• ') ? line.slice(2) : line.slice(2);
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>•</span>
              <span>{renderInline(content)}</span>
            </div>
          );
        }
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
        return <p key={i} style={{ margin: 0 }}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function SourceBadge({ source }) {
  if (!source) return null;
  const isDoc = source === 'docs+ai';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, marginTop: 5,
      background: isDoc ? 'rgba(52,211,153,0.1)' : 'rgba(167,139,250,0.1)',
      color: isDoc ? '#34d399' : '#a78bfa',
      border: `1px solid ${isDoc ? 'rgba(52,211,153,0.25)' : 'rgba(167,139,250,0.25)'}`,
    }}>
      {isDoc ? <BookOpen size={10} /> : <Sparkles size={10} />}
      {isDoc ? 'Career Docs + AI' : 'AI Knowledge'}
    </span>
  );
}

const CareerBotTab = ({ isFullscreen, TopBar }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getHistory = (msgs) =>
    msgs
      .filter(m => m !== WELCOME_MSG)
      .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

  const handleAsk = async (q = question.trim()) => {
    if (!q || loading) return;
    const userMsg = { role: 'user', content: q };
    const next = [...messages, userMsg];
    setMessages(next);
    setQuestion('');
    setLoading(true);
    inputRef.current?.focus();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/ask`, {
        question: q,
        history: getHistory(next.slice(0, -1)),
      });
      setMessages([...next, { role: 'bot', content: data.answer, source: data.source }]);
    } catch {
      setMessages([...next, {
        role: 'bot',
        content: '⚠️ Could not reach the backend. Please make sure the server is running on port 5000.',
        source: null,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setMessages([WELCOME_MSG]); setQuestion(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar title="AI Career Bot" icon={Briefcase} />

      {/* Chat inner container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* Bot identity bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={18} color="white" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Career Navigator AI</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                RAG-powered • Career Docs + Groq AI
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 20 }}
          >
            <RotateCcw size={13} /> Clear
          </button>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'bot';
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: isBot ? 'row' : 'row-reverse', alignItems: 'flex-end', gap: '0.6rem' }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: isBot ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : 'linear-gradient(135deg, #ec4899, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isBot ? <Bot size={15} color="white" /> : <User size={15} color="white" />}
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isBot ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    padding: '0.7rem 1rem', borderRadius: 16, fontSize: '0.88rem', color: 'white',
                    background: isBot ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(59,130,246,0.85))',
                    border: isBot ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    borderBottomLeftRadius: isBot ? 4 : 16,
                    borderBottomRightRadius: isBot ? 16 : 4,
                  }}>
                    <RenderContent text={msg.content} />
                  </div>
                  {isBot && <SourceBadge source={msg.source} />}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={15} color="white" />
              </div>
              <div style={{ padding: '0.7rem 1rem', borderRadius: 16, borderBottomLeftRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 150, 300].map(d => (
                  <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', animation: 'bounce 1s infinite', animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion chips — horizontally scrollable */}
        <div style={{
          padding: '0.6rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: '0.5rem', overflowX: 'auto', flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleAsk(s)}
              style={{
                padding: '0.35rem 0.9rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)',
                fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                fontFamily: 'inherit',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.4rem 0.5rem 0.4rem 1rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAsk()}
              placeholder="Ask about careers, courses, skills, roadmaps..."
              disabled={loading}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.9rem', fontFamily: 'inherit' }}
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              style={{
                width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                opacity: loading || !question.trim() ? 0.4 : 1,
              }}
            >
              <Send size={16} color="white" />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', margin: '6px 0 0' }}>
            Grounded in Career Docs • Extended by Groq AI (llama3-8b)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerBotTab;
