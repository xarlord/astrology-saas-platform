/**
 * Profile Page Component
 */

import { SkeletonLoader, EmptyState, AppLayout, UserProfile } from '../components';
import { useAuth } from '../hooks';
import { getErrorMessage } from '../utils/errorHandling';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, isLoading, error } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">My Profile</h1>
      </div>

      {isLoading ? (
        <div className="max-w-2xl mx-auto">
          <SkeletonLoader variant="card" />
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon="⚠️"
            title="Unable to load profile"
            description={getErrorMessage(error, 'Failed to load profile')}
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        </div>
      ) : !user ? (
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon="🔒"
            title="Sign in required"
            description="Please sign in to view your profile."
            actionText="Go to Login"
            onAction={() => navigate('/login')}
          />
        </div>
      ) : (
        <UserProfile
          onViewChart={(chartId) => navigate(`/charts/${chartId}`)}
        />
      )}
    </AppLayout>
  );
}
