import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiPlus, FiUsers, FiHash, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const DEMO_GROUPS = [
  { _id: '1', name: 'Math Study Group', subject: 'Mathematics', members: [1, 2, 3], inviteCode: 'MATH123' },
  { _id: '2', name: 'Physics Explorers', subject: 'Physics', members: [1, 4], inviteCode: 'PHY456' },
  { _id: '3', name: 'Chemistry Lab', subject: 'Chemistry', members: [2, 3], inviteCode: 'CHEM789' },
];

const DEMO_MESSAGES = {
  '1': [
    { userId: { name: 'Alice' }, content: 'Hey everyone! Ready to study calculus today?', createdAt: new Date(Date.now() - 60000 * 30) },
    { userId: { name: 'Bob' }, content: 'Yes! I have some practice problems. Let me share them.', createdAt: new Date(Date.now() - 60000 * 20) },
  ],
  '2': [{ userId: { name: 'Carol' }, content: 'Did anyone solve the optics problem from chapter 5?', createdAt: new Date(Date.now() - 60000 * 10) }],
  '3': [],
};

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState(DEMO_GROUPS);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('Mathematics');
  const [inviteCode, setInviteCode] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Try to connect socket
    try {
      socketRef.current = io('http://localhost:5000', { transports: ['websocket'], reconnectionAttempts: 2 });
      
      socketRef.current.on('message', (data) => {
        if (data.groupId === activeGroup?._id) {
          setMessages(prev => [...prev, data]);
        }
      });
    } catch { /* offline mode */ }

    return () => socketRef.current?.disconnect();
  }, [activeGroup]);

  useEffect(() => {
    if (activeGroup) {
      setMessages(DEMO_MESSAGES[activeGroup._id] || []);
    }
  }, [activeGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeGroup) return;

    const msg = {
      groupId: activeGroup._id,
      userId: { name: user?.name || 'You' },
      content: input,
      createdAt: new Date(),
      isMe: true,
    };

    setMessages(prev => [...prev, msg]);
    socketRef.current?.emit('message', { groupId: activeGroup._id, content: input });
    setInput('');
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const group = {
      _id: String(Date.now()),
      name: newGroupName,
      subject: newGroupSubject,
      members: [user?._id],
      inviteCode: code,
    };
    setGroups(prev => [...prev, group]);
    DEMO_MESSAGES[group._id] = [];
    setActiveGroup(group);
    setShowCreate(false);
    setNewGroupName('');
    toast.success(`Group created! Invite code: ${code}`);
  };

  const joinGroup = () => {
    const group = groups.find(g => g.inviteCode === inviteCode.toUpperCase());
    if (group) {
      setActiveGroup(group);
      setShowJoin(false);
      setInviteCode('');
      toast.success(`Joined ${group.name}!`);
    } else {
      toast.error('Invalid invite code');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent to-primary rounded-xl">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Study Groups</h1>
            <p className="text-xs text-muted">Collaborate and learn together</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(!showJoin)} className="btn-secondary text-xs flex items-center gap-1"><FiLogIn className="w-3 h-3" /> Join</button>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-xs flex items-center gap-1"><FiPlus className="w-3 h-3" /> Create</button>
        </div>
      </motion.div>

      {/* Create / Join forms */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-4 flex-shrink-0 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-muted mb-1 block">Group Name</label>
            <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Math Warriors" className="input-field text-sm py-2" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-muted mb-1 block">Subject</label>
            <select value={newGroupSubject} onChange={e => setNewGroupSubject(e.target.value)} className="input-field text-sm py-2 bg-surface">
              {['Mathematics','Physics','Chemistry','Biology','CS','History'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={createGroup} className="btn-primary text-sm py-2">Create</button>
        </motion.div>
      )}

      {showJoin && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-4 flex-shrink-0 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Invite Code</label>
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. MATH123" className="input-field text-sm py-2 uppercase" />
          </div>
          <button onClick={joinGroup} className="btn-primary text-sm py-2">Join</button>
        </motion.div>
      )}

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Group list */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
          {groups.map(g => (
            <button
              key={g._id}
              onClick={() => setActiveGroup(g)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                activeGroup?._id === g._id
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-white/10 bg-surface/50 hover:border-white/20 hover:bg-surface/80'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FiHash className="w-3 h-3 text-primary" />
                <span className="text-sm font-medium text-text truncate">{g.name}</span>
              </div>
              <p className="text-xs text-muted">{g.subject} • {g.members.length} members</p>
              <p className="text-xs text-muted/60 font-mono mt-1">{g.inviteCode}</p>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 glass-card flex flex-col overflow-hidden">
          {activeGroup ? (
            <>
              <div className="p-4 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
                <FiHash className="w-4 h-4 text-primary" />
                <span className="font-semibold text-text">{activeGroup.name}</span>
                <span className="text-xs text-muted ml-auto">{activeGroup.subject}</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                    {!msg.isMe && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {msg.userId?.name?.[0]}
                      </div>
                    )}
                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                      msg.isMe ? 'bg-primary/20 text-text border border-primary/30 rounded-br-none' : 'bg-white/5 text-text border border-white/10 rounded-bl-none'
                    }`}>
                      {!msg.isMe && <p className="text-xs text-primary mb-0.5 font-medium">{msg.userId?.name}</p>}
                      <p>{msg.content}</p>
                      <p className="text-xs text-muted mt-0.5">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2 flex-shrink-0">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Message #${activeGroup.name}`}
                  className="input-field flex-1 text-sm py-2"
                />
                <button type="submit" className="btn-primary px-4" disabled={!input.trim()}>
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-8">
              <FiUsers className="w-12 h-12 text-muted/30" />
              <p className="text-muted">Select a group to start chatting</p>
              <p className="text-xs text-muted/60">or create / join a new group</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
