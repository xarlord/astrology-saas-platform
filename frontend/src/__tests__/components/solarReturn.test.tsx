/**
 * Solar Return Components Tests
 * Testing suite for all solar return components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SolarReturnDashboard } from '../../components/SolarReturnDashboard';
import { SolarReturnChart } from '../../components/SolarReturnChart';
import { SolarReturnInterpretation } from '../../components/SolarReturnInterpretation';
import { RelocationCalculator } from '../../components/RelocationCalculator';
import { BirthdaySharing } from '../../components/BirthdaySharing';
import * as axios from 'axios';

// Mock axios
vi.mock('axios');

const mockSolarReturns = [
  {
    id: 'sr-1',
    year: 2026,
    returnDate: '2026-01-15T10:30:00Z',
    returnLocation: {
      name: 'New York, USA',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
    },
    interpretation: {
      themes: ['Personal empowerment', 'New beginnings'],
      keywords: ['new', 'growth', 'transformation'],
    },
    isRelocated: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sr-2',
    year: 2025,
    returnDate: '2025-01-14T14:22:00Z',
    returnLocation: {
      name: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
    },
    interpretation: {
      themes: ['Financial growth', 'Building wealth'],
      keywords: ['money', 'security', 'values'],
    },
    isRelocated: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

const mockChartData = {
  planets: [
    {
      planet: 'sun',
      sign: 'capricorn',
      degree: 15,
      minute: 30,
      house: 10,
      retrograde: false,
    },
    {
      planet: 'moon',
      sign: 'taurus',
      degree: 10,
      minute: 15,
      house: 2,
      retrograde: false,
    },
  ],
  houses: [
    { house: 1, sign: 'aries', degree: 10, minute: 30 },
    { house: 2, sign: 'taurus', degree: 15, minute: 0 },
  ],
  aspects: [
    {
      planet1: 'sun',
      planet2: 'jupiter',
      type: 'trine',
      orb: 5,
      applying: true,
    },
  ],
  ascendant: { sign: 'aries', degree: 10, minute: 30 },
  mc: { sign: 'capricorn', degree: 15, minute: 0 },
  moonPhase: { phase: 'full', illumination: 98 },
};

const mockInterpretation = {
  themes: ['Personal empowerment', 'New beginnings', 'Leadership'],
  sunHouse: {
    house: 1,
    interpretation: 'This year marks a powerful new beginning...',
    focus: ['Self-discovery', 'Personal identity'],
  },
  moonPhase: {
    phase: 'full',
    interpretation: 'Your emotions are illuminated...',
    energy: 'Culminating, illuminating',
    advice: ['Celebrate achievements', 'Release what no longer serves'],
  },
  luckyDays: [
    {
      date: '2026-03-15',
      reason: 'Jupiter trine - favorable day',
      intensity: 9,
    },
    {
      date: '2026-07-22',
      reason: 'Venus sextile - harmonious day',
      intensity: 7,
    },
  ],
  challenges: [
    {
      area: 'Self-Expression',
      description: 'You may feel heavier or restricted',
      advice: 'Take on responsibilities',
    },
  ],
  opportunities: [
    {
      area: 'Personal Growth',
      description: 'Expansion through learning',
      timing: 'Best during latter half',
    },
  ],
  advice: [
    'Focus on self-development',
    'Start new projects',
    'Build confidence',
  ],
  keywords: ['new', 'growth', 'transformation', 'empowerment'],
};

describe('SolarReturnDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (axios.get as any).mockResolvedValue({
      data: { data: [] },
    });

    render(<SolarReturnDashboard />);

    expect(screen.getByText(/loading your solar returns/i)).toBeInTheDocument();
  });

  it('renders solar returns after loading', async () => {
    (axios.get as any).mockResolvedValue({
      data: { data: mockSolarReturns },
    });

    render(<SolarReturnDashboard />);

    await waitFor(() => {
      expect(screen.getByText('2026')).toBeInTheDocument();
      expect(screen.getByText('2025')).toBeInTheDocument();
    });
  });

  it('displays empty state when no returns', async () => {
    (axios.get as any).mockResolvedValue({
      data: { data: [] },
    });

    render(<SolarReturnDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/no solar returns yet/i)).toBeInTheDocument();
      expect(screen.getByText(/calculate your first solar return/i)).toBeInTheDocument();
    });
  });

  it('filters relocated returns', async () => {
    (axios.get as any).mockResolvedValue({
      data: { data: mockSolarReturns },
    });

    render(<SolarReturnDashboard />);

    await waitFor(() => {
      const relocatedButton = screen.getByText('Relocated Only');
      fireEvent.click(relocatedButton);
    });

    await waitFor(() => {
      expect(screen.getByText('London, UK')).toBeInTheDocument();
      expect(screen.queryByText('New York, USA')).not.toBeInTheDocument();
    });
  });

  it('calculates new solar return', async () => {
    (axios.get as any).mockResolvedValue({
      data: { data: [{ id: 'chart-1', name: 'Natal Chart' }] },
    });

    (axios.post as any).mockResolvedValue({
      data: { data: mockSolarReturns[0] },
    });

    render(<SolarReturnDashboard onSelectYear={vi.fn()} />);

    await waitFor(() => {
      const calculateButton = screen.getByText(/calculate current year/i);
      fireEvent.click(calculateButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it('sorts returns by year and date', async () => {
    (axios.get as any).mockResolvedValue({
      data: { data: mockSolarReturns },
    });

    render(<SolarReturnDashboard />);

    await waitFor(() => {
      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'date' } });
    });
  });
});

describe('SolarReturnChart', () => {
  it('renders chart canvas', () => {
    render(
      <SolarReturnChart
        chartData={mockChartData}
        year={2026}
        location="New York"
      />
    );

    expect(screen.getByText(/solar return chart for 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/new york/i)).toBeInTheDocument();
  });

  it('displays zoom controls', () => {
    render(
      <SolarReturnChart
        chartData={mockChartData}
        year={2026}
      />
    );

    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
  });

  it('handles zoom in/out', () => {
    render(
      <SolarReturnChart
        chartData={mockChartData}
        year={2026}
      />
    );

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });

    fireEvent.click(zoomInButton);
    expect(screen.getByText(/110%/i)).toBeInTheDocument();

    fireEvent.click(zoomOutButton);
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it('displays planet legend', () => {
    render(
      <SolarReturnChart
        chartData={mockChartData}
        year={2026}
        showAspects={true}
      />
    );

    expect(screen.getByText(/sun/i)).toBeInTheDocument();
    expect(screen.getByText(/moon/i)).toBeInTheDocument();
    expect(screen.getByText(/aspects/i)).toBeInTheDocument();
  });
});

describe('SolarReturnInterpretation', () => {
  it('renders sun house interpretation', () => {
    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
      />
    );

    expect(screen.getByText(/sun in first house/i)).toBeInTheDocument();
    expect(screen.getByText(/personal empowerment/i)).toBeInTheDocument();
  });

  it('displays moon phase', () => {
    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
      />
    );

    expect(screen.getByText(/moon phase: full/i)).toBeInTheDocument();
    expect(screen.getByText(/culminating/i)).toBeInTheDocument();
  });

  it('shows lucky days', () => {
    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
      />
    );

    expect(screen.getByText(/lucky days/i)).toBeInTheDocument();
    expect(screen.getByText(/jupiter trine/i)).toBeInTheDocument();
    expect(screen.getByText(/venus sextile/i)).toBeInTheDocument();
  });

  it('displays challenges and opportunities', () => {
    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
      />
    );

    expect(screen.getByText(/challenges & growth opportunities/i)).toBeInTheDocument();
    expect(screen.getByText(/opportunities/i)).toBeInTheDocument();
  });

  it('shows advice list', () => {
    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
      />
    );

    expect(screen.getByText(/your advice for 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/focus on self-development/i)).toBeInTheDocument();
  });

  it('displays keywords cloud', () => {
    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
      />
    );

    expect(screen.getByText(/keywords for 2026/i)).toBeInTheDocument();
    mockInterpretation.keywords.forEach(keyword => {
      expect(screen.getByText(keyword)).toBeInTheDocument();
    });
  });

  it('handles download action', () => {
    const onDownload = vi.fn();

    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
        onDownload={onDownload}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(downloadButton);

    expect(onDownload).toHaveBeenCalled();
  });

  it('handles share action', () => {
    const onShare = vi.fn();

    render(
      <SolarReturnInterpretation
        interpretation={mockInterpretation}
        year={2026}
        returnDate="2026-01-15T10:30:00Z"
        onShare={onShare}
      />
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    expect(onShare).toHaveBeenCalled();
  });
});

describe('RelocationCalculator', () => {
  it('renders popular locations', () => {
    render(
      <RelocationCalculator
        natalChartId="chart-1"
        year={2026}
        onRecalculate={vi.fn()}
      />
    );

    expect(screen.getByText(/choose a location/i)).toBeInTheDocument();
    expect(screen.getByText(/popular locations/i)).toBeInTheDocument();
    expect(screen.getByText(/new york, usa/i)).toBeInTheDocument();
    expect(screen.getByText(/london, uk/i)).toBeInTheDocument();
  });

  it('handles location selection', async () => {
    const onRecalculate = vi.fn().mockResolvedValue({
      id: 'sr-relocated',
      year: 2026,
      returnDate: '2026-01-15T14:22:00Z',
      calculatedData: mockChartData,
      interpretation: mockInterpretation,
    });

    render(
      <RelocationCalculator
        natalChartId="chart-1"
        year={2026}
        onRecalculate={onRecalculate}
      />
    );

    const locationButton = screen.getByText(/new york, usa/i);
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(onRecalculate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New York, USA',
          latitude: 40.7128,
          longitude: -74.0060,
        })
      );
    });
  });

  it('shows comparison view after calculation', async () => {
    const onRecalculate = vi.fn().mockResolvedValue({
      id: 'sr-relocated',
      year: 2026,
      returnDate: '2026-01-15T14:22:00Z',
      calculatedData: mockChartData,
      interpretation: mockInterpretation,
    });

    render(
      <RelocationCalculator
        natalChartId="chart-1"
        year={2026}
        onRecalculate={onRecalculate}
      />
    );

    const locationButton = screen.getByText(/new york, usa/i);
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText(/relocation comparison/i)).toBeInTheDocument();
    });
  });

  it('handles manual coordinate entry', () => {
    render(
      <RelocationCalculator
        natalChartId="chart-1"
        year={2026}
        onRecalculate={vi.fn()}
      />
    );

    const details = screen.getByText(/enter coordinates manually/i);
    fireEvent.click(details);

    expect(screen.getByLabelText(/location name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
  });
});

describe('BirthdaySharing', () => {
  const mockSolarReturn = {
    id: 'sr-1',
    year: 2026,
    returnDate: '2026-01-15T10:30:00Z',
    interpretation: mockInterpretation,
  };

  it('renders sharing preview', () => {
    render(
      <BirthdaySharing
        solarReturn={mockSolarReturn}
      />
    );

    expect(screen.getByText(/share as gift/i)).toBeInTheDocument();
    expect(screen.getByText(/solar return reading for 2026/i)).toBeInTheDocument();
  });

  it('switches between link and email sharing', () => {
    render(
      <BirthdaySharing
        solarReturn={mockSolarReturn}
      />
    );

    const linkTab = screen.getByRole('button', { name: /share link/i });
    const emailTab = screen.getByRole('button', { name: /send email/i });

    expect(linkTab).toHaveClass('active');
    expect(emailTab).not.toHaveClass('active');

    fireEvent.click(emailTab);

    expect(emailTab).toHaveClass('active');
    expect(linkTab).not.toHaveClass('active');
  });

  it('generates share link', async () => {
    (axios.post as any).mockResolvedValue({
      data: { data: { url: 'https://example.com/share/abc123' } },
    });

    render(
      <BirthdaySharing
        solarReturn={mockSolarReturn}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate link/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/your share link/i)).toBeInTheDocument();
    });
  });

  it('copies link to clipboard', async () => {
    (axios.post as any).mockResolvedValue({
      data: { data: { url: 'https://example.com/share/abc123' } },
    });

    // Mock navigator.clipboard
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(
      <BirthdaySharing
        solarReturn={mockSolarReturn}
      />
    );

    // First generate link
    const generateButton = screen.getByRole('button', { name: /generate link/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/share/abc123');
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });

  it('sends email sharing', async () => {
    (axios.post as any).mockResolvedValue({
      data: { success: true },
    });

    render(
      <BirthdaySharing
        solarReturn={mockSolarReturn}
        recipientEmail="friend@example.com"
      />
    );

    // Switch to email tab
    const emailTab = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(emailTab);

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /send email/i });
      expect(sendButton).toBeDisabled(); // Disabled because email is pre-filled

      // Change email to trigger validation
      const emailInput = screen.getByLabelText(/recipient email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });
  });
});
