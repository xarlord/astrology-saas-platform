/**
 * Profile Page Component
 */

import { EmptyState, AppLayout, UserProfile } from '../components';
import { useAuth } from '../hooks';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // For now, the auth hook provides user data directly.
  // If user is not authenticated, show login prompt.
  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon="🔒"
            title="Sign in required"
            description="Please sign in to view your profile."
            actionText="Go to Login"
            onAction={() => navigate('/login')}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <UserProfile
        onViewChart={(chartId) => navigate(`/charts/${chartId}`)}
      />
    </AppLayout>
  );
}
