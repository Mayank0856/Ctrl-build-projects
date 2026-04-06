import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiClock, FiTarget, FiZap, FiAward } from 'react-icons/fi';
import { MdLocalFireDepartment } from 'react-icons/md';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
  },
};

const MOCK_PROGRESS = [
  { subject: 'Mathematics', lessonsCompleted: 7, totalLessons: 10, streak: 5, timeSpent: 180, accuracy: 85, weakAreas: ['Calculus', 'Matrices'] },
  { subject: 'Physics', lessonsCompleted: 4, totalLessons: 10, streak: 3, timeSpent: 90, accuracy: 70, weakAreas: ['Optics'] },
  { subject: 'Chemistry', lessonsCompleted: 6, totalLessons: 10, streak: 2, timeSpent: 120, accuracy: 78, weakAreas: ['Organic Chemistry'] },
];

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

const DashboardPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress')
      .then(res => setProgress(res.data.length ? res.data : MOCK_PROGRESS))
      .catch(() => setProgress(MOCK_PROGRESS))
      .finally(() => setLoading(false));
  }, []);

  const totalStreak = progress.reduce((a, b) => Math.max(a, b.streak || 0), 0);
  const totalTime = progress.reduce((a, b) => a + (b.timeSpent || 0), 0);
  const avgAccuracy = progress.length
    ? Math.round(progress.reduce((a, b) => a + (b.accuracy || 0), 0) / progress.length)
    : 0;

  const barData = {
    labels: progress.map(p => p.subject),
    datasets: [{
      label: 'Time Spent (min)',
      data: progress.map(p => p.timeSpent),
      backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(139,92,246,0.7)', 'rgba(16,185,129,0.7)'],
      borderRadius: 8,
    }],
  };

  const doughnutData = {
    labels: progress.map(p => p.subject),
    datasets: [{
      data: progress.map(p => p.lessonsCompleted),
      backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(139,92,246,0.8)', 'rgba(14,165,233,0.8)'],
      borderWidth: 0,
    }],
  };

  const weeks = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const lineData = {
    labels: weeks,
    datasets: [{
      label: 'Focus Score',
      data: [65, 72, 80, 68, 90, 85, 88],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const weakAreas = [...new Set(progress.flatMap(p => p.weakAreas || []))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {user?.name?.split(' ')[0]} 👋
          </span>
        </h1>
        <p className="text-muted mt-1">Here&apos;s your learning overview for today</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MdLocalFireDepartment} label="Study Streak" value={`${totalStreak} days`} color="bg-orange-500/20" delay={0} />
        <StatCard icon={FiClock} label="Time Studied" value={`${Math.round(totalTime / 60)}h`} color="bg-primary/20" delay={0.1} />
        <StatCard icon={FiTarget} label="Avg Accuracy" value={`${avgAccuracy}%`} color="bg-success/20" delay={0.2} />
        <StatCard icon={FiAward} label="Subjects" value={progress.length} color="bg-accent/20" delay={0.3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><FiClock className="text-primary" /> Time per Subject (min)</h2>
          <Bar data={barData} options={chartOptions} />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><FiZap className="text-accent" /> Lessons Progress</h2>
          <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, boxWidth: 12 } } } }} />
        </motion.div>
      </div>

      {/* Focus & Weak Areas Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><FiTrendingUp className="text-success" /> Weekly Focus Score</h2>
          <Line data={lineData} options={chartOptions} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2"><FiTarget className="text-danger" /> Weak Areas</h2>
          {weakAreas.length > 0 ? (
            <div className="space-y-2">
              {weakAreas.map((area, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg border border-danger/20">
                  <span className="w-2 h-2 bg-danger rounded-full flex-shrink-0"></span>
                  <span className="text-sm text-text">{area}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No weak areas detected. Keep learning!</p>
          )}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-muted">Tip: Focus on weak areas to boost your accuracy score.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
