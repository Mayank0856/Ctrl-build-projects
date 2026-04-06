import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiBell } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tutor', label: 'AI Tutor' },
    { to: '/test', label: 'Quiz' },
    { to: '/focus', label: 'Focus' },
    { to: '/groups', label: 'Groups' },
    { to: '/resources', label: 'Resources' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/materials', label: 'Materials' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="sticky top-0 z-50 bg-surface/70 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
              <MdSchool className="w-5 h-5 text-white" />
            </span>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SmartEdu
            </span>
          </Link>

          {/* Desktop Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-all relative">
                  <FiBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full"></span>
                </button>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-text">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}
            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-all"
              >
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-surface/90 backdrop-blur-lg"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
