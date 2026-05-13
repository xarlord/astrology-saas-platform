/**
 * Main App Component
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { ServiceWorkerUpdateBanner } from './components/ServiceWorkerUpdateBanner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auth store
import { useAuthStore } from './stores/authStore';

// Eager-loaded pages (landing, auth — needed immediately)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPageNew';
import RegisterPage from './pages/RegisterPageNew';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';
import StaticPage from './pages/StaticPage';

// Lazy-loaded pages (code-split into separate chunks)
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
const SynastryPageWrapper = lazy(() => import('./pages/SynastryPageNew'));
const SolarReturnsPage = lazy(() => import('./pages/SolarReturnsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const MoonCalendarPage = lazy(() => import('./pages/MoonCalendarPage'));
const LunarReturnsPage = lazy(() => import('./pages/LunarReturnsPage'));
const RetrogradePage = lazy(() => import('./pages/RetrogradePage'));
const EphemerisPage = lazy(() => import('./pages/EphemerisPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));

// Newly routed pages (previously unwired)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const BirthDataStep = lazy(() => import('./pages/BirthDataStep'));
const ChartCreationWizardPage = lazy(() => import('./pages/ChartCreationWizardPage'));
const NatalChartDetailPage = lazy(() => import('./pages/NatalChartDetailPage'));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage'));
const DailyBriefingPage = lazy(() => import('./pages/DailyBriefingPage'));
const TransitForecastPage = lazy(() => import('./pages/TransitForecastPage'));
const DetailedNatalReportPage = lazy(() => import('./pages/DetailedNatalReportPage'));
const SolarReturnAnnualReportPage = lazy(() => import('./pages/SolarReturnAnnualReportPage'));
const LearningCenterPage = lazy(() => import('./pages/LearningCenterPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const SavedChartsGalleryPage = lazy(() => import('./pages/SavedChartsGalleryPage'));
const ShareCardPage = lazy(() => import('./pages/ShareCardPage'));
const SharedCardPage = lazy(() => import('./pages/SharedCardPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cosmic-page">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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
      <div className="min-h-screen bg-cosmic-page">
        <ServiceWorkerUpdateBanner />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes (eager-loaded) */}
              {/* NOTE: HomePage (eager, route "/") is the primary landing page for logged-out visitors. */}
              {/* LandingPage (lazy, route "/landing") is the extended marketing/feature showcase page. */}
              {/* Both are kept intentionally. If consolidating, merge LandingPage content into HomePage. */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Redirects */}
              <Route path="/charts" element={<Navigate to="/dashboard" replace />} />
              <Route path="/charts/natal" element={<Navigate to="/charts/new" replace />} />
              <Route path="/compatibility" element={<Navigate to="/synastry" replace />} />

              {/* Protected routes (lazy-loaded) */}
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

              {/* Newly routed pages (protected) */}
              {/* /landing — Extended marketing landing page (LandingPage.tsx). NOT protected by design — */}
              {/* public marketing page. If this route is dead traffic, consider removing or redirecting to /. */}
              <Route
                path="/landing"
                element={<LandingPage />}
              />
              <Route
                path="/onboarding/birth-data"
                element={
                  <ProtectedRoute>
                    <BirthDataStep />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/charts/wizard"
                element={
                  <ProtectedRoute>
                    <ChartCreationWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/charts/:id/detail"
                element={
                  <ProtectedRoute>
                    <NatalChartDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/charts/gallery"
                element={
                  <ProtectedRoute>
                    <SavedChartsGalleryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettingsPage />
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
              <Route
                path="/transits/forecast"
                element={
                  <ProtectedRoute>
                    <TransitForecastPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/natal/:id"
                element={
                  <ProtectedRoute>
                    <DetailedNatalReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/solar-returns/:id/annual"
                element={
                  <ProtectedRoute>
                    <SolarReturnAnnualReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/center"
                element={
                  <ProtectedRoute>
                    <LearningCenterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/courses/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/share"
                element={
                  <ProtectedRoute>
                    <ShareCardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shared/:id"
                element={<SharedCardPage />}
              />

              {/* Static pages (eager-loaded — lightweight) */}
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
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
