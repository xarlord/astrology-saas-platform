/**
 * UI Components Test Suite
 *
 * Tests for all base UI components
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Toggle,
  Badge,
  DotBadge,
  CountBadge,
  LoadingSpinner,
  Alert,
  Toast,
  Modal,
} from '../index';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-purple-600');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3');

    rerender(<Button size="xl">Extra Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-8');
  });

  it('renders with icons', () => {
    const leftIcon = <span data-testid="left-icon">L</span>;
    const rightIcon = <span data-testid="right-icon">R</span>;

    render(
      <Button leftIcon={leftIcon} rightIcon={rightIcon}>
        Icon Button
      </Button>,
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
  });
});

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Name" id="name" />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<Input label="Email" error="Invalid email" id="email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders helper text', () => {
    render(<Input label="Password" helperText="Must be 8 characters" id="password" />);
    expect(screen.getByText('Must be 8 characters')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    render(<Input label="Username" id="username" />);
    const input = screen.getByLabelText('Username');

    await userEvent.type(input, 'john_doe');
    expect(input).toHaveValue('john_doe');
  });

  it('renders with left icon', () => {
    render(<Input label="Search" leftIcon={<span>@</span>} id="search" />);
    expect(screen.getByText('@')).toBeInTheDocument();
  });

  it('renders floating label', () => {
    render(<Input label="Floating" floatingLabel id="floating" />);
    expect(screen.getByText('Floating')).toBeInTheDocument();
  });
});

describe('Select Component', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  it('renders select with label', () => {
    render(<Select label="Choose" options={options} />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<Select options={options} placeholder="Select an option" />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects an option', async () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} placeholder="Select" />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Option 2'));

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('2');
    });
  });

  it('filters options when searchable', async () => {
    render(<Select options={options} searchable placeholder="Search" />);

    await userEvent.click(screen.getByRole('combobox'));
    const searchInput = screen.getByPlaceholderText('Search...');

    await userEvent.type(searchInput, 'Option 1');

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<Select options={options} error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });
});

describe('Checkbox Component', () => {
  it('renders checkbox with label', () => {
    render(<Checkbox label="Accept terms" id="terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('toggles checked state', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Check me" id="check" checked onChange={handleChange} />);
    const checkbox = screen.getByLabelText('Check me') as HTMLInputElement;

    expect(checkbox).toBeChecked();
  });

  it('renders indeterminate state', () => {
    render(<Checkbox label="Indeterminate" indeterminate id="indeterminate" />);
    const checkbox = screen.getByLabelText('Indeterminate');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<Checkbox label="Agree" error="Must accept" id="agree" />);
    expect(screen.getByText('Must accept')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox label="Disabled" disabled id="disabled" />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });
});

describe('Toggle Component', () => {
  it('renders toggle with label', () => {
    render(<Toggle label="Enable notifications" id="toggle" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('toggles checked state', async () => {
    const handleChange = vi.fn();
    render(<Toggle onChange={handleChange} id="toggle" />);

    const toggle = screen.getByRole('switch');
    await userEvent.click(toggle);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('renders with different label positions', () => {
    const { rerender } = render(<Toggle label="Start" labelPosition="start" />);
    expect(screen.getByText('Start')).toBeInTheDocument();

    rerender(<Toggle label="End" labelPosition="end" />);
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Toggle disabled id="toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders error state', () => {
    render(<Toggle error="Invalid setting" />);
    expect(screen.getByText('Invalid setting')).toBeInTheDocument();
  });
});

describe('Badge Components', () => {
  describe('Badge', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const { rerender } = render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText('Success').closest('span[role="status"]')).toHaveClass(
        'bg-green-100',
      );

      rerender(<Badge variant="danger">Danger</Badge>);
      expect(screen.getByText('Danger').closest('span[role="status"]')).toHaveClass('bg-red-100');
    });

    it('renders with dot indicator', () => {
      render(<Badge dot>Dotted</Badge>);
      expect(screen.getByText('Dotted')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      render(<Badge icon={<span>★</span>}>Starred</Badge>);
      expect(screen.getByText('★')).toBeInTheDocument();
    });
  });

  describe('DotBadge', () => {
    it('renders dot badge', () => {
      render(<DotBadge />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('CountBadge', () => {
    it('renders count badge', () => {
      render(<CountBadge count={5} />);
      expect(screen.getByRole('status')).toHaveTextContent('5');
    });

    it('caps count at maxCount', () => {
      render(<CountBadge count={150} maxCount={99} />);
      expect(screen.getByRole('status')).toHaveTextContent('99+');
    });

    it('does not render when count is 0 and showZero is false', () => {
      const { container } = render(<CountBadge count={0} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders 0 when showZero is true', () => {
      render(<CountBadge count={0} showZero />);
      expect(screen.getByRole('status')).toHaveTextContent('0');
    });
  });
});

describe('LoadingSpinner Component', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with different sizes per design specs', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('h-4');

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole('status')).toHaveClass('h-8');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('h-12');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole('status')).toHaveClass('h-16');
  });

  it('renders with different colors per design specs', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    expect(screen.getByRole('status')).toHaveClass('border-primary-500');

    rerender(<LoadingSpinner color="secondary" />);
    expect(screen.getByRole('status')).toHaveClass('border-indigo-500');

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByRole('status')).toHaveClass('border-white');
  });

  it('renders fullscreen variant', () => {
    render(<LoadingSpinner fullScreen />);
    expect(screen.getByRole('progressbar')).toHaveClass('fixed');
  });
});

describe('Alert Component', () => {
  it('renders alert with message', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('renders with title', () => {
    render(<Alert title="Warning">Warning message</Alert>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('calls onClose when dismiss button clicked', async () => {
    const handleClose = vi.fn();
    render(
      <Alert onClose={handleClose} dismissible>
        Dismissible
      </Alert>,
    );

    const closeButton = screen.getByLabelText('Dismiss alert');
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Toast Component', () => {
  it('renders toast with message', () => {
    render(<Toast id="1" message="Toast message" />);
    expect(screen.getByText('Toast message')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Toast id="1" variant="success" message="Success message" />);
    expect(screen.getByRole('alert')).toHaveClass('border-l-4 border-green-500');

    rerender(<Toast id="1" variant="error" message="Error message" />);
    expect(screen.getByRole('alert')).toHaveClass('border-l-4 border-red-500');
  });

  it('renders with action button', async () => {
    const handleAction = vi.fn();
    render(<Toast id="1" message="Message" action={{ label: 'Undo', onClick: handleAction }} />);

    const actionButton = screen.getByText('Undo');
    await userEvent.click(actionButton);

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('dismisses on close button click', async () => {
    const handleClose = vi.fn();
    render(<Toast id="1" message="Message" onClose={handleClose} />);

    const closeButton = screen.getByLabelText('Close notification');
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledWith('1');
    });
  });
});

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  it('renders modal when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    const closeButton = screen.getByLabelText('Close modal');
    await userEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', async () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    const overlay = screen.getByRole('dialog').firstChild as HTMLElement;
    await userEvent.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders with footer', () => {
    render(<Modal {...defaultProps} footer={<button>Footer Action</button>} />);
    expect(screen.getByText('Footer Action')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<Modal {...defaultProps} size="sm" />);
    const modalContent = container.querySelector('.rounded-lg.shadow-xl');
    expect(modalContent).toHaveClass('max-w-md');

    rerender(<Modal {...defaultProps} size="full" />);
    const modalContent2 = container.querySelector('.rounded-lg.shadow-xl');
    expect(modalContent2).toHaveClass('max-w-full');
  });
});

describe('Accessibility', () => {
  it('Button has proper ARIA attributes', () => {
    render(
      <Button isLoading aria-label="Loading data">
        Loading
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Loading data');
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('Input has proper ARIA attributes', () => {
    render(<Input label="Email" error="Invalid email" id="email" aria-describedby="email-help" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('Select has proper ARIA attributes', () => {
    render(<Select options={[]} label="Choose option" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('Toggle has proper ARIA attributes', () => {
    render(<Toggle checked aria-label="Dark mode" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Dark mode');
  });
});
