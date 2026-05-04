/**
 * Subscription Page
 *
 * Shows plan comparison (Free / Pro / Premium) with real Stripe Checkout redirect.
 * Handles ?status=success and ?status=cancel query params from redirect flows.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components';
import { useAuth } from '../hooks';
import { billingService, type PlanDetail } from '../services/billing.service';

// Static plan definitions – used as fallback when backend plans endpoint is unavailable
const FALLBACK_PLANS: PlanDetail[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'none',
    maxCharts: 3,
    features: [
      'Up to 3 natal charts',
      'Basic daily transits',
      'Limited AI interpretations',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    maxCharts: 25,
    highlighted: true,
    priceId: 'price_pro_monthly',
    features: [
      'Up to 25 charts',
      'Full transit forecasts',
      'Synastry comparisons',
      'PDF report exports',
      'Solar & lunar returns',
      'Priority support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    maxCharts: -1,
    priceId: 'price_premium_monthly',
    features: [
      'Unlimited charts',
      'All Pro features',
      'Advanced AI interpretations',
      'Detailed annual reports',
      'Early access to new features',
      'Dedicated support',
    ],
  },
];

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [plans, setPlans] = useState<PlanDetail[]>(FALLBACK_PLANS);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'cancel';
    text: string;
  } | null>(null);

  // Determine current tier from user object (map backend 'basic' → frontend 'pro')
  const rawTier = user?.plan ?? 'free';
  const currentTier: string = rawTier === 'basic' ? 'pro' : rawTier;

  // Handle redirect status from Stripe
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setStatusMessage({
        type: 'success',
        text: 'Subscription activated successfully! Your plan has been updated.',
      });
      setSearchParams({}, { replace: true });
    } else if (status === 'cancel') {
      setStatusMessage({
        type: 'cancel',
        text: 'Checkout was cancelled. No changes were made to your plan.',
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch plans from backend if available
  useEffect(() => {
    let cancelled = false;
    billingService
      .getPlans()
      .then((backendPlans) => {
        if (!cancelled && backendPlans.length > 0) {
          setPlans(backendPlans);
        }
      })
      .catch(() => {
        // Use fallback plans
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = useCallback(
    async (plan: PlanDetail) => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (plan.id === 'free' || plan.id === currentTier) return;

      setLoadingPlan(plan.id);
      setError(null);

      try {
        const baseUrl = window.location.origin + '/subscription';
        const session = await billingService.createCheckoutSession({
          priceId: plan.priceId ?? '',
          successUrl: `${baseUrl}?status=success`,
          cancelUrl: `${baseUrl}?status=cancel`,
        });

        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to start checkout. Please try again.';
        setError(message);
        setLoadingPlan(null);
      }
    },
    [isAuthenticated, currentTier, navigate],
  );

  const handleManage = useCallback(async () => {
    setLoadingPlan('portal');
    setError(null);
    try {
      const portal = await billingService.createPortalSession(
        window.location.origin + '/subscription',
      );
      window.location.href = portal.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to open billing portal.';
      setError(message);
      setLoadingPlan('portal');
    }
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Unlock deeper astrological insights with the plan that fits your journey.
          </p>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border text-sm ${
              statusMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
            }`}
            role="alert"
          >
            {statusMessage.text}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Current plan info */}
        {isAuthenticated && currentTier !== 'free' && (
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-accent-gold text-sm font-medium">
              <span className="material-symbols-outlined text-[16px]">star</span>
              Current plan: {plans.find((p) => p.id === currentTier)?.name ?? currentTier}
            </span>
            <button
              onClick={() => {
                void handleManage();
              }}
              disabled={loadingPlan === 'portal'}
              className="ml-3 text-sm text-primary hover:text-accent-gold hover:underline disabled:opacity-50"
            >
              {loadingPlan === 'portal' ? 'Opening portal...' : 'Manage subscription'}
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentTier;
            const isLoading = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col transition-shadow hover:shadow-lg ${
                  plan.highlighted
                    ? 'border-primary/50 ring-2 ring-primary/20 bg-[#141627]/70 backdrop-blur-md'
                    : 'border-white/10 bg-[#141627]/50 backdrop-blur-sm'
                } ${isCurrent ? 'bg-primary/10' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                    Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          /{plan.interval}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {plan.maxCharts === -1 ? 'Unlimited charts' : `Up to ${plan.maxCharts} charts`}
                  </p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span
                        className="material-symbols-outlined text-[16px] mt-0.5 text-green-500 flex-shrink-0"
                        aria-hidden="true"
                      >
                        check
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => void handleSubscribe(plan)}
                  disabled={isCurrent || isLoading}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrent
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
                      : plan.highlighted
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isCurrent
                    ? 'Current Plan'
                    : isLoading
                      ? 'Redirecting...'
                      : plan.price === 0
                        ? 'Get Started'
                        : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ / note */}
        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          All plans include secure payment via Stripe. Cancel anytime from your account settings.
        </p>
      </div>
    </AppLayout>
  );
}
