/**
 * Dropdown Component Tests
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Dropdown } from '../Dropdown';

// MoreIcon component for testing
const MoreIcon = () => (
  <svg data-testid="more-icon" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
);

describe('Dropdown Component', () => {
  describe('Rendering', () => {
    it('renders trigger button', () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
        </Dropdown>
      );

      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    });

    it('does not show menu initially', () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Opening/Closing', () => {
    it('opens menu on trigger click', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('closes menu on outside click', async () => {
      render(
        <div>
          <Dropdown>
            <Dropdown.Trigger>
              <button>Menu</button>
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item>Item 1</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <button>Outside</button>
        </div>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('closes menu on Escape key', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('calls onOpenChange callback', async () => {
      const handleOpenChange = vi.fn();

      render(
        <Dropdown onOpenChange={handleOpenChange}>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Menu Items', () => {
    it('renders menu items', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Item>Item 2</Dropdown.Item>
            <Dropdown.Item>Item 3</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Item 2' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Item 3' })).toBeInTheDocument();
      });
    });

    it('closes menu after item click', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('menuitem', { name: 'Item 1' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('calls onClick handler on item click', async () => {
      const handleItemClick = vi.fn();

      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleItemClick}>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('menuitem', { name: 'Item 1' }));

      expect(handleItemClick).toHaveBeenCalledTimes(1);
    });

    it('renders item with icon', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item icon={<MoreIcon />}>Item with Icon</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByTestId('more-icon')).toBeInTheDocument();
      });
    });

    it('renders disabled item', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item disabled>Disabled Item</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        const item = screen.getByRole('menuitem', { name: 'Disabled Item' });
        expect(item).toBeDisabled();
      });
    });

    it('renders danger item', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item danger>Delete</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        const item = screen.getByRole('menuitem', { name: 'Delete' });
        expect(item).toHaveClass('text-red-600');
      });
    });
  });

  describe('Divider', () => {
    it('renders divider', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Item 2</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('separator')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates items with arrow keys', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Item>Item 2</Dropdown.Item>
            <Dropdown.Item>Item 3</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'ArrowDown' });

      // First item should be focused
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Item 1' })).toHaveFocus();
      });
    });

    it('closes menu on Tab key', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'Tab' });

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Alignment', () => {
    it('aligns menu to left by default', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toHaveClass('left-0');
      });
    });

    it('aligns menu to right when specified', async () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>
            <button>Menu</button>
          </Dropdown.Trigger>
          <Dropdown.Menu align="right">
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toHaveClass('right-0');
      });
    });
  });
});
