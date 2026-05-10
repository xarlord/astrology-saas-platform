/**
 * Tests for PlanetDeepDiveCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlanetDeepDiveCard } from '../PlanetDeepDiveCard';
import type { PlanetInfo } from '../PlanetDeepDiveCard';

const mockPlanet: PlanetInfo = {
  name: 'Venus',
  symbol: '♀',
  degree: 78,
  minute: 15,
  sign: 'Gemini',
  house: 7,
  element: 'air',
  retrograde: false,
  aspects: [
    { planet: 'Mars', type: 'square', orb: 2.5, harmonious: false },
    { planet: 'Jupiter', type: 'trine', orb: 0.8, harmonious: true },
  ],
};

describe('PlanetDeepDiveCard', () => {
  it('does not render when closed', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('deep-dive-card')).not.toBeInTheDocument();
  });

  it('renders planet info when open', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId('deep-dive-card')).toBeInTheDocument();
    expect(screen.getByText('Venus')).toBeInTheDocument();
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('shows planet symbol', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('♀')).toBeInTheDocument();
  });

  it('shows house and degree info', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText(/78°15'/)).toBeInTheDocument();
  });

  it('shows direct motion for non-retrograde planets', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Direct')).toBeInTheDocument();
  });

  it('shows retrograde motion', () => {
    const retroPlanet = { ...mockPlanet, retrograde: true };
    render(
      <PlanetDeepDiveCard
        planet={retroPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Retrograde/)).toBeInTheDocument();
  });

  it('lists planet aspects', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/square Mars/)).toBeInTheDocument();
    expect(screen.getByText(/trine Jupiter/)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTestId('deep-dive-close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTestId('deep-dive-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows AI interpretation button', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    const btn = screen.getByTestId('get-interpretation-btn');
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toContain('AI Interpretation');
  });

  it('loads AI interpretation on button click', async () => {
    const onGetInterpretation = vi.fn().mockResolvedValue('Venus in Gemini brings charm!');
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
        onGetInterpretation={onGetInterpretation}
      />,
    );
    fireEvent.click(screen.getByTestId('get-interpretation-btn'));

    await waitFor(() => {
      expect(onGetInterpretation).toHaveBeenCalledWith('Venus');
    });

    await waitFor(() => {
      expect(screen.getByText(/Venus in Gemini brings charm/)).toBeInTheDocument();
    });
  });

  it('shows element-themed background', () => {
    render(
      <PlanetDeepDiveCard
        planet={mockPlanet}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    const card = screen.getByTestId('deep-dive-card');
    // Air element should have blue gradient classes
    expect(card.className).toContain('from-blue-900');
  });
});
