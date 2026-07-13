import { Navigate, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './store/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Wizard from './pages/Wizard';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import Landing from './pages/Landing';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#8489F2]" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: '/wizard' }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/landing" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/wizard" element={<ProtectedRoute><Wizard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
