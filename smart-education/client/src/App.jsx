import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import FloatingChatbot from './components/chatbot/FloatingChatbot';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AITutorPage from './pages/AITutorPage';
import TestPage from './pages/TestPage';
import FocusMonitorPage from './pages/FocusMonitorPage';
import GroupsPage from './pages/GroupsPage';
import ResourcesPage from './pages/ResourcesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMaterials from './pages/admin/AdminMaterials';

// Route guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></span></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (user && user.role === 'admin') ? children : <Navigate to="/dashboard" />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/tutor" element={<ProtectedRoute><AITutorPage /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
        <Route path="/focus" element={<ProtectedRoute><FocusMonitorPage /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/materials" element={<AdminRoute><AdminMaterials /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <FloatingChatbot />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
