import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiBook, FiTrash2, FiSettings, FiVolumeX, FiVolume2, FiX } from 'react-icons/fi';
import { MdSmartToy } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Computer Science', 'English', 'General'];
const emotions = ['neutral', 'confused', 'bored', 'frustrated'];
const personalities = ['Friendly', 'Strict', 'Encouraging', 'Socratic'];

const AITutorPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [emotionState, setEmotionState] = useState('neutral');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // AI Personalization State
  const [aiSettings, setAiSettings] = useState({ name: 'Nova', personality: 'Friendly', voiceEnabled: true });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({});

  useEffect(() => {
    // Load chat history & AI Settings
    const fetchData = async () => {
      try {
        const [settingsRes, historyRes] = await Promise.all([
          api.get('/tutor/settings'),
          api.get(`/tutor/history/${subject}`)
        ]);
        
        setAiSettings(settingsRes.data);
        
        if (historyRes.data.messages && historyRes.data.messages.length > 0) {
          setMessages(historyRes.data.messages);
        } else {
          setMessages([{ role: 'assistant', content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm your AI Tutor, ${settingsRes.data.name || 'Nova'}. Select a subject and ask me anything. I'll explain concepts and give you practice questions!`, timestamp: new Date() }]);
        }
      } catch (error) {
        console.error("Error loading tutor data", error);
        toast.error('Failed to load tutor data.');
      }
    };
    fetchData();
  }, [subject, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = async () => {
    try {
      const res = await api.put('/tutor/settings', tempSettings);
      setAiSettings(res.data);
      setIsSettingsOpen(false);
      toast.success('Personal AI Tutor updated!');
    } catch (e) {
      toast.error('Failed to save settings.');
    }
  };

  const openSettings = () => {
    setTempSettings(aiSettings);
    setIsSettingsOpen(true);
  };

  const speak = (text) => {
    if (aiSettings?.voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

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
      speak(res.data.response);
    } catch {
      const fallback = `Great question about **${currentInput}**!\n\nThis topic has several key parts. I'd recommend starting with fundamentals. Feel free to ask more specifics!`;
      setMessages(prev => [...prev, { role: 'assistant', content: fallback, timestamp: new Date() }]);
      speak(fallback);
      toast.error('Offline mode - Using fallback response');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: `Chat cleared! What would you like to learn today?`, timestamp: new Date() }]);
  };

  const emotionColors = { neutral: 'text-success', confused: 'text-yellow-400', bored: 'text-blue-400', frustrated: 'text-danger' };
  const emotionEmoji = { neutral: '😊', confused: '🤔', bored: '😴', frustrated: '😤' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
            <MdSmartToy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text flex items-center gap-2">
              {aiSettings.name}
              <button onClick={openSettings} className="p-1 text-muted hover:text-primary transition-colors" title="Customize AI">
                <FiSettings className="w-4 h-4" />
              </button>
            </h1>
            <p className="text-xs text-muted flex items-center gap-2">
              <span>Personalized {aiSettings.personality} Tutor</span>
              {aiSettings.voiceEnabled ? <FiVolume2 className="w-3 h-3 text-success" /> : <FiVolumeX className="w-3 h-3 text-danger" />}
            </p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Clear Chat">
          <FiTrash2 className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-text">Customize AI Tutor</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-muted hover:text-white"><FiX /></button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs text-muted mb-1">Tutor Name</label>
                  <input type="text" value={tempSettings.name || ''} onChange={(e) => setTempSettings({...tempSettings, name: e.target.value})} className="input-field" placeholder="e.g. Einstein" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Personality</label>
                  <select value={tempSettings.personality || 'Friendly'} onChange={(e) => setTempSettings({...tempSettings, personality: e.target.value})} className="input-field">
                    {personalities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm text-text">Voice Output</label>
                    <p className="text-xs text-muted">Read responses aloud</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={tempSettings.voiceEnabled || false} onChange={(e) => setTempSettings({...tempSettings, voiceEnabled: e.target.checked})} />
                    <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsSettingsOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={saveSettings} className="btn-primary flex-1">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3 mb-4 flex-shrink-0">
        {/* Subject selector */}
        <div className="flex items-center gap-2 p-1 bg-surface/50 border border-white/10 rounded-xl overflow-x-auto scroller-hide">
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
