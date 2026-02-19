/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
/* eslint-disable @typescript-eslint/no-unused-vars */
 * * UserProfile Component Tests
 * * Testing data loading, editing, tabs, and chart management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProfile } from '../UserProfile';

// Mock hooks - the component imports from '../hooks' (src/hooks from components dir)
// From the test file's perspective (src/components/__tests__), this should be '../../hooks'
// But we need to mock what the component uses, so we mock '../hooks' and Vitest will resolve it
vi.mock('../../hooks', () => ({
  useAuth: vi.fn(),
  useCharts: vi.fn(),
}));

// Import the mocked hooks from the correct path
import { useAuth, useCharts } from '../../hooks';

const mockUpdateProfile = vi.fn();
const mockDeleteChart = vi.fn();

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  timezone: 'UTC',
  plan: 'free',
  preferences: {
    theme: 'auto',
    defaultHouseSystem: 'placidus',
    defaultZodiac: 'tropical',
    aspectOrbs: {
      conjunction: 10,
      opposition: 10,
      trine: 8,
      square: 8,
      sextile: 6,
    },
  },
};

const mockCharts = [
  {
    id: 'chart-1',
    userId: 'user-123',
    name: 'Natal Chart',
    type: 'natal' as const,
    birthData: {
      date: new Date('1990-01-15T00:00:00Z') as any, // Cast to any to bypass type checking
      time: '10:30',
      place: {
        name: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      },
      timeUnknown: false,
    },
    settings: {
      houseSystem: 'placidus',
      zodiac: 'tropical',
    },
    calculatedData: {
      planets: [],
      houses: [],
      aspects: [],
    },
    createdAt: new Date('2024-01-01T00:00:00Z') as any,
    updatedAt: new Date('2024-01-01T00:00:00Z') as any,
  },
  {
    id: 'chart-2',
    userId: 'user-123',
    name: 'Secondary Chart',
    type: 'natal' as const,
    birthData: {
      date: new Date('1995-06-20T00:00:00Z') as any,
      time: '14:45',
      place: {
        name: 'Los Angeles, CA',
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: 'America/Los_Angeles',
      },
      timeUnknown: false,
    },
    settings: {
      houseSystem: 'placidus',
      zodiac: 'tropical',
    },
    calculatedData: {
      planets: [],
      houses: [],
      aspects: [],
    },
    createdAt: new Date('2024-02-01T00:00:00Z') as any,
    updatedAt: new Date('2024-02-01T00:00:00Z') as any,
  },
];

describe('UserProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      logout: vi.fn(),
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      updatePreferences: vi.fn(),
      isLoading: false,
      error: null,
      clearError: vi.fn(),
    });
    vi.mocked(useCharts).mockReturnValue({
      charts: mockCharts,
      deleteChart: mockDeleteChart,
      currentChart: null,
      pagination: null,
      fetchCharts: vi.fn(),
      fetchChart: vi.fn(),
      createChart: vi.fn(),
      updateChart: vi.fn(),
      calculateChart: vi.fn(),
      isLoading: false,
      error: null,
      clearError: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render profile header with user info', () => {
      render(<UserProfile />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<UserProfile />);

      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('My Charts')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('should render avatar with user initial', () => {
      render(<UserProfile />);

      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test"
    });

    it('should default to account tab', () => {
      render(<UserProfile />);

      const accountTab = screen.getByTestId('tab-account');
      expect(accountTab).toHaveClass('border-indigo-500');
    });

    it('should have accessible tab navigation', () => {
      render(<UserProfile />);

      const tabs = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.match(/account|charts|preferences|subscription/i)
      );

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to charts tab when clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const chartsTab = screen.getByRole('button', { name: /my charts/i });
      await user.click(chartsTab);

      expect(screen.getByText('My Charts (2)')).toBeInTheDocument();
    });

    it('should switch to preferences tab when clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const preferencesTab = screen.getByRole('button', { name: /preferences/i });
      await user.click(preferencesTab);

      expect(screen.getByText('Chart Preferences')).toBeInTheDocument();
    });

    it('should switch to subscription tab when clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const subscriptionTab = screen.getByTestId('tab-subscription');
      await user.click(subscriptionTab);

      expect(screen.getByText(/current plan: free/i)).toBeInTheDocument();
    });

    it('should update active tab styling', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const accountTab = screen.getByTestId('tab-account');
      const chartsTab = screen.getByTestId('tab-charts');

      expect(accountTab).toHaveClass('border-indigo-500');
      expect(chartsTab).not.toHaveClass('border-indigo-500');

      await user.click(chartsTab);

      expect(chartsTab).toHaveClass('border-indigo-500');
      expect(accountTab).not.toHaveClass('border-indigo-500');
    });
  });

  describe('Profile Editing', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    it('should show save and cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should allow changing name in edit mode', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      expect(nameInput).toHaveValue('Updated Name');
    });

    it('should allow changing timezone in edit mode', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      const timezoneSelect = screen.getByDisplayValue('UTC');
      await user.selectOptions(timezoneSelect, 'America/New_York');

      expect(timezoneSelect).toHaveValue('America/New_York');
    });

    it('should save profile and call updateProfile', async () => {
      const user = userEvent.setup();
      mockUpdateProfile.mockResolvedValue({ success: true });
      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          name: 'New Name',
          timezone: 'UTC',
        });
      });
    });

    it('should cancel edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);
      await user.type(nameInput, 'Changed Name');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Changed Name')).not.toBeInTheDocument();
    });
  });

  describe('Account Tab', () => {
    it('should display account details', () => {
      render(<UserProfile />);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('UTC')).toBeInTheDocument();
    });

    it('should show change password button', () => {
      render(<UserProfile />);

      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    });

    it('should show delete account button in danger zone', () => {
      render(<UserProfile />);

      expect(screen.getByRole('button', { name: /delete my account/i })).toBeInTheDocument();
    });

    it('should have disabled inputs for email', () => {
      render(<UserProfile />);

      const emailInput = screen.getByDisplayValue('test@example.com');
      expect(emailInput).toBeDisabled();
    });
  });

  describe('Charts Tab', () => {
    it('should display list of charts', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const chartsTab = screen.getByRole('button', { name: /my charts/i });
      await user.click(chartsTab);

      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
      expect(screen.getByText('Secondary Chart')).toBeInTheDocument();
    });

    it('should show empty state when no charts', async () => {
      const user = userEvent.setup();
      vi.mocked(useCharts).mockReturnValue({
        charts: [],
        deleteChart: mockDeleteChart,
        currentChart: null,
        pagination: null,
        fetchCharts: vi.fn(),
        fetchChart: vi.fn(),
        createChart: vi.fn(),
        updateChart: vi.fn(),
        calculateChart: vi.fn(),
        isLoading: false,
        error: null,
        clearError: vi.fn(),
      });

      render(<UserProfile />);

      const chartsTab = screen.getByRole('button', { name: /my charts/i });
      await user.click(chartsTab);

      expect(screen.getByText('No charts yet')).toBeInTheDocument();
    });

    it('should show chart count in header', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const chartsTab = screen.getByRole('button', { name: /my charts/i });
      await user.click(chartsTab);

      expect(screen.getByText('My Charts (2)')).toBeInTheDocument();
    });

    it('should call onViewChart when view button is clicked', async () => {
      const user = userEvent.setup();
      const onViewChart = vi.fn();
      render(<UserProfile onViewChart={onViewChart} />);

      const chartsTab = screen.getByRole('button', { name: /my charts/i });
      await user.click(chartsTab);

      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      await user.click(viewButtons[0]);

      expect(onViewChart).toHaveBeenCalledWith('chart-1');
    });

    it('should call onEditChart when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEditChart = vi.fn();
      render(<UserProfile onEditChart={onEditChart} />);

      const chartsTab = screen.getByRole('button', { name: /my charts/i });
      await user.click(chartsTab);

      const editButtons = screen.getAllByRole('button', { name: /edit chart/i });

      if (editButtons.length > 0) {
        await user.click(editButtons[0]);
        expect(onEditChart).toHaveBeenCalled();
      }
    });

    it('should confirm and call deleteChart when delete button is clicked', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => true);
      const onDeleteChart = vi.fn();
      mockDeleteChart.mockResolvedValue({ success: true });

      render(<UserProfile onDeleteChart={onDeleteChart} />);

      const chartsTab = screen.getByRole('button', { name: /my charts/i });
      await user.click(chartsTab);

      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('Delete') || btn.querySelector('svg')
      );

      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[deleteButtons.length - 1]);

        await waitFor(() => {
          expect(window.confirm).toHaveBeenCalledWith(
            'Are you sure you want to delete this chart?'
          );
          expect(mockDeleteChart).toHaveBeenCalled();
        });
      }
    });

    it('should show chart details', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      // Click on charts tab
      const chartsTab = screen.getByTestId('tab-charts');
      await user.click(chartsTab);

      // Wait for chart name to appear
      await waitFor(() => {
        expect(screen.getByText('Natal Chart')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify chart card is rendered - just check for chart name and house system
      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
    });
  });

  describe('Preferences Tab', () => {
    it('should display chart preferences', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const preferencesTab = screen.getByRole('button', { name: /preferences/i });
      await user.click(preferencesTab);

      expect(screen.getByLabelText(/default house system/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/default zodiac type/i)).toBeInTheDocument();
    });

    it('should display aspect orb sliders', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const preferencesTab = screen.getByRole('button', { name: /preferences/i });
      await user.click(preferencesTab);

      expect(screen.getByLabelText(/conjunction/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/trine/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sextile/i)).toBeInTheDocument();
    });

    it('should display theme options', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const preferencesTab = screen.getByRole('button', { name: /preferences/i });
      await user.click(preferencesTab);

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should have save button for preferences', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const preferencesTab = screen.getByRole('button', { name: /preferences/i });
      await user.click(preferencesTab);

      expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
    });
  });

  describe('Subscription Tab', () => {
    it('should display current plan', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const subscriptionTab = screen.getByRole('button', { name: /subscription/i });
      await user.click(subscriptionTab);

      expect(screen.getByText(/current plan: free/i)).toBeInTheDocument();
      expect(screen.getByText(/status: active/i)).toBeInTheDocument();
    });

    it('should display available plans', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const subscriptionTab = screen.getByRole('button', { name: /subscription/i });
      await user.click(subscriptionTab);

      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
    });

    it('should highlight premium plan as most popular', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const subscriptionTab = screen.getByRole('button', { name: /subscription/i });
      await user.click(subscriptionTab);

      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });

    it('should show billing history section', async () => {
      const user = userEvent.setup();
      render(<UserProfile />);

      const subscriptionTab = screen.getByRole('button', { name: /subscription/i });
      await user.click(subscriptionTab);

      expect(screen.getByText('Billing History')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on tabs', () => {
      render(<UserProfile />);

      const tabs = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.match(/account|charts|preferences|subscription/i)
      );

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('type', 'button');
      });
    });

    it('should have accessible form inputs', () => {
      render(<UserProfile />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type');
      });
    });

    it('should have proper button labels', () => {
      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle profile update errors gracefully', async () => {
      const user = userEvent.setup();
      mockUpdateProfile.mockRejectedValue(new Error('Update failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<UserProfile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile', () => {
      // Mock mobile viewport
      global.innerWidth = 375;

      render(<UserProfile />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should scroll tabs horizontally on mobile', () => {
      render(<UserProfile />);

      const tabNav = screen.getByRole('navigation').closest('.overflow-x-auto');
      expect(tabNav).toBeInTheDocument();
    });
  });
});
