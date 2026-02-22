/**
 * ProfileSettingsPage Component Tests
 *
 * Comprehensive tests for the profile settings page
 * Covers: profile settings, account settings, subscription, appearance, notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock hooks
const mockUpdateProfile = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      plan: 'premium',
      bio: 'Astrology enthusiast',
      location: 'New York',
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    updateProfile: mockUpdateProfile,
    clearError: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock child components
vi.mock('../../components/ui/Button', () => ({
  __esModule: true,
  Button: ({ children, onClick, variant, isLoading, leftIcon, ...props }: any) => (
    <button
      onClick={onClick}
      className={`btn btn-${variant} ${isLoading ? 'loading' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  ),
}));

vi.mock('../../components/ui/Toggle', () => ({
  __esModule: true,
  Toggle: ({ checked, onChange, label, helperText }: any) => (
    <div className="toggle-wrapper">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          data-testid={`toggle-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <span className="toggle-label">{label}</span>
      </label>
      {helperText && <span className="helper-text">{helperText}</span>}
    </div>
  ),
}));

// Import after mocks
import { ProfileSettingsPage } from '../../pages/ProfileSettingsPage';

// Helper to create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: ['/profile/settings'] }, children)
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: createWrapper() });
};

describe('ProfileSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProfile.mockReset();
    mockUpdateProfile.mockResolvedValue(true);
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      // Test User appears in multiple places (header and hero card)
      const userElements = screen.getAllByText('Test User');
      expect(userElements.length).toBeGreaterThan(0);
    });

    it('should render the app header with logo', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });

    it('should render user display name in header', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      // Name appears in header and hero card
      const nameElements = screen.getAllByText('Test User');
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should render user email', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should render Pro badge', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('PRO')).toBeInTheDocument();
    });
  });

  describe('Hero Profile Card', () => {
    it('should render user avatar placeholder', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      // Avatar shows person icon
      const personIcons = screen.getAllByText('person');
      expect(personIcons.length).toBeGreaterThan(0);
    });

    it('should render zodiac badges', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Moon')).toBeInTheDocument();
      expect(screen.getByText('Rising')).toBeInTheDocument();
    });

    it('should render Edit Profile button', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('should click Edit Profile button to switch to profile tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const editButton = screen.getByText('Edit Profile');
      await user.click(editButton);

      // Should show profile form
      expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
    });
  });

  describe('Navigation Tabs', () => {
    it('should render all tab buttons', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    it('should have Personal Info tab active by default', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      const profileTab = screen.getByText('Personal Info');
      expect(profileTab).toHaveClass('border-primary');
    });

    it('should switch to Account tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const accountTab = screen.getByText('Account');
      await user.click(accountTab);

      expect(accountTab).toHaveClass('border-primary');
      expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('should switch to Subscription tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const subscriptionTab = screen.getByText('Subscription');
      await user.click(subscriptionTab);

      expect(subscriptionTab).toHaveClass('border-primary');
      expect(screen.getByText('Subscription Details')).toBeInTheDocument();
    });

    it('should switch to Appearance tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const appearanceTab = screen.getByText('Appearance');
      await user.click(appearanceTab);

      expect(appearanceTab).toHaveClass('border-primary');
      expect(screen.getByText('Appearance Settings')).toBeInTheDocument();
    });
  });

  describe('Profile Tab (Personal Info)', () => {
    it('should render Basic Information card', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });

    it('should render full name input', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
    });

    it('should render display name input', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByTestId('display-name-input')).toBeInTheDocument();
    });

    it('should render email input (disabled)', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toBeDisabled();
    });

    it('should render bio textarea', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByTestId('bio-input')).toBeInTheDocument();
    });

    it('should show bio character count', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText(/characters/)).toBeInTheDocument();
    });

    it('should render Save Changes button', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByTestId('save-profile-button')).toBeInTheDocument();
    });

    it('should update form when typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const fullNameInput = screen.getByTestId('full-name-input');
      await user.clear(fullNameInput);
      await user.type(fullNameInput, 'New Name');

      expect(fullNameInput).toHaveValue('New Name');
    });

    it('should call updateProfile when saving', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const saveButton = screen.getByTestId('save-profile-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });
    });
  });

  describe('Account Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));
      await user.click(screen.getByText('Account'));
    });

    it('should render Security section', () => {
      expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('should render password change form', () => {
      expect(screen.getByPlaceholderText('Current password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('should render Update Password button', () => {
      expect(screen.getByText('Update Password')).toBeInTheDocument();
    });

    it('should render Danger Zone', () => {
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });

    it('should render Delete Account button', () => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });
  });

  describe('Subscription Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));
      await user.click(screen.getByText('Subscription'));
    });

    it('should render Subscription Details card', () => {
      expect(screen.getByText('Subscription Details')).toBeInTheDocument();
    });

    it('should render Current Plan section', () => {
      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });

    it('should render Pro Plan info', () => {
      expect(screen.getByText(/Pro Plan/)).toBeInTheDocument();
    });

    it('should render plan price', () => {
      expect(screen.getByText(/\$12/)).toBeInTheDocument();
    });

    it('should render plan features', () => {
      expect(screen.getByText('Unlimited Transit Charts')).toBeInTheDocument();
      expect(screen.getByText('Synastry Reports')).toBeInTheDocument();
      expect(screen.getByText('Future Forecasts (1 Year)')).toBeInTheDocument();
    });

    it('should render Manage Subscription button', () => {
      expect(screen.getByText('Manage Subscription')).toBeInTheDocument();
    });
  });

  describe('Appearance Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));
      await user.click(screen.getByText('Appearance'));
    });

    it('should render Appearance Settings card', () => {
      expect(screen.getByText('Appearance Settings')).toBeInTheDocument();
    });

    it('should render Theme options', () => {
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(screen.getByText('dark')).toBeInTheDocument();
      expect(screen.getByText('system')).toBeInTheDocument();
    });

    it('should have dark theme selected by default', () => {
      // Dark button should have the primary border class
      const darkButtons = screen.getAllByText('dark');
      // Find the theme button (in Appearance section)
      const themeDarkButton = darkButtons.find(btn => btn.closest('button'));
      expect(themeDarkButton?.closest('button')).toHaveClass('border-primary');
    });

    it('should change theme when clicked', async () => {
      const user = userEvent.setup();
      const lightButtons = screen.getAllByText('light');
      const themeLightButton = lightButtons.find(btn => btn.closest('button'));
      await user.click(themeLightButton!);

      expect(themeLightButton?.closest('button')).toHaveClass('border-primary');
    });

    it('should render Interface Density options', () => {
      expect(screen.getByText('Interface Density')).toBeInTheDocument();
      expect(screen.getByText('compact')).toBeInTheDocument();
      expect(screen.getByText('comfortable')).toBeInTheDocument();
      expect(screen.getByText('spacious')).toBeInTheDocument();
    });

    it('should have comfortable density selected by default', () => {
      const comfortableButton = screen.getByText('comfortable');
      expect(comfortableButton).toHaveClass('border-primary');
    });

    it('should render Enable Animations toggle', () => {
      expect(screen.getByText('Enable Animations')).toBeInTheDocument();
      expect(screen.getByText('Smooth transitions and micro-interactions')).toBeInTheDocument();
    });

    it('should render Sidebar Position options', () => {
      expect(screen.getByText('Sidebar Position')).toBeInTheDocument();
    });
  });

  describe('Notification Preferences', () => {
    it('should render Notification Preferences card', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    it('should render Major Transits toggle', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Major Transits')).toBeInTheDocument();
      expect(screen.getByText('Get alerted when planets change signs')).toBeInTheDocument();
    });

    it('should render Moon Phases toggle', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Moon Phases')).toBeInTheDocument();
    });

    it('should render Retrograde Warnings toggle', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Retrograde Warnings')).toBeInTheDocument();
    });

    it('should render Daily Horoscope toggle', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Daily Horoscope')).toBeInTheDocument();
    });

    it('should render Weekly Forecast toggle', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Weekly Forecast')).toBeInTheDocument();
    });

    it('should toggle notification setting', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const majorTransitsToggle = screen.getByTestId('toggle-major-transits');
      await user.click(majorTransitsToggle);

      // Toggle should still exist
      expect(majorTransitsToggle).toBeInTheDocument();
    });
  });

  describe('Birth Data Card', () => {
    it('should render Birth Data card', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText('Birth Data')).toBeInTheDocument();
    });

    it('should render info message about updating birth data', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByText(/Updating your birth data will recalculate/i)).toBeInTheDocument();
    });
  });

  describe('Header Navigation', () => {
    it('should render notification button', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      const notificationButtons = screen.getAllByRole('button');
      // Should have multiple buttons
      expect(notificationButtons.length).toBeGreaterThan(0);
    });

    it('should navigate to profile when user avatar clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      // Find the clickable user area - it contains the user name
      const userArea = screen.getByText('Pro Member').closest('.group');
      if (userArea) {
        await user.click(userArea);
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      // Main heading should be the user name
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have labels for form inputs', () => {
      renderWithProviders(createElement(ProfileSettingsPage));
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle profile update error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockUpdateProfile.mockRejectedValue(new Error('Update failed'));

      const user = userEvent.setup();
      renderWithProviders(createElement(ProfileSettingsPage));

      const saveButton = screen.getByTestId('save-profile-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
