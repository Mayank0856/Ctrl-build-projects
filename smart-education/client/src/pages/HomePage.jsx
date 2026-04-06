import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCpu, FiTarget, FiUsers, FiCamera, FiArrowRight } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: FiCpu,
    title: 'AI-Powered Tutoring',
    desc: 'Get personalized explanations, step-by-step solutions, and practice questions powered by GPT.',
    color: 'from-primary to-blue-400',
    link: '/tutor',
  },
  {
    icon: FiTarget,
    title: 'Smart Quizzes',
    desc: 'AI-generated quizzes tailored to your weak areas with instant feedback and analytics.',
    color: 'from-accent to-purple-400',
    link: '/test',
  },
  {
    icon: FiCamera,
    title: 'Focus Monitoring',
    desc: 'Webcam-based concentration tracking with emotion detection to optimize your study sessions.',
    color: 'from-success to-emerald-400',
    link: '/focus',
  },
  {
    icon: FiUsers,
    title: 'Study Groups',
    desc: 'Real-time collaborative study rooms with peers. Share knowledge, ask questions, grow together.',
    color: 'from-secondary to-cyan-400',
    link: '/groups',
  },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl"></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-8">
            <MdSchool className="w-4 h-4" />
            <span>AI-Powered Education Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-text mb-6 leading-tight">
            Learn Smarter with{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              AI Precision
            </span>
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            An emotion-aware AI tutor, real-time focus tracking, collaborative study groups, and adaptive quizzes — everything you need to excel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary text-base py-4 px-8 inline-flex items-center gap-2">
                Go to Dashboard <FiArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-base py-4 px-8 inline-flex items-center gap-2">
                  Get Started Free <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="btn-secondary text-base py-4 px-8">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Mock Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-12 mt-16 relative"
        >
          {[
            { value: '10K+', label: 'Students' },
            { value: '95%', label: 'Satisfaction' },
            { value: '50+', label: 'Subjects' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text mb-4">Everything You Need to Excel</h2>
          <p className="text-muted max-w-xl mx-auto">AI-driven tools designed to make learning more effective, engaging, and personalized.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={user ? feature.link : '/signup'} className="glass-card p-6 block group hover:border-white/20 transition-all h-full">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <FiArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center">
        <p className="text-muted text-sm">
          Built with ❤️ for the hackathon · SmartEdu © 2025
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
