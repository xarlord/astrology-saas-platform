/**
 * Main App Component
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { ServiceWorkerUpdateBanner } from './components/ServiceWorkerUpdateBanner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChartCreatePage from './pages/ChartCreatePage';
import ChartViewPage from './pages/ChartViewPage';
import { AnalysisPage } from './pages/AnalysisPage';
import TransitPage from './pages/TransitPage';
import TodayTransitsPage from './pages/TodayTransitsPage';
import ForecastPage from './pages/ForecastPage';
import ProfilePage from './pages/ProfilePage';
import SynastryPageWrapper from './pages/SynastryPage';
import SolarReturnsPage from './pages/SolarReturnsPage';
import CalendarPage from './pages/CalendarPage';
import MoonCalendarPage from './pages/MoonCalendarPage';
import LunarReturnsPage from './pages/LunarReturnsPage';
import RetrogradePage from './pages/RetrogradePage';
import EphemerisPage from './pages/EphemerisPage';
import LearnPage from './pages/LearnPage';
import SettingsPage from './pages/SettingsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import StaticPage from './pages/StaticPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-cosmic-page">
        <ServiceWorkerUpdateBanner />
        <ErrorBoundary>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Redirects */}
            <Route path="/charts" element={<Navigate to="/dashboard" replace />} />
            <Route path="/charts/natal" element={<Navigate to="/charts/new" replace />} />
            <Route path="/compatibility" element={<Navigate to="/synastry" replace />} />

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
              path="/transits/today"
              element={
                <ProtectedRoute>
                  <TodayTransitsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast"
              element={
                <ProtectedRoute>
                  <ForecastPage />
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
              path="/moon-calendar"
              element={
                <ProtectedRoute>
                  <MoonCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/retrograde"
              element={
                <ProtectedRoute>
                  <RetrogradePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ephemeris"
              element={
                <ProtectedRoute>
                  <EphemerisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn"
              element={
                <ProtectedRoute>
                  <LearnPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <SubscriptionPage />
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
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lunar-returns"
              element={
                <ProtectedRoute>
                  <LunarReturnsPage />
                </ProtectedRoute>
              }
            />

            {/* Static pages */}
            <Route path="/about" element={<StaticPage pageKey="about" />} />
            <Route path="/features" element={<StaticPage pageKey="features" />} />
            <Route path="/pricing" element={<StaticPage pageKey="pricing" />} />
            <Route path="/api" element={<StaticPage pageKey="api" />} />
            <Route path="/blog" element={<StaticPage pageKey="blog" />} />
            <Route path="/support" element={<StaticPage pageKey="support" />} />
            <Route path="/careers" element={<StaticPage pageKey="careers" />} />
            <Route path="/contact" element={<StaticPage pageKey="contact" />} />
            <Route path="/privacy" element={<StaticPage pageKey="privacy" />} />
            <Route path="/terms" element={<StaticPage pageKey="terms" />} />
            <Route path="/cookies" element={<StaticPage pageKey="cookies" />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </QueryClientProvider>
  );
}

export default App;
