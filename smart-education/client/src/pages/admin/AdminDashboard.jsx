import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiBook, FiActivity } from 'react-icons/fi';
import { MdSchool, MdAdminPanelSettings } from 'react-icons/md';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
  },
};

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-5 flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-muted text-sm">{label}</p>
      <p className="text-2xl font-bold text-text">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
        const stRes = await api.get('/admin/students');
        setStudents(stRes.data);
      } catch (err) {
        toast.error('Failed to load admin dashboard data.');
      }
    };
    fetchDashboard();
  }, []);

  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Active Students',
      data: [12, 19, 15, 25, 22, 10, 8],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const subjectData = {
    labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'CS'],
    datasets: [{
      data: [35, 25, 20, 15, 30],
      backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(139,92,246,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(14,165,233,0.7)'],
      borderRadius: 8,
    }],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent to-primary rounded-xl">
            <MdAdminPanelSettings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Admin Dashboard</h1>
            <p className="text-xs text-muted">Platform oversight and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['overview', 'students'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-primary text-white' : 'text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          {stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FiUsers} label="Total Students" value={stats.studentCount || 0} color="bg-primary/20" delay={0} />
            <StatCard icon={FiActivity} label="Avg Focus Score" value={`${stats.avgFocus || 0}%`} color="bg-success/20" delay={0.1} />
            <StatCard icon={FiTrendingUp} label="Library Materials" value={stats.totalMaterials || 0} color="bg-accent/20" delay={0.2} />
            <StatCard icon={MdSchool} label="Active Sessions (24h)" value={stats.activeSessions || 0} color="bg-secondary/20" delay={0.3} />
          </div>
          ) : (
            <p className="text-muted mb-8">Loading stats...</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><FiActivity className="text-primary" /> Weekly Active Students</h2>
              <Line data={weeklyActivityData} options={chartOptions} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><FiBook className="text-accent" /> Engagement by Subject</h2>
              <Bar data={subjectData} options={chartOptions} />
            </motion.div>
          </div>
        </>
      )}

      {activeTab === 'students' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-text">Student Management</h2>
            <span className="text-xs text-muted">{students.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Name', 'Email', 'Role', 'Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                          {s.name ? s.name[0] : '?'}
                        </div>
                        <span className="text-sm text-text">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full capitalize">{s.role || 'Student'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                        {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
