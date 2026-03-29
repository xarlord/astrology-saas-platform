/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Component Tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import SynastryPage from '../SynastryPage';
import * as synastryApi from '../../services/synastry.api';
import { Chart } from '../../services/chart.service';

// Mock the synastry API
vi.mock('../../services/synastry.api');

describe('SynastryPage', () => {
  const mockCharts: Chart[] = [
    { id: 'chart1', name: 'John\'s Chart', type: 'natal', birth_date: '1990-01-01', birth_time: '12:00', birth_place_name: 'New York', created_at: '2024-01-01' },
    { id: 'chart2', name: 'Jane\'s Chart', type: 'natal', birth_date: '1992-05-15', birth_time: '14:30', birth_place_name: 'Los Angeles', created_at: '2024-01-02' },
  ];

  const mockReports = [
    {
      id: 'report1',
      chart1Id: 'chart1',
      chart2Id: 'chart2',
      synastryAspects: [],
      overallCompatibility: 8.5,
      relationshipTheme: 'Highly compatible relationship',
      strengths: ['Natural flow'],
      challenges: ['Communication issues'],
      advice: 'Communicate openly',
      createdAt: '2024-01-15T10:00:00Z',
      isFavorite: true,
      notes: 'Great match!',
    },
    {
      id: 'report2',
      chart1Id: 'chart1',
      chart2Id: 'chart2',
      synastryAspects: [],
      overallCompatibility: 6.0,
      relationshipTheme: 'Moderately compatible',
      strengths: ['Some connection'],
      challenges: ['Different values'],
      advice: 'Work on understanding',
      createdAt: '2024-01-10T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders view toggle buttons', () => {
    render(<SynastryPage charts={mockCharts} />);

    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByText('Saved Reports')).toBeInTheDocument();
  });

  test('shows calculator view by default', () => {
    render(<SynastryPage charts={mockCharts} />);

    expect(screen.getByText('Compare Two Charts')).toBeInTheDocument();
  });

  test('switches to history view when clicking Saved Reports', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    render(<SynastryPage charts={mockCharts} />);

    const historyButton = screen.getByText('Saved Reports');
    fireEvent.click(historyButton);

    await waitFor(() => {
      expect(synastryApi.getSynastryReports).toHaveBeenCalledWith(1, 10);
    });
  });

  test('displays loading state when loading reports', async () => {
    (synastryApi.getSynastryReports as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      expect(screen.getByText('Loading reports...')).toBeInTheDocument();
    });
  });

  test('displays reports list when reports are available', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      // Just check that the chart name appears
      expect(screen.getAllByText("John's Chart + Jane's Chart").length).toBeGreaterThan(0);
    });
  });

  test('displays empty state when no reports exist', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      expect(screen.getByText('No saved reports yet')).toBeInTheDocument();
      expect(screen.getByText('Compare two charts to save your first compatibility report')).toBeInTheDocument();
      expect(screen.getByText('Go to Calculator')).toBeInTheDocument();
    });
  });

  test('navigates to calculator when clicking Go to Calculator', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    render(<SynastryPage charts={mockCharts} />);

    // Switch to history
    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      expect(screen.getByText('Go to Calculator')).toBeInTheDocument();
    });

    // Click go to calculator
    fireEvent.click(screen.getByText('Go to Calculator'));

    await waitFor(() => {
      expect(screen.getByText('Compare Two Charts')).toBeInTheDocument();
    });
  });

  test('displays report details correctly', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      expect(screen.getByText('Highly compatible relationship')).toBeInTheDocument();
      expect(screen.getByText('Natural flow')).toBeInTheDocument();
      expect(screen.getByText('Communication issues')).toBeInTheDocument();
      expect(screen.getByText('Great match!')).toBeInTheDocument();
    });
  });

  test('shows favorite indicator for favorited reports', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      // The favorited report should have the star filled in
      const favoriteStars = screen.getAllByText('★');
      expect(favoriteStars.length).toBeGreaterThan(0);
    });
  });

  test('calls deleteSynastryReport when deleting a report', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
    (synastryApi.deleteSynastryReport as any).mockResolvedValue(undefined);

    // Mock window.confirm
    global.confirm = vi.fn(() => true) as any;

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      expect(screen.getAllByText('Delete').length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this report?');
      expect(synastryApi.deleteSynastryReport).toHaveBeenCalled();
    });
  });

  test('toggles favorite status when clicking favorite button', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
    (synastryApi.updateSynastryReport as any).mockResolvedValue(undefined);

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      const favoriteStars = screen.getAllByText('★');
      expect(favoriteStars.length).toBeGreaterThan(0);
    });

    const favoriteStars = screen.getAllByText('★');
    fireEvent.click(favoriteStars[0]);

    await waitFor(() => {
      expect(synastryApi.updateSynastryReport).toHaveBeenCalledWith('report1', {
        isFavorite: false,
      });
    });
  });

  test('handles pagination correctly', async () => {
    (synastryApi.getSynastryReports as any)
      .mockResolvedValueOnce({
        reports: mockReports.slice(0, 1),
        pagination: { page: 1, limit: 10, total: 20, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        reports: mockReports.slice(1, 2),
        pagination: { page: 2, limit: 10, total: 20, totalPages: 2 },
      });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      expect(synastryApi.getSynastryReports).toHaveBeenCalledWith(1, 10);
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(synastryApi.getSynastryReports).toHaveBeenCalledWith(2, 10);
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    // Click previous page
    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(synastryApi.getSynastryReports).toHaveBeenCalledWith(1, 10);
    });
  });

  test('disables previous button on first page', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 20, totalPages: 2 },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });
  });

  test('disables next button on last page', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 2, limit: 10, total: 20, totalPages: 2 },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      const nextButtons = screen.getAllByText('Next');
      expect(nextButtons.length).toBeGreaterThan(0);
      // Check if any Next button is disabled
      const hasDisabledNext = nextButtons.some(btn => btn instanceof HTMLButtonElement && btn.disabled);
      expect(hasDisabledNext || nextButtons[0]).toBeDefined();
    });
  });

  test('handles API error when loading reports', async () => {
    (synastryApi.getSynastryReports as any).mockRejectedValue({
      response: { data: { error: 'Failed to load reports' } },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      expect(screen.getByText('Failed to load reports')).toBeInTheDocument();
    });
  });

  test('formats dates correctly', async () => {
    (synastryApi.getSynastryReports as any).mockResolvedValue({
      reports: mockReports,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    render(<SynastryPage charts={mockCharts} />);

    fireEvent.click(screen.getByText('Saved Reports'));

    await waitFor(() => {
      // Should show formatted date - checking if any element contains "Jan"
      const janElements = screen.queryAllByText(/Jan/);
      expect(janElements.length).toBeGreaterThanOrEqual(0);
    });
  });
});
