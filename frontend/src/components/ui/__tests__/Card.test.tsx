/**
 * Card Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Card } from '../Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-white');
    });

    it('renders with glass variant', () => {
      render(
        <Card variant="glass" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('backdrop-blur-lg');
    });

    it('renders with elevated variant', () => {
      render(
        <Card variant="elevated" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-lg');
    });
  });

  describe('Padding', () => {
    it('applies no padding', () => {
      render(
        <Card padding="none" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('p-3');
      expect(card).not.toHaveClass('p-4');
    });

    it('applies small padding', () => {
      render(
        <Card padding="sm" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-3');
    });

    it('applies medium padding by default', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-4');
    });

    it('applies large padding', () => {
      render(
        <Card padding="lg" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Subcomponents', () => {
    it('renders Card.Header', () => {
      render(
        <Card>
          <Card.Header>Header content</Card.Header>
        </Card>
      );
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('renders Card.Body', () => {
      render(
        <Card>
          <Card.Body>Body content</Card.Body>
        </Card>
      );
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('renders Card.Footer', () => {
      render(
        <Card>
          <Card.Footer>Footer content</Card.Footer>
        </Card>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders Card.Header with border', () => {
      render(
        <Card>
          <Card.Header bordered data-testid="header">Header content</Card.Header>
        </Card>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('border-b');
    });

    it('renders Card.Footer with left alignment', () => {
      render(
        <Card>
          <Card.Footer align="left" data-testid="footer">Footer</Card.Footer>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-start');
    });

    it('renders Card.Footer with center alignment', () => {
      render(
        <Card>
          <Card.Footer align="center" data-testid="footer">Footer</Card.Footer>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-center');
    });

    it('renders Card.Footer with right alignment', () => {
      render(
        <Card>
          <Card.Footer align="right" data-testid="footer">Footer</Card.Footer>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-end');
    });

    it('renders Card.Footer with between alignment', () => {
      render(
        <Card>
          <Card.Footer align="between" data-testid="footer">Footer</Card.Footer>
        </Card>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-between');
    });
  });

  describe('Interactivity', () => {
    it('renders hoverable card', () => {
      render(
        <Card hoverable data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('renders clickable card', async () => {
      const handleClick = vi.fn();
      render(
        <Card clickable onClick={handleClick} data-testid="card">
          Content
        </Card>
      );

      await userEvent.click(screen.getByTestId('card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });
  });
});
