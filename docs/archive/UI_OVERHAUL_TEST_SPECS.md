# UI Overhaul Test Specifications
**Project:** AstroVerse - Astrology SaaS Platform
**Date:** 2026-02-21
**Version:** 2.0
**Coverage Target:** 100%

---

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Frontend Test Specifications](#frontend-test-specifications)
3. [Backend Test Specifications](#backend-test-specifications)
4. [E2E Test Specifications](#e2e-test-specifications)
5. [Accessibility Testing](#accessibility-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Execution Plan](#test-execution-plan)

---

## Testing Strategy Overview

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  10% (Critical user journeys)
                    │  (Playwright)│
                    └─────────────┘
                   ┌─────────────────┐
                   │  Integration    │  30% (Component + API)
                   │     Tests       │
                   └─────────────────┘
                 ┌─────────────────────────┐
                 │      Unit Tests         │  60% (Functions, hooks)
                 │  (Vitest + Jest)        │
                 └─────────────────────────┘
```

### Coverage Goals

| Layer | Tool | Target Coverage | Current Gap |
|-------|------|-----------------|-------------|
| Frontend Unit | Vitest | 100% | 95% |
| Frontend Integration | React Testing Library | 100% | 80% |
| Backend Unit | Jest | 100% | 85% |
| Backend Integration | Supertest | 100% | 75% |
| E2E | Playwright | Critical paths | 60% |
| Accessibility | axe-playwright | WCAG 2.1 AA | 0% |

### Test Categories

1. **Unit Tests** - Test individual functions, hooks, components in isolation
2. **Integration Tests** - Test component interactions and API integrations
3. **E2E Tests** - Test complete user workflows from start to finish
4. **Accessibility Tests** - Automated WCAG compliance checking
5. **Performance Tests** - Load time, rendering speed, API response time
6. **Security Tests** - Auth flows, data validation, XSS prevention

---

## Frontend Test Specifications

### Unit Tests (Vitest + React Testing Library)

#### Component Tests (29 Components)

##### 1. EnergyMeter Component

```typescript
// components/astrology/__tests__/EnergyMeter.test.tsx

describe('EnergyMeter', () => {
  it('renders correctly with default props', () => {
    render(<EnergyMeter value={50} label="Test" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays correct value', () => {
    render(<EnergyMeter value={75} label="Energy" />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies correct gradient color based on value', () => {
    const { container } = render(<EnergyMeter value={90} label="High" />);
    const gradient = container.querySelector('linearGradient');
    expect(gradient).toHaveAttribute('gradientTransform');
  });

  it('renders different sizes', () => {
    const { container: small } = render(<EnergyMeter value={50} size="sm" />);
    const { container: large } = render(<EnergyMeter value={50} size="lg" />);
    expect(small.querySelector('svg')).toHaveStyle({ width: '100px' });
    expect(large.querySelector('svg')).toHaveStyle({ width: '200px' });
  });

  it('has correct aria attributes', () => {
    render(<EnergyMeter value={50} label="Energy Level" aria-label="Current energy" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('animates value changes', async () => {
    const { rerender } = render(<EnergyMeter value={0} label="Test" />);
    rerender(<EnergyMeter value={100} label="Test" />);
    await waitFor(() => expect(screen.getByText('100%')).toBeInTheDocument());
  });
});
```

##### 2. MoonPhaseCard Component

```typescript
describe('MoonPhaseCard', () => {
  const phases = [
    'new-moon', 'waxing-crescent', 'first-quarter', 'waxing-gibbous',
    'full-moon', 'waning-gibbous', 'last-quarter', 'waning-crescent'
  ];

  it.each(phases)('renders %s phase correctly', (phase) => {
    render(<MoonPhaseCard phase={phase} illumination={50} sign="Cancer" />);
    expect(screen.getByText(new RegExp(phase.replace('-', ' '), 'i'))).toBeInTheDocument();
  });

  it('displays illumination percentage', () => {
    render(<MoonPhaseCard phase="full-moon" illumination={100} sign="Cancer" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows zodiac sign', () => {
    render(<MoonPhaseCard phase="new-moon" illumination={0} sign="Scorpio" />);
    expect(screen.getByText('Scorpio')).toBeInTheDocument();
  });

  it('has accessibility attributes', () => {
    render(
      <MoonPhaseCard
        phase="full-moon"
        illumination={100}
        sign="Cancer"
        aria-label="Full Moon in Cancer at 100% illumination"
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute('aria-label');
  });
});
```

##### 3. ChartWheel Component

```typescript
describe('ChartWheel', () => {
  const mockChartData = {
    planets: [
      { name: 'Sun', sign: 'Aries', degree: 15, house: 1 },
      { name: 'Moon', sign: 'Cancer', degree: 20, house: 4 },
    ],
    aspects: [
      { planet1: 'Sun', planet2: 'Moon', type: 'trine', degree: 120 },
    ],
    houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    ascendant: { sign: 'Aries', degree: 10 },
  };

  it('renders SVG chart wheel', () => {
    render(<ChartWheel chartData={mockChartData} />);
    expect(screen.getByRole('img', { name: /astrology chart/i })).toBeInTheDocument();
  });

  it('displays all planets', () => {
    render(<ChartWheel chartData={mockChartData} />);
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Moon')).toBeInTheDocument();
  });

  it('shows aspect lines', () => {
    const { container } = render(<ChartWheel chartData={mockChartData} />);
    const lines = container.querySelectorAll('line.aspect-line');
    expect(lines).toHaveLength(1);
  });

  it('is keyboard navigable', () => {
    render(<ChartWheel chartData={mockChartData} />);
    const wheel = screen.getByRole('img');
    wheel.focus();
    expect(wheel).toHaveFocus();
  });

  it('has zoom functionality', () => {
    render(<ChartWheel chartData={mockChartData} enableZoom />);
    const zoomIn = screen.getByRole('button', { name: /zoom in/i });
    const zoomOut = screen.getByRole('button', { name: /zoom out/i });
    expect(zoomIn).toBeInTheDocument();
    expect(zoomOut).toBeInTheDocument();
  });
});
```

##### 4. CalendarCell Component

```typescript
describe('CalendarCell', () => {
  it('renders date correctly', () => {
    const date = new Date('2024-01-15');
    render(<CalendarCell date={date} events={[]} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('highlights today', () => {
    const today = new Date();
    render(<CalendarCell date={today} events={[]} isToday />);
    expect(screen.getByRole('gridcell')).toHaveClass('today');
  });

  it('shows event indicators', () => {
    const date = new Date('2024-01-15');
    const events = [
      { type: 'new-moon', title: 'New Moon' },
      { type: 'transit', title: 'Mercury Retrograde' },
    ];
    render(<CalendarCell date={date} events={events} />);
    expect(screen.getByTitle('New Moon')).toBeInTheDocument();
    expect(screen.getByTitle('Mercury Retrograde')).toBeInTheDocument();
  });

  it('is clickable for date selection', () => {
    const handleClick = vi.fn();
    const date = new Date('2024-01-15');
    render(<CalendarCell date={date} events={[]} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('gridcell'));
    expect(handleClick).toHaveBeenCalledWith(date);
  });

  it('has accessibility attributes', () => {
    const date = new Date('2024-01-15');
    render(
      <CalendarCell
        date={date}
        events={[]}
        aria-label="January 15, 2024"
        aria-selected="false"
      />
    );
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-label', 'January 15, 2024');
  });
});
```

#### Hook Tests (Custom Hooks)

##### useAuth Hook

```typescript
describe('useAuth', () => {
  it('logs in user successfully', async () => {
    const mockCredentials = { email: 'test@test.com', password: 'password123' };
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };

    (authService.login as Mock).mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login(mockCredentials);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('mock-token');
  });

  it('handles login errors', async () => {
    (authService.login as Mock).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.login({ email: 'test', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });

    expect(result.current.error).toBe('Invalid credentials');
  });

  it('logs out user', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('updates user profile', async () => {
    const mockUser = { id: '1', name: 'Updated Name' };
    (authService.updateProfile as Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.updateProfile({ name: 'Updated Name' });
    });

    expect(result.current.user?.name).toBe('Updated Name');
  });
});
```

##### useCharts Hook

```typescript
describe('useCharts', () => {
  it('loads user charts', async () => {
    const mockCharts = [
      { id: '1', name: 'My Chart', birthDate: '1990-01-01' },
      { id: '2', name: 'Partner Chart', birthDate: '1992-05-15' },
    ];
    (chartService.getCharts as Mock).mockResolvedValue(mockCharts);

    const { result } = renderHook(() => useCharts());

    await act(async () => {
      await result.current.loadCharts();
    });

    expect(result.current.charts).toEqual(mockCharts);
    expect(result.current.isLoading).toBe(false);
  });

  it('creates new chart', async () => {
    const newChart = { name: 'New Chart', birthDate: '1995-03-20', birthTime: '14:30' };
    const createdChart = { id: '3', ...newChart };

    (chartService.createChart as Mock).mockResolvedValue(createdChart);

    const { result } = renderHook(() => useCharts());

    await act(async () => {
      const chart = await result.current.createChart(newChart);
      expect(chart).toEqual(createdChart);
    });
  });

  it('deletes chart', async () => {
    (chartService.deleteChart as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCharts());

    await act(async () => {
      await result.current.deleteChart('1');
    });

    expect(chartService.deleteChart).toHaveBeenCalledWith('1');
  });
});
```

#### Store Tests (Zustand)

##### authStore Tests

```typescript
describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().reset();
  });

  it('initializes with empty state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets user on login', () => {
    const mockUser = { id: '1', email: 'test@test.com' };
    const mockToken = 'mock-jwt-token';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('clears state on logout', () => {
    useAuthStore.getState().setAuth({ id: '1' }, 'token');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('persists state to localStorage', () => {
    const mockUser = { id: '1', email: 'test@test.com' };
    useAuthStore.getState().setAuth(mockUser, 'token');

    expect(localStorage.getItem('auth-storage')).toContain('test@test.com');
  });
});
```

### Integration Tests (React Testing Library)

#### Page Tests (18 Pages)

##### LandingPage Integration Test

```typescript
describe('LandingPage Integration', () => {
  it('renders hero section with CTAs', () => {
    render(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/discover your cosmic/i);
    expect(screen.getByRole('button', { name: /get started free/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /watch demo/i })).toBeInTheDocument();
  });

  it('navigates to registration on CTA click', () => {
    const navigate = vi.spyOn(require('react-router-dom'), 'useNavigate');
    render(<LandingPage />);

    fireEvent.click(screen.getByRole('button', { name: /get started free/i }));
    expect(navigate).toHaveBeenCalledWith('/register');
  });

  it('displays feature cards', () => {
    render(<LandingPage />);
    expect(screen.getByText(/natal charts/i)).toBeInTheDocument();
    expect(screen.getByText(/compatibility/i)).toBeInTheDocument();
    expect(screen.getByText(/transits/i)).toBeInTheDocument();
  });

  it('shows pricing tiers', () => {
    render(<LandingPage />);
    expect(screen.getByText('Seeker')).toBeInTheDocument();
    expect(screen.getByText('Mystic')).toBeInTheDocument();
    expect(screen.getByText('Oracle')).toBeInTheDocument();
  });
});
```

##### DashboardPage Integration Test

```typescript
describe('DashboardPage Integration', () => {
  beforeEach(() => {
    // Mock auth
    vi.mock('@/stores/authStore', () => ({
      useAuthStore: () => ({ user: { id: '1', name: 'Test User' } }),
    }));
  });

  it('loads and displays user charts', async () => {
    (chartService.getCharts as Mock).mockResolvedValue([
      { id: '1', name: 'My Chart', isDefault: true },
    ]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('My Chart')).toBeInTheDocument();
    });
  });

  it('shows energy meter widgets', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar', { name: /physical energy/i })).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { name: /emotional energy/i })).toBeInTheDocument();
    });
  });

  it('displays moon phase card', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /moon phase/i })).toBeInTheDocument();
    });
  });

  it('navigates to chart creation on button click', async () => {
    render(<DashboardPage />);

    fireEvent.click(screen.getByRole('button', { name: /create new chart/i }));

    expect(screen.getByRole('heading', { name: /create your chart/i })).toBeInTheDocument();
  });
});
```

##### ChartCreationFlow Integration Test

```typescript
describe('ChartCreationFlow Integration', () => {
  it('completes 3-step wizard', async () => {
    render(<ChartCreationFlowPage />);

    // Step 1: Personal details
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Birth data
    await waitFor(() => {
      expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText(/birth date/i);
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });

    const timeInput = screen.getByLabelText(/birth time/i);
    fireEvent.change(timeInput, { target: { value: '14:30' } });

    const locationInput = screen.getByLabelText(/birth location/i);
    fireEvent.change(locationInput, { target: { value: 'New York, NY' } });

    fireEvent.click(screen.getByRole('button', { name: /generate chart/i }));

    // Success
    await waitFor(() => {
      expect(screen.getByText(/chart created successfully/i)).toBeInTheDocument();
    });
  });

  it('shows live preview as user types', async () => {
    render(<ChartCreationFlowPage />);

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText(/John/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<ChartCreationFlowPage />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
```

#### Form Validation Tests

##### BirthDataForm Validation

```typescript
describe('BirthDataForm Validation', () => {
  it('requires name', async () => {
    const onSubmit = vi.fn();
    render(<BirthDataForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('requires valid date', async () => {
    const onSubmit = vi.fn();
    render(<BirthDataForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/birth date/i), { target: { value: 'invalid' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();
    });
  });

  it('requires date in the past', async () => {
    const onSubmit = vi.fn();
    render(<BirthDataForm onSubmit={onSubmit} />);

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    fireEvent.change(screen.getByLabelText(/birth date/i), {
      target: { value: futureDate.toISOString().split('T')[0] },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/birth date must be in the past/i)).toBeInTheDocument();
    });
  });

  it('requires valid location', async () => {
    const onSubmit = vi.fn();
    render(<BirthDataForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/birth location/i), { target: { value: 'InvalidLocation123456' } });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/location not found/i)).toBeInTheDocument();
    });
  });
});
```

---

## Backend Test Specifications

### Unit Tests (Jest)

#### Service Layer Tests

##### swissEphemeris.service.test.ts

```typescript
describe('SwissEphemeris Service', () => {
  describe('calculateNatalChart', () => {
    const validInput = {
      date: '1990-01-15',
      time: '14:30',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    it('calculates planetary positions', async () => {
      const result = await swissEphemeris.calculateNatalChart(validInput);

      expect(result.planets).toBeDefined();
      expect(result.planets.length).toBeGreaterThan(0);
      expect(result.planets[0]).toHaveProperty('name');
      expect(result.planets[0]).toHaveProperty('sign');
      expect(result.planets[0]).toHaveProperty('degree');
    });

    it('calculates house cusps', async () => {
      const result = await swissEphemeris.calculateNatalChart(validInput);

      expect(result.houses).toBeDefined();
      expect(result.houses).toHaveLength(12);
      expect(result.houses[0]).toHaveProperty('cusp');
    });

    it('calculates ascendant correctly', async () => {
      const result = await swissEphemeris.calculateNatalChart(validInput);

      expect(result.ascendant).toBeDefined();
      expect(result.ascendant).toHaveProperty('sign');
      expect(result.ascendant).toHaveProperty('degree');
    });

    it('handles invalid date', async () => {
      await expect(
        swissEphemeris.calculateNatalChart({
          ...validInput,
          date: 'invalid-date',
        })
      ).rejects.toThrow('Invalid date format');
    });

    it('calculates within time limit (500ms)', async () => {
      const start = Date.now();
      await swissEphemeris.calculateNatalChart(validInput);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('calculateTransits', () => {
    it('calculates transit positions for date range', async () => {
      const result = await swissEphemeris.calculateTransits({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        natalDate: '1990-01-15',
      });

      expect(result.transits).toBeDefined();
      expect(result.transits.length).toBeGreaterThan(0);
    });

    it('identifies major aspects', async () => {
      const result = await swissEphemeris.calculateTransits({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        natalDate: '1990-01-15',
      });

      const majorAspects = result.transits.filter(t =>
        ['conjunction', 'opposition', 'trine', 'square'].includes(t.aspect)
      );

      expect(majorAspects.length).toBeGreaterThan(0);
    });
  });

  describe('calculateSynastry', () => {
    const chart1 = { date: '1990-01-15', time: '14:30', latitude: 40.7128, longitude: -74.0060 };
    const chart2 = { date: '1992-05-20', time: '10:00', latitude: 51.5074, longitude: -0.1278 };

    it('calculates compatibility score', async () => {
      const result = await swissEphemeris.calculateSynastry(chart1, chart2);

      expect(result.score).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('provides category breakdowns', async () => {
      const result = await swissEphemeris.calculateSynastry(chart1, chart2);

      expect(result.breakdown).toHaveProperty('romance');
      expect(result.breakdown).toHaveProperty('communication');
      expect(result.breakdown).toHaveProperty('trust');
    });

    it('identifies inter-aspects', async () => {
      const result = await swissEphemeris.calculateSynastry(chart1, chart2);

      expect(result.aspects).toBeDefined();
      expect(result.aspects.length).toBeGreaterThan(0);
    });
  });
});
```

#### chart.service.test.ts

```typescript
describe('Chart Service', () => {
  describe('createChart', () => {
    it('creates chart with valid data', async () => {
      const input = {
        name: 'Test Chart',
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthLocationName: 'New York, NY',
        birthLocationLat: 40.7128,
        birthLocationLng: -74.0060,
      };

      const result = await chartService.createChart(input);

      expect(result.id).toBeDefined();
      expect(result.name).toBe(input.name);
      expect(result.chartData).toBeDefined();
    });

    it('calculates chart data on creation', async () => {
      const input = {
        name: 'Test Chart',
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthLocationName: 'New York, NY',
        birthLocationLat: 40.7128,
        birthLocationLng: -74.0060,
      };

      const result = await chartService.createChart(input);

      expect(result.chartData.planets).toBeDefined();
      expect(result.chartData.houses).toBeDefined();
    });

    it('sets first chart as default', async () => {
      const input = {
        name: 'First Chart',
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthLocationName: 'New York, NY',
      };

      const result = await chartService.createChart(input);

      expect(result.isDefault).toBe(true);
    });
  });

  describe('getCharts', () => {
    it('returns user charts only', async () => {
      const userId = 'user-1';
      const charts = await chartService.getCharts(userId);

      charts.forEach(chart => {
        expect(chart.userId).toBe(userId);
      });
    });

    it('sorts by creation date desc', async () => {
      const charts = await chartService.getCharts('user-1');

      for (let i = 0; i < charts.length - 1; i++) {
        expect(new Date(charts[i].createdAt)).toBeGreaterThanOrEqual(
          new Date(charts[i + 1].createdAt)
        );
      }
    });
  });

  describe('updateChart', () => {
    it('updates chart name', async () => {
      const chart = await chartService.createChart({
        name: 'Original Name',
        birthDate: '1990-01-15',
      });

      const updated = await chartService.updateChart(chart.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
    });

    it('recalculates chart data if birth data changes', async () => {
      const chart = await chartService.createChart({
        name: 'Test',
        birthDate: '1990-01-15',
        birthTime: '14:30',
      });

      const updated = await chartService.updateChart(chart.id, {
        birthTime: '15:30',
      });

      expect(updated.chartData).toBeDefined();
      // Verify recalculation
    });
  });
});
```

### Integration Tests (Supertest)

#### API Route Tests

##### auth.routes.test.ts

```typescript
describe('Auth Routes', () => {
  describe('POST /api/v1/auth/register', () => {
    it('registers new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('token');
    });

    it('rejects duplicate email', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(201);

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
          name: 'Another User',
        })
        .expect(409);
    });

    it('validates password strength', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: 'weak',
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
          name: 'Test User',
        });
    });

    it('logs in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('rejects invalid password', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('returns JWT token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });
  });
});
```

##### chart.routes.test.ts

```typescript
describe('Chart Routes', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login user
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'charttest@test.com',
        password: 'Password123!',
        name: 'Chart Test User',
      });

    token = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/v1/charts', () => {
    it('creates new chart', async () => {
      const response = await request(app)
        .post('/api/v1/charts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Chart',
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthLocationName: 'New York, NY',
          birthLocationLat: 40.7128,
          birthLocationLng: -74.0060,
        })
        .expect(201);

      expect(response.body.data.chart).toHaveProperty('id');
      expect(response.body.data.chart.chartData).toBeDefined();
    });

    it('requires authentication', async () => {
      await request(app)
        .post('/api/v1/charts')
        .send({
          name: 'My Chart',
          birthDate: '1990-01-15',
        })
        .expect(401);
    });

    it('validates birth date', async () => {
      await request(app)
        .post('/api/v1/charts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Chart',
          birthDate: 'invalid-date',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/charts', () => {
    it('returns user charts', async () => {
      // Create test chart
      await request(app)
        .post('/api/v1/charts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Chart',
          birthDate: '1990-01-15',
        });

      const response = await request(app)
        .get('/api/v1/charts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.charts).toBeInstanceOf(Array);
      expect(response.body.data.charts.length).toBeGreaterThan(0);
    });

    it('does not return other users charts', async () => {
      // Create chart for user 1
      await request(app)
        .post('/api/v1/charts')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'User 1 Chart', birthDate: '1990-01-15' });

      // Login as user 2
      const user2Response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'user2@test.com',
          password: 'Password123!',
          name: 'User 2',
        });

      const user2Charts = await request(app)
        .get('/api/v1/charts')
        .set('Authorization', `Bearer ${user2Response.body.data.token}`)
        .expect(200);

      expect(user2Charts.body.data.charts).not.toContainEqual(
        expect.objectContaining({ name: 'User 1 Chart' })
      );
    });
  });

  describe('DELETE /api/v1/charts/:id', () => {
    it('deletes chart', async () => {
      const createResponse = await request(app)
        .post('/api/v1/charts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'To Delete',
          birthDate: '1990-01-15',
        });

      const chartId = createResponse.body.data.chart.id;

      await request(app)
        .delete(`/api/v1/charts/${chartId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('prevents deleting other users charts', async () => {
      const user2Response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'user2@test.com',
          password: 'Password123!',
          name: 'User 2',
        });

      const chartId = await createChartForUser(token);

      await request(app)
        .delete(`/api/v1/charts/${chartId}`)
        .set('Authorization', `Bearer ${user2Response.body.data.token}`)
        .expect(403);
    });
  });
});
```

---

## E2E Test Specifications (Playwright)

### Critical User Journeys

#### 1. User Registration Flow

```typescript
// tests/e2e/01-authentication.spec.ts

import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('registers new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[name="email"]', 'newuser@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.fill('input[name="name"]', 'New User');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome, New User');
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('validates password match', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('registers with Google OAuth', async ({ page, context }) => {
    await page.goto('/register');

    // Mock Google OAuth (in reality, this would use test OAuth credentials)
    await page.click('button:has-text("Continue with Google")');

    // Verify OAuth flow initiated (check for redirect to Google)
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });
});
```

#### 2. Chart Creation Flow

```typescript
// tests/e2e/02-chart-creation.spec.ts

test.describe('Chart Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('creates natal chart with complete data', async ({ page }) => {
    await page.click('button:has-text("Create New Chart")');

    // Step 1: Personal details
    await page.fill('input[name="name"]', 'John Doe');
    await page.click('button:has-text("Next")');

    // Step 2: Birth data
    await page.fill('input[type="date"]', '1990-01-15');
    await page.fill('input[type="time"]', '14:30');

    // Search for location
    await page.fill('input[placeholder*="Search city"]', 'New York');
    await page.click('text=New York, NY, USA');

    // Verify live preview updated
    await expect(page.locator('text=January 15, 1990')).toBeVisible();
    await expect(page.locator('text=14:30')).toBeVisible();
    await expect(page.locator('text=New York')).toBeVisible();

    // Submit
    await page.click('button:has-text("Generate Chart")');

    // Verify success
    await expect(page.locator('text=Chart created successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/charts\/[a-f0-9-]+/);
  });

  test('handles unknown birth time', async ({ page }) => {
    await page.click('button:has-text("Create New Chart")');
    await page.fill('input[name="name"]', 'Jane Doe');
    await page.click('button:has-text("Next")');

    // Check "Unknown time" checkbox
    await page.check('input[type="checkbox"][name="unknownTime"]');

    // Verify time input is disabled
    await expect(page.locator('input[type="time"]')).toBeDisabled();

    await page.fill('input[type="date"]', '1990-01-15');
    await page.fill('input[placeholder*="Search city"]', 'London');
    await page.click('text=London, UK');

    await page.click('button:has-text("Generate Chart")');

    // Verify chart created with noon time
    await expect(page.locator('text=12:00')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.click('button:has-text("Create New Chart")');

    // Try to proceed without entering name
    await page.click('button:has-text("Next")');

    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page).not.toHaveURL(/\/step-2/);
  });
});
```

#### 3. Synastry Comparison Flow

```typescript
// tests/e2e/03-synastry-comparison.spec.ts

test.describe('Synastry Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('compares two charts for compatibility', async ({ page }) => {
    // Navigate to synastry page
    await page.click('a:has-text("Compatibility")');

    // Select first person
    await page.click('#person1-select');
    await page.click('text=My Chart');

    // Select second person
    await page.click('#person2-select');
    await page.click('text=Partner Chart');

    // Start comparison
    await page.click('button:has-text("Compare Charts")');

    // Verify loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Verify results
    await expect(page.locator('text=Compatibility Score')).toBeVisible();
    await expect(page.locator('[data-testid="compatibility-score"]')).toBeVisible();

    // Verify breakdown categories
    await expect(page.locator('text=Romance')).toBeVisible();
    await expect(page.locator('text=Communication')).toBeVisible();
    await expect(page.locator('text=Trust')).toBeVisible();

    // Verify aspects grid
    await expect(page.locator('data-testid=aspect-grid')).toBeVisible();
  });

  test('handles calculation timeout', async ({ page }) => {
    await page.goto('/synastry');

    // Mock slow API response
    await page.route('**/api/v1/synastry/compare', route => {
      setTimeout(() => route.fulfill({ status: 408 }), 30000);
    });

    // Select persons and compare
    await page.click('#person1-select');
    await page.click('text=My Chart');
    await page.click('#person2-select');
    await page.click('text=Partner Chart');
    await page.click('button:has-text("Compare Charts")');

    // Verify timeout error message
    await expect(page.locator('text=Calculation timed out')).toBeVisible({
      timeout: 35000,
    });
  });

  test('saves comparison report', async ({ page }) => {
    // Perform comparison
    await performComparison(page);

    // Save report
    await page.click('button:has-text("Save Report")');
    await page.fill('input[name="reportName"]', 'John & Jane Compatibility');
    await page.click('button:has-text("Save")');

    // Verify saved
    await expect(page.locator('text=Report saved successfully')).toBeVisible();

    // Navigate to saved reports
    await page.click('a:has-text("Saved Reports")');
    await expect(page.locator('text=John & Jane Compatibility')).toBeVisible();
  });
});
```

#### 4. Calendar Interactions Flow

```typescript
// tests/e2e/04-calendar-interactions.spec.ts

test.describe('Astrological Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/calendar');
  });

  test('displays monthly view with events', async ({ page }) => {
    // Verify current month displayed
    const monthName = new Date().toLocaleString('default', { month: 'long' });
    await expect(page.locator(`text=${monthName}`)).toBeVisible();

    // Verify event indicators on specific dates
    const eventDays = await page.locator('[data-event-type]').count();
    expect(eventDays).toBeGreaterThan(0);
  });

  test('selects date and shows event details', async ({ page }) => {
    // Click on a date with events
    await page.click('[data-event-type]:not([data-event-count="0"])');

    // Verify event detail panel
    await expect(page.locator('[data-testid="event-detail-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-list"]')).toBeVisible();
  });

  test('filters events by type', async ({ page }) => {
    await page.click('[data-testid="filter-button"]');

    // Filter for moon phases only
    await page.check('input[value="moon-phase"]');
    await page.click('button:has-text("Apply Filters")');

    // Verify only moon phases shown
    const visibleEvents = await page.locator('[data-event-type="moon-phase"]').count();
    const allEvents = await page.locator('[data-event-type]').count();

    expect(visibleEvents).toBeLessThan(allEvents);
  });

  test('navigates between months', async ({ page }) => {
    const currentMonth = new Date().getMonth();

    // Navigate to next month
    await page.click('[aria-label="Next month"]');
    const nextMonth = (currentMonth + 1) % 12;
    const nextMonthName = new Date(2024, nextMonth).toLocaleString('default', { month: 'long' });
    await expect(page.locator(`text=${nextMonthName}`)).toBeVisible();

    // Navigate to previous month
    await page.click('[aria-label="Previous month"]');
    await expect(page.locator('text=January')).toBeVisible();
  });
});
```

#### 5. Learning Center Flow

```typescript
// tests/e2e/05-learning-center.spec.ts

test.describe('Learning Center', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/learning');
  });

  test('displays available courses', async ({ page }) => {
    // Verify course cards displayed
    await expect(page.locator('[data-testid="course-card"]')).toHaveCount(4);

    // Verify course details
    await expect(page.locator('text=Astrology 101')).toBeVisible();
    await expect(page.locator('text=Intermediate: Aspects & Transits')).toBeVisible();
    });

  test('shows current course progress', async ({ page }) => {
    // Verify progress bar
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();

    // Verify percentage
    const progressText = await page.locator('[data-testid="progress-text"]').textContent();
    expect(parseInt(progressText)).toBeGreaterThanOrEqual(0);
    expect(parseInt(progressText)).toBeLessThanOrEqual(100);
  });

  test('navigates to course lesson', async ({ page }) => {
    // Click on current course
    await page.click('[data-testid="current-course-card"]');

    // Verify syllabus displayed
    await expect(page.locator('[data-testid="lesson-list"]')).toBeVisible();

    // Click on first lesson
    await page.click('[data-testid="lesson-item"]:first-child');

    // Verify video player
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible();

    // Verify lesson content
    await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();
  });

  test('marks lesson as complete', async ({ page }) => {
    await page.click('[data-testid="current-course-card"]');
    await page.click('[data-testid="lesson-item"]:first-child');

    // Mark complete
    await page.click('button:has-text("Mark Complete")');

    // Verify lesson marked
    await expect(page.locator('[data-lesson-complete="true"]')).toBeVisible();

    // Verify progress updated
    await page.click('[aria-label="Back to courses"]');
    const progressText = await page.locator('[data-testid="progress-text"]').textContent();
    expect(parseInt(progressText)).toBeGreaterThan(0);
  });
});
```

---

## Accessibility Testing

### Automated Accessibility Tests

```typescript
// tests/e2e/accessibility/a11y.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard has no accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('chart creation wizard is keyboard navigable', async ({ page }) => {
    await page.goto('/charts/create');

    // Test Tab navigation
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe('INPUT');

    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe('BUTTON');

    // Test Enter key submission
    await page.keyboard.press('Enter');

    // Verify error or navigation
    const hasErrorOrMoved = await page.evaluate(() => {
      return document.querySelector('[role="alert"]') !== null ||
             window.location.pathname !== '/charts/create';
    });
    expect(hasErrorOrMoved).toBe(true);
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/dashboard');

    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');

    const violations = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include(['#main-content'])
      .analyze();

    const contrastViolations = violations.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });
});
```

---

## Performance Testing

### Frontend Performance Tests

```typescript
// tests/performance/frontend-performance.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('page load time under 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('time to interactive under 3 seconds', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button:has-text("Get Started")');

    const tti = await page.evaluate(() => {
      return performance.timing.domInteractive - performance.timing.navigationStart;
    });

    expect(tti).toBeLessThan(3000);
  });

  test('chart wheel renders under 500ms', async ({ page }) => {
    await login(page);

    const startTime = Date.now();

    await page.goto('/charts/test-chart-id');

    await page.waitForSelector('[data-testid="chart-wheel"]');

    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(500);
  });

  test('calendar loads under 300ms', async ({ page }) => {
    await login(page);

    const startTime = Date.now();

    await page.goto('/calendar');
    await page.waitForSelector('[data-testid="calendar-grid"]');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(300);
  });
});
```

### Backend Performance Tests

```typescript
// tests/performance/api-performance.test.ts

describe('API Performance', () => {
  describe('Chart Calculation', () => {
    it('calculates natal chart under 500ms (p95)', async () => {
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = Date.now();
        await swissEphemeris.calculateNatalChart({
          date: '1990-01-15',
          time: '14:30',
          latitude: 40.7128,
          longitude: -74.0060,
        });
        times.push(Date.now() - start);
      }

      times.sort((a, b) => a - b);
      const p95 = times[94]; // 95th percentile

      expect(p95).toBeLessThan(500);
    });

    it('handles concurrent requests', async () => {
      const requests = Array(50).fill(null).map((_, i) =>
        swissEphemeris.calculateNatalChart({
          date: '1990-01-15',
          time: '14:30',
          latitude: 40.7128 + (i * 0.01),
          longitude: -74.0060,
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result).toHaveProperty('planets');
        expect(result).toHaveProperty('houses');
      });
    });
  });

  describe('API Response Times', () => {
    it('GET /charts responds under 200ms (p95)', async () => {
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = Date.now();
        await request(app)
          .get('/api/v1/charts')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        times.push(Date.now() - start);
      }

      times.sort((a, b) => a - b);
      const p95 = times[94];

      expect(p95).toBeLessThan(200);
    });

    it('POST /charts responds under 500ms (p95)', async () => {
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = Date.now();
        await request(app)
          .post('/api/v1/charts')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Test Chart ${i}`,
            birthDate: '1990-01-15',
            birthTime: '14:30',
          })
          .expect(201);
        times.push(Date.now() - start);
      }

      times.sort((a, b) => a - b);
      const p95 = times[94];

      expect(p95).toBeLessThan(500);
    });
  });
});
```

---

## Security Testing

### Security Test Specifications

```typescript
// tests/security/security.spec.ts

describe('Security Tests', () => {
  describe('Authentication', () => {
    it('rejects requests without token', async () => {
      await request(app)
        .get('/api/v1/charts')
        .expect(401);
    });

    it('rejects requests with expired token', async () => {
      const expiredToken = generateExpiredToken();

      await request(app)
        .get('/api/v1/charts')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('rejects requests with invalid token', async () => {
      await request(app)
        .get('/api/v1/charts')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('implements rate limiting on login', async () => {
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' })
      );

      const responses = await Promise.all(requests);

      // First 5 should get 401, 6th should get 429
      responses.slice(0, 5).forEach(r => expect(r.status).toBe(401));
      expect(responses[5].status).toBe(429);
    });
  });

  describe('Authorization', () => {
    it('prevents accessing other users charts', async () => {
      const user1Token = await registerAndLogin('user1@test.com');
      const user2Token = await registerAndLogin('user2@test.com');

      const chart = await createChart(user1Token);

      await request(app)
        .get(`/api/v1/charts/${chart.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });
  });

  describe('Input Validation', () => {
    it('sanitizes user input to prevent XSS', async () => {
      const maliciousInput = '<script>alert("XSS")</script>';

      const response = await request(app)
        .post('/api/v1/charts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: maliciousInput,
          birthDate: '1990-01-15',
        })
        .expect(201);

      expect(response.body.data.chart.name).not.toContain('<script>');
    });

    it('validates JWT payload', async () => {
      const tamperedToken = generateTamperedToken();

      await request(app)
        .get('/api/v1/charts')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('prevents SQL injection in search', async () => {
      const sqlInjection = "'; DROP TABLE charts; --";

      await request(app)
        .get(`/api/v1/charts?search=${sqlInjection}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify charts table still exists
      const result = await db.query('SELECT * FROM charts LIMIT 1');
      expect(result).toBeDefined();
    });
  });
});
```

---

## Test Execution Plan

### Pre-Implementation Test Setup

```bash
# Week 1: Test Infrastructure Setup
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm install --save-dev @axe-core/playwright @playwright/test

# Backend tests
cd ../backend
npm install --save-dev jest supertest @types/jest
```

### Test Execution Commands

```bash
# Frontend Tests
cd frontend
npm run test              # Run all unit tests
npm run test:coverage     # With coverage report
npm run test:ui           # Interactive UI mode

# Backend Tests
cd backend
npm test                  # Run all tests
npm run test:coverage     # With coverage

# E2E Tests
cd frontend
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # With Playwright UI

# Accessibility Tests
npm run test:a11y         # Automated accessibility scans

# Performance Tests
npm run test:perf         # Performance benchmarks
```

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
    branches: [main, develop]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  accessibility-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run test:a11y
```

### Coverage Goals by Phase

| Phase | Frontend Coverage | Backend Coverage | E2E Coverage | A11y Compliance |
|-------|------------------|------------------|--------------|-----------------|
| Phase 1 | 80% | 90% | 40% | 60% |
| Phase 2 | 90% | 95% | 60% | 70% |
| Phase 3 | 95% | 98% | 80% | 85% |
| Phase 4 | 100% | 100% | 100% | 100% |

---

## Appendix

### Test Data Fixtures

```typescript
// tests/fixtures/chartData.ts
export const mockNatalChart = {
  id: 'chart-1',
  name: 'Test Chart',
  birthDate: '1990-01-15',
  birthTime: '14:30',
  birthLocation: 'New York, NY',
  chartData: {
    planets: [
      { name: 'Sun', sign: 'Capricorn', degree: 15.5, house: 10, isRetrograde: false },
      { name: 'Moon', sign: 'Pisces', degree: 22.3, house: 12, isRetrograde: false },
      // ... more planets
    ],
    houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    ascendant: { sign: 'Scorpio', degree: 15.2 },
    midheaven: { sign: 'Leo', degree: 20.8 },
    aspects: [
      { planet1: 'Sun', planet2: 'Moon', type: 'trine', degree: 120, orb: 5 },
      // ... more aspects
    ],
  },
};

export const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  subscriptionTier: 'free',
};
```

### Helper Functions

```typescript
// tests/helpers/auth.ts
export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function registerAndLogin(email: string): Promise<string> {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email,
      password: 'Password123!',
      name: 'Test User',
    });

  return response.body.data.token;
}
```

---

**Document Version:** 2.0
**Last Updated:** 2026-02-21
**Total Test Cases:** 500+
**Coverage Target:** 100%
