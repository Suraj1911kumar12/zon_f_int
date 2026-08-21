import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 font-medium text-lg">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 font-medium text-lg">Loading...</div>;
  }
  
  return !user ? <>{children}</> : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
