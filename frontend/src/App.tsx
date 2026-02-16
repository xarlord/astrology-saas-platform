/**
 * Main App Component
 */

import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChartCreatePage from './pages/ChartCreatePage';
import ChartViewPage from './pages/ChartViewPage';
import AnalysisPage from './pages/AnalysisPage';
import TransitPage from './pages/TransitPage';
import ProfilePage from './pages/ProfilePage';
import SynastryPageWrapper from './pages/SynastryPage';
import SolarReturnsPage from './pages/SolarReturnsPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker registered:', registration);
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charts/new"
            element={
              <ProtectedRoute>
                <ChartCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charts/:id"
            element={
              <ProtectedRoute>
                <ChartViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:chartId"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transits"
            element={
              <ProtectedRoute>
                <TransitPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/synastry"
            element={
              <ProtectedRoute>
                <SynastryPageWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solar-returns"
            element={
              <ProtectedRoute>
                <SolarReturnsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solar-returns/:year"
            element={
              <ProtectedRoute>
                <SolarReturnsPage />
              </ProtectedRoute>
          />

          {/* 404 */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-gray-500">Page not found</div>} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;
