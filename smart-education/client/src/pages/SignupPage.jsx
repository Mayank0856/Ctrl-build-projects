import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MdSchool } from 'react-icons/md';
import { FiUser, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signup(name, email, password, role);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl mb-4 shadow-lg shadow-accent/30">
              <MdSchool className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text">Create Account</h1>
            <p className="text-muted mt-1 text-sm">Join the AI-powered learning platform</p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === 'student'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-muted hover:text-white'
              }`}
            >
              <FiUser className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === 'admin'
                  ? 'bg-accent text-white shadow-lg shadow-accent/30'
                  : 'text-muted hover:text-white'
              }`}
            >
              <FiShield className="w-4 h-4" /> Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="6"
                className="input-field"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-sm justify-center flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 rounded-lg font-medium text-white transition-all ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-accent to-primary hover:shadow-lg hover:shadow-accent/30'
                  : 'btn-primary'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-secondary transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
