/**
 * Tabs Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tabs, TabList, Tab, TabPanel, TabPanels } from '../Tabs';

describe('Tabs Component', () => {
  describe('Uncontrolled Mode', () => {
    it('renders tabs correctly', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
        </Tabs>
      );

      // Use getAllByRole since there's a tablist inside TabList
      const tablists = screen.getAllByRole('tablist');
      expect(tablists.length).toBeGreaterThan(0);
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    });

    it('selects tab on click', async () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(screen.getByText('Panel 1')).toBeInTheDocument();
      expect(screen.queryByText('Panel 2')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));

      await waitFor(() => {
        expect(screen.getByText('Panel 2')).toBeInTheDocument();
        expect(screen.queryByText('Panel 1')).not.toBeInTheDocument();
      });
    });

    it('sets default selected tab', () => {
      render(
        <Tabs defaultValue="tab2">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Panel 2')).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('responds to value prop changes', () => {
      const { rerender } = render(
        <Tabs value="tab1" onChange={() => {}}>
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Panel 1')).toBeInTheDocument();

      rerender(
        <Tabs value="tab2" onChange={() => {}}>
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Panel 2')).toBeInTheDocument();
    });

    it('calls onChange when tab is clicked', async () => {
      const handleChange = vi.fn();
      render(
        <Tabs value="tab1" onChange={handleChange}>
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
        </Tabs>
      );

      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
      expect(handleChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('activates tab on Enter key', async () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.focus(tab2);
      fireEvent.keyDown(tab2, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Panel 2')).toBeInTheDocument();
      });
    });

    it('activates tab on Space key', async () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.focus(tab2);
      fireEvent.keyDown(tab2, { key: ' ' });

      await waitFor(() => {
        expect(screen.getByText('Panel 2')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('renders disabled tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2" disabled>
              Tab 2
            </Tab>
          </TabList>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('aria-disabled', 'true');
      expect(tab2).toBeDisabled();
    });

    it('does not change selection when disabled tab is clicked', async () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2" disabled>
              Tab 2
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.getByText('Panel 1')).toBeInTheDocument();
      expect(screen.queryByText('Panel 2')).not.toBeInTheDocument();
    });
  });

  describe('Orientation', () => {
    it('has horizontal tabs by default', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
        </Tabs>
      );

      // TabList has role="tablist" internally
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('renders vertical tabs', () => {
      render(
        <Tabs defaultValue="tab1" orientation="vertical">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
        </Tabs>
      );

      // Container has aria-orientation
      const tablist = screen.getByRole('tablist');
      const container = tablist.parentElement;
      expect(container).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Tab with Icon', () => {
    it('renders tab with icon', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1" icon={<span data-testid="icon">Icon</span>}>
              Tab 1
            </Tab>
          </TabList>
        </Tabs>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('TabPanel', () => {
    it('shows active panel content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      // Active panel should be visible
      expect(screen.getByText('Panel 1')).toBeInTheDocument();
    });

    it('hides inactive panel content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
            <Tab value="tab2">Tab 2</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel 1</TabPanel>
            <TabPanel value="tab2">Panel 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      // Inactive panel should not be visible
      expect(screen.queryByText('Panel 2')).not.toBeInTheDocument();
    });
  });
});
