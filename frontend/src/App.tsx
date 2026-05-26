/**
 * Main App Component
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ServiceWorkerUpdateBanner } from './components/ServiceWorkerUpdateBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useChartsStore } from './store/chartsStore';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';
import StaticPage from './pages/StaticPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChartCreatePage = lazy(() => import('./pages/ChartCreatePage'));
const ChartViewPage = lazy(() => import('./pages/ChartViewPage'));
const AnalysisPage = lazy(() =>
  import('./pages/AnalysisPage').then((m) => ({ default: m.AnalysisPage })),
);
const TransitPage = lazy(() => import('./pages/TransitPage'));
const TodayTransitsPage = lazy(() => import('./pages/TodayTransitsPage'));
const ForecastPage = lazy(() => import('./pages/ForecastPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SynastryPageWrapper = lazy(() => import('./pages/SynastryPage'));
const SolarReturnsPage = lazy(() => import('./pages/SolarReturnsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const MoonCalendarPage = lazy(() => import('./pages/MoonCalendarPage'));
const LunarReturnsPage = lazy(() => import('./pages/LunarReturnsPage'));
const RetrogradePage = lazy(() => import('./pages/RetrogradePage'));
const EphemerisPage = lazy(() => import('./pages/EphemerisPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cosmic-page">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Smart redirect: "Natal Chart" sidebar link goes to the user's first chart,
 * or to the creation form if they have none.
 */
function NatalChartRedirect() {
  const charts = useChartsStore((s) => s.charts);
  const fetchCharts = useChartsStore((s) => s.fetchCharts);
  const isLoading = useChartsStore((s) => s.isLoading);
  const navigate = useNavigate();
  const [resolved, setResolved] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Fetch charts on mount
  useEffect(() => {
    if (!fetched) {
      void fetchCharts().finally(() => setFetched(true));
    }
  }, [fetched, fetchCharts]);

  useEffect(() => {
    if (!fetched || isLoading) return;
    if (charts.length > 0) {
      navigate(`/charts/${charts[0].id}`, { replace: true });
    } else {
      navigate('/charts/new', { replace: true });
    }
    setResolved(true);
  }, [charts, fetched, isLoading, navigate]);

  if (resolved) return null;
  return <PageLoader />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-cosmic-page">
        <ServiceWorkerUpdateBanner />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Redirects */}
              <Route path="/charts" element={<Navigate to="/dashboard" replace />} />
              <Route path="/charts/natal" element={<ProtectedRoute><NatalChartRedirect /></ProtectedRoute>} />
              <Route path="/compatibility" element={<Navigate to="/synastry" replace />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
              />
              <Route
                path="/charts/new"
                element={<ProtectedRoute><ChartCreatePage /></ProtectedRoute>}
              />
              <Route
                path="/charts/:id"
                element={<ProtectedRoute><ChartViewPage /></ProtectedRoute>}
              />
              <Route
                path="/analysis/:chartId"
                element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>}
              />
              <Route
                path="/transits"
                element={<ProtectedRoute><TransitPage /></ProtectedRoute>}
              />
              <Route
                path="/transits/today"
                element={<ProtectedRoute><TodayTransitsPage /></ProtectedRoute>}
              />
              <Route
                path="/forecast"
                element={<ProtectedRoute><ForecastPage /></ProtectedRoute>}
              />
              <Route
                path="/synastry"
                element={<ProtectedRoute><SynastryPageWrapper /></ProtectedRoute>}
              />
              <Route
                path="/moon-calendar"
                element={<ProtectedRoute><MoonCalendarPage /></ProtectedRoute>}
              />
              <Route
                path="/retrograde"
                element={<ProtectedRoute><RetrogradePage /></ProtectedRoute>}
              />
              <Route
                path="/ephemeris"
                element={<ProtectedRoute><EphemerisPage /></ProtectedRoute>}
              />
              <Route
                path="/learn"
                element={<ProtectedRoute><LearnPage /></ProtectedRoute>}
              />
              <Route
                path="/settings"
                element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
              />
              <Route
                path="/subscription"
                element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
              />
              <Route
                path="/solar-returns"
                element={<ProtectedRoute><SolarReturnsPage /></ProtectedRoute>}
              />
              <Route
                path="/solar-returns/:year"
                element={<ProtectedRoute><SolarReturnsPage /></ProtectedRoute>}
              />
              <Route
                path="/calendar"
                element={<ProtectedRoute><CalendarPage /></ProtectedRoute>}
              />
              <Route
                path="/lunar-returns"
                element={<ProtectedRoute><LunarReturnsPage /></ProtectedRoute>}
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
          </Suspense>
        </ErrorBoundary>
      </div>
    </QueryClientProvider>
  );
}

export default App;
