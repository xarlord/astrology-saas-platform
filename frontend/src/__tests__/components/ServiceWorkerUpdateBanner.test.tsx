/**
 * Service Worker Update Banner Component Tests
 * Following TDD approach: write failing tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ServiceWorkerUpdateBanner } from '../../components/ServiceWorkerUpdateBanner';

// Mock the useServiceWorkerUpdate hook
vi.mock('../../hooks/useServiceWorkerUpdate', () => ({
  useServiceWorkerUpdate: vi.fn(),
}));

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
  configurable: true,
});

import { useServiceWorkerUpdate } from '../../hooks/useServiceWorkerUpdate';

describe('ServiceWorkerUpdateBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when no update is needed', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    const { container } = render(<ServiceWorkerUpdateBanner />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText(/update available/i)).not.toBeInTheDocument();
  });

  it('should render banner when update is needed', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    expect(screen.getByText(/new version available/i)).toBeInTheDocument();
    expect(screen.getByText(/refresh now/i)).toBeInTheDocument();
    expect(screen.getByText(/later/i)).toBeInTheDocument();
  });

  it('should reload the page when refresh now button is clicked', async () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    const refreshButton = screen.getByText(/refresh now/i);
    refreshButton.click();

    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should dismiss (no-op) when later button is clicked', async () => {
    const update = vi.fn();
    const skipWaiting = vi.fn();

    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update,
      skipWaiting,
    });

    render(<ServiceWorkerUpdateBanner />);

    const laterButton = screen.getByText(/later/i);
    laterButton.click();

    // "Later" is a no-op — neither update nor skipWaiting is called
    await waitFor(() => {
      expect(update).not.toHaveBeenCalled();
      expect(skipWaiting).not.toHaveBeenCalled();
    });
  });

  it('should render offline banner when app goes offline', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: false,
      offlineReady: true,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    expect(screen.getByText(/you are offline/i)).toBeInTheDocument();
    expect(screen.getByText(/some features may be unavailable/i)).toBeInTheDocument();
  });

  it('should show subtext with refresh information', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    expect(screen.getByText(/refresh to get the latest features/i)).toBeInTheDocument();
  });

  it('should have responsive design with proper class names', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    const { container } = render(<ServiceWorkerUpdateBanner />);

    const banner = container.querySelector('.fixed');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass('fixed');
  });

  it('keeps the update banner constrained to a centered card on larger screens', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    const { container } = render(<ServiceWorkerUpdateBanner />);
    const banner = container.querySelector('.fixed');

    expect(banner).toHaveClass('w-full', 'max-w-full', 'sm:w-[400px]', 'sm:max-w-[90%]');
    expect(banner).not.toHaveClass('sm:left-0', 'sm:right-0', 'sm:w-full', 'sm:max-w-full');
  });

  it('should render offline banner with offline-specific styling', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: false,
      offlineReady: true,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    const { container } = render(<ServiceWorkerUpdateBanner />);

    // Offline banner renders a fixed banner element
    const banner = container.querySelector('.fixed');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass('fixed');
  });
});
