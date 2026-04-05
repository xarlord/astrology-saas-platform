/**
 * Main App Component
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { ServiceWorkerUpdateBanner } from './components/ServiceWorkerUpdateBanner';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPageNew'));
const RegisterPage = lazy(() => import('./pages/RegisterPageNew'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SynastryPage = lazy(() => import('./pages/SynastryPageNew'));
const TransitForecastPage = lazy(() => import('./pages/TransitForecastPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SolarReturnsPage = lazy(() => import('./pages/SolarReturnsPage'));
const LunarReturnsPage = lazy(() => import('./pages/LunarReturnsPage'));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage'));
const NatalChartDetailPage = lazy(() => import('./pages/NatalChartDetailPage'));
const ChartCreationWizardPage = lazy(() => import('./pages/ChartCreationWizardPage'));
const SavedChartsGalleryPage = lazy(() => import('./pages/SavedChartsGalleryPage'));
const LearningCenterPage = lazy(() => import('./pages/LearningCenterPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const DetailedNatalReportPage = lazy(() => import('./pages/DetailedNatalReportPage'));
const SolarReturnAnnualReportPage = lazy(() => import('./pages/SolarReturnAnnualReportPage'));
const ChartCreatePage = lazy(() => import('./pages/ChartCreatePage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const DailyBriefingPage = lazy(() => import('./pages/DailyBriefingPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const ShareCardPage = lazy(() => import('./pages/ShareCardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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
      <HelmetProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ServiceWorkerUpdateBanner />
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
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
                path="/synastry"
                element={
                  <ProtectedRoute>
                    <SynastryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transits"
                element={
                  <ProtectedRoute>
                    <TransitForecastPage />
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
                path="/settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettingsPage />
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
                path="/charts/new"
                element={
                  <ProtectedRoute>
                    <ChartCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/charts/create"
                element={
                  <ProtectedRoute>
                    <ChartCreationWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/charts"
                element={
                  <ProtectedRoute>
                    <SavedChartsGalleryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/charts/:id"
                element={
                  <ProtectedRoute>
                    <NatalChartDetailPage />
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
                path="/learning"
                element={
                  <ProtectedRoute>
                    <LearningCenterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning/courses/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/natal/:chartId"
                element={
                  <ProtectedRoute>
                    <DetailedNatalReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily-briefing"
                element={
                  <ProtectedRoute>
                    <DailyBriefingPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/share/:shareToken" element={<ShareCardPage />} />
              <Route
                path="/reports/solar-return/:id"
                element={
                  <ProtectedRoute>
                    <SolarReturnAnnualReportPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 - Must be last */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
