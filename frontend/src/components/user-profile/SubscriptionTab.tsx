import { APP_LOCALE } from '../../utils/constants';
import type { UserProfile } from './types';

export interface SubscriptionTabProps {
  user?: UserProfile;
}

export function SubscriptionTab({ user }: SubscriptionTabProps) {
  if (!user) return null;

  const plans = [
    {
      name: 'Free',
      price: '$0/month',
      features: ['3 natal charts', 'Basic personality analysis', 'Daily transits', 'Community support'],
      cta: 'Current Plan',
      disabled: true,
      highlight: false,
    },
    {
      name: 'Premium',
      price: '$9.99/month',
      features: [
        'Unlimited natal charts',
        'Detailed personality analysis',
        'Transit calendar & forecasts',
        'Aspect pattern detection',
        'Priority support',
      ],
      cta: user.subscription.plan === 'premium' ? 'Current Plan' : 'Upgrade',
      disabled: user.subscription.plan === 'premium',
      highlight: true,
    },
    {
      name: 'Professional',
      price: '$29.99/month',
      features: [
        'Everything in Premium',
        'Synastry charts (compatibility)',
        'Composite charts',
        'Transit to transit analysis',
        'PDF chart exports',
        'Dedicated support',
      ],
      cta: user.subscription.plan === 'professional' ? 'Current Plan' : 'Upgrade',
      disabled: user.subscription.plan === 'professional',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Current Plan: {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}
            </h3>
            <p className="text-sm text-primary">
              Status: {user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1)}
            </p>
            {user.subscription.renewalDate && (
              <p className="text-xs text-primary mt-1">
                Renews on {new Date(user.subscription.renewalDate).toLocaleDateString(APP_LOCALE, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">auto_awesome</span>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Available Plans</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-lg font-semibold text-white mb-4">Billing History</h4>
        <div className="bg-white/15 rounded-lg p-6 text-center">
          <p className="text-slate-200 text-sm">
            No billing history available for your account.
          </p>
        </div>
      </div>
    </div>
  );
}

// Plan Card Component (internal to SubscriptionTab)
interface PlanCardProps {
  plan: {
    name: string;
    price: string;
    features: string[];
    cta: string;
    disabled: boolean;
    highlight: boolean;
  };
}

function PlanCard({ plan }: PlanCardProps) {
  return (
    <div
      className={`
        bg-white/15 rounded-lg border-2 p-6
        ${plan.highlight ? 'border-primary shadow-lg' : 'border-white/15'}
      `}
    >
      {plan.highlight && (
        <div className="text-center mb-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-3xl font-bold text-primary">{plan.price}</p>
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-200">
            <span className="material-symbols-outlined text-4xl text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true">check</span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={plan.disabled}
        className={`
          w-full py-3 rounded-lg font-medium transition-colors
          ${
            plan.disabled
              ? 'bg-white/15 text-slate-200 cursor-not-allowed'
              : plan.highlight
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-white/15 border border-white/15 text-slate-200 hover:bg-white/15'
          }
        `}
      >
        {plan.cta}
      </button>
    </div>
  );
}
