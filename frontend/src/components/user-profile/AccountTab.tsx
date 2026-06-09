import { APP_LOCALE } from '../../utils/constants';
import type { UserProfile } from './types';

export interface AccountTabProps {
  user?: UserProfile;
}

export function AccountTab({ user }: AccountTabProps) {
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Account Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="account-name" className="block text-sm font-medium text-slate-200 mb-2">
            Display Name
          </label>
          <input
            id="account-name"
            type="text"
            value={user.name}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="account-email" className="block text-sm font-medium text-slate-200 mb-2">
            Email Address
          </label>
          <input
            id="account-email"
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-slate-200">
            Email cannot be changed. Contact support for assistance.
          </p>
        </div>

        <div>
          <label htmlFor="account-timezone" className="block text-sm font-medium text-slate-200 mb-2">
            Timezone
          </label>
          <input
            id="account-timezone"
            type="text"
            value={user.timezone}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="label-member-since" className="block text-sm font-medium text-slate-200 mb-2">
            Member Since
          </label>
          <input
            type="text"
            id="label-member-since"
            value={new Date(user.createdAt).toLocaleDateString(APP_LOCALE, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
        </div>
      </div>

      {/* Change Password Section */}
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-md font-medium text-white mb-4">Security</h4>
        <button type="button" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Change Password
        </button>
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-md font-medium text-red-400 mb-4">Danger Zone</h4>
        <button type="button" className="px-4 py-2 border border-red-800 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors">
          Delete My Account
        </button>
        <p className="mt-2 text-xs text-slate-200">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
      </div>
    </div>
  );
}
