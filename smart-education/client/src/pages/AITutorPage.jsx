import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiBook, FiTrash2 } from 'react-icons/fi';
import { MdSmartToy } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Computer Science', 'English', 'General'];

const emotions = ['neutral', 'confused', 'bored', 'frustrated'];

const AITutorPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Tutor 🎓 Select a subject and ask me anything. I'll explain concepts, solve doubts, and give you practice questions!", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [emotionState, setEmotionState] = useState('neutral');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/tutor/chat', {
        message: currentInput,
        subject,
        emotionState,
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date()
      }]);
    } catch {
      // Fallback mock response
      const mockResponses = {
        confused: `Let me break that down step by step! 📚\n\n**${currentInput}**\n\nHere's a simple explanation: Think of it like building blocks - each concept builds on the previous one. Let's start from the basics...`,
        bored: `Oh, this is actually super interesting! 🌟\n\nDid you know that **${subject}** connects to real-world applications like space travel and AI? Let me show you the exciting side of this topic...`,
        frustrated: `I completely understand - this can be tough! 💪\n\nLet's try a different approach. Sometimes explaining it differently makes all the difference...`,
        neutral: `Great question! 🎯\n\nFor **${currentInput}** in ${subject}:\n\n1. **Concept**: The core idea is...\n2. **Example**: Here's how it works in practice...\n3. **Practice**: Try solving this similar problem...`,
      };
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: mockResponses[emotionState] || mockResponses.neutral,
        timestamp: new Date()
      }]);
      toast.error('Using offline mode - Connect server for full AI responses');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared! What would you like to learn today?", timestamp: new Date() }]);
  };

  const emotionColors = { neutral: 'text-success', confused: 'text-yellow-400', bored: 'text-blue-400', frustrated: 'text-danger' };
  const emotionEmoji = { neutral: '😊', confused: '🤔', bored: '😴', frustrated: '😤' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
            <MdSmartToy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">AI Tutor</h1>
            <p className="text-xs text-muted">Powered by GPT-3.5</p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all">
          <FiTrash2 className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3 mb-4 flex-shrink-0">
        {/* Subject selector */}
        <div className="flex items-center gap-2 p-1 bg-surface/50 border border-white/10 rounded-xl overflow-x-auto">
          <FiBook className="w-4 h-4 text-muted ml-2 flex-shrink-0" />
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                subject === s ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Emotion selector */}
        <div className="flex items-center gap-1 p-1 bg-surface/50 border border-white/10 rounded-xl">
          {emotions.map(e => (
            <button
              key={e}
              onClick={() => setEmotionState(e)}
              title={e}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                emotionState === e ? `bg-white/10 ${emotionColors[e]}` : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {emotionEmoji[e]} {e}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1">
                <MdSmartToy className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary/20 text-text border border-primary/30 rounded-br-sm'
                : 'bg-surface/80 text-text border border-white/10 rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-muted mt-1">
                {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <MdSmartToy className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface/80 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0,1,2].map(i => (
                <span key={i} className={`w-2 h-2 bg-primary rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }}></span>
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={sendMessage}
        className="flex gap-3 flex-shrink-0"
      >
        <input
          id="tutor-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${subject}...`}
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          id="tutor-send"
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-5 disabled:opacity-50 flex-shrink-0"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </motion.form>
    </div>
  );
};

export default AITutorPage;
