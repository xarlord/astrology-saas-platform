/**
 * Subscription Page Component
 * Pricing tiers and current plan usage
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import UsageMeter from '../components/UsageMeter';
import { useCharts } from '../hooks';
import type { Tier } from '../components/UsageMeter';

interface PricingTierProps {
  name: string;
  tier: Tier;
  price: string;
  period: string;
  chartLimit: number;
  features: string[];
  currentTier: string;
  onUpgrade: () => void;
  icon: React.ReactNode;
  accentColor: string;
}

function PricingTierCard({
  name,
  tier,
  price,
  period,
  features,
  currentTier,
  onUpgrade,
  icon,
  accentColor,
}: PricingTierProps) {
  const isCurrent = currentTier === tier;
  const isPopular = tier === 'pro';

  return (
    <div
      className={`relative glass-panel rounded-2xl border-2 flex flex-col ${
        isPopular
          ? 'border-primary shadow-primary/25'
          : isCurrent
            ? 'border-green-500/50'
            : 'border-white/15'
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
          Most Popular
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
          Current Plan
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        {/* Tier header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
        </div>

        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-slate-200 text-sm ml-1">{period}</span>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" style={{ fontSize: '20px' }}>check</span>
              <span className="text-sm text-slate-200">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        {isCurrent ? (
          <div className="w-full py-2.5 text-center text-sm font-medium text-green-400 bg-green-500/10 rounded-lg border border-green-500/20">
            Current Plan
          </div>
        ) : (
          <button
            onClick={onUpgrade}
            className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              isPopular
                ? 'bg-primary text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                : 'bg-white/15 text-white border border-white/15 hover:bg-white/15'
            }`}
          >
            {currentTier === 'free' && tier !== 'free'
              ? 'Upgrade'
              : currentTier === 'pro' && tier === 'premium'
                ? 'Upgrade'
                : 'Get Started'}
          </button>
        )}
      </div>
    </div>
  );
}

const TIERS = [
  {
    name: 'Free',
    tier: 'free' as Tier,
    price: '$0',
    period: 'forever',
    chartLimit: 3,
    features: [
      'Up to 3 natal charts',
      'Basic transit tracking',
      'Limited AI interpretations',
      'Standard house systems',
    ],
    icon: <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>star</span>,
    accentColor: '#6b7280',
  },
  {
    name: 'Pro',
    tier: 'pro' as Tier,
    price: '$12',
    period: '/month',
    chartLimit: 25,
    features: [
      'Up to 25 charts',
      'Full transit analysis',
      'Synastry & compatibility',
      'PDF chart exports',
      'All house systems',
      'Unlimited AI interpretations',
    ],
    icon: <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>workspace_premium</span>,
    accentColor: '#8b5cf6',
  },
  {
    name: 'Premium',
    tier: 'premium' as Tier,
    price: '$29',
    period: '/month',
    chartLimit: 1000,
    features: [
      'Up to 1,000 charts',
      'All Pro features',
      'Solar & Lunar returns',
      'Progressed charts',
      'Priority support',
      'Early access to new features',
      'API access',
    ],
    icon: <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>bolt</span>,
    accentColor: '#f59e0b',
  },
];

const TIER_LIMITS: Record<string, number> = {
  free: 3,
  pro: 25,
  premium: 1000,
};

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { charts, fetchCharts } = useCharts();

  useEffect(() => {
    void fetchCharts();
  }, [fetchCharts]);

  const currentTier = (charts.length > 0 ? 'free' : 'free') as Tier;
  const chartCount = charts.length;
  const tierLimit = TIER_LIMITS[currentTier] ?? 3;

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription</h1>
        <p className="text-slate-200">
          Manage your plan and usage
        </p>
      </div>

      {/* Current Usage */}
      <div className="max-w-xl mb-10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Current Usage
        </h3>
        <UsageMeter
          currentCount={chartCount}
          limit={tierLimit}
          tier={currentTier}
          onUpgradeClick={() => {
            const section = document.getElementById('pricing-tiers');
            section?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Pricing Tiers */}
      <div id="pricing-tiers" className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">
          Choose Your Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((t) => (
            <PricingTierCard
              key={t.tier}
              name={t.name}
              tier={t.tier}
              price={t.price}
              period={t.period}
              chartLimit={t.chartLimit}
              features={t.features}
              currentTier={currentTier}
              onUpgrade={() => navigate('/settings')}
              icon={t.icon}
              accentColor={t.accentColor}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">
          Feature Comparison
        </h3>
        <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/15">
                  <th className="px-6 py-4 text-left font-semibold text-white">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-200">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-primary">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-amber-400">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {[
                  { feature: 'Natal Charts', free: '3', pro: '25', premium: '1,000' },
                  { feature: 'Transit Tracking', free: 'Basic', pro: 'Full', premium: 'Full' },
                  { feature: 'AI Interpretations', free: 'Limited', pro: 'Unlimited', premium: 'Unlimited' },
                  { feature: 'Synastry Reports', free: false, pro: true, premium: true },
                  { feature: 'PDF Exports', free: false, pro: true, premium: true },
                  { feature: 'Solar Returns', free: false, pro: false, premium: true },
                  { feature: 'Lunar Returns', free: false, pro: false, premium: true },
                  { feature: 'Progressed Charts', free: false, pro: false, premium: true },
                  { feature: 'Priority Support', free: false, pro: false, premium: true },
                  { feature: 'API Access', free: false, pro: false, premium: true },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-white/15 transition-colors">
                    <td className="px-6 py-3.5 text-slate-200 font-medium">
                      {row.feature}
                    </td>
                    {(['free', 'pro', 'premium'] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="px-6 py-3.5 text-center">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <span className="material-symbols-outlined text-green-500" aria-hidden="true" style={{ fontSize: '20px' }} aria-label="Included">check</span>
                            ) : (
                              <span className="text-slate-400" aria-label="Not included">--</span>
                            )
                          ) : (
                            <span className="text-slate-200">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
