/**
 * Avatar Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Avatar, AvatarGroup } from '../Avatar';

describe('Avatar Component', () => {
  describe('Rendering', () => {
    it('renders with image', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="User Avatar"
          name="John Doe"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'User Avatar');
    });

    it('renders with initials when no image provided', () => {
      render(<Avatar name="John Doe" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders with initials when image fails to load', () => {
      render(
        <Avatar
          src="https://invalid-url.com/image.jpg"
          name="Jane Doe"
        />
      );

      // Find the image element and trigger error
      const img = screen.getByRole('img');
      fireEvent.error(img);

      // After error, initials should be shown
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders question mark when no name provided', () => {
      render(<Avatar />);

      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders extra small size', () => {
      render(<Avatar name="JD" size="xs" />);
      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('w-6', 'h-6');
    });

    it('renders small size', () => {
      render(<Avatar name="JD" size="sm" />);
      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('w-8', 'h-8');
    });

    it('renders medium size by default', () => {
      render(<Avatar name="JD" />);
      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('w-10', 'h-10');
    });

    it('renders large size', () => {
      render(<Avatar name="JD" size="lg" />);
      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('w-12', 'h-12');
    });

    it('renders extra large size', () => {
      render(<Avatar name="JD" size="xl" />);
      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('w-16', 'h-16');
    });
  });

  describe('Shape', () => {
    it('renders circle shape by default', () => {
      render(<Avatar name="JD" />);
      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('rounded-full');
    });

    it('renders square shape', () => {
      render(<Avatar name="JD" shape="square" />);
      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('rounded-lg');
    });
  });

  describe('Status Indicator', () => {
    it('renders online status', () => {
      render(<Avatar name="JD" status="online" />);

      const statusIndicator = screen.getByLabelText('Status: online');
      expect(statusIndicator).toBeInTheDocument();
      expect(statusIndicator).toHaveClass('bg-green-500');
    });

    it('renders offline status', () => {
      render(<Avatar name="JD" status="offline" />);

      const statusIndicator = screen.getByLabelText('Status: offline');
      expect(statusIndicator).toBeInTheDocument();
      expect(statusIndicator).toHaveClass('bg-gray-400');
    });

    it('renders away status', () => {
      render(<Avatar name="JD" status="away" />);

      const statusIndicator = screen.getByLabelText('Status: away');
      expect(statusIndicator).toBeInTheDocument();
      expect(statusIndicator).toHaveClass('bg-yellow-500');
    });

    it('renders busy status', () => {
      render(<Avatar name="JD" status="busy" />);

      const statusIndicator = screen.getByLabelText('Status: busy');
      expect(statusIndicator).toBeInTheDocument();
      expect(statusIndicator).toHaveClass('bg-red-500');
    });

    it('does not render status when not provided', () => {
      render(<Avatar name="JD" />);

      expect(screen.queryByLabelText(/Status:/)).not.toBeInTheDocument();
    });
  });

  describe('Initials Generation', () => {
    it('generates initials from full name', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('generates initial from single name', () => {
      render(<Avatar name="John" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('generates initials from multiple names', () => {
      render(<Avatar name="John Michael Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles empty name gracefully', () => {
      render(<Avatar name="" />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Interactivity', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      render(<Avatar name="JD" onClick={handleClick} />);

      await userEvent.click(screen.getByLabelText('JD'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders as button when clickable', () => {
      render(<Avatar name="JD" onClick={() => {}} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<Avatar name="JD" className="custom-class" />);

      const container = screen.getByLabelText('JD');
      expect(container).toHaveClass('custom-class');
    });
  });
});

describe('AvatarGroup Component', () => {
  it('renders multiple avatars', () => {
    render(
      <AvatarGroup>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
      </AvatarGroup>
    );

    expect(screen.getByText('U1')).toBeInTheDocument();
    expect(screen.getByText('U2')).toBeInTheDocument();
    expect(screen.getByText('U3')).toBeInTheDocument();
  });

  it('limits visible avatars with max prop', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
        <Avatar name="User 4" />
      </AvatarGroup>
    );

    expect(screen.getByText('U1')).toBeInTheDocument();
    expect(screen.getByText('U2')).toBeInTheDocument();
    expect(screen.queryByText('U3')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows remaining count correctly', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
        <Avatar name="User 4" />
        <Avatar name="User 5" />
      </AvatarGroup>
    );

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not show count when under max', () => {
    render(
      <AvatarGroup max={5}>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
      </AvatarGroup>
    );

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('applies size to all avatars', () => {
    render(
      <AvatarGroup size="lg">
        <Avatar name="User 1" />
        <Avatar name="User 2" />
      </AvatarGroup>
    );

    // Check that size class is applied (lg = w-12 h-12)
    const container1 = screen.getByLabelText('User 1');
    expect(container1).toHaveClass('w-12', 'h-12');
  });

  it('applies custom className', () => {
    render(
      <AvatarGroup className="custom-group">
        <Avatar name="User 1" />
      </AvatarGroup>
    );

    // The className is on the outer flex container
    const group = screen.getByText('U1').closest('.custom-group');
    expect(group).toBeInTheDocument();
  });
});
