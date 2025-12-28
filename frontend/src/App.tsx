import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import CreateProjectPage from './pages/CreateProjectPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuthStore } from './store/authStore';
import { apiClient } from './lib/api';

function AppContent() {
  const { isAuthenticated, token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    // Verify token on mount if authenticated
    if (isAuthenticated && token) {
      apiClient
        .getMe()
        .then(result => {
          if (result.success && result.data) {
            // Token is valid, update user info
            setAuth(result.data, token);
          } else {
            // Token is invalid, clear auth
            clearAuth();
          }
        })
        .catch(() => {
          // Error verifying token, clear auth
          clearAuth();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <CreateProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <AppContent />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
