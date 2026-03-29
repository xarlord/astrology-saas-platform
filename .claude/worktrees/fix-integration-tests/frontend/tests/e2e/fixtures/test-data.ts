/**
 * Test Data Fixtures
 * Provides reusable test data for E2E tests
 */

export const testUsers = {
  valid: {
    email: `e2e-test-${Date.now()}@example.com`,
    password: 'SecurePass123!',
    name: 'E2E Test User',
  },
  invalid: {
    email: 'invalid-email',
    weakPassword: 'weak',
    mismatchedPassword: 'DifferentPass123!',
  },
  existing: {
    email: process.env.EXISTING_USER_EMAIL || 'existing@example.com',
    password: process.env.EXISTING_USER_PASSWORD || 'ExistingPass123!',
  },
};

export const testCharts = {
  valid: {
    name: 'E2E Test Chart',
    birth_date: '1990-01-15',
    birth_time: '14:30',
    birth_place: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    house_system: 'placidus',
    zodiac_type: 'tropical',
  },
  timeUnknown: {
    name: 'Time Unknown Chart',
    birth_date: '1985-06-20',
    birth_time: '',
    birth_place: 'Los Angeles, CA',
    time_unknown: true,
    house_system: 'placidus',
    zodiac_type: 'tropical',
  },
  invalid: {
    name: '',
    birth_date: 'invalid-date',
    birth_time: 'invalid-time',
    birth_place: 'InvalidPlaceThatDoesNotExist12345',
  },
};

export const testLocations = {
  newYork: {
    name: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
  },
  london: {
    name: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  },
  tokyo: {
    name: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
  },
};

export const testCalendarEvents = {
  fullMoon: {
    type: 'full_moon',
    date: '2024-01-25',
    sign: 'Leo',
  },
  newMoon: {
    type: 'new_moon',
    date: '2024-02-09',
    sign: 'Aquarius',
  },
  mercuryRetrograde: {
    type: 'mercury_retrograde',
    startDate: '2024-04-01',
    endDate: '2024-04-25',
  },
  custom: {
    title: 'Personal Event',
    date: '2024-02-15',
    time: '14:00',
    notes: 'Test custom event',
  },
};

export const testSynastry = {
  valid: {
    chart1Id: 'chart-1',
    chart2Id: 'chart-2',
    chart1Name: 'Person A',
    chart2Name: 'Person B',
  },
};

export const testSolarReturn = {
  currentYear: new Date().getFullYear(),
  location: testLocations.newYork,
  relocated: testLocations.london,
};

export const testLunarReturn = {
  month: 'February',
  year: 2024,
};

export const apiResponses = {
  auth: {
    login: {
      success: {
        status: 200,
        data: {
          user: {
            id: 'user-1',
            email: testUsers.valid.email,
            name: testUsers.valid.name,
          },
          token: 'fake-jwt-token',
        },
      },
      invalidCredentials: {
        status: 401,
        error: 'Invalid credentials',
      },
    },
    register: {
      success: {
        status: 201,
        data: {
          user: {
            id: 'user-1',
            email: testUsers.valid.email,
            name: testUsers.valid.name,
          },
          token: 'fake-jwt-token',
        },
      },
    },
  },
  charts: {
    create: {
      success: {
        status: 201,
        data: {
          id: 'chart-1',
          name: testCharts.valid.name,
          birth_date: testCharts.valid.birth_date,
          created_at: new Date().toISOString(),
        },
      },
    },
    list: {
      success: {
        status: 200,
        data: {
          charts: [
            {
              id: 'chart-1',
              name: 'Test Chart 1',
              birth_date: '1990-01-15',
            },
            {
              id: 'chart-2',
              name: 'Test Chart 2',
              birth_date: '1985-06-20',
            },
          ],
          total: 2,
        },
      },
    },
  },
  calendar: {
    events: {
      success: {
        status: 200,
        data: {
          events: [
            {
              id: 'event-1',
              type: 'full_moon',
              date: '2024-01-25',
              sign: 'Leo',
              intensity: 'high',
            },
            {
              id: 'event-2',
              type: 'mercury_retrograde',
              startDate: '2024-04-01',
              endDate: '2024-04-25',
            },
          ],
        },
      },
    },
  },
  synastry: {
    compatibility: {
      success: {
        status: 200,
        data: {
          overall_score: 78,
          romantic_score: 82,
          communication_score: 75,
          emotional_score: 80,
          aspects: [
            {
              planets: ['Sun', 'Moon'],
              type: 'conjunction',
              score: 90,
              description: 'Strong emotional connection',
            },
          ],
          interpretation: {
            summary: 'Highly compatible match',
            strengths: ['Emotional connection', 'Shared values'],
            challenges: ['Communication differences'],
          },
        },
      },
    },
  },
  lunarReturns: {
    calculation: {
      success: {
        status: 200,
        data: {
          returnDate: '2024-02-15T10:30:00Z',
          moonPosition: {
            sign: 'Leo',
            degree: 15,
            minute: 30,
          },
          moonPhase: 'waxing_gibbous',
          housePlacement: 5,
          aspects: [],
          theme: 'Creative expression and romance',
          intensity: 'high',
        },
      },
    },
  },
  solarReturns: {
    calculation: {
      success: {
        status: 200,
        data: {
          year: 2024,
          returnDate: '2024-01-15T14:30:00Z',
          location: testLocations.newYork,
          chart: {},
          interpretation: {
            theme: 'Year of new beginnings',
            highlights: ['Career opportunities', 'Personal growth'],
          },
        },
      },
    },
  },
};
