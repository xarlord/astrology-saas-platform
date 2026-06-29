/**
 * SkipLink Component
 *
 * Provides an accessible skip-to-content link for keyboard navigation.
 * Uses React Router's Link component for SPA navigation.
 */

import { Link } from 'react-router-dom';

interface SkipLinkProps {
  target: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ target, children, className = 'skip-link' }: SkipLinkProps) {
  return (
    <Link to={target} className={className}>
      {children}
    </Link>
  );
}
