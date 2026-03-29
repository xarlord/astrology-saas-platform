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

  it('should call skipWaiting when refresh now button is clicked', async () => {
    const skipWaiting = vi.fn();

    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting,
    });

    render(<ServiceWorkerUpdateBanner />);

    const refreshButton = screen.getByText(/refresh now/i);
    refreshButton.click();

    await waitFor(() => {
      expect(skipWaiting).toHaveBeenCalledTimes(1);
    });
  });

  it('should call update and close banner when later button is clicked', async () => {
    const update = vi.fn();

    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update,
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    const laterButton = screen.getByText(/later/i);
    laterButton.click();

    await waitFor(() => {
      expect(update).toHaveBeenCalledTimes(1);
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

    const banner = container.querySelector('.sw-update-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass('sw-update-banner');
  });

  it('should add offline class when offlineReady is true', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: false,
      offlineReady: true,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    const { container } = render(<ServiceWorkerUpdateBanner />);

    const banner = container.querySelector('.sw-update-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass('offline');
  });
});
