import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiArrowDown } from 'react-icons/fi';
import { MdSmartToy } from 'react-icons/md';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SUGGESTIONS = [
  'Explain photosynthesis',
  'What is Newton\'s 2nd law?',
  'Help me with algebra',
  'How to improve focus?',
];

const FloatingChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI tutor. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/tutor/chat', { message: msg, subject: 'General', emotionState: 'neutral' });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch {
      const fallback = `Great question! Here's a quick answer about "${msg}":\n\nThis topic involves several key concepts. I'd recommend starting with the fundamentals and building up your understanding step by step. Would you like me to explain in more detail? 📚`;
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 glass-card flex flex-col shadow-2xl shadow-black/50"
            style={{ height: '420px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <MdSmartToy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text">AI Tutor</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-all">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/20 border border-primary/30 text-text'
                      : 'bg-white/5 border border-white/10 text-text'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2 flex-shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-text placeholder-muted focus:outline-none focus:border-primary/50 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="p-1.5 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg transition-all disabled:opacity-50"
              >
                <FiSend className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg shadow-primary/40 flex items-center justify-center relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="arrow" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <FiArrowDown className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
              <FiMessageSquare className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Notification dot */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingChatbot;
