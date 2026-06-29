/**
 * SkipLink Component
 *
 * Provides an accessible skip-to-content link for keyboard navigation.
 *
 * For in-page hash anchors (target starting with "#"), a plain <a> is rendered.
 * This is intentional: an in-page skip link is a hash anchor, not client-side
 * route navigation. Using React Router's <Link> for a hash target resolves it
 * against the current route path (e.g. "/#main-content"), breaking both the
 * `href` value and native browser focus behavior. Plain <a> preserves the
 * expected `href="#main-content"` and the browser's built-in skip-to-anchor
 * focus management.
 *
 * For path targets (e.g. "/dashboard"), React Router's <Link> is used for
 * SPA navigation — satisfying the navigation convention that internal links
 * must not use raw <a href> for route changes.
 */

import { Link } from 'react-router-dom';

interface SkipLinkProps {
  target: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ target, children, className = 'skip-link' }: SkipLinkProps) {
  // In-page hash anchors use a plain <a> to keep href="#..." semantics intact.
  if (target.startsWith('#')) {
    return (
      <a href={target} className={className}>
        {children}
      </a>
    );
  }

  // Path targets use React Router Link for SPA navigation.
  return (
    <Link to={target} className={className}>
      {children}
    </Link>
  );
}
